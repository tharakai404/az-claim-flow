import React, { useState } from 'react';
import { Users, Zap } from 'lucide-react';
import { Claim, Team, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { ASSIGNMENT_REASONS, TEAM_LABELS } from '../../data/mockData';
import Modal from '../shared/Modal';
import StatusDot from '../shared/StatusDot';

const TEAM_OPTIONS: Team[] = [
  'CALL_CENTER', 'VIRTUAL_ASSESSOR', 'PHYSICAL_ASSESSOR',
  'DESK_ENGINEERS', 'GARAGE_COORDINATOR', 'CLAIM_EXPERT',
  'FRAUD_MANAGEMENT', 'NORMAL_PROCESSING',
];

export default function AssignModal({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const { assignClaim, roundRobinAssign, users, getEligibleUsersForAssignment } = useApp();
  const [selectedTeam, setSelectedTeam] = useState<Team | ''>('');
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'manual' | 'auto'>('auto');

  const teamUsers = selectedTeam ? getEligibleUsersForAssignment(selectedTeam) : [];

  const handleAssign = () => {
    if (!selectedTeam || !reason) return;
    if (mode === 'auto') {
      roundRobinAssign(claim.id, selectedTeam, reason);
    } else if (selectedUser) {
      assignClaim(claim.id, selectedUser, reason);
    }
    onClose();
  };

  return (
    <Modal title="Assign Claim" onClose={onClose} size="md">
      <div className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>{claim.claimNumber}</strong> — {claim.customerName}
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode('auto')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode === 'auto' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
          >
            <Zap className="w-4 h-4" /> Auto (Round Robin)
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${mode === 'manual' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
          >
            <Users className="w-4 h-4" /> Manual
          </button>
        </div>

        {/* Team Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Team *</label>
          <select
            value={selectedTeam}
            onChange={e => { setSelectedTeam(e.target.value as Team); setSelectedUser(''); }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a team...</option>
            {TEAM_OPTIONS.map(t => <option key={t} value={t}>{TEAM_LABELS[t]}</option>)}
          </select>
        </div>

        {/* User Selection (manual mode) */}
        {mode === 'manual' && selectedTeam && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Select User *</label>
            {teamUsers.length === 0 ? (
              <p className="text-sm text-orange-600 p-3 bg-orange-50 rounded-lg">No available users in this team.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-2">
                {teamUsers.map(u => (
                  <label key={u.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedUser === u.id ? 'bg-blue-50' : ''}`}>
                    <input type="radio" name="user" value={u.id} checked={selectedUser === u.id} onChange={e => setSelectedUser(e.target.value)} className="accent-blue-600" />
                    <StatusDot status={u.status} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.activeClaims} active claims</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auto mode info */}
        {mode === 'auto' && selectedTeam && (
          <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
            <strong>Round Robin:</strong> Will assign to the most available user with the lowest active claim count in {TEAM_LABELS[selectedTeam]}.
            {teamUsers.length > 0 && <span className="ml-1">({teamUsers.length} eligible users)</span>}
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignment Reason *</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select reason...</option>
            {ASSIGNMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            onClick={handleAssign}
            disabled={!selectedTeam || !reason || (mode === 'manual' && !selectedUser)}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Assign Claim
          </button>
        </div>
      </div>
    </Modal>
  );
}
