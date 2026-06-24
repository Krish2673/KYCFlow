import { Request, Response } from "express";

import {
  createApplication,
  getAllApplications,
  getApplicationById,
} from "./application.service";

export const createApplicationController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { fullName, email } = req.body;

      const application =
        await createApplication(
          fullName,
          email,
          req.user!.tenantId,
          req.user!.userId
        );

      res.status(201).json({
        success: true,
        data: application,
      });
    } catch (error) {

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Failed to create application",
    error,
  });
}
  };

export const getAllApplicationsController =
  async (
    req: Request,
    res: Response
  ) => {

    const applications =
      await getAllApplications(
        req.user!.tenantId
      );

    res.status(200).json({
      success: true,
      data: applications,
    });
  };

export const getApplicationByIdController =
  async (
    req: Request,
    res: Response
  ) => {

    const application =
      await getApplicationById(
        req.params.id,
        req.user!.tenantId
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  };