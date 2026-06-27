import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { updateApplicationStatus } from '../../api/applications';
import {
  APPLICATION_STATUS_LABELS,
  VALID_TRANSITIONS,
} from '../../lib/constants';
import type { ApplicationStatus } from '../../types';
import { Button } from '../ui/Button';

interface StatusTransitionProps {
  applicationId: string;
  currentStatus: ApplicationStatus;
}

export function StatusTransition({ applicationId, currentStatus }: StatusTransitionProps) {
  const queryClient = useQueryClient();
  const nextStatuses = VALID_TRANSITIONS[currentStatus];

  const mutation = useMutation({
    mutationFn: (newStatus: ApplicationStatus) =>
      updateApplicationStatus(applicationId, { newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        This application has reached a terminal state.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Move application from{' '}
        <strong>{APPLICATION_STATUS_LABELS[currentStatus]}</strong> to:
      </p>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            variant={status === 'REJECTED' ? 'danger' : status === 'APPROVED' ? 'success' : 'primary'}
            size="sm"
            loading={mutation.isPending && mutation.variables === status}
            onClick={() => mutation.mutate(status)}
          >
            <ArrowRight className="h-4 w-4" />
            {APPLICATION_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
      {mutation.isError && (
        <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
      )}
    </div>
  );
}
