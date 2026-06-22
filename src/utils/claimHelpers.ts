import { Claim, ClaimStatus, ClaimCategory, LiabilityStatus, FraudStatus } from '../types';

export function getStatusColor(status: ClaimStatus): string {
  const map: Record<string, string> = {
    NOT_ASSIGNED: 'bg-gray-100 text-gray-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
    WAITING_CUSTOMER_RESPONSE: 'bg-yellow-100 text-yellow-700',
    WAITING_ESTIMATE: 'bg-orange-100 text-orange-700',
    VIRTUAL_INSPECTION: 'bg-purple-100 text-purple-700',
    PHYSICAL_INSPECTION_REQUESTED: 'bg-orange-100 text-orange-700',
    PHYSICAL_INSPECTION_IN_PROGRESS: 'bg-orange-100 text-orange-700',
    OFFER_GENERATED: 'bg-teal-100 text-teal-700',
    OFFER_ACCEPTED: 'bg-green-100 text-green-700',
    OFFER_REJECTED: 'bg-red-100 text-red-700',
    ESTIMATE_UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
    ESTIMATE_APPROVED: 'bg-green-100 text-green-700',
    GARAGE_INSPECTION_SCHEDULED: 'bg-blue-100 text-blue-700',
    GARAGE_INSPECTION_IN_PROGRESS: 'bg-blue-100 text-blue-700',
    FRAUD_REVIEW: 'bg-red-100 text-red-700',
    EXPERT_REVIEW: 'bg-purple-100 text-purple-700',
    PAYMENT_PROCESSING: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    PENDING: 'bg-gray-100 text-gray-700',
  };
  return map[status] ?? 'bg-gray-100 text-gray-600';
}

export function getStatusLabel(status: ClaimStatus): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function getCategoryColor(cat?: ClaimCategory): string {
  if (!cat) return 'bg-gray-100 text-gray-600';
  return { SIMPLE: 'bg-green-100 text-green-700', CORE: 'bg-blue-100 text-blue-700', COMPLEX: 'bg-red-100 text-red-700' }[cat];
}

export function getSLAColor(sla: Claim['sla']): string {
  if (sla.isBreached) return 'text-red-600';
  if (sla.remainingHours < 6) return 'text-orange-500';
  return 'text-green-600';
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(amount: number): string {
  return `AED ${amount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}`;
}

export function getLiabilityBadge(status: LiabilityStatus): string {
  return { PENDING: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' }[status];
}

export function getFraudBadge(status: FraudStatus): string {
  return { CLEAR: 'bg-green-100 text-green-700', SUSPECT: 'bg-orange-100 text-orange-700', CONFIRMED: 'bg-red-100 text-red-700' }[status];
}
