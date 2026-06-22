import React, { useState } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USERS, ROLE_LABELS } from '../../data/mockData';
import { UserStatus } from '../../types';
import StatusDot from '../shared/StatusDot';

const STATUS_OPTIONS: UserStatus[] = ['AVAILABLE', 'BUSY', 'AWAY', 'ON_LEAVE', 'OFFLINE'];

export default function TopBar({ title }: { title: string }) {
  const { currentUser, login, unreadCount, notifications, markNotificationRead, updateUserStatus } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitchUser, setShowSwitchUser] = useState(false);

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id).slice(0, 8);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400" />
          <input placeholder="Search claims, policies..." className="bg-transparent text-sm text-gray-600 outline-none w-full" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                <span className="text-xs text-blue-600 cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {myNotifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No notifications</p>
                ) : myNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        n.severity === 'ERROR' ? 'bg-red-500' :
                        n.severity === 'WARNING' ? 'bg-orange-500' :
                        n.severity === 'SUCCESS' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">{currentUser?.role ? ROLE_LABELS[currentUser.role] : ''}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 mb-1">My Status</p>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => { if (currentUser) updateUserStatus(currentUser.id, s); setShowUserMenu(false); }}
                    className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-sm hover:bg-gray-50 ${currentUser?.status === s ? 'bg-gray-50' : ''}`}
                  >
                    <StatusDot status={s} />
                    {s.replace(/_/g, ' ')}
                    {currentUser?.status === s && <span className="ml-auto text-blue-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-100 px-4 py-2">
                <button
                  onClick={() => { setShowUserMenu(false); setShowSwitchUser(true); }}
                  className="flex items-center gap-2 w-full text-sm text-gray-700 hover:text-blue-600 py-1.5"
                >
                  Switch User (Demo)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Switch User Demo Modal */}
      {showSwitchUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-80 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Switch User (Demo)</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => { login(u.id); setShowSwitchUser(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 ${currentUser?.id === u.id ? 'bg-blue-50' : ''}`}
                >
                  <StatusDot status={u.status} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{ROLE_LABELS[u.role]}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowSwitchUser(false)} className="mt-4 w-full py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}
    </header>
  );
}
