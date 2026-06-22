import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './components/dashboard/Dashboard';
import ClaimsTable from './components/claims/ClaimsTable';
import QueueView from './components/queues/QueueView';
import UserManagement from './components/admin/UserManagement';
import Reports from './components/dashboard/Reports';
import CustomerPortal from './components/customer/CustomerPortal';
import { QueueType } from './types';

type View =
  | 'dashboard' | 'claims' | 'documents' | 'reports' | 'users' | 'admin'
  | 'queue-incoming' | 'queue-action' | 'queue-pending' | 'queue-outgoing' | 'queue-completed'
  | 'customer-portal';

const VIEW_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  claims: 'All Claims',
  documents: 'Documents',
  reports: 'Reports & Analytics',
  users: 'User Management',
  admin: 'Admin Settings',
  'queue-incoming': 'Incoming Queue',
  'queue-action': 'Action Required',
  'queue-pending': 'Pending Queue',
  'queue-outgoing': 'Outgoing Queue',
  'queue-completed': 'Completed Claims',
  'customer-portal': 'Customer Portal',
};

const QUEUE_MAP: Partial<Record<View, QueueType>> = {
  'queue-incoming': 'INCOMING',
  'queue-action': 'ACTION_REQUIRED',
  'queue-pending': 'PENDING',
  'queue-outgoing': 'OUTGOING',
  'queue-completed': 'COMPLETED',
};

function InternalApp() {
  const [view, setView] = useState<View>('dashboard');
  const queueType = QUEUE_MAP[view];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar activeView={view} onNavigate={v => setView(v as View)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={VIEW_TITLES[view]} />
        <main className="flex-1 overflow-y-auto p-6">
          {view === 'dashboard' && <Dashboard />}
          {view === 'claims' && <ClaimsTable />}
          {queueType && <QueueView queue={queueType} />}
          {view === 'reports' && <Reports />}
          {view === 'users' && <UserManagement />}
          {view === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p className="text-lg font-medium">Document Management</p>
              <p className="text-sm mt-2">Centralized view of all claim documents across the system</p>
            </div>
          )}
          {view === 'admin' && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              <p className="text-lg font-medium">Admin Settings</p>
              <p className="text-sm mt-2">Configure workflow rules, assignment reasons, SLA thresholds, teams</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<'internal' | 'customer'>('internal');

  return (
    <AppProvider>
      {/* Portal Toggle */}
      <div className="fixed bottom-5 right-5 z-50 flex gap-1 bg-white rounded-full shadow-xl border border-gray-200 p-1">
        <button
          onClick={() => setMode('internal')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${mode === 'internal' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Internal Portal
        </button>
        <button
          onClick={() => setMode('customer')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${mode === 'customer' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Customer Portal
        </button>
      </div>

      {mode === 'internal' ? <InternalApp /> : <CustomerPortal />}
    </AppProvider>
  );
}
