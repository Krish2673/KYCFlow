// src/modules/tenant/tenant.routes.ts

import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

import {
  createTenantController,
  getAllTenantsController,
  getTenantByIdController,
} from "./tenant.controller";

const router = Router();

router.post("/", authenticate, authorize("TENANT_ADMIN"), validate(createTenantSchema), createTenantController);
// router.post("/", createTenantController);

router.get("/", authenticate, authorize("TENANT_ADMIN"), getAllTenantsController);
// router.get("/", getAllTenantsController);

router.get("/:id", authenticate, authorize("TENANT_ADMIN"), getTenantByIdController);
// router.get("/:id", getTenantByIdController);

export default router;