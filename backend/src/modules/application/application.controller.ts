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
  calculateRisk,
  getApplicationAuditLogs,
  getReviewerMetrics,
  getMe,
  getApplicantApplication,
  assertApplicationAccess,
} from "./application.service";
import { ApplicationStatus } from "@prisma/client";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { MESSAGES } from "../../constants/messages";

export const createApplicationController =
asyncHandler(

async (req : Request, res : Response) => {

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
        req.query.status as ApplicationStatus,

    reviewerId:
        req.query.reviewerId as string,

    search:
        req.query.search as string,

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
  asyncHandler(async (req: Request, res: Response) => {
    const application = await assertApplicationAccess(
      req.params.id as string,
      req.user!.tenantId,
      req.user!.userId,
      req.user!.role,
    );

    return sendResponse(res, 200, "Application fetched successfully", application);
  });

export const getApplicantApplicationController =
  asyncHandler(async (req: Request, res: Response) => {
    const application = await getApplicantApplication(
      req.user!.userId,
      req.user!.tenantId,
    );

    if (!application) {
      return sendResponse(res, 404, "No KYC application found for your account");
    }

    return sendResponse(res, 200, "Application fetched successfully", application);
  });

export const submitApplicationController =
  asyncHandler(async (req: Request, res: Response) => {
    if (req.user!.role === "APPLICANT") {
      await assertApplicationAccess(
        req.params.id as string,
        req.user!.tenantId,
        req.user!.userId,
        req.user!.role,
      );
    }

    const result = await submitApplication(
      req.params.id as string,
      req.user!.tenantId,
    );

    return sendResponse(res, 200, "Application submitted successfully", result);
  });

export const updateApplicationStatusController =
  async (req : Request, res : Response) => {

    try {

      const { newStatus } = req.body;

      const application =
        await updateApplicationStatus(
          req.params.id as string,
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
      req.params.id as string,
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

async (req : Request, res : Response) => {
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

async (req : Request, res : Response) => {

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

export const getReviewerMetricsController =
asyncHandler(

async (req : Request, res : Response) => {

    const metrics =
        await getReviewerMetrics(
            req.user!.userId,
            req.user!.tenantId
        );

    return sendResponse(
        res,
        200,
        "Reviewer metrics fetched successfully",
        metrics
    );

});

export const getRiskAssessmentController =
asyncHandler(

async (req : Request, res : Response) => {

    const result =
    await calculateRisk(

        req.params.id as string,

        req.user!.tenantId

    );

    return sendResponse(

        res,

        200,

        "Risk assessment completed",

        result

    );

});

export const getApplicationAuditLogsController =
asyncHandler(async (req : Request, res : Response) => {

    const logs =
    await getApplicationAuditLogs(
        req.params.id as string,
        req.user!.tenantId
    );

    return sendResponse(
        res,
        200,
        "Audit logs fetched successfully",
        logs
    );

});

export const getMeController =
asyncHandler(async (req : Request, res : Response) => {

    const user =
    await getMe(
        req.user!.userId as string
    );

    return sendResponse(
        res,
        200,
        "Profile fetched successfully",
        user
    );

});