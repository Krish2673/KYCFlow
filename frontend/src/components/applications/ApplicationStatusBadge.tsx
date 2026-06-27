import type { ApplicationStatus } from '../../types';
import { APPLICATION_STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <Badge className={cn(STATUS_COLORS[status])}>
      {APPLICATION_STATUS_LABELS[status]}
    </Badge>
  );
}
