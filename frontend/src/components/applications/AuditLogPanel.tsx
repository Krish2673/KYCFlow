import { useQuery } from '@tanstack/react-query';
import { Clock, History } from 'lucide-react';
import { getAuditLogs } from '../../api/audit';
import { formatDate } from '../../lib/utils';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Spinner } from '../ui/Spinner';
import type { ApplicationStatus } from '../../types';

interface AuditLogPanelProps {
  applicationId: string;
}

export function AuditLogPanel({ applicationId }: AuditLogPanelProps) {
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['audit-logs', applicationId],
    queryFn: () => getAuditLogs(applicationId),
    retry: false,
  });

  return (
    <Card>
      <CardHeader
        title="Audit Trail"
        description="Complete history of status changes for this application"
      />

      {isLoading ? (
        <Spinner className="h-6 w-6" />
      ) : isError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Audit log endpoint is not available yet. This section will populate once the backend
          exposes <code className="text-xs">GET /applications/:id/audit-logs</code>.
        </div>
      ) : !logs?.length ? (
        <EmptyState
          icon={History}
          title="No audit entries yet"
          description="Status changes will be recorded here as the application moves through the workflow."
        />
      ) : (
        <div className="relative space-y-0">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
          {logs.map((log) => (
            <div key={log.id} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-brand-100">
                <Clock className="h-3.5 w-3.5 text-brand-600" />
              </div>
              <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip status={log.fromStatus} />
                  <span className="text-slate-400">→</span>
                  <StatusChip status={log.toStatus} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {log.user?.name ? (
                    <>Changed by <strong>{log.user.name}</strong></>
                  ) : (
                    'Status updated'
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{formatDate(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function StatusChip({ status }: { status: ApplicationStatus }) {
  return <ApplicationStatusBadge status={status} />;
}
