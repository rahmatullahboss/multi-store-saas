/**
 * Order Timeline Component
 * 
 * Visual vertical timeline for order activity logs.
 * Shows system events, status changes, and user notes with distinct styling.
 */

import { 
  RefreshCw, StickyNote, Settings, Clock, User,
  ChevronDown, ChevronUp, Package, CreditCard, Send
} from 'lucide-react';
import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { getActionLabel, getActionColor } from '~/lib/activity';

interface ActivityLog {
  id: number;
  userId: number | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  details: string | null;
  createdAt: Date | string | null;
  user?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
}

interface OrderTimelineProps {
  logs: ActivityLog[];
  orderId: number;
  isSubmitting?: boolean;
}

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return '';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActionIcon(action: string) {
  if (action.includes('status_update')) {
    return <RefreshCw className="w-3.5 h-3.5" />;
  }
  if (action.includes('note_added')) {
    return <StickyNote className="w-3.5 h-3.5" />;
  }
  if (action.includes('payment')) {
    return <CreditCard className="w-3.5 h-3.5" />;
  }
  if (action.includes('created')) {
    return <Package className="w-3.5 h-3.5" />;
  }
  return <Settings className="w-3.5 h-3.5" />;
}

function parseDetails(details: string | null): Record<string, unknown> | null {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch {
    return null;
  }
}

export function OrderTimeline({ logs, orderId: _orderId, isSubmitting: _isSubmitting }: OrderTimelineProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [note, setNote] = useState('');
  const fetcher = useFetcher();
  const isAddingNote = fetcher.state === 'submitting';

  const toggleExpand = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const handleSubmitNote = () => {
    if (!note.trim()) return;
    fetcher.submit(
      { intent: 'addNote', note: note.trim() },
      { method: 'post' }
    );
    setNote('');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-500" />
        Order Timeline
      </h2>

      {/* Add Note Form */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Internal Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a private note about this order..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
        />
        <button
          type="button"
          onClick={handleSubmitNote}
          disabled={isAddingNote || !note.trim()}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isAddingNote ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Add Note
            </>
          )}
        </button>
      </div>

      {/* Timeline */}
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No activity recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log, index) => {
            const parsedDetails = parseDetails(log.details);
            const isNote = log.action === 'order_note_added';
            const isStatusChange = log.action === 'order_status_update';
            
            return (
              <div key={log.id} className="relative pl-6">
                {/* Timeline line */}
                {index < logs.length - 1 && (
                  <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-gray-200" />
                )}
                
                {/* Timeline dot */}
                <div className={`absolute left-0 top-0.5 w-5 h-5 rounded-full ${
                  isNote 
                    ? 'bg-yellow-100 text-yellow-600' 
                    : isStatusChange
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                } flex items-center justify-center`}>
                  {getActionIcon(log.action)}
                </div>

                {/* Content */}
                <div className={`p-3 rounded-lg ${
                  isNote 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-gray-50'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                          {isNote ? 'Note' : getActionLabel(log.action)}
                        </span>
                        {isStatusChange && parsedDetails && (
                          <span className="text-xs text-gray-500">
                            {String(parsedDetails.from || '').charAt(0).toUpperCase() + String(parsedDetails.from || '').slice(1)} → {String(parsedDetails.to || '').charAt(0).toUpperCase() + String(parsedDetails.to || '').slice(1)}
                          </span>
                        )}
                      </div>
                      {/* Note content preview */}
                      {isNote && parsedDetails && 'note' in parsedDetails && (
                        <p className="mt-1.5 text-sm text-gray-700 line-clamp-2">
                          {String(parsedDetails.note)}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                        {log.user ? (
                          <>
                            <User className="w-3 h-3" />
                            <span>{log.user.name || log.user.email}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">System</span>
                        )}
                        <span>•</span>
                        <span title={new Date(log.createdAt || '').toLocaleString()}>
                          {formatRelativeTime(log.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Expand button */}
                    {parsedDetails && !isNote && (
                      <button
                        onClick={() => toggleExpand(log.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {expandedLogs.has(log.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {parsedDetails && expandedLogs.has(log.id) && !isNote && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <pre className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(parsedDetails, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
