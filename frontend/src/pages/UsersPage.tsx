import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { createUser, getUsers } from '../api/users';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLE_LABELS } from '../lib/constants';
import { formatDate } from '../lib/utils';
import type { UserRole } from '../types';

export function UsersPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const tenantUsers = users?.filter((u) => u.tenantId === user?.tenantId) ?? [];

  return (
    <div>
      <Header
        title="Users"
        description="Manage team members in your organization"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : tenantUsers.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No users yet"
            description="Add team members to help manage KYC applications."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left font-medium text-slate-600">Name</th>
                <th className="px-5 py-3.5 text-left font-medium text-slate-600">Email</th>
                <th className="px-5 py-3.5 text-left font-medium text-slate-600">Role</th>
                <th className="px-5 py-3.5 text-left font-medium text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-5 py-4 text-slate-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {USER_ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tenantId={user?.tenantId ?? ''}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function CreateUserModal({
  open,
  onClose,
  tenantId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('REVIEWER');

  const mutation = useMutation({
    mutationFn: () => createUser({ name, email, password, role, tenantId }),
    onSuccess: () => {
      setName('');
      setEmail('');
      setPassword('');
      setRole('REVIEWER');
      onSuccess();
    },
  });

  const roleOptions = Object.entries(USER_ROLE_LABELS)
    .filter(([value]) => value !== 'SUPER_ADMIN')
    .map(([value, label]) => ({ value, label }));

  return (
    <Modal open={open} onClose={onClose} title="Add New User">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <Input
          id="userName"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="userEmail"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="userPassword"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={roleOptions}
        />

        {mutation.isError && (
          <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
}
