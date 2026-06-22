import React from 'react';
import {
  ClipboardList, Clock, CheckCircle2, AlertCircle, TrendingUp,
  ShieldAlert, DollarSign, Users, ArrowUpRight, Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatCurrency } from '../../utils/claimHelpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const weeklyData = [
  { day: 'Mon', claims: 12, completed: 8 },
  { day: 'Tue', claims: 19, completed: 14 },
  { day: 'Wed', claims: 15, completed: 11 },
  { day: 'Thu', claims: 22, completed: 16 },
  { day: 'Fri', claims: 18, completed: 15 },
  { day: 'Sat', claims: 8, completed: 7 },
  { day: 'Sun', claims: 5, completed: 4 },
];

export default function Dashboard() {
  const { claims, users } = useApp();

  const totalClaims = claims.length;
  const activeClaims = claims.filter(c => !['COMPLETED', 'REJECTED'].includes(c.status)).length;
  const slaBreached = claims.filter(c => c.sla.isBreached).length;
  const fraudAlerts = claims.filter(c => c.fraudStatus === 'SUSPECT' || c.fraudStatus === 'CONFIRMED').length;
  const paymentProcessing = claims.filter(c => c.status === 'PAYMENT_PROCESSING').length;
  const notAssigned = claims.filter(c => c.status === 'NOT_ASSIGNED').length;
  const availableUsers = users.filter(u => u.status === 'AVAILABLE').length;

  const statusDistribution = [
    { name: 'Not Assigned', value: claims.filter(c => c.status === 'NOT_ASSIGNED').length },
    { name: 'In Progress', value: claims.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'VIRTUAL_INSPECTION'].includes(c.status)).length },
    { name: 'Pending Customer', value: claims.filter(c => c.status === 'WAITING_CUSTOMER_RESPONSE').length },
    { name: 'Under Review', value: claims.filter(c => ['FRAUD_REVIEW', 'EXPERT_REVIEW', 'ESTIMATE_UNDER_REVIEW'].includes(c.status)).length },
    { name: 'Completed', value: claims.filter(c => c.status === 'COMPLETED').length },
  ].filter(d => d.value > 0);

  const categoryData = [
    { name: 'Simple', value: claims.filter(c => c.category === 'SIMPLE').length, color: '#10b981' },
    { name: 'Core', value: claims.filter(c => c.category === 'CORE').length, color: '#3b82f6' },
    { name: 'Complex', value: claims.filter(c => c.category === 'COMPLEX').length, color: '#ef4444' },
    { name: 'Uncat.', value: claims.filter(c => !c.category).length, color: '#9ca3af' },
  ];

  const recentClaims = [...claims].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Claims" value={totalClaims} icon={ClipboardList} color="blue" delta="+3 today" />
        <KPICard label="Active Claims" value={activeClaims} icon={Activity} color="indigo" delta={`${notAssigned} unassigned`} urgent={notAssigned > 0} />
        <KPICard label="SLA Breached" value={slaBreached} icon={Clock} color="red" delta="Needs attention" urgent={slaBreached > 0} />
        <KPICard label="Fraud Alerts" value={fraudAlerts} icon={ShieldAlert} color="orange" delta="Under investigation" urgent={fraudAlerts > 0} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Payments Pending" value={paymentProcessing} icon={DollarSign} color="green" delta="AED 7,750 queued" />
        <KPICard label="Available Staff" value={availableUsers} icon={Users} color="teal" delta={`of ${users.length} total`} />
        <KPICard label="Awaiting Customer" value={claims.filter(c => c.status === 'WAITING_CUSTOMER_RESPONSE').length} icon={AlertCircle} color="yellow" />
        <KPICard label="Completed Today" value={claims.filter(c => c.status === 'COMPLETED').length} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Claims Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="claims" name="New Claims" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Claim Categories</h3>
          <div className="space-y-3">
            {categoryData.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{cat.name}</span>
                  <span className="font-semibold text-gray-900">{cat.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(cat.value / totalClaims) * 100}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Team Workload</h3>
          <div className="space-y-2">
            {[
              { team: 'Call Center', count: 8, cap: 15 },
              { team: 'Virtual Assessor', count: 7, cap: 10 },
              { team: 'Physical Assessor', count: 3, cap: 8 },
              { team: 'Desk Engineers', count: 10, cap: 12 },
              { team: 'Claim Expert', count: 11, cap: 15 },
            ].map(t => (
              <div key={t.team}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{t.team}</span>
                  <span className={`font-medium ${t.count / t.cap > 0.8 ? 'text-red-600' : 'text-gray-900'}`}>{t.count}/{t.cap}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${t.count / t.cap > 0.8 ? 'bg-red-400' : t.count / t.cap > 0.6 ? 'bg-yellow-400' : 'bg-green-400'}`}
                    style={{ width: `${(t.count / t.cap) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Claims</h3>
          <div className="space-y-3">
            {recentClaims.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.sla.isBreached ? 'bg-red-400' : 'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{c.claimNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{c.customerName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.status === 'NOT_ASSIGNED' ? 'bg-gray-100 text-gray-600' :
                  c.status === 'FRAUD_REVIEW' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {c.status.replace(/_/g, ' ').slice(0, 12)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon: Icon, color, delta, urgent }: {
  label: string; value: number; icon: React.ElementType;
  color: string; delta?: string; urgent?: boolean;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
    teal: 'bg-teal-50 text-teal-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className={`bg-white rounded-xl border p-4 shadow-sm ${urgent ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {urgent && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {delta && <div className={`text-xs mt-1 font-medium ${urgent ? 'text-red-600' : 'text-gray-400'}`}>{delta}</div>}
    </div>
  );
}
