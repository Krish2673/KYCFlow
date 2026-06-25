// src/modules/user/user.routes.ts

import { Router } from "express";
import { validate } from "../../middleware/validate.middleware"
import { createUserSchema } from "../../validators/user.validator";

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
} from "./user.controller";

const router = Router();

router.post("/", validate(createUserSchema), createUserController);

router.get("/", getAllUsersController);

router.get("/:id", getUserByIdController);

export default router;