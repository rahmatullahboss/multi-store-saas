/**
 * Subscribers Management Page
 * 
 * Route: /app/subscribers
 * 
 * Features:
 * - List all subscribers
 * - Add new subscriber
 * - Import from CSV
 * - Delete/unsubscribe
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq, and } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { emailSubscribers } from '@db/schema';
import { createCampaignService } from '~/services/campaign.server';
import { 
  Plus, 
  Trash2, 
  Upload, 
  ArrowLeft,
  Mail,
  UserMinus,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Subscribers - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const db = drizzle(context.cloudflare.env.DB);

  const subscribers = await db
    .select()
    .from(emailSubscribers)
    .where(eq(emailSubscribers.storeId, storeId))
    .orderBy(desc(emailSubscribers.createdAt));

  return json({ subscribers });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'customers',
  });

  const formData = await request.formData();
  const intent = formData.get('intent');
  
  const campaignService = createCampaignService(context.cloudflare.env.DB);

  if (intent === 'add') {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    if (!email || !email.includes('@')) {
      return json({ error: 'Valid email is required' }, { status: 400 });
    }

    await campaignService.addSubscriber(storeId, email, name, 'manual');
    return json({ success: true, message: 'Subscriber added' });
  }

  if (intent === 'delete') {
    const subscriberId = Number(formData.get('subscriberId'));
    await campaignService.deleteSubscriber(storeId, subscriberId);
    return json({ success: true, message: 'Subscriber deleted' });
  }

  if (intent === 'import') {
    const csvData = formData.get('csvData') as string;
    
    if (!csvData) {
      return json({ error: 'No data provided' }, { status: 400 });
    }

    // Parse CSV (simple format: email,name)
    const lines = csvData.split('\n').filter(line => line.trim());
    const subscribers: Array<{ email: string; name?: string }> = [];

    for (const line of lines) {
      const [email, name] = line.split(',').map(s => s.trim());
      if (email && email.includes('@')) {
        subscribers.push({ email, name });
      }
    }

    if (subscribers.length === 0) {
      return json({ error: 'No valid emails found' }, { status: 400 });
    }

    const result = await campaignService.importSubscribers(storeId, subscribers);
    return json({ 
      success: true, 
      message: `Imported ${result.imported} subscribers (${result.skipped} skipped)` 
    });
  }

  return json({ error: 'Unknown action' });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SubscribersPage() {
  const { subscribers } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  const activeCount: number = subscribers.filter(s => s.status === 'subscribed').length;
  const unsubscribedCount: number = subscribers.filter(s => s.status === 'unsubscribed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/app/campaigns"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('subscribers')}</h1>
            <p className="text-gray-500 mt-1">{t('manageSubscribersDesc')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowImportForm(!showImportForm); setShowAddForm(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
          >
            <Upload className="w-4 h-4" />
            {t('importFromCsv')}
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setShowImportForm(false); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium transition"
          >
            <Plus className="w-4 h-4" />
            {t('addSubscriber')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users className="w-4 h-4" />
            {t('total')}
          </div>
          <p className="text-2xl font-bold text-gray-900">{Number(subscribers.length)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {t('activeLabel')}
          </div>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
            {t('unsubscribed')}
          </div>
          <p className="text-2xl font-bold text-red-600">{unsubscribedCount}</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {actionData && 'message' in actionData && actionData.message && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-800">{String(actionData.message)}</p>
        </div>
      )}
      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <Form method="post" className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('addSubscriber')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('emailLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="subscriber@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('nameLabel')}
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              name="intent"
              value="add"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
            >
              {isSubmitting ? t('adding') : t('addSubscriber')}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </Form>
      )}

      {/* Import Form */}
      {showImportForm && (
        <Form method="post" className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">{t('importFromCsv')}</h3>
          <p className="text-gray-500 text-sm mb-4">
            {t('csvImportDesc')}
          </p>
          <textarea
            name="csvData"
            rows={6}
            placeholder="john@example.com,John Doe&#10;jane@example.com,Jane Smith"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              name="intent"
              value="import"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
            >
              {isSubmitting ? t('importing') : t('import')}
            </button>
            <button
              type="button"
              onClick={() => setShowImportForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              {t('cancel')}
            </button>
          </div>
        </Form>
      )}

      {/* Subscribers Table */}
      {subscribers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noSubscribersTitle')}</h3>
          <p className="text-gray-500 mb-6">{t('noSubscribersDesc')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('emailLabel')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('nameLabel')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('status')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('source')}</th>
                  <th className="text-left py-3.5 px-4 text-sm font-semibold text-gray-900">{t('joinedLabel')}</th>
                  <th className="text-right py-3.5 px-4 text-sm font-semibold text-gray-900">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">{subscriber.email}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {subscriber.name || '-'}
                    </td>
                    <td className="py-4 px-4">
                      {subscriber.status === 'subscribed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          {t('activeLabel')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          {t('unsubscribed')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {subscriber.source || 'manual'}
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {subscriber.createdAt 
                        ? new Date(subscriber.createdAt).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end">
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="subscriberId" value={subscriber.id} />
                          <button
                            type="submit"
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                            onClick={(e) => {
                              if (!confirm('Delete this subscriber?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {subscribers.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{sub.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${sub.status === 'subscribed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {sub.status === 'subscribed' ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
