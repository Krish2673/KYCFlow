import { Request, Response } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
} from "./user.service";

export const createUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch(error) {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Failed to create user",
    error,
  });
}
};

export const getAllUsersController = async (
  req: Request,
  res: Response
) => {
  const users = await getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
};

export const getUserByIdController = async (
  req: Request,
  res: Response
) => {
  const user = await getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};