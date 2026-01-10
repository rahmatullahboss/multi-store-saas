/**
 * Admin Marketplace Themes Management
 * Route: /admin/marketplace-themes
 * 
 * Allows super admins to review, approve, or remove marketplace themes.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useNavigation, useActionData, Form, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { marketplaceThemes } from '@db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  CheckCircle, XCircle, Trash2, Eye, 
  ExternalLink, Clock, BadgeCheck, AlertCircle,
  MoreVertical, Filter, Search, ChevronRight,
  Shield, Palette, Layout, ImageIcon, Loader2
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => [{ title: 'Manage Themes - Super Admin' }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);
  const db = drizzle(context.cloudflare.env.DB);
  
  const themes = await db
    .select()
    .from(marketplaceThemes)
    .orderBy(desc(marketplaceThemes.createdAt));

  return json({ themes });
}

export async function action({ request, context }: ActionFunctionArgs) {
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const themeId = parseInt(formData.get('themeId') as string);
  const intent = formData.get('intent') as string;

  if (isNaN(themeId)) return json({ error: 'Invalid Theme ID' }, { status: 400 });

  if (intent === 'approve') {
    await db
      .update(marketplaceThemes)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(marketplaceThemes.id, themeId));
    return json({ success: true, message: 'Theme approved' });
  }

  if (intent === 'reject') {
    await db
      .update(marketplaceThemes)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(marketplaceThemes.id, themeId));
    return json({ success: true, message: 'Theme rejected' });
  }

  if (intent === 'delete') {
    await db
      .delete(marketplaceThemes)
      .where(eq(marketplaceThemes.id, themeId));
    return json({ success: true, message: 'Theme deleted permanently' });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function AdminMarketplaceThemes() {
  const { themes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredThemes = themes.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Palette className="text-red-400" />
            Theme Marketplace Management
          </h1>
          <p className="text-slate-400 mt-1">Review and manage community-built themes.</p>
        </div>
      </div>

      {actionData && 'success' in actionData && actionData.success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} />
          <p className="text-sm font-medium">{(actionData as any).message}</p>
        </div>
      )}

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Themes', value: themes.length, icon: Layout, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Pending Review', value: themes.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Approved', value: themes.filter(t => t.status === 'approved').length, icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Rejected', value: themes.filter(t => t.status === 'rejected').length, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon size={18} />
              </div>
              <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === s 
                    ? 'bg-slate-800 text-white shadow-inner ring-1 ring-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search themes or designers..."
              className="bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Theme Info</th>
                <th className="px-6 py-4">Designer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredThemes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <AlertCircle className="mx-auto mb-2 opacity-20" size={32} />
                    No themes found in this category.
                  </td>
                </tr>
              ) : (
                filteredThemes.map((theme) => (
                  <tr key={theme.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 aspect-video rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                          {theme.thumbnail ? (
                            <img src={theme.thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-slate-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">{theme.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{theme.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold border border-slate-700">
                          {theme.authorName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm">{theme.authorName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        theme.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        theme.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {theme.status === 'approved' && <BadgeCheck size={12} />}
                        {theme.status === 'pending' && <Clock size={12} />}
                        {theme.status === 'rejected' && <XCircle size={12} />}
                        {theme.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {theme.createdAt ? new Date(theme.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {theme.status !== 'approved' && (
                          <Form method="POST" className="inline">
                            <input type="hidden" name="themeId" value={theme.id} />
                            <input type="hidden" name="intent" value="approve" />
                            <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                          </Form>
                        )}
                        {theme.status !== 'rejected' && (
                          <Form method="POST" className="inline">
                            <input type="hidden" name="themeId" value={theme.id} />
                            <input type="hidden" name="intent" value="reject" />
                            <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </Form>
                        )}
                        <Form method="POST" className="inline" onSubmit={(e) => {
                          if (!confirm('Are you sure you want to delete this theme?')) e.preventDefault();
                        }}>
                          <input type="hidden" name="themeId" value={theme.id} />
                          <input type="hidden" name="intent" value="delete" />
                          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
