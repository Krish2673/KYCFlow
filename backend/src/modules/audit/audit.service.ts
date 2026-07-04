import prisma from "../../config/prisma";
import { ApplicationStatus } from "@prisma/client";

export const createAuditLog =
  async (
    applicationId: string,
    userId: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus
  ) => {

    return prisma.auditLog.create({
      data: {
        applicationId,
        userId,
        fromStatus,
        toStatus,
      },
    });

  };