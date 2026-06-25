import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";

export const verifyAssignedReviewer = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const application = await prisma.application.findUnique({
        where: {
            id: req.params.id
        }
    });

    if (!application) {
        return res.status(404).json({
            success: false,
            message: "Application not found"
        });
    }

    if (application.reviewerId !== req.user!.userId) {
        return res.status(403).json({
            success: false,
            message: "You are not assigned to this application"
        });
    }

    next();
};