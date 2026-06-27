import { Check } from 'lucide-react';
import { APPLICATION_STATUS_LABELS } from '../../lib/constants';
import { cn } from '../../lib/utils';
import type { ApplicationStatus } from '../../types';

const WORKFLOW_STEPS: ApplicationStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'DOCUMENT_VERIFICATION',
  'RISK_ASSESSMENT',
  'MANUAL_REVIEW',
];

const TERMINAL: ApplicationStatus[] = ['APPROVED', 'REJECTED'];

function stepIndex(status: ApplicationStatus): number {
  if (status === 'APPROVED') return WORKFLOW_STEPS.length;
  if (status === 'REJECTED') return WORKFLOW_STEPS.indexOf('MANUAL_REVIEW');
  return WORKFLOW_STEPS.indexOf(status);
}

export function WorkflowStepper({ status }: { status: ApplicationStatus }) {
  const current = stepIndex(status);
  const isRejected = status === 'REJECTED';
  const isApproved = status === 'APPROVED';

  return (
    <div className="w-full">
      <div className="flex items-center">
        {WORKFLOW_STEPS.map((step, i) => {
          const done = i < current || isApproved;
          const active = i === current && !TERMINAL.includes(status);
          const rejected = isRejected && step === 'MANUAL_REVIEW';

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    done && !rejected && 'border-emerald-500 bg-emerald-500 text-white',
                    active && 'border-brand-600 bg-brand-600 text-white ring-4 ring-brand-100',
                    rejected && 'border-red-500 bg-red-500 text-white',
                    !done && !active && !rejected && 'border-slate-200 bg-white text-slate-400',
                  )}
                >
                  {done && !rejected ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <p
                  className={cn(
                    'mt-2 hidden max-w-[4.5rem] text-center text-[10px] font-medium leading-tight sm:block',
                    active && 'text-brand-700',
                    done && !rejected && 'text-emerald-700',
                    rejected && 'text-red-700',
                    !done && !active && !rejected && 'text-slate-400',
                  )}
                >
                  {APPLICATION_STATUS_LABELS[step]}
                </p>
              </div>
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-1 h-0.5 flex-1',
                    i < current || isApproved ? 'bg-emerald-400' : 'bg-slate-200',
                  )}
                />
              )}
            </div>
          );
        })}

        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2',
              isApproved && 'border-emerald-500 bg-emerald-500 text-white',
              isRejected && 'border-red-500 bg-red-500 text-white',
              !TERMINAL.includes(status) && 'border-slate-200 bg-white text-slate-300',
            )}
          >
            {isApproved || isRejected ? (
              <Check className="h-4 w-4" />
            ) : (
              <span className="text-xs">✓</span>
            )}
          </div>
          <p
            className={cn(
              'mt-2 hidden max-w-[4.5rem] text-center text-[10px] font-medium sm:block',
              isApproved && 'text-emerald-700',
              isRejected && 'text-red-700',
              !TERMINAL.includes(status) && 'text-slate-400',
            )}
          >
            {isRejected
              ? APPLICATION_STATUS_LABELS.REJECTED
              : APPLICATION_STATUS_LABELS.APPROVED}
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-sm font-medium text-slate-600 sm:hidden">
        Current: {APPLICATION_STATUS_LABELS[status]}
      </p>
    </div>
  );
}
