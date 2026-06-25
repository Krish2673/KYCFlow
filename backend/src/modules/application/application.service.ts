import prisma from "../../config/prisma";
import { ApplicationStatus } from "@prisma/client";
import { VALID_TRANSITIONS } from "../../utils/workflow";
import { createAuditLog } from "../audit/audit.service";
import { AppError } from "../../errors/AppError";

export const createApplication = async (
  fullName: string,
  email: string,
  tenantId: string,
  createdById: string
) => {
  return prisma.application.create({
    data: {
      fullName,
      email,
      tenantId,
      createdById,
    },
  });
};

export const getAllApplications = async (
  tenantId: string
) => {
  return prisma.application.findMany({
    where: {
      tenantId,
    },
    include: {
      createdBy: true,
    },
  });
};

export const getApplicationById = async (
  id: string,
  tenantId: string
) => {
  return prisma.application.findFirst({
    where: {
      id,
      tenantId,
    },
    include: {
      createdBy: true,
    },
  });
};

export const submitApplication = async (
  applicationId: string,
  tenantId: string
) => {

  const application =
    await prisma.application.findFirst({
      where: {
        id: applicationId,
        tenantId,
      },
    });

  if (!application) {
    throw new AppError(
    "Application not found",
    404
);
  }

  const allowedTransitions =
    VALID_TRANSITIONS[
      application.status
    ];

  if (
    !allowedTransitions.includes(
      ApplicationStatus.SUBMITTED
    )
  ) {
    throw new AppError(
      `Cannot move from ${application.status} to SUBMITTED`,
      400
    );
  }

  return prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status:
        ApplicationStatus.SUBMITTED,
    },
  });
};

export const updateApplicationStatus = async (
  applicationId: string,
  tenantId: string,
  userId: string,
  newStatus: ApplicationStatus
) => {

  
  const application =
  await prisma.application.findFirst({
    where: {
      id: applicationId,
      tenantId,
    },
  });
  
  if (!application) {
    throw new AppError(
    "Application not found",
    404
);
  }

  const oldStatus = application.status;

  const allowedTransitions =
    VALID_TRANSITIONS[
      application.status
    ];

  if (
    !allowedTransitions.includes(newStatus)
  ) {
    throw new AppError(
      `Cannot move from ${application.status} to ${newStatus}`,
      400
    );
  }

  const updatedApplication =
  await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: newStatus,
    },
  });

  await createAuditLog(
  application.id,
  userId,
  oldStatus,
  newStatus
);

  return updatedApplication;
};

export const assignReviewer = async (
    applicationId: string,
    reviewerId: string,
    tenantId: string
) => {
    console.log("Application ID:", applicationId);
    console.log("Tenant ID:", tenantId);
    const application = await prisma.application.findFirst({
        where: {
            id: applicationId,
            tenantId
        }
    });
    console.log(application);
    if (!application) {
        throw new AppError("Application not found", 404);
    }

    if (application.status !== "SUBMITTED") {
    throw new AppError(
        "Only submitted applications can be assigned to a reviewer",
        400
    );
}

    const reviewer = await prisma.user.findFirst({
        where: {
            id: reviewerId,
            tenantId,
            role: "REVIEWER"
        }
    });

    if (!reviewer) {
        throw new AppError(
    "Reviewer not found",
    404
);
    }

    return prisma.application.update({
  where: {
    id: applicationId,
  },
  data: {
    reviewerId,
  },
  include: {
    reviewer: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
});
};