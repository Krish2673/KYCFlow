import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getApplication, getApplicationRisk } from '../api/applications';
import { getDocuments } from '../api/documents';
import { RiskAssessmentDisplay } from '../components/applications/RiskAssessmentDisplay';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';

export function RiskAssessmentPage() {
  const { id } = useParams<{ id: string }>();

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id!),
    enabled: !!id,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => getDocuments(id!),
    enabled: !!id,
  });

  const {
    data: assessment,
    isLoading: riskLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['risk', id],
    queryFn: () => getApplicationRisk(id!),
    enabled: !!id,
  });

  if (appLoading || riskLoading) return <PageLoader />;

  if (error || !assessment || !application) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">{(error as Error)?.message ?? 'Unable to load assessment'}</p>
        <Link to={`/applications/${id}`} className="mt-4 inline-block text-brand-600 hover:underline">
          Back to application
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Link
          to={`/applications/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to application
        </Link>
        <Button
          variant="secondary"
          size="sm"
          loading={isFetching}
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Assessment
        </Button>
      </div>

      <RiskAssessmentDisplay
        assessment={assessment}
        documents={documents ?? []}
        applicantName={application.fullName}
        variant="full"
      />
    </div>
  );
}
