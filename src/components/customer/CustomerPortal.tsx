import React, { useState } from 'react';
import {
  Shield, Clock, Upload, CheckCircle2, XCircle, FileText,
  ChevronRight, AlertCircle, Car, Phone, Calendar, MapPin
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Claim } from '../../types';
import { getStatusColor, getStatusLabel, formatDate, formatCurrency } from '../../utils/claimHelpers';
import Badge from '../shared/Badge';
import TimelineView from '../claims/TimelineView';

export default function CustomerPortal() {
  const { claims, updateClaim } = useApp();
  const [token, setToken] = useState('');
  const [foundClaim, setFoundClaim] = useState<Claim | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'timeline' | 'documents' | 'offer'>('status');
  const [error, setError] = useState('');

  const handleSearch = () => {
    setError('');
    const claim = claims.find(c => c.customerToken === token || c.claimNumber === token);
    if (claim) setFoundClaim(claim);
    else setError('No claim found with this reference. Please check your token or claim number.');
  };

  // Keep foundClaim in sync with context
  const currentClaim = foundClaim ? claims.find(c => c.id === foundClaim.id) ?? foundClaim : null;

  const handleAcceptOffer = (offerId: string) => {
    if (!currentClaim) return;
    updateClaim(currentClaim.id, {
      offers: currentClaim.offers.map(o => o.id === offerId ? { ...o, status: 'ACCEPTED' } : o),
      status: 'PAYMENT_PROCESSING',
      queue: 'OUTGOING',
    });
  };

  const handleRejectOffer = (offerId: string) => {
    if (!currentClaim) return;
    updateClaim(currentClaim.id, {
      offers: currentClaim.offers.map(o => o.id === offerId ? { ...o, status: 'REJECTED' } : o),
      status: 'WAITING_ESTIMATE',
    });
  };

  if (!currentClaim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Claim Portal</h1>
            <p className="text-blue-200 mt-2">Track your motor insurance claim</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Access Your Claim</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Claim Reference / Token</label>
                <input
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g. CLM-2026-001234 or tok_..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {error && <p className="text-sm text-red-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</p>}
              <button onClick={handleSearch} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Access My Claim
              </button>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-medium mb-1">Demo tokens:</p>
              {[
                { token: 'tok_c4_secure_jkl012', label: 'Offer Pending' },
                { token: 'tok_c6_secure_pqr678', label: 'Payment Processing' },
                { token: 'tok_c1_secure_abc123', label: 'Virtual Inspection' },
              ].map(t => (
                <button key={t.token} onClick={() => { setToken(t.token); }} className="block text-xs text-blue-600 hover:underline mb-0.5">
                  {t.token} ({t.label})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingOffer = currentClaim.offers.find(o => o.status === 'PENDING');
  const tabs = [
    { id: 'status' as const, label: 'Status' },
    { id: 'timeline' as const, label: 'Timeline' },
    { id: 'documents' as const, label: 'Documents' },
    { id: 'offer' as const, label: pendingOffer ? '🔔 Offer' : 'Offer' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Motor Claim Portal</h1>
              <p className="text-blue-200 text-sm">Real-time claim tracking</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-bold">{currentClaim.claimNumber}</span>
            <Badge label={getStatusLabel(currentClaim.status)} className={`${getStatusColor(currentClaim.status)} text-xs font-semibold`} />
            {currentClaim.sla.isBreached && <Badge label="Delayed" className="bg-red-100 text-red-700 text-xs" />}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><Car className="w-4 h-4" />{currentClaim.policy.vehicleMake} {currentClaim.policy.vehicleModel} {currentClaim.policy.vehicleYear}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{new Date(currentClaim.createdAt).toLocaleDateString('en-AE')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Pending Offer Alert */}
        {pendingOffer && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Settlement Offer Available</p>
              <p className="text-sm text-amber-700 mt-0.5">You have a pending offer of {formatCurrency(pendingOffer.amount)}. Please review and respond.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'status' && (
              <div className="space-y-4">
                {/* Progress Steps */}
                <div className="space-y-3">
                  {[
                    { label: 'Claim Submitted', done: true },
                    { label: 'Claim Assigned', done: currentClaim.status !== 'NOT_ASSIGNED' },
                    { label: 'Inspection', done: currentClaim.inspections.some(i => i.status === 'COMPLETED') },
                    { label: 'Settlement Offer', done: currentClaim.offers.length > 0 },
                    { label: 'Payment', done: currentClaim.status === 'PAYMENT_PROCESSING' || currentClaim.status === 'COMPLETED' },
                    { label: 'Completed', done: currentClaim.status === 'COMPLETED' },
                  ].map((step, i) => (
                    <div key={step.label} className={`flex items-center gap-3 p-3 rounded-lg ${step.done ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${step.done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      <span className={`text-sm font-medium ${step.done ? 'text-green-800' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Current Status</p>
                  <p className="text-sm text-blue-700">{getStatusLabel(currentClaim.status)}</p>
                  {currentClaim.fraudStatus === 'SUSPECT' && (
                    <p className="text-sm text-orange-700 mt-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Your claim is under additional review.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && <TimelineView timeline={currentClaim.timeline} />}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                {currentClaim.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-8 h-8 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.status}</p>
                    </div>
                    {doc.status === 'REQUESTED' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                    )}
                  </div>
                ))}
                {currentClaim.documents.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-6">No document requests yet</p>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors">
                  <Upload className="w-4 h-4" /> Upload Additional Document
                </button>
              </div>
            )}

            {activeTab === 'offer' && (
              <div className="space-y-4">
                {currentClaim.offers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No offers yet. We will notify you when an offer is ready.</p>
                  </div>
                ) : currentClaim.offers.map(offer => (
                  <div key={offer.id} className={`p-5 rounded-xl border-2 ${offer.status === 'ACCEPTED' ? 'border-green-200 bg-green-50' : offer.status === 'REJECTED' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Settlement Offer</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(offer.amount)}</p>
                    <p className="text-xs text-gray-500 mb-4">Expires: {formatDate(offer.expiresAt)}</p>

                    {offer.status === 'PENDING' && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">Please review and respond to this settlement offer.</p>
                        <div className="flex gap-3">
                          <button onClick={() => handleAcceptOffer(offer.id)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-5 h-5" /> Accept
                          </button>
                          <button onClick={() => handleRejectOffer(offer.id)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" /> Reject
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">If you reject, you'll need to submit a garage estimate for review.</p>
                      </div>
                    )}
                    {offer.status === 'ACCEPTED' && (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">Offer Accepted — Payment being processed</span>
                      </div>
                    )}
                    {offer.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">Offer Rejected — Please submit garage estimate</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setFoundClaim(null)} className="mt-4 w-full py-2 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Search
        </button>
      </div>
    </div>
  );
}
