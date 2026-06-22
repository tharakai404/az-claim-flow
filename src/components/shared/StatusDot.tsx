import React from 'react';
import { UserStatus } from '../../types';

const colors: Record<UserStatus, string> = {
  AVAILABLE: 'bg-green-400',
  BUSY: 'bg-yellow-400',
  AWAY: 'bg-orange-400',
  ON_LEAVE: 'bg-gray-400',
  OFFLINE: 'bg-red-400',
};

export default function StatusDot({ status }: { status: UserStatus }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}
