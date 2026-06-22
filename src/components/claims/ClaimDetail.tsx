import React, { useState } from 'react';
import {
  X, Car, User, FileText, Clock, Shield, AlertTriangle,
  CheckCircle, XCircle, Send, ChevronRight, Download,
  MapPin, Phone, Mail, Calendar, Tag, Users
} from 'lucide-react';
import { Claim, ClaimStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { getStatusColor, getStatusLabel, getCategoryColor, getSLAColor, formatDate, formatCurrency, getLiabilityBadge, getFraudBadge } from '../../utils/claimHelpers';
import Badge from '../shared/Badge';
import AssignModal from './AssignModal';
import TimelineView from './TimelineView';
import InspectionPanel from '../workflow/InspectionPanel';

interface Props { claim: Claim; onClose: () => void; }

type Tab = 'overview' | 'timeline' | 'documents' | 'inspection' | 'offer';

export default function ClaimDetail({ claim: initialClaim, onClose }: Props) {
  const { claims, updateClaimStatus, moveToPending, currentUser, updateClaim } = useApp();
  const claim = claims.find(c => c.id === initialClaim.id) ?? initialClaim;

  const [tab, setTab] = useState<Tab>('overview');
  const [showAssign, setShowAssign] = useState(false);

  const canAssign = ['CALL_CENTER_AGENT', 'SUPERVISOR', 'ADMIN'].includes(currentUser?.role ?? '');
  const canProcess = claim.currentAssignees.includes(currentUser?.id ?? '') || currentUser?.role === 'ADMIN';

  const activeOffer = claim.offers.find(o => o.status === 'PENDING');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: `Documents (${claim.documents.length})` },
    { id: 'inspection', label: 'Inspection' },
    { id: 'offer', label: activeOffer ? '🔔 Offer' : 'Offer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{claim.claimNumber}</h2>
                <Badge label={getStatusLabel(claim.status)} className={getStatusColor(claim.status)} />
                {claim.category && <Badge label={claim.category} className={getCategoryColor(claim.category)} />}
                {claim.sla.isBreached && <Badge label="SLA BREACHED" className="bg-red-100 text-red-700 animate-pulse" />}
              </div>
              <p className="text-sm text-gray-500">{claim.customerName} • {claim.policy.vehicleMake} {claim.policy.vehicleModel} {claim.policy.vehicleYear} • {claim.policy.vehicleRegistration}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {canAssign && (
              <button onClick={() => setShowAssign(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                <Users className="w-3.5 h-3.5" /> {claim.status === 'NOT_ASSIGNED' ? 'Assign Claim' : 'Re-assign'}
              </button>
            )}
            {canProcess && claim.status !== 'PENDING' && claim.status !== 'COMPLETED' && (
              <button onClick={() => moveToPending(claim.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300">
                <Clock className="w-3.5 h-3.5" /> Move to Pending
              </button>
            )}
            {canProcess && claim.status === 'NOT_ASSIGNED' && (
              <button
                onClick={() => updateClaimStatus(claim.id, 'IN_PROGRESS', currentUser?.name, 'Claim taken into processing')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Start Processing
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-white">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'overview' && <OverviewTab claim={claim} />}
          {tab === 'timeline' && <TimelineView timeline={claim.timeline} />}
          {tab === 'documents' && <DocumentsTab claim={claim} />}
          {tab === 'inspection' && <InspectionPanel claim={claim} />}
          {tab === 'offer' && <OfferTab claim={claim} />}
        </div>
      </div>

      {showAssign && <AssignModal claim={claim} onClose={() => setShowAssign(false)} />}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ claim }: { claim: Claim }) {
  return (
    <div className="space-y-5">
      {/* Customer & Policy */}
      <div className="grid grid-cols-2 gap-5">
        <InfoCard title="Customer" icon={User}>
          <InfoRow icon={User} label="Name" value={claim.customerName} />
          <InfoRow icon={Phone} label="Phone" value={claim.customerPhone} />
          <InfoRow icon={Mail} label="Email" value={claim.customerEmail} />
        </InfoCard>
        <InfoCard title="Policy" icon={Shield}>
          <InfoRow label="Policy #" value={claim.policy.policyNumber} />
          <InfoRow label="Coverage" value={claim.policy.coverageType} />
          <InfoRow label="Deductible" value={formatCurrency(claim.policy.deductible)} />
          <InfoRow label="Sum Insured" value={formatCurrency(claim.policy.sumInsured)} />
        </InfoCard>
      </div>

      {/* Vehicle */}
      <InfoCard title="Vehicle" icon={Car}>
        <div className="grid grid-cols-3 gap-4">
          <InfoRow label="Make/Model" value={`${claim.policy.vehicleMake} ${claim.policy.vehicleModel}`} />
          <InfoRow label="Year" value={String(claim.policy.vehicleYear)} />
          <InfoRow label="Registration" value={claim.policy.vehicleRegistration} />
        </div>
      </InfoCard>

      {/* Accident */}
      <InfoCard title="Accident Details" icon={AlertTriangle}>
        <InfoRow icon={Calendar} label="Date/Time" value={formatDate(claim.accident.dateTime)} />
        <InfoRow icon={MapPin} label="Location" value={claim.accident.location} />
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{claim.accident.description}</p>
        </div>
        <div className="flex gap-4 mt-3">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${claim.accident.thirdPartyInvolved ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
            {claim.accident.thirdPartyInvolved ? '⚠ Third Party Involved' : 'No Third Party'}
          </span>
          {claim.accident.policeReportNumber && (
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              Police: {claim.accident.policeReportNumber}
            </span>
          )}
        </div>
      </InfoCard>

      {/* Assessment */}
      <InfoCard title="Assessment" icon={Shield}>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Liability</p>
            <Badge label={claim.liabilityStatus} className={getLiabilityBadge(claim.liabilityStatus)} />
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Fraud Status</p>
            <Badge label={claim.fraudStatus} className={getFraudBadge(claim.fraudStatus)} />
          </div>
          {claim.settlementAmount && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Settlement</p>
              <span className="text-sm font-bold text-green-700">{formatCurrency(claim.settlementAmount)}</span>
            </div>
          )}
        </div>
      </InfoCard>

      {/* SLA */}
      <InfoCard title="SLA" icon={Clock}>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">Target</p>
            <p className="text-sm font-medium">{claim.sla.targetHours}h</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Due</p>
            <p className="text-sm font-medium">{new Date(claim.sla.dueAt).toLocaleDateString('en-AE')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className={`text-sm font-semibold ${getSLAColor(claim.sla)}`}>
              {claim.sla.isBreached ? `Breached by ${Math.abs(claim.sla.remainingHours)}h` : `${claim.sla.remainingHours}h remaining`}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* Assignments */}
      {claim.assignments.length > 0 && (
        <InfoCard title="Assignments" icon={Users}>
          <div className="space-y-2">
            {claim.assignments.map(a => (
              <div key={a.id} className={`flex items-center justify-between p-2 rounded-lg ${a.isActive ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.assignedToName}</p>
                  <p className="text-xs text-gray-500">{a.assignedToTeam.replace(/_/g, ' ')} • {a.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{new Date(a.timestamp).toLocaleDateString()}</p>
                  {a.isActive && <Badge label="Active" className="bg-blue-100 text-blue-700" />}
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ claim }: { claim: Claim }) {
  const statusColors: Record<string, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-700',
    UPLOADED: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <div className="space-y-3">
      {claim.documents.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No documents yet</p>
        </div>
      ) : claim.documents.map(doc => (
        <div key={doc.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
            <p className="text-xs text-gray-400">{doc.type.replace(/_/g, ' ')}</p>
            {doc.requestedAt && <p className="text-xs text-gray-400">Requested: {new Date(doc.requestedAt).toLocaleDateString()}</p>}
            {doc.uploadedAt && <p className="text-xs text-gray-400">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>}
          </div>
          <Badge label={doc.status} className={statusColors[doc.status]} />
          {doc.status === 'UPLOADED' && (
            <button className="p-2 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-500" /></button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Offer Tab ────────────────────────────────────────────────────────────────
function OfferTab({ claim }: { claim: Claim }) {
  const { updateClaim, updateClaimStatus, currentUser } = useApp();

  const handleAccept = (offerId: string) => {
    updateClaim(claim.id, {
      offers: claim.offers.map(o => o.id === offerId ? { ...o, status: 'ACCEPTED' } : o),
      status: 'PAYMENT_PROCESSING',
      queue: 'OUTGOING',
    });
  };

  const handleReject = (offerId: string) => {
    updateClaim(claim.id, {
      offers: claim.offers.map(o => o.id === offerId ? { ...o, status: 'REJECTED' } : o),
      status: 'WAITING_ESTIMATE',
    });
  };

  return (
    <div className="space-y-4">
      {claim.offers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No offers generated yet</p>
        </div>
      ) : claim.offers.map(offer => (
        <div key={offer.id} className={`p-5 rounded-xl border-2 ${offer.status === 'ACCEPTED' ? 'border-green-200 bg-green-50' : offer.status === 'REJECTED' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Settlement Offer</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(offer.amount)}</p>
            </div>
            <Badge label={offer.status} className={
              offer.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
              offer.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            } />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><span className="text-gray-500">Generated:</span> <span className="font-medium">{formatDate(offer.generatedAt)}</span></div>
            <div><span className="text-gray-500">Expires:</span> <span className="font-medium">{formatDate(offer.expiresAt)}</span></div>
          </div>
          {offer.status === 'PENDING' && (
            <div className="flex gap-3">
              <button onClick={() => handleAccept(offer.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                <CheckCircle className="w-4 h-4" /> Accept Offer
              </button>
              <button onClick={() => handleReject(offer.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                <XCircle className="w-4 h-4" /> Reject Offer
              </button>
            </div>
          )}
          {offer.status === 'REJECTED' && offer.rejectionReason && (
            <p className="text-sm text-red-700 mt-2">Reason: {offer.rejectionReason}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InfoCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm py-0.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
