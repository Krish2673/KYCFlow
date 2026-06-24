import { Request, Response } from "express";
import { loginUser } from "./auth.service";

export const loginController = async (
  req: Request,
  res: Response
) => {
  try {

    const { email, password } = req.body;

    const result = await loginUser(
      email,
      password
    );

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });

  }
};