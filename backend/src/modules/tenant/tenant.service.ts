import prisma from "../../config/prisma";
import { uniqueTenantSlug } from "../../utils/slug";

export const createTenant = async (name: string) => {
  const slug = await uniqueTenantSlug(prisma, name);

  return prisma.tenant.create({
    data: {
      name,
      slug,
    },
  });
};

export const getAllTenants = async () => {
  return prisma.tenant.findMany({
    orderBy: { name: "asc" },
  });
};

export const getPublicTenants = async () => {
  return prisma.tenant.findMany({
    where: { allowApplicantRegistration: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });
};

export const getTenantById = async (id: string) => {
  return prisma.tenant.findUnique({
    where: { id },
  });
};
