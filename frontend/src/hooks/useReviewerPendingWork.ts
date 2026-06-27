import { useQueries, useQuery } from '@tanstack/react-query';
import { getMyApplications } from '../api/applications';
import { getDocuments } from '../api/documents';
import { DOCUMENT_TYPE_LABELS } from '../lib/constants';
import type { Application, Document } from '../types';

export interface PendingDocumentItem {
  document: Document;
  application: Application;
}

const ACTIVE_REVIEW_STATUSES = [
  'DOCUMENT_VERIFICATION',
  'RISK_ASSESSMENT',
  'MANUAL_REVIEW',
  'SUBMITTED',
] as const;

export function useReviewerPendingWork() {
  const appsQuery = useQuery({
    queryKey: ['my-applications', 'pending-work'],
    queryFn: () => getMyApplications({ limit: 50 }),
  });

  const activeApps =
    appsQuery.data?.data.filter((app) =>
      ACTIVE_REVIEW_STATUSES.includes(app.status as (typeof ACTIVE_REVIEW_STATUSES)[number]),
    ) ?? [];

  const docQueries = useQueries({
    queries: activeApps.map((app) => ({
      queryKey: ['documents', app.id, 'pending-work'],
      queryFn: () => getDocuments(app.id),
      enabled: !!appsQuery.data,
    })),
  });

  const isLoading =
    appsQuery.isLoading || docQueries.some((q) => q.isLoading);

  const pendingDocuments: PendingDocumentItem[] = [];

  activeApps.forEach((app, index) => {
    const docs = docQueries[index]?.data ?? [];
    docs
      .filter((doc) => !doc.verified)
      .forEach((document) => {
        pendingDocuments.push({ document, application: app });
      });
  });

  const pendingVerifications = activeApps.filter(
    (app) => app.status === 'DOCUMENT_VERIFICATION',
  ).length;

  return {
    isLoading,
    myApplications: appsQuery.data?.data ?? [],
    activeApps,
    pendingVerifications,
    pendingDocuments,
    documentsAwaitingReview: pendingDocuments.length,
    getDocumentLabel: (type: Document['type']) => DOCUMENT_TYPE_LABELS[type],
  };
}
