// src/modules/user/user.routes.ts

import { Router } from "express";

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
} from "./user.controller";

const router = Router();

router.post("/", createUserController);

router.get("/", getAllUsersController);

router.get("/:id", getUserByIdController);

export default router;