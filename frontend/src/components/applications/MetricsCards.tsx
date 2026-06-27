import {
  CheckCircle2,
  Clock,
  FileSearch,
  FileText,
  Shield,
  XCircle,
} from 'lucide-react';
import type { ApplicationMetrics } from '../../types';
import { Card } from '../ui/Card';

const metricConfig = [
  { key: 'total' as const, label: 'Total Applications', icon: FileText, color: 'bg-brand-50 text-brand-600' },
  { key: 'submitted' as const, label: 'Submitted', icon: Clock, color: 'bg-blue-50 text-blue-600' },
  { key: 'documentVerification' as const, label: 'Doc Verification', icon: FileSearch, color: 'bg-amber-50 text-amber-600' },
  { key: 'riskAssessment' as const, label: 'Risk Assessment', icon: Shield, color: 'bg-orange-50 text-orange-600' },
  { key: 'manualReview' as const, label: 'Manual Review', icon: Clock, color: 'bg-purple-50 text-purple-600' },
  { key: 'approved' as const, label: 'Approved', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
  { key: 'rejected' as const, label: 'Rejected', icon: XCircle, color: 'bg-red-50 text-red-600' },
];

export function MetricsCards({ metrics }: { metrics: ApplicationMetrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {metricConfig.map(({ key, label, icon: Icon, color }) => (
        <Card key={key} className="!p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{metrics[key]}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
