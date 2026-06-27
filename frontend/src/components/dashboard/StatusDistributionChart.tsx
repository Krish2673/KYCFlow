import type { ApplicationMetrics } from '../../types';
import { APPLICATION_STATUS_LABELS } from '../../lib/constants';
import { Card, CardHeader } from '../ui/Card';

const STATUS_KEYS: {
  key: keyof Omit<ApplicationMetrics, 'total'>;
  color: string;
  stroke: string;
}[] = [
  { key: 'draft', color: 'bg-slate-400', stroke: '#94a3b8' },
  { key: 'submitted', color: 'bg-blue-500', stroke: '#3b82f6' },
  { key: 'documentVerification', color: 'bg-amber-500', stroke: '#f59e0b' },
  { key: 'riskAssessment', color: 'bg-orange-500', stroke: '#f97316' },
  { key: 'manualReview', color: 'bg-purple-500', stroke: '#a855f7' },
  { key: 'approved', color: 'bg-emerald-500', stroke: '#10b981' },
  { key: 'rejected', color: 'bg-red-500', stroke: '#ef4444' },
];

const STATUS_LABEL_MAP: Record<string, string> = {
  draft: APPLICATION_STATUS_LABELS.DRAFT,
  submitted: APPLICATION_STATUS_LABELS.SUBMITTED,
  documentVerification: APPLICATION_STATUS_LABELS.DOCUMENT_VERIFICATION,
  riskAssessment: APPLICATION_STATUS_LABELS.RISK_ASSESSMENT,
  manualReview: APPLICATION_STATUS_LABELS.MANUAL_REVIEW,
  approved: APPLICATION_STATUS_LABELS.APPROVED,
  rejected: APPLICATION_STATUS_LABELS.REJECTED,
};

export function StatusDistributionChart({ metrics }: { metrics: ApplicationMetrics }) {
  const max = Math.max(
    ...STATUS_KEYS.map(({ key }) => metrics[key]),
    1,
  );

  const segments = STATUS_KEYS.map(({ key, color, stroke }) => ({
    key,
    color,
    stroke,
    value: metrics[key],
    label: STATUS_LABEL_MAP[key],
    pct: metrics.total > 0 ? (metrics[key] / metrics.total) * 100 : 0,
  }));

  return (
    <Card className="mt-8">
      <CardHeader
        title="Status Distribution"
        description="Application breakdown across the KYC pipeline"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {segments.map(({ key, label, value, color, pct }) => (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="tabular-nums text-slate-500">
                  {value} <span className="text-slate-400">({pct.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="relative h-48 w-48">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {(() => {
                let offset = 0;
                return segments
                  .filter((s) => s.value > 0)
                  .map(({ key, stroke, pct }) => {
                    const dash = (pct / 100) * 251.2;
                    const gap = 251.2 - dash;
                    const el = (
                      <circle
                        key={key}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="18"
                        stroke={stroke}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                      />
                    );
                    offset += dash;
                    return el;
                  });
              })()}
              {metrics.total === 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="18"
                  className="stroke-slate-100"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">{metrics.total}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {segments
              .filter((s) => s.value > 0)
              .map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
