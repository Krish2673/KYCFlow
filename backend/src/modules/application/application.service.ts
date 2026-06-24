import prisma from "../../config/prisma";

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