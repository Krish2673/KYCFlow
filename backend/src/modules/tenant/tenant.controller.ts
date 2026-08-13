import { Request, Response } from "express";
import {
  createTenant,
  getAllTenants,
  getTenantById,
  getPublicTenants,
} from "./tenant.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";

export const createTenantController = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const tenant = await createTenant(name);
  return sendResponse(res, 201, "Tenant created successfully", tenant);
});

export const getAllTenantsController = asyncHandler(async (_req: Request, res: Response) => {
  const tenants = await getAllTenants();
  return sendResponse(res, 200, "Tenants fetched successfully", tenants);
});

export const getPublicTenantsController = asyncHandler(async (_req: Request, res: Response) => {
  const tenants = await getPublicTenants();
  return sendResponse(res, 200, "Organizations fetched successfully", tenants);
});

export const getTenantByIdController = asyncHandler(async (req: Request, res: Response) => {
  const tenant = await getTenantById(req.params.id as string);

  if (!tenant) {
    return sendResponse(res, 404, "Tenant not found");
  }

  return sendResponse(res, 200, "Tenant fetched successfully", tenant);
});