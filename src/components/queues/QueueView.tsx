import React, { useState } from 'react';
import { Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { QueueType, Claim } from '../../types';
import { useApp } from '../../context/AppContext';
import { getStatusColor, getStatusLabel, getCategoryColor, getSLAColor } from '../../utils/claimHelpers';
import Badge from '../shared/Badge';
import ClaimDetail from '../claims/ClaimDetail';

const QUEUE_CONFIG: Record<QueueType, { label: string; description: string; color: string; emptyMsg: string }> = {
  INCOMING: { label: 'Incoming Claims', description: 'New claims assigned to you requiring action', color: 'blue', emptyMsg: 'No incoming claims' },
  ACTION_REQUIRED: { label: 'Action Required', description: 'Claims awaiting your immediate action', color: 'orange', emptyMsg: 'No claims requiring action' },
  PENDING: { label: 'Pending Claims', description: 'Claims on hold waiting for information', color: 'gray', emptyMsg: 'No pending claims' },
  OUTGOING: { label: 'Outgoing Claims', description: 'Claims transferred or in payment processing', color: 'green', emptyMsg: 'No outgoing claims' },
  COMPLETED: { label: 'Completed Claims', description: 'Closed and finalized claims', color: 'emerald', emptyMsg: 'No completed claims' },
};

export default function QueueView({ queue }: { queue: QueueType }) {
  const { claims, currentUser } = useApp();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const config = QUEUE_CONFIG[queue];

  const queueClaims = claims.filter(c => {
    if (!currentUser) return false;
    const isMine = c.currentAssignees.includes(currentUser.id);
    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR';

    if (queue === 'INCOMING') return (isMine || isAdmin) && c.queue === 'INCOMING';
    if (queue === 'ACTION_REQUIRED') return (isMine || isAdmin) && c.queue === 'ACTION_REQUIRED';
    if (queue === 'PENDING') return (isMine || isAdmin) && c.status === 'PENDING';
    if (queue === 'OUTGOING') return (isMine || isAdmin) && c.queue === 'OUTGOING';
    if (queue === 'COMPLETED') return c.status === 'COMPLETED' || c.status === 'REJECTED';
    return false;
  });

  const borderColors: Record<string, string> = {
    blue: 'border-blue-500', orange: 'border-orange-500',
    gray: 'border-gray-400', green: 'border-green-500', emerald: 'border-emerald-500',
  };
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50', orange: 'bg-orange-50',
    gray: 'bg-gray-50', green: 'bg-green-50', emerald: 'bg-emerald-50',
  };

  return (
    <div>
      {/* Queue Header */}
      <div className={`mb-5 p-4 rounded-xl border-l-4 ${borderColors[config.color]} ${bgColors[config.color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{config.label}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
          </div>
          <span className="text-3xl font-bold text-gray-800">{queueClaims.length}</span>
        </div>
      </div>

      {/* Claims List */}
      {queueClaims.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-8 h-8 opacity-50" />
          </div>
          <p className="font-medium">{config.emptyMsg}</p>
          <p className="text-sm mt-1">Check back later or adjust filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {queueClaims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} onClick={() => setSelectedClaim(claim)} />
          ))}
        </div>
      )}

      {selectedClaim && <ClaimDetail claim={selectedClaim} onClose={() => setSelectedClaim(null)} />}
    </div>
  );
}

function ClaimCard({ claim, onClick }: { claim: Claim; onClick: () => void }) {
  const activeAssignment = claim.assignments.find(a => a.isActive);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 ${claim.sla.isBreached ? 'border-red-200 border-l-4 border-l-red-500' : 'border-gray-100'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-blue-600 text-sm">{claim.claimNumber}</p>
            <p className="text-sm text-gray-900 mt-0.5">{claim.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {claim.category && <Badge label={claim.category} className={getCategoryColor(claim.category)} />}
          <Badge label={getStatusLabel(claim.status)} className={`${getStatusColor(claim.status)} text-xs`} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{claim.policy.vehicleMake} {claim.policy.vehicleModel} · {claim.policy.vehicleRegistration}</span>
        {activeAssignment && (
          <span className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            {activeAssignment.assignedToName}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className={`flex items-center gap-1 text-xs font-medium ${getSLAColor(claim.sla)}`}>
          <Clock className="w-3 h-3" />
          {claim.sla.isBreached ? `⚠ Breached ${Math.abs(claim.sla.remainingHours)}h ago` : `${claim.sla.remainingHours}h until SLA`}
        </div>
        <span className="text-xs text-gray-400">
          Updated {new Date(claim.updatedAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })}
        </span>
      </div>
    </div>
  );
}
