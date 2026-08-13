import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createTenantSchema } from "../../validators/tenant.validator";
import {
  createTenantController,
  getAllTenantsController,
  getTenantByIdController,
  getPublicTenantsController,
} from "./tenant.controller";

const router = Router();

router.get("/public", getPublicTenantsController);

router.post("/", authenticate, authorize("SUPER_ADMIN"), validate(createTenantSchema), createTenantController);
router.get("/", authenticate, authorize("SUPER_ADMIN"), getAllTenantsController);
router.get("/:id", authenticate, authorize("SUPER_ADMIN", "TENANT_ADMIN"), getTenantByIdController);

export default router;
