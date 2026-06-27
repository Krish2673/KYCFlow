import { Check, Minus, X } from 'lucide-react';
import {
  buildRiskReasons,
  getDecisionLabel,
  getScoreTier,
  SCORE_TIER_STYLES,
  type ParsedReason,
} from '../../lib/riskUtils';
import { cn } from '../../lib/utils';
import type { Document, RiskAssessment } from '../../types';

interface RiskAssessmentDisplayProps {
  assessment: RiskAssessment;
  documents?: Document[];
  applicantName?: string;
  variant?: 'full' | 'compact';
}

export function RiskAssessmentDisplay({
  assessment,
  documents = [],
  applicantName,
  variant = 'full',
}: RiskAssessmentDisplayProps) {
  const reasons = buildRiskReasons(assessment, documents);
  const tier = getScoreTier(assessment.trustScore);
  const styles = SCORE_TIER_STYLES[tier];
  const circumference = 2 * Math.PI * 88;

  if (variant === 'compact') {
    return (
      <CompactView
        assessment={assessment}
        reasons={reasons}
        tier={tier}
        styles={styles}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className={cn('bg-gradient-to-br px-8 py-10 text-white', styles.bg)}>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
          <div className="text-center lg:text-left">
            {applicantName && (
              <p className="text-sm font-medium text-white/80">Risk Assessment for</p>
            )}
            {applicantName && (
              <h2 className="mt-1 text-2xl font-bold">{applicantName}</h2>
            )}
            <p className="mt-4 max-w-sm text-sm text-white/90">
              Automated trust scoring based on document verification, completeness, and
              workflow progress.
            </p>
          </div>

          <div className="relative flex h-52 w-52 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(assessment.trustScore / 100) * circumference} ${circumference}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-5xl font-bold tabular-nums">{assessment.trustScore}</p>
              <p className="mt-1 text-sm font-medium text-white/80">Trust Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-5">
        <div className="border-b border-slate-100 p-8 lg:col-span-3 lg:border-b-0 lg:border-r">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Assessment Reasons
          </h3>
          <ul className="space-y-3">
            {reasons.map((reason, i) => (
              <ReasonRow key={i} reason={reason} />
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center p-8 lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Decision
          </h3>
          <div
            className={cn(
              'rounded-xl border-2 px-6 py-8 text-center shadow-lg',
              styles.badge,
              styles.glow,
            )}
          >
            <p className="text-3xl font-bold tracking-tight">
              {getDecisionLabel(assessment.decision)}
            </p>
            <p className="mt-2 text-sm opacity-80">Recommended outcome</p>
          </div>

          <div className="mt-6 space-y-2">
            <ThresholdBar label="Reject" range="< 60" active={tier === 'low'} color="bg-red-500" />
            <ThresholdBar label="Manual Review" range="60 – 84" active={tier === 'medium'} color="bg-amber-500" />
            <ThresholdBar label="Approve" range="≥ 85" active={tier === 'high'} color="bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReasonRow({ reason }: { reason: ParsedReason }) {
  const Icon =
    reason.sentiment === 'positive'
      ? Check
      : reason.sentiment === 'negative'
        ? X
        : Minus;

  const iconStyles = {
    positive: 'bg-emerald-100 text-emerald-600',
    negative: 'bg-red-100 text-red-600',
    neutral: 'bg-slate-100 text-slate-500',
  };

  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          iconStyles[reason.sentiment],
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span
        className={cn(
          'text-sm font-medium',
          reason.sentiment === 'positive' && 'text-slate-800',
          reason.sentiment === 'negative' && 'text-slate-800',
          reason.sentiment === 'neutral' && 'text-slate-600',
        )}
      >
        {reason.text}
      </span>
    </li>
  );
}

function ThresholdBar({
  label,
  range,
  active,
  color,
}: {
  label: string;
  range: string;
  active: boolean;
  color: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors',
        active ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-400',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', color, !active && 'opacity-40')} />
        {label}
      </div>
      <span>{range}</span>
    </div>
  );
}

function CompactView({
  assessment,
  reasons,
  styles,
}: {
  assessment: RiskAssessment;
  reasons: ParsedReason[];
  tier: keyof typeof SCORE_TIER_STYLES;
  styles: (typeof SCORE_TIER_STYLES)[keyof typeof SCORE_TIER_STYLES];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              className={styles.ring}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(assessment.trustScore / 100) * 264} 264`}
            />
          </svg>
          <div className="absolute text-center">
            <p className={cn('text-2xl font-bold', styles.text)}>{assessment.trustScore}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-500">Decision</p>
          <p className={cn('text-lg font-bold', styles.text)}>
            {getDecisionLabel(assessment.decision)}
          </p>
          <ul className="mt-2 space-y-1">
            {reasons.slice(0, 4).map((r, i) => (
              <li key={i} className="text-xs text-slate-600">
                {r.sentiment === 'positive' ? '✓' : r.sentiment === 'negative' ? '✗' : '–'}{' '}
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
