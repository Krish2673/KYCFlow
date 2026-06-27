import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Send,
  Shield,
  User,
} from 'lucide-react';
import { getApplication, getApplicationRisk, submitApplication } from '../api/applications';
import { getDocuments } from '../api/documents';
import { AssignReviewer } from '../components/applications/AssignReviewer';
import { ApplicationStatusBadge } from '../components/applications/ApplicationStatusBadge';
import { AuditLogPanel } from '../components/applications/AuditLogPanel';
import { DocumentList } from '../components/applications/DocumentList';
import { DocumentUpload } from '../components/applications/DocumentUpload';
import { RiskAssessmentDisplay } from '../components/applications/RiskAssessmentDisplay';
import { StatusTransition } from '../components/applications/StatusTransition';
import { WorkflowStepper } from '../components/applications/WorkflowStepper';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: application, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id!),
    enabled: !!id,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => getDocuments(id!),
    enabled: !!id,
  });

  const { data: risk } = useQuery({
    queryKey: ['risk', id],
    queryFn: () => getApplicationRisk(id!),
    enabled: !!id && !!application && application.status !== 'DRAFT',
  });

  const submitMutation = useMutation({
    mutationFn: () => submitApplication(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  if (isLoading) return <PageLoader />;

  if (error || !application) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{(error as Error)?.message ?? 'Application not found'}</p>
        <Link to="/applications" className="mt-4 inline-block text-brand-600 hover:underline">
          Back to applications
        </Link>
      </div>
    );
  }

  const isAssignedReviewer = application.reviewerId === user?.id;
  const canUpload =
    (hasRole('TENANT_ADMIN') || (hasRole('REVIEWER') && isAssignedReviewer)) &&
    !['APPROVED', 'REJECTED'].includes(application.status);
  const canSubmit = hasRole('TENANT_ADMIN') && application.status === 'DRAFT';
  const canAssignReviewer = hasRole('TENANT_ADMIN') && application.status === 'SUBMITTED';
  const canReview = hasRole('REVIEWER') && isAssignedReviewer;
  const showRisk = application.status !== 'DRAFT';

  return (
    <div>
      <div className="mb-6">
        <Link
          to={hasRole('REVIEWER') && !hasRole('TENANT_ADMIN') ? '/inbox' : '/applications'}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <Header
        title={application.fullName}
        description={`Application ID: ${application.id}`}
        action={
          <div className="flex gap-2">
            {showRisk && (
              <Link to={`/applications/${id}/risk`}>
                <Button variant="secondary">
                  <Shield className="h-4 w-4" />
                  Full Risk Assessment
                </Button>
              </Link>
            )}
            {canSubmit && (
              <Button
                loading={submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                <Send className="h-4 w-4" />
                Submit Application
              </Button>
            )}
          </div>
        }
      />

      <Card className="mb-6">
        <CardHeader title="Workflow Progress" />
        <WorkflowStepper status={application.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Applicant Details" />
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-400">Full Name</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{application.fullName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-slate-400" />
                <div>
                  <dt className="text-xs font-medium uppercase text-slate-400">Email</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{application.email}</dd>
                </div>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader
              title="Documents"
              description={
                canUpload
                  ? 'Upload and manage identity documents'
                  : 'View uploaded documents'
              }
            />
            {canUpload && (
              <div className="mb-6">
                <DocumentUpload applicationId={application.id} />
              </div>
            )}
            <DocumentList
              applicationId={application.id}
              applicantName={application.fullName}
              canVerify={
                canReview &&
                ['DOCUMENT_VERIFICATION', 'RISK_ASSESSMENT', 'MANUAL_REVIEW'].includes(
                  application.status,
                )
              }
            />
          </Card>

          {showRisk && risk && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Trust Score Summary</h3>
                <Link
                  to={`/applications/${id}/risk`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  View full assessment →
                </Link>
              </div>
              <RiskAssessmentDisplay
                assessment={risk}
                documents={documents ?? []}
                variant="compact"
              />
            </div>
          )}

          <AuditLogPanel applicationId={application.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Status" />
            <div className="space-y-4">
              <ApplicationStatusBadge status={application.status} />
              <div className="space-y-2 text-sm text-slate-600">
                <p>
                  <span className="text-slate-400">Created:</span>{' '}
                  {formatDate(application.createdAt)}
                </p>
                <p>
                  <span className="text-slate-400">Updated:</span>{' '}
                  {formatDate(application.updatedAt)}
                </p>
                {application.createdBy && (
                  <p>
                    <span className="text-slate-400">Created by:</span>{' '}
                    {application.createdBy.name}
                  </p>
                )}
                {application.reviewer && (
                  <p>
                    <span className="text-slate-400">Reviewer:</span>{' '}
                    {application.reviewer.name}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {canAssignReviewer && (
            <Card>
              <CardHeader
                title="Reviewer Assignment"
                description="Assign a reviewer to this application"
              />
              <AssignReviewer
                applicationId={application.id}
                currentReviewerId={application.reviewerId}
              />
            </Card>
          )}

          {canReview &&
            application.status !== 'DRAFT' &&
            application.status !== 'APPROVED' &&
            application.status !== 'REJECTED' && (
              <Card>
                <CardHeader
                  title="Workflow Actions"
                  description="Advance the application through the pipeline"
                />
                <StatusTransition
                  applicationId={application.id}
                  currentStatus={application.status}
                />
              </Card>
            )}

          {submitMutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(submitMutation.error as Error).message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
