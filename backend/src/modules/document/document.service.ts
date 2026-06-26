import prisma from "../../config/prisma";
import { DocumentType } from "@prisma/client";

export const createDocument = async (
  applicationId: string,
  type: DocumentType,
  path: string
) => {
  return prisma.document.create({
    data: {
      applicationId,
      type,
      path,
    },
  });
};

export const getDocumentsByApplication =
async (
    applicationId: string
) => {

    return prisma.document.findMany({

        where: {
            applicationId
        },

        orderBy: {
            uploadedAt: "desc"
        }

    });

};

export const verifyDocument =
async (
    documentId: string
) => {

    return prisma.document.update({

        where: {
            id: documentId
        },

        data: {
            verified: true
        }

    });

};

export const getDocumentById = async (
    documentId: string
) => {

    return prisma.document.findUnique({
        where: {
            id: documentId
        },
        include: {
            application: true
        }
    });

};