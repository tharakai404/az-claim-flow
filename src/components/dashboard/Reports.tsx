import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/claimHelpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const monthlyData = [
  { month: 'Jan', claims: 145, settled: 132, amount: 2400000 },
  { month: 'Feb', claims: 132, settled: 125, amount: 2100000 },
  { month: 'Mar', claims: 187, settled: 165, amount: 3200000 },
  { month: 'Apr', claims: 156, settled: 144, amount: 2700000 },
  { month: 'May', claims: 178, settled: 160, amount: 3100000 },
  { month: 'Jun', claims: 201, settled: 178, amount: 3600000 },
];

const teamData = [
  { team: 'Call Center', claims: 201, resolved: 180 },
  { team: 'Virtual Assessor', claims: 87, resolved: 75 },
  { team: 'Physical Assessor', claims: 45, resolved: 40 },
  { team: 'Desk Engineers', claims: 33, resolved: 28 },
  { team: 'Claim Expert', claims: 56, resolved: 50 },
];

const categoryData = [
  { name: 'Simple', value: 45, color: '#10b981' },
  { name: 'Core', value: 35, color: '#3b82f6' },
  { name: 'Complex', value: 20, color: '#ef4444' },
];

export default function Reports() {
  const { claims } = useApp();

  const avgSLAHours = claims.reduce((sum, c) => sum + c.sla.targetHours, 0) / Math.max(claims.length, 1);
  const totalSettlement = claims.reduce((sum, c) => sum + (c.settlementAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims (2026)', value: '1,024', sub: '+12% vs last year' },
          { label: 'Settled Amount', value: `AED ${(totalSettlement / 1000).toFixed(0)}K`, sub: 'This month' },
          { label: 'Avg Processing Time', value: `${avgSLAHours.toFixed(0)}h`, sub: 'Per claim' },
          { label: 'Settlement Rate', value: '87%', sub: 'Claims resolved' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-2">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-green-600 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Claims & Settlement Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="claims" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="settled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="claims" name="New Claims" stroke="#3b82f6" fill="url(#claims)" strokeWidth={2} />
            <Area type="monotone" dataKey="settled" name="Settled" stroke="#10b981" fill="url(#settled)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Team Performance + Category */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Team Performance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={teamData} layout="vertical" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="team" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Bar dataKey="claims" name="Assigned" fill="#93c5fd" radius={[0, 4, 4, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Claim Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3}>
                {categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SLA Compliance */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">SLA Compliance by Team</h3>
        <div className="space-y-3">
          {[
            { team: 'Call Center', compliance: 94 },
            { team: 'Virtual Assessor', compliance: 88 },
            { team: 'Physical Assessor', compliance: 76 },
            { team: 'Desk Engineers', compliance: 82 },
            { team: 'Claim Expert', compliance: 91 },
            { team: 'Fraud Management', compliance: 69 },
          ].map(item => (
            <div key={item.team} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-40">{item.team}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full">
                <div
                  className={`h-full rounded-full ${item.compliance >= 90 ? 'bg-green-500' : item.compliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${item.compliance}%` }}
                />
              </div>
              <span className={`text-sm font-semibold w-10 text-right ${item.compliance >= 90 ? 'text-green-600' : item.compliance >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                {item.compliance}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
