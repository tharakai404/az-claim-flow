import React from 'react';
import {
  LayoutDashboard, ClipboardList, Inbox, Send, Clock, AlertCircle,
  CheckCircle2, Users, Settings, ShieldAlert, BarChart2, Bell,
  FileText, ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusDot from '../shared/StatusDot';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'claims', label: 'All Claims', icon: ClipboardList },
  { id: 'queue-incoming', label: 'Incoming', icon: Inbox },
  { id: 'queue-action', label: 'Action Required', icon: AlertCircle },
  { id: 'queue-pending', label: 'Pending', icon: Clock },
  { id: 'queue-outgoing', label: 'Outgoing', icon: Send },
  { id: 'queue-completed', label: 'Completed', icon: CheckCircle2 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'users', label: 'User Management', icon: Users, roles: ['ADMIN', 'SUPERVISOR'] },
  { id: 'admin', label: 'Admin', icon: Settings, roles: ['ADMIN'] },
];

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { currentUser, claims, unreadCount } = useApp();

  const queueCounts = {
    'queue-incoming': claims.filter(c => c.queue === 'INCOMING' && c.currentAssignees.includes(currentUser?.id ?? '')).length,
    'queue-action': claims.filter(c => c.queue === 'ACTION_REQUIRED' && c.currentAssignees.includes(currentUser?.id ?? '')).length,
    'queue-pending': claims.filter(c => c.status === 'PENDING' && c.currentAssignees.includes(currentUser?.id ?? '')).length,
  };

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(currentUser?.role ?? '')
  );

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight">AZ Claims</div>
            <div className="text-xs text-slate-400">Workflow Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const count = queueCounts[item.id as keyof typeof queueCounts];
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {count ? (
                <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {count}
                </span>
              ) : null}
              {isActive && <ChevronRight className="w-3 h-3" />}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-700">
        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <StatusDot status={currentUser.status} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{currentUser.name}</div>
              <div className="text-xs text-slate-400 truncate">{currentUser.role.replace(/_/g, ' ')}</div>
            </div>
            <button className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors relative">
              <Bell className="w-4 h-4 text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
