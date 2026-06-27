// src/modules/user/user.routes.ts

import { Router } from "express";
import { validate } from "../../middleware/validate.middleware"
import { createUserSchema } from "../../validators/user.validator";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
} from "./user.controller";

const router = Router();

router.use(authenticate);

router.post("/", validate(createUserSchema), authorize("TENANT_ADMIN"), createUserController);

router.get("/", authorize("TENANT_ADMIN"), getAllUsersController);

router.get("/:id", authorize("TENANT_ADMIN"), getUserByIdController);

export default router;