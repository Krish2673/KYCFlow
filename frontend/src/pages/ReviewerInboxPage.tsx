import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Inbox, Search } from 'lucide-react';
import { useState } from 'react';
import { getMyApplications } from '../api/applications';
import { ApplicationStatusBadge } from '../components/applications/ApplicationStatusBadge';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import { APPLICATION_STATUS_LABELS } from '../lib/constants';
import { formatRelativeDate } from '../lib/utils';
import type { ApplicationStatus } from '../types';

export function ReviewerInboxPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-applications', { page, search, status }],
    queryFn: () =>
      getMyApplications({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...Object.entries(APPLICATION_STATUS_LABELS)
      .filter(([key]) => key !== 'DRAFT')
      .map(([value, label]) => ({ value, label })),
  ];

  return (
    <div>
      <Header
        title="My Inbox"
        description="Applications assigned to you for review"
      />

      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ApplicationStatus | '');
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <PageLoader />
      ) : !data?.data.length ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Your inbox is empty"
            description="No applications have been assigned to you yet."
          />
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3.5 text-left font-medium text-slate-600">Applicant</th>
                  <th className="px-5 py-3.5 text-left font-medium text-slate-600">Status</th>
                  <th className="px-5 py-3.5 text-left font-medium text-slate-600">Submitted by</th>
                  <th className="px-5 py-3.5 text-left font-medium text-slate-600">Updated</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{app.fullName}</p>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {app.createdBy?.name ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatRelativeDate(app.updatedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/applications/${app.id}`}>
                        <Button variant="primary" size="sm">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.meta && data.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {data.meta.page} of {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
