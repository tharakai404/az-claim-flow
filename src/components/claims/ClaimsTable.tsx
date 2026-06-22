import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Clock, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Claim, ClaimStatus, ClaimCategory } from '../../types';
import { getStatusColor, getStatusLabel, getCategoryColor, getSLAColor, formatDate } from '../../utils/claimHelpers';
import Badge from '../shared/Badge';
import ClaimDetail from './ClaimDetail';
import NewClaimModal from './NewClaimModal';

export default function ClaimsTable() {
  const { claims, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [sortField, setSortField] = useState<'createdAt' | 'updatedAt' | 'claimNumber'>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    return claims
      .filter(c => {
        if (search) {
          const q = search.toLowerCase();
          return c.claimNumber.toLowerCase().includes(q) ||
            c.customerName.toLowerCase().includes(q) ||
            c.policy.policyNumber.toLowerCase().includes(q) ||
            c.policy.vehicleRegistration.toLowerCase().includes(q);
        }
        return true;
      })
      .filter(c => !statusFilter || c.status === statusFilter)
      .filter(c => !categoryFilter || c.category === categoryFilter)
      .sort((a, b) => {
        const va = a[sortField], vb = b[sortField];
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [claims, search, statusFilter, categoryFilter, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search claims..."
              className="outline-none text-sm text-gray-700 w-48"
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none"
          >
            <option value="">All Statuses</option>
            {['NOT_ASSIGNED','ASSIGNED','VIRTUAL_INSPECTION','PHYSICAL_INSPECTION_IN_PROGRESS','FRAUD_REVIEW','EXPERT_REVIEW','OFFER_GENERATED','PAYMENT_PROCESSING','COMPLETED','REJECTED'].map(s => (
              <option key={s} value={s}>{getStatusLabel(s as ClaimStatus)}</option>
            ))}
          </select>
          <select
            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none"
          >
            <option value="">All Categories</option>
            {['SIMPLE','CORE','COMPLEX'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{filtered.length} claims</span>
          {(currentUser?.role === 'CALL_CENTER_AGENT' || currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => setShowNewClaim(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Claim
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <Th label="Claim #" onClick={() => toggleSort('claimNumber')} />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SLA</th>
                <Th label="Updated" onClick={() => toggleSort('updatedAt')} />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No claims found</td></tr>
              ) : filtered.map(claim => {
                const assignee = claim.assignments.find(a => a.isActive);
                return (
                  <tr
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${claim.sla.isBreached ? 'border-l-2 border-l-red-400' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-blue-600 text-xs">{claim.claimNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{claim.customerName}</div>
                      <div className="text-xs text-gray-400">{claim.policy.policyNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700">{claim.policy.vehicleMake} {claim.policy.vehicleModel}</div>
                      <div className="text-xs text-gray-400">{claim.policy.vehicleRegistration}</div>
                    </td>
                    <td className="px-4 py-3">
                      {claim.category ? (
                        <Badge label={claim.category} className={getCategoryColor(claim.category)} />
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={getStatusLabel(claim.status)} className={`${getStatusColor(claim.status)} text-xs`} />
                    </td>
                    <td className="px-4 py-3">
                      {assignee ? (
                        <div>
                          <div className="text-gray-700 text-xs">{assignee.assignedToName}</div>
                          <div className="text-gray-400 text-xs">{assignee.assignedToTeam.replace(/_/g, ' ')}</div>
                        </div>
                      ) : <span className="text-xs text-orange-500 font-medium">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-xs font-medium ${getSLAColor(claim.sla)}`}>
                        <Clock className="w-3 h-3" />
                        {claim.sla.isBreached ? `Breached ${Math.abs(claim.sla.remainingHours)}h ago` : `${claim.sla.remainingHours}h left`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(claim.updatedAt).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClaim && <ClaimDetail claim={selectedClaim} onClose={() => setSelectedClaim(null)} />}
      {showNewClaim && <NewClaimModal onClose={() => setShowNewClaim(false)} />}
    </div>
  );
}

function Th({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700" onClick={onClick}>
      <div className="flex items-center gap-1">{label} <ArrowUpDown className="w-3 h-3" /></div>
    </th>
  );
}
