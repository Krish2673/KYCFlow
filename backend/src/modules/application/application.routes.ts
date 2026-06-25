import { Router } from "express";

import {
  createApplicationController,
  getAllApplicationsController,
  getApplicationByIdController,
  submitApplicationController,
  updateApplicationStatusController,
  assignReviewerController,
} from "./application.controller";

import {
  authenticate,
} from "../../middleware/auth.middleware";

import {
  authorize,
} from "../../middleware/role.middleware";

import { verifyAssignedReviewer } from "../../middleware/reviewer.middleware";

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

router.patch(
  "/:id/submit",
  authenticate,
  authorize("TENANT_ADMIN"),
  submitApplicationController
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("REVIEWER"),
  verifyAssignedReviewer,
  updateApplicationStatusController
);

router.patch(
    "/:id/assign-reviewer",
    authenticate,
    authorize("TENANT_ADMIN"),
    assignReviewerController
);

export default router;