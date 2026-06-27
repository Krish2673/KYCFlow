import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
import { useState } from 'react';
import { createTenant, getTenants } from '../api/tenants';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import { formatDate } from '../lib/utils';

export function TenantsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: getTenants,
  });

  return (
    <div>
      <Header
        title="Tenants"
        description="Manage organizations on the platform"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New Tenant
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : !tenants?.length ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No tenants yet"
            description="Create your first tenant organization."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Tenant
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <Building2 className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Created {formatDate(tenant.createdAt)}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-slate-400">{tenant.id}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateTenantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
          setModalOpen(false);
        }}
      />
    </div>
  );
}

function CreateTenantModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');

  const mutation = useMutation({
    mutationFn: () => createTenant({ name }),
    onSuccess: () => {
      setName('');
      onSuccess();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Create Tenant">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="space-y-4"
      >
        <Input
          id="tenantName"
          label="Organization Name"
          placeholder="Acme Corp"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {mutation.isError && (
          <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create Tenant
          </Button>
        </div>
      </form>
    </Modal>
  );
}
