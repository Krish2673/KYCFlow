import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis";
import { AppError } from "../../errors/AppError";
import { queueEmail } from "../../jobs/email.job";
import { applicantApprovedTemplate } from "../../templates";
import { uniqueTenantSlug } from "../../utils/slug";

function issueTokens(user: {
  id: string;
  tenantId: string;
  role: string;
  name: string;
  email: string;
}) {
  const accessToken = jwt.sign(
    { userId: user.id, tenantId: user.tenantId, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" },
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  };
}

async function storeRefreshToken(userId: string, refreshToken: string) {
  await redisClient.set(
    `refresh:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
}

export const registerApplicant = async (data: {
  name: string;
  email: string;
  password: string;
  tenantId: string;
}) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: data.tenantId },
  });

  if (!tenant) {
    throw new AppError("Organization not found", 404);
  }

  if (!tenant.allowApplicantRegistration) {
    throw new AppError("This organization is not accepting applicant registrations", 403);
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "APPLICANT",
      status: "PENDING",
      tenantId: data.tenantId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      tenantId: true,
      tenant: { select: { name: true } },
    },
  });

  return {
    message: "Registration submitted. Your organization admin will review and approve your account.",
    user,
  };
};

export const registerOrganization = async (data: {
  orgName: string;
  name: string;
  email: string;
  password: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const slug = await uniqueTenantSlug(prisma, data.orgName);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: data.orgName,
        slug,
        allowApplicantRegistration: true,
      },
    });

    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "TENANT_ADMIN",
        status: "ACTIVE",
        tenantId: tenant.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    return { tenant, user };
  });

  return {
    message: "Organization created successfully. You can now sign in.",
    tenant: { id: result.tenant.id, name: result.tenant.name, slug: result.tenant.slug },
    user: result.user,
  };
};

export const getInvitationByToken = async (token: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      tenant: { select: { id: true, name: true } },
    },
  });

  if (!invitation) {
    throw new AppError("Invalid invitation link", 404);
  }

  if (invitation.acceptedAt) {
    throw new AppError("This invitation has already been accepted", 400);
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError("This invitation has expired", 400);
  }

  return {
    email: invitation.email,
    role: invitation.role,
    organization: invitation.tenant.name,
    expiresAt: invitation.expiresAt,
  };
};

export const acceptInvitation = async (
  token: string,
  data: { password: string; name?: string },
) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { tenant: true },
  });

  if (!invitation) {
    throw new AppError("Invalid invitation link", 404);
  }

  if (invitation.acceptedAt) {
    throw new AppError("This invitation has already been accepted", 400);
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError("This invitation has expired", 400);
  }

  const existing = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (existing?.password) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const displayName = data.name ?? invitation.email.split("@")[0] ?? "User";

  const user = await prisma.$transaction(async (tx) => {
    let account = existing;

    if (account) {
      account = await tx.user.update({
        where: { id: account.id },
        data: {
          name: displayName,
          password: hashedPassword,
          status: "ACTIVE",
        },
      });
    } else {
      account = await tx.user.create({
        data: {
          name: displayName,
          email: invitation.email,
          password: hashedPassword,
          role: invitation.role,
          status: "ACTIVE",
          tenantId: invitation.tenantId,
        },
      });
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return account;
  });

  const tokens = issueTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    message: "Account activated successfully",
    ...tokens,
  };
};

export const approveApplicant = async (
  userId: string,
  adminId: string,
  tenantId: string,
) => {
  const applicant = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      role: "APPLICANT",
      status: "PENDING",
    },
    include: { tenant: true },
  });

  if (!applicant) {
    throw new AppError("Pending applicant not found", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        approvedAt: new Date(),
        approvedById: adminId,
      },
    });

    const application = await tx.application.create({
      data: {
        fullName: applicant.name,
        email: applicant.email,
        tenantId,
        createdById: adminId,
        applicantUserId: applicant.id,
      },
    });

    return { user: updated, application };
  });

  const loginLink = `${process.env.FRONTEND_URL}/login`;
  await queueEmail(
    applicant.email,
    "Your KYCFlow account has been approved",
    applicantApprovedTemplate(applicant.name, applicant.tenant.name, loginLink),
  );

  return result;
};

export const rejectApplicant = async (
  userId: string,
  tenantId: string,
) => {
  const applicant = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
      role: "APPLICANT",
      status: "PENDING",
    },
  });

  if (!applicant) {
    throw new AppError("Pending applicant not found", 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status: "REJECTED" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
};
