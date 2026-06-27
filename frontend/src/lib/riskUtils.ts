import type { Document, DocumentType, RiskAssessment, RiskDecision } from '../types';
import { DOCUMENT_TYPE_LABELS } from './constants';

export type ReasonSentiment = 'positive' | 'negative' | 'neutral';

export interface ParsedReason {
  text: string;
  sentiment: ReasonSentiment;
}

const POSITIVE_PATTERNS = [/verified/i, /uploaded/i, /assigned/i, /passed/i, /reached/i];
const NEGATIVE_PATTERNS = [/missing/i, /pending verification/i, /mandatory/i];

export function classifyReason(text: string): ReasonSentiment {
  if (NEGATIVE_PATTERNS.some((p) => p.test(text))) return 'negative';
  if (POSITIVE_PATTERNS.some((p) => p.test(text))) return 'positive';
  return 'neutral';
}

const OPTIONAL_DOC_TYPES: DocumentType[] = ['PASSPORT', 'BANK_STATEMENT', 'DRIVING_LICENSE', 'SELFIE'];

export function buildRiskReasons(
  assessment: RiskAssessment,
  documents: Document[] = [],
): ParsedReason[] {
  const parsed = assessment.reasons.map((text) => ({
    text,
    sentiment: classifyReason(text),
  }));

  const uploadedTypes = new Set(documents.map((d) => d.type));
  const mentionedMissing = new Set(
    parsed
      .filter((r) => r.sentiment === 'negative' && /missing/i.test(r.text))
      .map((r) => r.text.toLowerCase()),
  );

  for (const type of OPTIONAL_DOC_TYPES) {
    const label = DOCUMENT_TYPE_LABELS[type];
    if (!uploadedTypes.has(type) && !mentionedMissing.has(`${label.toLowerCase()} missing`)) {
      parsed.push({
        text: `${label} missing`,
        sentiment: 'negative',
      });
    }
  }

  const order = { negative: 0, neutral: 1, positive: 2 };
  return parsed.sort((a, b) => order[a.sentiment] - order[b.sentiment]);
}

export function getScoreTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 85) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

export function getDecisionLabel(decision: RiskDecision): string {
  if (decision === 'REJECT') return 'REJECT';
  if (decision === 'APPROVED') return 'APPROVED';
  return 'MANUAL REVIEW';
}

export const SCORE_TIER_STYLES = {
  high: {
    text: 'text-emerald-600',
    ring: 'stroke-emerald-500',
    bg: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    glow: 'shadow-emerald-500/20',
  },
  medium: {
    text: 'text-amber-600',
    ring: 'stroke-amber-500',
    bg: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    glow: 'shadow-amber-500/20',
  },
  low: {
    text: 'text-red-600',
    ring: 'stroke-red-500',
    bg: 'from-red-500 to-rose-600',
    badge: 'bg-red-100 text-red-800 border-red-200',
    glow: 'shadow-red-500/20',
  },
} as const;
