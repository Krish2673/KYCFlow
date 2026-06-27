import { apiRequest } from './client';
import type { Document, DocumentType } from '../types';

export function getDocuments(applicationId: string) {
  return apiRequest<Document[]>(`/api/v1/documents/application/${applicationId}`);
}

export function uploadDocument(applicationId: string, file: File, type: DocumentType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  return apiRequest<Document>(`/api/v1/documents/${applicationId}`, {
    method: 'POST',
    body: formData,
  });
}

export function getDocumentViewUrl(documentId: string) {
  return apiRequest<{ url: string }>(`/api/v1/documents/${documentId}/view`);
}

export function verifyDocument(documentId: string) {
  return apiRequest<Document>(`/api/v1/documents/${documentId}/verify`, {
    method: 'PATCH',
  });
}
