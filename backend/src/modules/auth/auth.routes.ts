import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  requestOTPController,
  verifyOTPController,
  registerApplicantController,
  registerOrganizationController,
  getInvitationController,
  acceptInvitationController,
} from "./auth.controller";
import { loginLimiter } from "../../middleware/rateLimiter.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  registerApplicantSchema,
  registerOrganizationSchema,
  acceptInviteSchema,
} from "../../validators/auth.validator";

const router = Router();

router.post("/login", loginLimiter, loginController);

router.post(
  "/register/applicant",
  validate(registerApplicantSchema),
  registerApplicantController,
);

router.post(
  "/register/organization",
  validate(registerOrganizationSchema),
  registerOrganizationController,
);

router.get("/invite/:token", getInvitationController);

router.post(
  "/invite/:token/accept",
  validate(acceptInviteSchema),
  acceptInvitationController,
);

router.post("/logout", authenticate, logoutController);
router.post("/refresh", refreshTokenController);
router.post("/request-otp", requestOTPController);
router.post("/verify-otp", verifyOTPController);

export default router;
