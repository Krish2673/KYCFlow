import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { upload } from "../../middleware/multer.middleware";

import { uploadDocumentController, getDocumentsController, verifyDocumentController, viewDocumentController } from "./document.controller";

const router = Router();

router.post(
  "/:id",
  authenticate,
  authorize(
    "TENANT_ADMIN",
    "REVIEWER"
  ),
  upload.single("file"),
  uploadDocumentController
);

router.get(
    "/application/:applicationId",
    authenticate,
    getDocumentsController
);

router.get(
    "/:documentId/view",

    authenticate,

    viewDocumentController
);

router.patch(
    "/:documentId/verify",
    authenticate,
    authorize("REVIEWER"),
    verifyDocumentController
);


export default router;