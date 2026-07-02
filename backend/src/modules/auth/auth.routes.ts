import { Router } from "express";

import { loginController, logoutController, refreshTokenController } from "./auth.controller";
import { loginLimiter } from "../../middleware/rateLimiter.middleware";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */

router.post(
  "/login",
  loginLimiter,
  loginController
);

router.post(
    "/logout",
    authenticate,
    logoutController
);

router.post(
    "/refresh",
    refreshTokenController
);

export default router;