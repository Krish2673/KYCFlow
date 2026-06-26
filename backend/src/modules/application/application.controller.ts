import { Request, Response } from "express";

import {
  createApplication,
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplicationStatus,
  assignReviewer,
  getMyApplications,
  getApplicationMetrics,
  calculateRisk
} from "./application.service";
import { ApplicationStatus } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";

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

    return sendResponse(
    res,
    201,
    MESSAGES.APPLICATION_CREATED,
    application
);

});

export const getAllApplicationsController =
  async (
    req: Request,
    res: Response
  ) => {

    const filters = {

    page:
        Number(req.query.page) || 1,

    limit:
        Number(req.query.limit) || 10,

    status:
        req.query.status,

    reviewerId:
        req.query.reviewerId,

    search:
        req.query.search,

};

  const result =
await getAllApplications(

    req.user!.tenantId,

    filters

);

    sendResponse(

    res,

    200,

    MESSAGES.APPLICATIONS_FETCHED,

    result.applications,

    result.meta

);
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

export const getMyApplicationsController =
asyncHandler(

async (req, res) => {
  const filters = {

    page:
        Number(req.query.page) || 1,

    limit:
        Number(req.query.limit) || 10,

    status:
        req.query.status as ApplicationStatus,

    search:
        req.query.search as string,

};

  const result =
await getMyApplications(

    req.user!.userId,

    req.user!.tenantId,

    filters

);

return sendResponse(

    res,

    200,

    "Applications fetched successfully",

    result.applications,

    result.meta

);

});

export const getApplicationMetricsController =
asyncHandler(

async (req, res) => {

    const metrics =
    await getApplicationMetrics(
        req.user!.tenantId
    );

    return sendResponse(
        res,
        200,
        "Metrics fetched successfully",
        metrics
    );

});

export const getRiskAssessmentController =
asyncHandler(

async (req, res) => {

    const result =
    await calculateRisk(

        req.params.id,

        req.user!.tenantId

    );

    return sendResponse(

        res,

        200,

        "Risk assessment completed",

        result

    );

});