import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDocumentViewUrl, verifyDocument } from '../../api/documents';
import { DOCUMENT_TYPE_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import type { Document } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const URL_TTL_SECONDS = 60;

interface DocumentViewerModalProps {
  document: Document | null;
  applicantName?: string;
  canVerify?: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function DocumentViewerModal({
  document,
  applicantName,
  canVerify,
  onClose,
  onVerified,
}: DocumentViewerModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(URL_TTL_SECONDS);
  const queryClient = useQueryClient();

  const viewMutation = useMutation({
    mutationFn: () => getDocumentViewUrl(document!.id),
    onSuccess: (data) => {
      setUrl(data.url);
      setSecondsLeft(URL_TTL_SECONDS);
      setError(null);
    },
    onError: (err) => setError((err as Error).message),
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyDocument(document!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', document!.applicationId] });
      onVerified?.();
      onClose();
    },
  });

  useEffect(() => {
    if (!document) return;
    setUrl(null);
    setError(null);
    viewMutation.mutate();
  }, [document?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!document) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.document.body.style.overflow = '';
    };
  }, [document, onClose]);

  useEffect(() => {
    if (!url) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          viewMutation.mutate();
          return URL_TTL_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!document) return null;

  const isImage = /\.(jpg|jpeg|png|webp|gif)/i.test(document.path);
  const isPdf = /\.pdf/i.test(document.path);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              {DOCUMENT_TYPE_LABELS[document.type]}
            </h3>
            {applicantName && (
              <p className="text-sm text-slate-500">{applicantName}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {document.verified ? (
              <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700">Pending verification</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {viewMutation.isPending && !url && (
            <div className="flex h-96 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
            </div>
          )}

          {error && (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="secondary" size="sm" onClick={() => viewMutation.mutate()}>
                Retry
              </Button>
            </div>
          )}

          {url && !error && (
            <>
              {isImage ? (
                <img
                  src={url}
                  alt={DOCUMENT_TYPE_LABELS[document.type]}
                  className="mx-auto max-h-[60vh] rounded-lg object-contain shadow-md"
                />
              ) : isPdf ? (
                <iframe
                  src={url}
                  title={DOCUMENT_TYPE_LABELS[document.type]}
                  className="h-[60vh] w-full rounded-lg border-0 bg-white shadow-md"
                />
              ) : (
                <div className="flex h-96 flex-col items-center justify-center gap-4">
                  <p className="text-sm text-slate-600">
                    Preview not available for this file type.
                  </p>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary">
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </Button>
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-400">
            Uploaded {formatDate(document.uploadedAt)}
            {url && (
              <span className="ml-3 text-amber-600">
                URL refreshes in {secondsLeft}s
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </a>
            )}
            {canVerify && !document.verified && (
              <Button
                variant="success"
                size="sm"
                loading={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate()}
              >
                <ShieldCheck className="h-4 w-4" />
                Verify Document
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
