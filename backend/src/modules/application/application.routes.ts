import { Router } from "express";

import {
  createApplicationController,
  getAllApplicationsController,
  getApplicationByIdController,
  submitApplicationController,
  updateApplicationStatusController,
  assignReviewerController,
  getMyApplicationsController,
  getApplicationMetricsController,
  getRiskAssessmentController
} from "./application.controller";

import {
  authenticate,
} from "../../middleware/auth.middleware";

import {
  authorize,
} from "../../middleware/role.middleware";

import { verifyAssignedReviewer } from "../../middleware/reviewer.middleware";

import { validate } from "../../middleware/validate.middleware";

import { createApplicationSchema, updateStatusSchema, assignReviewerSchema } from "../../validators/application.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("TENANT_ADMIN"),
  validate(createApplicationSchema),
  createApplicationController
);

router.get(
  "/",
  authenticate,
  getAllApplicationsController
);

router.get(
    "/my",
    authenticate,
    authorize("REVIEWER"),
    getMyApplicationsController
);

router.get(
    "/metrics",
    authenticate,
    getApplicationMetricsController
);

router.get(
    "/:id/risk",
    authenticate,
    getRiskAssessmentController

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
  validate(updateStatusSchema),
  updateApplicationStatusController
);

router.patch(
    "/:id/assign-reviewer",
    authenticate,
    authorize("TENANT_ADMIN"),
    validate(assignReviewerSchema),
    assignReviewerController
);


export default router;