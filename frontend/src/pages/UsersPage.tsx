import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, UserPlus, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { approveApplicant, getPendingApplicants, getUsers, inviteUser, rejectApplicant } from '../api/users';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card, CardHeader } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from '../lib/constants';
import { formatDate } from '../lib/utils';
import type { UserRole } from '../types';
import { cn } from '../lib/utils';

type Tab = 'team' | 'pending';

export function UsersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('team');
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-applicants'],
    queryFn: getPendingApplicants,
  });

  const teamUsers = users?.filter(
    (u) => u.tenantId === user?.tenantId && u.role !== 'APPLICANT',
  ) ?? [];

  const approveMutation = useMutation({
    mutationFn: approveApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div>
      <Header
        title="Users"
        description="Manage team members and approve applicant registrations"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite Reviewer
          </Button>
        }
      />

      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {(['team', 'pending'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t === 'team' ? 'Team Members' : `Pending Applicants${pending?.length ? ` (${pending.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'team' ? (
        isLoading ? (
          <PageLoader />
        ) : teamUsers.length === 0 ? (
          <Card>
            <EmptyState
              icon={Users}
              title="No team members yet"
              description="Invite reviewers to help with KYC verification."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Invite Reviewer
                </Button>
              }
            />
          </Card>
        ) : (
          <UsersTable users={teamUsers} />
        )
      ) : pendingLoading ? (
        <PageLoader />
      ) : !pending?.length ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No pending applicants"
            description="Applicant registrations awaiting approval will appear here."
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Pending Applicant Registrations"
            description="Approve applicants to create their KYC application"
          />
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {pending.map((applicant) => (
              <div key={applicant.id} className="flex items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">{applicant.name}</p>
                  <p className="text-sm text-slate-500">{applicant.email}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Registered {formatDate(applicant.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    loading={approveMutation.isPending && approveMutation.variables === applicant.id}
                    onClick={() => approveMutation.mutate(applicant.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    loading={rejectMutation.isPending && rejectMutation.variables === applicant.id}
                    onClick={() => rejectMutation.mutate(applicant.id)}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <InviteUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function UsersTable({ users }: { users: Array<{ id: string; name: string; email: string; role: UserRole; status?: string; createdAt: string }> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            <th className="px-5 py-3.5 text-left font-medium text-slate-600">Name</th>
            <th className="px-5 py-3.5 text-left font-medium text-slate-600">Email</th>
            <th className="px-5 py-3.5 text-left font-medium text-slate-600">Role</th>
            <th className="px-5 py-3.5 text-left font-medium text-slate-600">Status</th>
            <th className="px-5 py-3.5 text-left font-medium text-slate-600">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50/50">
              <td className="px-5 py-4 font-medium text-slate-900">{u.name}</td>
              <td className="px-5 py-4 text-slate-600">{u.email}</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {USER_ROLE_LABELS[u.role]}
                </span>
              </td>
              <td className="px-5 py-4 text-slate-600">
                {u.status ? USER_STATUS_LABELS[u.status as keyof typeof USER_STATUS_LABELS] ?? u.status : 'Active'}
              </td>
              <td className="px-5 py-4 text-slate-500">{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InviteUserModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'REVIEWER' | 'TENANT_ADMIN'>('REVIEWER');

  const mutation = useMutation({
    mutationFn: () => inviteUser({ name, email, role }),
    onSuccess: () => {
      setName('');
      setEmail('');
      setRole('REVIEWER');
      onSuccess();
    },
  });

  const roleOptions = [
    { value: 'REVIEWER', label: 'Reviewer' },
    { value: 'TENANT_ADMIN', label: 'Tenant Admin' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Invite Team Member">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <p className="text-sm text-slate-600">
          An invitation email will be sent. They&apos;ll set their password via the invite link.
        </p>
        <Input id="inviteName" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input id="inviteEmail" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as 'REVIEWER' | 'TENANT_ADMIN')} options={roleOptions} />

        {mutation.isError && (
          <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
        )}

        {mutation.isSuccess && (
          <p className="text-sm text-emerald-600">Invitation sent successfully!</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Send Invitation</Button>
        </div>
      </form>
    </Modal>
  );
}
