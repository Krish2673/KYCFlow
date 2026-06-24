// src/modules/tenant/tenant.service.ts

import prisma from "../../config/prisma";

export const createTenant = async (name: string) => {
  return await prisma.tenant.create({
    data: {
      name,
    },
  });
};

export const getAllTenants = async () => {
  return await prisma.tenant.findMany();
};

export const getTenantById = async (id: string) => {
  return await prisma.tenant.findUnique({
    where: {
      id,
    },
  });
};