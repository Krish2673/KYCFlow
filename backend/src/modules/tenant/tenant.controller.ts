// src/modules/tenant/tenant.controller.ts

import { Request, Response } from "express";
import {
  createTenant,
  getAllTenants,
  getTenantById,
} from "./tenant.service";

export const createTenantController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name } = req.body;

    const tenant = await createTenant(name);

    res.status(201).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create tenant",
    });
  }
};

export const getAllTenantsController = async (
  req: Request,
  res: Response
) => {
  const tenants = await getAllTenants();

  res.status(200).json({
    success: true,
    data: tenants,
  });
};

export const getTenantByIdController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  const tenant = await getTenantById(id);

  if (!tenant) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  res.status(200).json({
    success: true,
    data: tenant,
  });
};