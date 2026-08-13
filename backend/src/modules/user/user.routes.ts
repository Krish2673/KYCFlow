import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { createUserSchema, inviteUserSchema } from "../../validators/user.validator";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  inviteUserController,
  getPendingApplicantsController,
  approveApplicantController,
  rejectApplicantController,
} from "./user.controller";

const router = Router();

router.use(authenticate);
router.use(authorize("TENANT_ADMIN", "SUPER_ADMIN"));

router.post("/invite", validate(inviteUserSchema), inviteUserController);
router.get("/pending", getPendingApplicantsController);
router.patch("/:id/approve", approveApplicantController);
router.patch("/:id/reject", rejectApplicantController);

router.post("/", validate(createUserSchema), createUserController);
router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);

export default router;
