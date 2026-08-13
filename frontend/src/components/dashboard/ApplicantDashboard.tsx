import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Upload } from 'lucide-react';
import { getMyApplication } from '../../api/applications';
import { ApplicationStatusBadge } from '../applications/ApplicationStatusBadge';
import { WorkflowStepper } from '../applications/WorkflowStepper';
import { Header } from '../layout/Header';
import { Button } from '../ui/Button';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { PageLoader } from '../ui/Spinner';
import { APPLICATION_STATUS_LABELS } from '../../lib/constants';
import { formatRelativeDate } from '../../lib/utils';

export function ApplicantDashboard() {
  const { data: application, isLoading, error } = useQuery({
    queryKey: ['my-application'],
    queryFn: getMyApplication,
    retry: false,
  });

  if (isLoading) return <PageLoader />;

  if (error || !application) {
    return (
      <div>
        <Header
          title="My KYC Application"
          description="Track your verification progress"
        />
        <Card>
          <EmptyState
            icon={FileText}
            title="No application yet"
            description="Your organization admin hasn't set up your KYC application yet. Please contact them if you've been approved."
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="My KYC Application"
        description={`Status: ${APPLICATION_STATUS_LABELS[application.status]}`}
        action={
          <Link to={`/applications/${application.id}`}>
            <Button>
              <Upload className="h-4 w-4" />
              Manage Application
            </Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Workflow Progress" />
        <WorkflowStepper status={application.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Application Details" />
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-400">Name</dt>
              <dd className="font-medium text-slate-900">{application.fullName}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="font-medium text-slate-900">{application.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Last Updated</dt>
              <dd className="text-slate-600">{formatRelativeDate(application.updatedAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Current Status" />
          <ApplicationStatusBadge status={application.status} />
          {application.reviewer && (
            <p className="mt-4 text-sm text-slate-600">
              Reviewer: <span className="font-medium">{application.reviewer.name}</span>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
