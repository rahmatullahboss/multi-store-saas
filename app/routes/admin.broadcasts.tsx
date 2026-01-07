/**
 * Super Admin - Broadcast Management
 * 
 * Route: /admin/broadcasts
 * 
 * Features:
 * - Create system-wide announcements
 * - Toggle active/inactive broadcasts
 * - Delete old broadcasts
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Form } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc } from 'drizzle-orm';
import { systemNotifications, users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  Radio, 
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Info,
  AlertTriangle,
  AlertCircle,
  Send
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Broadcasts - Super Admin' }];
};

// ============================================================================
// LOADER - Fetch all broadcasts
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, db);
  
  const drizzleDb = drizzle(db);
  
  const broadcasts = await drizzleDb
    .select({
      id: systemNotifications.id,
      message: systemNotifications.message,
      type: systemNotifications.type,
      isActive: systemNotifications.isActive,
      createdAt: systemNotifications.createdAt,
      createdById: systemNotifications.createdBy,
    })
    .from(systemNotifications)
    .orderBy(desc(systemNotifications.createdAt));
  
  return json({ broadcasts });
}

// ============================================================================
// ACTION - Create, toggle, delete broadcasts
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  const { userId } = await requireSuperAdmin(request, db);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  const drizzleDb = drizzle(db);
  
  // ============ CREATE ============
  if (intent === 'create') {
    const message = formData.get('message') as string;
    const type = formData.get('type') as 'info' | 'warning' | 'critical';
    
    if (!message?.trim()) {
      return json({ error: 'Message is required' }, { status: 400 });
    }
    
    await drizzleDb.insert(systemNotifications).values({
      message: message.trim(),
      type: type || 'info',
      isActive: true,
      createdBy: userId,
    });
    
    return json({ success: true, action: 'created' });
  }
  
  // ============ TOGGLE ============
  if (intent === 'toggle') {
    const notificationId = Number(formData.get('notificationId'));
    const currentStatus = formData.get('currentStatus') === 'true';
    
    await drizzleDb
      .update(systemNotifications)
      .set({ isActive: !currentStatus })
      .where(eq(systemNotifications.id, notificationId));
    
    return json({ success: true, action: currentStatus ? 'deactivated' : 'activated' });
  }
  
  // ============ DELETE ============
  if (intent === 'delete') {
    const notificationId = Number(formData.get('notificationId'));
    
    await drizzleDb
      .delete(systemNotifications)
      .where(eq(systemNotifications.id, notificationId));
    
    return json({ success: true, action: 'deleted' });
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminBroadcasts() {
  const { broadcasts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isCreating, setIsCreating] = useState(false);

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-500/20 text-amber-400';
      case 'critical':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Broadcasts</h1>
          <p className="text-slate-400">Send announcements to all merchants</p>
        </div>
        
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Broadcast
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Broadcast</h3>
          <Form method="post" onSubmit={() => setIsCreating(false)}>
            <input type="hidden" name="intent" value="create" />
            
            <div className="space-y-4">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={3}
                  required
                  placeholder="e.g., Scheduled maintenance at 2:00 AM UTC"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                />
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type
                </label>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="info"
                      defaultChecked
                      className="w-4 h-4 text-blue-500 bg-slate-800 border-slate-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                      <Info className="w-4 h-4 text-blue-400" />
                      Info
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="warning"
                      className="w-4 h-4 text-amber-500 bg-slate-800 border-slate-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      Warning
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="critical"
                      className="w-4 h-4 text-red-500 bg-slate-800 border-slate-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-slate-300 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      Critical
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition"
                >
                  <Send className="w-4 h-4" />
                  Send Broadcast
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Form>
        </div>
      )}

      {/* Broadcasts List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">All Broadcasts</h3>
        </div>
        
        {broadcasts.length === 0 ? (
          <div className="p-8 text-center">
            <Radio className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No broadcasts yet</p>
            <p className="text-sm text-slate-500">Create your first system-wide announcement</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {broadcasts.map((broadcast) => (
              <div 
                key={broadcast.id}
                className={`p-4 flex items-start gap-4 ${
                  !broadcast.isActive ? 'opacity-50' : ''
                }`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getTypeBadge(broadcast.type)}`}>
                  {getTypeIcon(broadcast.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white">{broadcast.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadge(broadcast.type)}`}>
                      {broadcast.type || 'info'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {broadcast.createdAt 
                        ? new Date(broadcast.createdAt).toLocaleString()
                        : 'Unknown date'
                      }
                    </span>
                    <span className={`text-xs ${broadcast.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {broadcast.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Toggle */}
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="notificationId" value={broadcast.id} />
                    <input type="hidden" name="currentStatus" value={String(broadcast.isActive)} />
                    <button
                      type="submit"
                      className={`p-2 rounded-lg transition ${
                        broadcast.isActive 
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                      }`}
                      title={broadcast.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {broadcast.isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </button>
                  </fetcher.Form>
                  
                  {/* Delete */}
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="notificationId" value={broadcast.id} />
                    <button
                      type="submit"
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                      title="Delete"
                      onClick={(e) => {
                        if (!confirm('Are you sure you want to delete this broadcast?')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </fetcher.Form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
