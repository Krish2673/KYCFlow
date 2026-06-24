import { Router } from "express";

import {
  createApplicationController,
  getAllApplicationsController,
  getApplicationByIdController,
} from "./application.controller";

import {
  authenticate,
} from "../../middleware/auth.middleware";

import {
  authorize,
} from "../../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("TENANT_ADMIN"),
  createApplicationController
);

router.get(
  "/",
  authenticate,
  getAllApplicationsController
);

router.get(
  "/:id",
  authenticate,
  getApplicationByIdController
);

export default router;