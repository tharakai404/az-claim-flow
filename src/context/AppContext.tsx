import React, { createContext, useContext, useState, useCallback } from 'react';
import { Claim, User, Notification, ClaimStatus, QueueType, UserStatus, Team } from '../types';
import { MOCK_CLAIMS, MOCK_NOTIFICATIONS, USERS } from '../data/mockData';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  claims: Claim[];
  users: User[];
  notifications: Notification[];
  currentUser: User | null;
}

interface AppContextValue extends AppState {
  login: (userId: string) => void;
  logout: () => void;
  updateClaimStatus: (claimId: string, status: ClaimStatus, actor?: string, description?: string) => void;
  assignClaim: (claimId: string, toUserId: string, reason: string) => void;
  moveToPending: (claimId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  getUsersByTeam: (team: Team) => User[];
  getEligibleUsersForAssignment: (team: Team) => User[];
  roundRobinAssign: (claimId: string, team: Team, reason: string) => void;
  unreadCount: number;
  getClaimsByQueue: (queue: QueueType) => Claim[];
  updateClaim: (claimId: string, updates: Partial<Claim>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = useState<Claim[]>(MOCK_CLAIMS);
  const [users, setUsers] = useState<User[]>(USERS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<User | null>(USERS[0]); // default Sara

  const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

  const login = useCallback((userId: string) => {
    const user = USERS.find(u => u.id === userId) || null;
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => setCurrentUser(null), []);

  const addTimelineEvent = useCallback((claimId: string, event: string, description: string, actor: string, actorRole: string, status?: ClaimStatus) => {
    setClaims(prev => prev.map(c => {
      if (c.id !== claimId) return c;
      return {
        ...c,
        timeline: [...c.timeline, {
          id: uuidv4(), claimId,
          event, description, actor, actorRole,
          timestamp: new Date().toISOString(),
          status,
        }],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const updateClaimStatus = useCallback((claimId: string, status: ClaimStatus, actor = 'System', description = '') => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status, updatedAt: new Date().toISOString() } : c));
    addTimelineEvent(claimId, 'Status Changed', description || `Status changed to ${status}`, actor, 'System', status);
  }, [addTimelineEvent]);

  const updateClaim = useCallback((claimId: string, updates: Partial<Claim>) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  }, []);

  const assignClaim = useCallback((claimId: string, toUserId: string, reason: string) => {
    const toUser = users.find(u => u.id === toUserId);
    if (!toUser || !currentUser) return;

    const assignment = {
      id: uuidv4(), claimId,
      assignedTo: toUserId, assignedToName: toUser.name, assignedToTeam: toUser.team,
      assignedBy: currentUser.id, assignedByName: currentUser.name,
      reason, timestamp: new Date().toISOString(), isActive: true,
    };

    setClaims(prev => prev.map(c => {
      if (c.id !== claimId) return c;
      const updatedAssignments = c.assignments.map(a => ({ ...a, isActive: false }));
      return {
        ...c,
        assignments: [...updatedAssignments, assignment],
        currentAssignees: [toUserId],
        status: 'ASSIGNED' as ClaimStatus,
        updatedAt: new Date().toISOString(),
      };
    }));

    setUsers(prev => prev.map(u => u.id === toUserId ? { ...u, activeClaims: u.activeClaims + 1 } : u));
    addTimelineEvent(claimId, 'Claim Assigned', `Assigned to ${toUser.name} (${reason})`, currentUser.name, currentUser.role);

    setNotifications(prev => [...prev, {
      id: uuidv4(), userId: toUserId, claimId,
      title: 'New Claim Assigned',
      message: `A claim has been assigned to you. Reason: ${reason}`,
      severity: 'INFO', read: false, createdAt: new Date().toISOString(),
    }]);
  }, [users, currentUser, addTimelineEvent]);

  const moveToPending = useCallback((claimId: string) => {
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, queue: 'PENDING', status: 'PENDING', updatedAt: new Date().toISOString() } : c));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    setNotifications(prev => [...prev, { ...notification, id: uuidv4(), createdAt: new Date().toISOString() }]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const updateUserStatus = useCallback((userId: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
  }, []);

  const getUsersByTeam = useCallback((team: Team) => users.filter(u => u.team === team), [users]);

  const getEligibleUsersForAssignment = useCallback((team: Team) => {
    return users.filter(u => u.team === team && (u.status === 'AVAILABLE' || u.status === 'BUSY'));
  }, [users]);

  const roundRobinAssign = useCallback((claimId: string, team: Team, reason: string) => {
    const eligible = getEligibleUsersForAssignment(team);
    if (eligible.length === 0) return;
    const sorted = [...eligible].sort((a, b) => a.activeClaims - b.activeClaims);
    assignClaim(claimId, sorted[0].id, reason);
  }, [getEligibleUsersForAssignment, assignClaim]);

  const getClaimsByQueue = useCallback((queue: QueueType) => {
    if (!currentUser) return [];
    return claims.filter(c => {
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERVISOR') return c.queue === queue;
      if (queue === 'INCOMING') return c.currentAssignees.includes(currentUser.id) && c.queue === 'INCOMING';
      if (queue === 'OUTGOING') return c.queue === 'OUTGOING' && c.assignments.some(a => a.assignedBy === currentUser.id);
      if (queue === 'PENDING') return c.currentAssignees.includes(currentUser.id) && c.status === 'PENDING';
      if (queue === 'ACTION_REQUIRED') return c.currentAssignees.includes(currentUser.id) && c.queue === 'ACTION_REQUIRED';
      if (queue === 'COMPLETED') return c.status === 'COMPLETED' || c.status === 'REJECTED';
      return false;
    });
  }, [claims, currentUser]);

  return (
    <AppContext.Provider value={{
      claims, users, notifications, currentUser,
      login, logout,
      updateClaimStatus, assignClaim, moveToPending, updateClaim,
      addNotification, markNotificationRead,
      updateUserStatus, getUsersByTeam, getEligibleUsersForAssignment, roundRobinAssign,
      unreadCount, getClaimsByQueue,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
