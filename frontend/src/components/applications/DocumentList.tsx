import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Eye, FileText, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { getDocuments, verifyDocument } from '../../api/documents';
import { DOCUMENT_TYPE_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import type { Document } from '../../types';
import { DocumentViewerModal } from '../documents/DocumentViewerModal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';

interface DocumentListProps {
  applicationId: string;
  applicantName?: string;
  canVerify?: boolean;
}

export function DocumentList({
  applicationId,
  applicantName,
  canVerify,
}: DocumentListProps) {
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', applicationId],
    queryFn: () => getDocuments(applicationId),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['risk', applicationId] });
    },
  });

  if (isLoading) return <Spinner className="h-6 w-6" />;

  if (!documents?.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents uploaded"
        description="Upload identity documents to proceed with verification."
      />
    );
  }

  return (
    <>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {documents.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            canVerify={canVerify}
            onView={() => setViewingDoc(doc)}
            onVerify={() => verifyMutation.mutate(doc.id)}
            verifying={verifyMutation.isPending && verifyMutation.variables === doc.id}
          />
        ))}
      </div>

      <DocumentViewerModal
        document={viewingDoc}
        applicantName={applicantName}
        canVerify={canVerify}
        onClose={() => setViewingDoc(null)}
        onVerified={() => {
          queryClient.invalidateQueries({ queryKey: ['documents', applicationId] });
          queryClient.invalidateQueries({ queryKey: ['risk', applicationId] });
        }}
      />
    </>
  );
}

function DocumentRow({
  doc,
  canVerify,
  onView,
  onVerify,
  verifying,
}: {
  doc: Document;
  canVerify?: boolean;
  onView: () => void;
  onVerify: () => void;
  verifying: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <FileText className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <p className="font-medium text-slate-900">{DOCUMENT_TYPE_LABELS[doc.type]}</p>
          <p className="text-xs text-slate-500">Uploaded {formatDate(doc.uploadedAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {doc.verified ? (
          <Badge className="bg-emerald-100 text-emerald-700">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-600">Pending</Badge>
        )}
        <Button variant="secondary" size="sm" onClick={onView}>
          <Eye className="h-4 w-4" />
          View
        </Button>
        {canVerify && !doc.verified && (
          <Button variant="success" size="sm" loading={verifying} onClick={onVerify}>
            <ShieldCheck className="h-4 w-4" />
            Verify
          </Button>
        )}
      </div>
    </div>
  );
}
