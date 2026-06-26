import { supabase } from "../../config/supabase";
import { createDocument, getDocumentsByApplication, verifyDocument, getDocumentById } from "./document.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";

export const uploadDocumentController =
asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error("No file uploaded");
  }

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
    throw error;
  }

  const document =
await createDocument(
    req.params.id,
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

async (req, res) => {

    const documents =
    await getDocumentsByApplication(
        req.params.applicationId
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

async (req, res) => {

    const existingDocument =
await getDocumentById(
    req.params.documentId
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
        req.params.documentId
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

async (req, res) => {

    const document =
    await getDocumentById(
        req.params.documentId
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
        throw error;
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