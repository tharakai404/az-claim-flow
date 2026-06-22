import React, { useState } from 'react';
import { Camera, Video, MapPin, CheckCircle2, Shield } from 'lucide-react';
import { Claim, LiabilityStatus, FraudStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { getLiabilityBadge, getFraudBadge } from '../../utils/claimHelpers';
import Badge from '../shared/Badge';

export default function InspectionPanel({ claim }: { claim: Claim }) {
  const { updateClaim, currentUser, addNotification } = useApp();
  const [liabilityDecision, setLiabilityDecision] = useState<LiabilityStatus>(claim.liabilityStatus);
  const [fraudDecision, setFraudDecision] = useState<FraudStatus>(claim.fraudStatus);
  const [notes, setNotes] = useState('');
  const [estimateAmount, setEstimateAmount] = useState('');
  const [saved, setSaved] = useState(false);

  const canProcess = claim.currentAssignees.includes(currentUser?.id ?? '') || currentUser?.role === 'ADMIN';

  const handleCompleteInspection = () => {
    const amount = parseFloat(estimateAmount) || 0;
    let newStatus = claim.status;

    if (fraudDecision === 'SUSPECT' || fraudDecision === 'CONFIRMED') {
      newStatus = 'FRAUD_REVIEW';
    } else if (liabilityDecision === 'REJECTED') {
      newStatus = 'EXPERT_REVIEW';
    } else if (liabilityDecision === 'APPROVED') {
      newStatus = 'OFFER_GENERATED';
    }

    updateClaim(claim.id, {
      liabilityStatus: liabilityDecision,
      fraudStatus: fraudDecision,
      status: newStatus,
      ...(newStatus === 'OFFER_GENERATED' && amount > 0 ? {
        settlementAmount: amount,
        offers: [...claim.offers, {
          id: Math.random().toString(36).slice(2),
          claimId: claim.id,
          amount,
          generatedAt: new Date().toISOString(),
          generatedBy: currentUser?.id ?? '',
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          status: 'PENDING' as const,
        }],
      } : {}),
    });

    addNotification({
      userId: currentUser?.id ?? '',
      claimId: claim.id,
      title: 'Inspection Completed',
      message: `Inspection for ${claim.claimNumber} completed. Status: ${newStatus.replace(/_/g, ' ')}`,
      severity: fraudDecision !== 'CLEAR' ? 'WARNING' : 'SUCCESS',
      read: false,
    });

    setSaved(true);
  };

  return (
    <div className="space-y-5">
      {/* Current Inspections */}
      {claim.inspections.length > 0 ? (
        <div className="space-y-3">
          {claim.inspections.map(ins => (
            <div key={ins.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {ins.type === 'SELF' && <Camera className="w-5 h-5 text-gray-500" />}
                  {ins.type === 'VIRTUAL' && <Video className="w-5 h-5 text-purple-500" />}
                  {(ins.type === 'PHYSICAL' || ins.type === 'GARAGE') && <MapPin className="w-5 h-5 text-blue-500" />}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{ins.type} Inspection</p>
                    <p className="text-xs text-gray-400">
                      {ins.status} {ins.completedAt ? `· Completed ${new Date(ins.completedAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  ins.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  ins.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>{ins.status}</span>
              </div>

              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Liability</p>
                  <Badge label={ins.liabilityStatus} className={getLiabilityBadge(ins.liabilityStatus)} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fraud</p>
                  <Badge label={ins.fraudStatus} className={getFraudBadge(ins.fraudStatus)} />
                </div>
                {ins.estimateAmount && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estimate</p>
                    <p className="text-sm font-semibold text-gray-900">AED {ins.estimateAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {ins.notes && (
                <div className="mt-3 p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xs text-orange-700"><strong>Notes:</strong> {ins.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No inspections recorded</p>
        </div>
      )}

      {/* Decision Panel */}
      {canProcess && !saved && ['VIRTUAL_INSPECTION', 'PHYSICAL_INSPECTION_IN_PROGRESS', 'IN_PROGRESS', 'ASSIGNED'].includes(claim.status) && (
        <div className="p-5 border-2 border-blue-200 rounded-xl bg-blue-50/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Inspection Decision
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Liability Decision</label>
              <div className="space-y-1.5">
                {(['PENDING', 'APPROVED', 'REJECTED'] as LiabilityStatus[]).map(s => (
                  <label key={s} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${liabilityDecision === s ? 'border-blue-400 bg-white' : 'border-transparent hover:border-gray-200'}`}>
                    <input type="radio" name="liability" value={s} checked={liabilityDecision === s} onChange={() => setLiabilityDecision(s)} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Fraud Assessment</label>
              <div className="space-y-1.5">
                {(['CLEAR', 'SUSPECT', 'CONFIRMED'] as FraudStatus[]).map(s => (
                  <label key={s} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border transition-colors ${fraudDecision === s ? 'border-blue-400 bg-white' : 'border-transparent hover:border-gray-200'}`}>
                    <input type="radio" name="fraud" value={s} checked={fraudDecision === s} onChange={() => setFraudDecision(s)} className="accent-blue-600" />
                    <span className={`text-sm ${s === 'SUSPECT' ? 'text-orange-700' : s === 'CONFIRMED' ? 'text-red-700' : 'text-gray-700'}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {liabilityDecision === 'APPROVED' && fraudDecision === 'CLEAR' && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Estimate Amount (AED)</label>
              <input
                type="number"
                value={estimateAmount}
                onChange={e => setEstimateAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Inspection notes..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none bg-white" />
          </div>

          {/* Outcome Preview */}
          <div className="p-3 bg-white rounded-lg border border-gray-200 mb-4 text-sm">
            <p className="text-xs font-medium text-gray-500 mb-1">Outcome Preview</p>
            <p className="text-gray-700">
              {fraudDecision !== 'CLEAR' ? '⚠ Route to Fraud Management Team' :
               liabilityDecision === 'REJECTED' ? '📋 Route to Claim Expert Processing Team' :
               liabilityDecision === 'APPROVED' ? '✅ Generate Settlement Offer' :
               '⏳ Awaiting decision'}
            </p>
          </div>

          <button
            onClick={handleCompleteInspection}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Complete Inspection & Submit Decision
          </button>
        </div>
      )}

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-900">Decision Submitted</p>
            <p className="text-xs text-green-700">Claim has been routed accordingly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
