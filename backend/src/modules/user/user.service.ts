import prisma from "../../config/prisma";
import bcrypt from "bcrypt";
import { AppError } from "../../errors/AppError";
import { queueEmail } from "../../jobs/email.job";
import { invitationTemplate } from "../../templates";
import { generateToken } from "../../utils/slug";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  tenantId: true,
  createdAt: true,
  tenant: { select: { id: true, name: true } },
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "REVIEWER";
  tenantId: string;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      status: "ACTIVE",
    },
  });

  const { password, ...safeUser } = user;
  return safeUser;
};

export const inviteUser = async (data: {
  name: string;
  email: string;
  role: "REVIEWER" | "TENANT_ADMIN";
  tenantId: string;
  invitedById: string;
}) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing?.password && existing.status === "ACTIVE") {
    throw new AppError("A user with this email already exists", 409);
  }

  const pendingInvite = await prisma.invitation.findFirst({
    where: {
      email: data.email,
      tenantId: data.tenantId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (pendingInvite) {
    throw new AppError("An active invitation already exists for this email", 409);
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: data.tenantId },
  });

  if (!tenant) {
    throw new AppError("Organization not found", 404);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    if (!existing) {
      await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          status: "PENDING",
          tenantId: data.tenantId,
        },
      });
    } else {
      await tx.user.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          role: data.role,
          status: "PENDING",
        },
      });
    }

    await tx.invitation.create({
      data: {
        email: data.email,
        role: data.role,
        token,
        expiresAt,
        tenantId: data.tenantId,
        invitedById: data.invitedById,
      },
    });
  });

  const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;
  await queueEmail(
    data.email,
    `Invitation to join ${tenant.name} on KYCFlow`,
    invitationTemplate(data.name, tenant.name, inviteLink, data.role),
  );

  return {
    message: "Invitation sent successfully",
    email: data.email,
  };
};

export const getAllUsers = async (tenantId: string) => {
  return prisma.user.findMany({
    where: { tenantId },
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const getPendingApplicants = async (tenantId: string) => {
  return prisma.user.findMany({
    where: {
      tenantId,
      role: "APPLICANT",
      status: "PENDING",
    },
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const getUserById = async (id: string, tenantId: string) => {
  return prisma.user.findFirst({
    where: { id, tenantId },
    select: userSelect,
  });
};
