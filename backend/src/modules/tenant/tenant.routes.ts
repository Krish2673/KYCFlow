// src/modules/tenant/tenant.routes.ts

import { Router } from "express";

import {
  createTenantController,
  getAllTenantsController,
  getTenantByIdController,
} from "./tenant.controller";

const router = Router();

router.post("/", createTenantController);

router.get("/", getAllTenantsController);

router.get("/:id", getTenantByIdController);

export default router;