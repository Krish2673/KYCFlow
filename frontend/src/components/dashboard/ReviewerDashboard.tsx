import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardCheck,
  FileSearch,
  Inbox,
} from 'lucide-react';
import { ApplicationStatusBadge } from '../applications/ApplicationStatusBadge';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { PageLoader } from '../ui/Spinner';
import { useReviewerPendingWork } from '../../hooks/useReviewerPendingWork';
import { formatRelativeDate } from '../../lib/utils';

export function ReviewerDashboard() {
  const {
    isLoading,
    myApplications,
    pendingVerifications,
    documentsAwaitingReview,
    pendingDocuments,
    getDocumentLabel,
  } = useReviewerPendingWork();

  if (isLoading) return <PageLoader />;

  const statCards = [
    {
      label: 'My Applications',
      value: myApplications.length,
      icon: Inbox,
      color: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Pending Verifications',
      value: pendingVerifications,
      icon: ClipboardCheck,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Documents Awaiting Review',
      value: documentsAwaitingReview,
      icon: FileSearch,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div>
      <Header
        title="Reviewer Dashboard"
        description="Your assigned applications and pending verification work"
        action={
          <Link to="/inbox">
            <Button variant="secondary">
              Full Inbox
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="!p-5">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="My Applications"
            description="Recently assigned KYC applications"
            action={
              <Link to="/inbox">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          {myApplications.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No assigned applications"
              description="Applications will appear here once a tenant admin assigns you as reviewer."
            />
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {myApplications.slice(0, 6).map((app) => (
                <Link
                  key={app.id}
                  to={`/applications/${app.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{app.fullName}</p>
                    <p className="text-xs text-slate-500">{app.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ApplicationStatusBadge status={app.status} />
                    <span className="text-xs text-slate-400">
                      {formatRelativeDate(app.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Documents Awaiting Review"
            description="Unverified documents across your assigned applications"
          />

          {pendingDocuments.length === 0 ? (
            <EmptyState
              icon={FileSearch}
              title="All caught up"
              description="No documents are waiting for your verification."
            />
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {pendingDocuments.slice(0, 8).map(({ document, application }) => (
                <Link
                  key={document.id}
                  to={`/applications/${application.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {getDocumentLabel(document.type)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {application.fullName} · {application.email}
                    </p>
                  </div>
                  <Button variant="primary" size="sm">
                    Review
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
