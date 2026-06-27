import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { getApplicationMetrics, getApplications } from '../api/applications';
import { MetricsCards } from '../components/applications/MetricsCards';
import { ApplicationStatusBadge } from '../components/applications/ApplicationStatusBadge';
import { ReviewerDashboard } from '../components/dashboard/ReviewerDashboard';
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { PageLoader } from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { formatRelativeDate } from '../lib/utils';

export function DashboardPage() {
  const { hasRole } = useAuth();
  const isTenantAdmin = hasRole('TENANT_ADMIN', 'SUPER_ADMIN');
  const isReviewerOnly = hasRole('REVIEWER') && !isTenantAdmin;

  if (isReviewerOnly) {
    return <ReviewerDashboard />;
  }

  return <TenantAdminDashboard isTenantAdmin={isTenantAdmin} />;
}

function TenantAdminDashboard({ isTenantAdmin }: { isTenantAdmin: boolean }) {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: getApplicationMetrics,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['applications', { page: 1, limit: 5 }],
    queryFn: () => getApplications({ page: 1, limit: 5 }),
    enabled: isTenantAdmin,
  });

  if (metricsLoading) return <PageLoader />;

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your KYC pipeline and application status"
        action={
          isTenantAdmin ? (
            <Link to="/applications/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Application
              </Button>
            </Link>
          ) : undefined
        }
      />

      {metrics && <MetricsCards metrics={metrics} />}
      {metrics && <StatusDistributionChart metrics={metrics} />}

      {isTenantAdmin && (
        <Card className="mt-8">
          <CardHeader
            title="Recent Applications"
            description="Latest KYC applications in your tenant"
            action={
              <Link to="/applications">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />

          {recentLoading ? (
            <PageLoader />
          ) : recent?.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No applications yet. Create your first one to get started.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Applicant</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Created</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recent?.data.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{app.fullName}</p>
                        <p className="text-xs text-slate-500">{app.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <ApplicationStatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatRelativeDate(app.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
