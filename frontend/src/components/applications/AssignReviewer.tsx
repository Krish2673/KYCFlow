import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { assignReviewer } from '../../api/applications';
import { getReviewers } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Spinner } from '../ui/Spinner';

interface AssignReviewerProps {
  applicationId: string;
  currentReviewerId?: string | null;
}

export function AssignReviewer({ applicationId, currentReviewerId }: AssignReviewerProps) {
  const { user } = useAuth();
  const [reviewerId, setReviewerId] = useState(currentReviewerId ?? '');
  const queryClient = useQueryClient();

  const { data: reviewers, isLoading } = useQuery({
    queryKey: ['reviewers', user?.tenantId],
    queryFn: () => getReviewers(user!.tenantId),
    enabled: !!user?.tenantId,
  });

  const mutation = useMutation({
    mutationFn: () => assignReviewer(applicationId, { reviewerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  if (isLoading) return <Spinner className="h-5 w-5" />;

  const options = [
    { value: '', label: 'Select a reviewer…' },
    ...(reviewers?.map((r) => ({ value: r.id, label: `${r.name} (${r.email})` })) ?? []),
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Select
          label="Assign Reviewer"
          value={reviewerId}
          onChange={(e) => setReviewerId(e.target.value)}
          options={options}
        />
      </div>
      <Button
        loading={mutation.isPending}
        disabled={!reviewerId}
        onClick={() => mutation.mutate()}
      >
        <UserPlus className="h-4 w-4" />
        Assign
      </Button>
      {mutation.isError && (
        <p className="text-sm text-red-600 sm:basis-full">
          {(mutation.error as Error).message}
        </p>
      )}
    </div>
  );
}
