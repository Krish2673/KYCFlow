import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { createApplication } from '../api/applications';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export function CreateApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: () => createApplication({ fullName, email }),
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      navigate(`/applications/${app.id}`);
    },
  });

  return (
    <div>
      <Header
        title="New Application"
        description="Create a new KYC application for an applicant"
      />

      <Card className="max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-5"
        >
          <Input
            id="fullName"
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mutation.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {(mutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>
              Create Application
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/applications')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
