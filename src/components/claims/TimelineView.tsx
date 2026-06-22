import React from 'react';
import { TimelineEvent } from '../../types';
import { getStatusColor } from '../../utils/claimHelpers';

export default function TimelineView({ timeline }: { timeline: TimelineEvent[] }) {
  const sorted = [...timeline].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {sorted.map((event, i) => (
          <div key={event.id} className="relative flex gap-4">
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
              i === 0 ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              {(sorted.length - i).toString().padStart(2, '0')}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{event.event}</span>
                  {event.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(event.status)}`}>
                      {event.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(event.timestamp).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-xs text-gray-400 mt-1">by {event.actor} · {event.actorRole}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
