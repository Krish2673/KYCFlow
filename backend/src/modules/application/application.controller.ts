import { Request, Response } from "express";

import {
  createApplication,
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplicationStatus,
  assignReviewer
} from "./application.service";
import { ApplicationStatus } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";

export const createApplicationController =
asyncHandler(

async (req, res) => {

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
        data: application
    });

});

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

export const submitApplicationController =
  async (
    req,
    res
  ) => {

    try {

      const result =
        await submitApplication(
          req.params.id,
          req.user!.tenantId
        );

      res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error) {

      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed",
      });

    }

  };

export const updateApplicationStatusController =
  async (req, res) => {

    try {

      const { newStatus } = req.body;

      const application =
        await updateApplicationStatus(
          req.params.id,
          req.user!.tenantId,
          req.user!.userId,
          newStatus
        );

      res.status(200).json({
        success: true,
        data: application,
      });

    } catch (error) {

      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed",
      });

    }

  };

export const assignReviewerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { reviewerId } = req.body;

    const application = await assignReviewer(
      req.params.id,
      reviewerId,
      req.user!.tenantId
    );

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to assign reviewer",
    });
  }
};