import React, { useState } from 'react';
import { Users, Search, Edit2, UserCheck, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserStatus } from '../../types';
import { ROLE_LABELS, TEAM_LABELS } from '../../data/mockData';
import StatusDot from '../shared/StatusDot';

const STATUS_OPTIONS: UserStatus[] = ['AVAILABLE', 'BUSY', 'AWAY', 'ON_LEAVE', 'OFFLINE'];

export default function UserManagement() {
  const { users, updateUserStatus, claims } = useApp();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');

  const filtered = users.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (!teamFilter || u.team === teamFilter)
  );

  const getUserClaimCount = (userId: string) =>
    claims.filter(c => c.currentAssignees.includes(userId) && !['COMPLETED', 'REJECTED'].includes(c.status)).length;

  const teamWorkload = Object.entries(TEAM_LABELS).map(([key, label]) => {
    const teamUsers = users.filter(u => u.team === key);
    const available = teamUsers.filter(u => u.status === 'AVAILABLE').length;
    const totalClaims = teamUsers.reduce((sum, u) => sum + getUserClaimCount(u.id), 0);
    return { key, label, total: teamUsers.length, available, totalClaims };
  });

  return (
    <div className="space-y-6">
      {/* Team Workload Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {teamWorkload.map(t => (
          <div key={t.key} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 mb-2">{t.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{t.totalClaims}</p>
                <p className="text-xs text-gray-400">active claims</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">{t.available}/{t.total}</p>
                <p className="text-xs text-gray-400">available</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
              <div
                className={`h-full rounded-full ${t.available / t.total < 0.3 ? 'bg-red-400' : t.available / t.total < 0.6 ? 'bg-yellow-400' : 'bg-green-400'}`}
                style={{ width: `${(t.available / Math.max(t.total, 1)) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="outline-none text-sm w-40" />
        </div>
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none">
          <option value="">All Teams</option>
          {Object.entries(TEAM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role / Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active Claims</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Update Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{ROLE_LABELS[user.role]}</p>
                  <p className="text-xs text-gray-400">{TEAM_LABELS[user.team]}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={user.status} />
                    <span className="text-sm text-gray-700">{user.status.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                    <span className={`font-semibold ${getUserClaimCount(user.id) > 6 ? 'text-red-600' : 'text-gray-900'}`}>
                      {getUserClaimCount(user.id)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={user.status}
                    onChange={e => updateUserStatus(user.id, e.target.value as UserStatus)}
                    className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
