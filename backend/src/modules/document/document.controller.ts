import { supabase } from "../../config/supabase";
import { createDocument, getDocumentsByApplication, verifyDocument, getDocumentById } from "./document.service";
import { assertApplicationAccess } from "../application/application.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../errors/AppError";
import { Request, Response } from "express";

export const uploadDocumentController =
asyncHandler(async (req : Request, res : Response) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  await assertApplicationAccess(
    req.params.id as string,
    req.user!.tenantId,
    req.user!.userId,
    req.user!.role,
  );

  const fileName =
    `${Date.now()}-${req.file.originalname}`;

  const { data, error } =
await supabase.storage
.from("documents")
.upload(
    fileName,
    req.file.buffer,
    {
        contentType: req.file.mimetype,
    }
);

  if (error) {
    throw new AppError("Failed to upload document", 500);
  }

  const document =
await createDocument(
    req.params.id as string,
    req.body.type,
    fileName
);

  return sendResponse(
    res,
    201,
    "Document uploaded successfully",
    document
);
});

export const getDocumentsController =
asyncHandler(

async (req : Request, res : Response) => {

    const documents =
    await getDocumentsByApplication(
        req.params.applicationId as string
    );

    return sendResponse(
        res,
        200,
        "Documents fetched successfully",
        documents
    );

});

export const verifyDocumentController =
asyncHandler(

async (req : Request, res : Response) => {

    const existingDocument =
await getDocumentById(
    req.params.documentId as string
);

if (!existingDocument) {

    throw new AppError(
        "Document not found",
        404
    );

}   

    if (
    existingDocument.application.reviewerId
    !==
    req.user!.userId
) {

    throw new AppError(
        "You are not authorized to verify this document",
        403
    );

}

    const document =
    await verifyDocument(
        req.params.documentId as string
    );

    return sendResponse(
        res,
        200,
        "Document verified successfully",
        document
    );

});

export const viewDocumentController =
asyncHandler(

async (req : Request, res : Response) => {

    const document =
    await getDocumentById(
        req.params.documentId as string
    );

    if (!document) {
        throw new AppError(
            "Document not found",
            404
        );
    }

    const canView =

req.user!.tenantId ===
document.application.tenantId;

    const { data, error } =
await supabase.storage
.from("documents")
.createSignedUrl(
    document.path,
    60
);

    if (error) {
        throw new AppError("Failed to generate document URL", 500);
    }

    return sendResponse(
    res,
    200,
    "Document URL generated successfully",
    {
        url: data.signedUrl
    }
);

});