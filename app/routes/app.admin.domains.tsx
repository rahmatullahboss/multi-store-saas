/**
 * Admin Domain Management Page
 * 
 * Platform admin page to view all custom domains and their Cloudflare status
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useNavigation, useRevalidator } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, isNotNull, or } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { requireUserId } from '~/services/auth.server';
import { 
  getHostnameStatus, 
  deleteCustomHostname,
  isCloudflareConfigured,
  type CloudflareEnv 
} from '~/services/cloudflare.server';
import { Globe, Check, X, Clock, ExternalLink, Copy, RefreshCw, Trash2, AlertTriangle, Zap } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Domain Management - Admin' }];
};

interface DomainEntry {
  id: number;
  name: string;
  subdomain: string;
  customDomain: string | null;
  customDomainRequest: string | null;
  customDomainStatus: string | null;
  cloudflareHostnameId: string | null;
  sslStatus: string | null;
  dnsVerified: boolean | null;
  customDomainRequestedAt: Date | null;
  ownerEmail: string | null;
  planType: string | null;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const db = drizzle(context.cloudflare.env.DB);
  
  // Check if user is admin
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || user[0].role !== 'admin') {
    throw new Response('Unauthorized', { status: 403 });
  }
  
  const env = context.cloudflare.env as CloudflareEnv;
  const cloudflareConfigured = isCloudflareConfigured(env);
  
  // Get all stores with custom domains or pending requests
  const domainsData = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
      customDomainRequest: stores.customDomainRequest,
      customDomainStatus: stores.customDomainStatus,
      cloudflareHostnameId: stores.cloudflareHostnameId,
      sslStatus: stores.sslStatus,
      dnsVerified: stores.dnsVerified,
      customDomainRequestedAt: stores.customDomainRequestedAt,
      planType: stores.planType,
    })
    .from(stores)
    .where(or(isNotNull(stores.customDomain), isNotNull(stores.customDomainRequest)));
  
  // Get store owner emails
  const domains: DomainEntry[] = [];
  for (const store of domainsData) {
    const owner = await db.select({ email: users.email }).from(users).where(eq(users.storeId, store.id)).limit(1);
    domains.push({
      ...store,
      ownerEmail: owner[0]?.email || null,
    });
  }
  
  // Separate by status
  const activeDomains = domains.filter(d => d.customDomain && d.sslStatus === 'active');
  const pendingDomains = domains.filter(d => d.customDomain && d.sslStatus !== 'active');
  const pendingRequests = domains.filter(d => !d.customDomain && d.customDomainRequest);
  
  return json({ 
    activeDomains, 
    pendingDomains, 
    pendingRequests,
    cloudflareConfigured,
    totalDomains: domains.length,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const db = drizzle(context.cloudflare.env.DB);
  const env = context.cloudflare.env as CloudflareEnv;
  
  // Check if user is admin
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0] || user[0].role !== 'admin') {
    throw new Response('Unauthorized', { status: 403 });
  }
  
  const formData = await request.formData();
  const storeId = Number(formData.get('storeId'));
  const actionType = formData.get('action') as string;
  
  if (!storeId || !actionType) {
    return json({ error: 'Invalid request' }, { status: 400 });
  }
  
  // Get the store
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) {
    return json({ error: 'Store not found' }, { status: 404 });
  }
  
  // Refresh status from Cloudflare
  if (actionType === 'refresh' && store[0].cloudflareHostnameId) {
    try {
      const result = await getHostnameStatus(store[0].cloudflareHostnameId, env);
      await db.update(stores).set({
        sslStatus: result.sslStatus,
        dnsVerified: result.status === 'active',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      return json({ success: true, message: 'Status refreshed' });
    } catch (error) {
      return json({ error: 'Failed to refresh status' }, { status: 500 });
    }
  }
  
  // Delete domain
  if (actionType === 'delete') {
    try {
      if (store[0].cloudflareHostnameId && isCloudflareConfigured(env)) {
        await deleteCustomHostname(store[0].cloudflareHostnameId, env);
      }
      await db.update(stores).set({
        customDomain: null,
        cloudflareHostnameId: null,
        sslStatus: 'pending',
        dnsVerified: false,
        customDomainStatus: 'none',
        customDomainRequest: null,
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      return json({ success: true, message: 'Domain removed' });
    } catch (error) {
      return json({ error: 'Failed to delete domain' }, { status: 500 });
    }
  }
  
  // Approve pending request (legacy)
  if (actionType === 'approve') {
    await db.update(stores).set({
      customDomain: store[0].customDomainRequest,
      customDomainStatus: 'approved',
      customDomainRequest: null,
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    return json({ success: true, message: 'Domain approved!' });
  }
  
  // Reject pending request
  if (actionType === 'reject') {
    await db.update(stores).set({
      customDomainStatus: 'rejected',
      customDomainRequest: null,
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    return json({ success: true, message: 'Request rejected' });
  }
  
  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function AdminDomainManagement() {
  const { activeDomains, pendingDomains, pendingRequests, cloudflareConfigured, totalDomains } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isSubmitting = navigation.state === 'submitting';
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2000);
  };
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('domainManagement')}</h1>
        <p className="text-gray-600 mt-1">{t('domainManagementDesc')}</p>
      </div>
      
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{totalDomains}</div>
          <div className="text-sm text-gray-500">{t('totalDomains')}</div>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <div className="text-2xl font-bold text-emerald-600">{activeDomains.length}</div>
          <div className="text-sm text-emerald-700">{t('activeSslReady')}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{pendingDomains.length}</div>
          <div className="text-sm text-yellow-700">{t('pendingDnsSsl')}</div>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
          <div className="text-sm text-blue-700">{t('pendingRequests')}</div>
        </div>
      </div>
      
      {/* Cloudflare Status */}
      <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
        cloudflareConfigured 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <Zap className={`w-5 h-5 ${cloudflareConfigured ? 'text-emerald-600' : 'text-yellow-600'}`} />
        <div>
          <p className={`font-medium ${cloudflareConfigured ? 'text-emerald-800' : 'text-yellow-800'}`}>
            {cloudflareConfigured 
              ? t('cloudflareConnected') 
              : t('cloudflareNotConfigured')}
          </p>
          {!cloudflareConfigured && (
            <p className="text-sm text-yellow-700 mt-1">
              {t('setCloudflareEnv')}
            </p>
          )}
        </div>
        <button
          onClick={() => revalidator.revalidate()}
          className="ml-auto px-3 py-1.5 bg-white rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      {/* Active Domains */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-500" />
          {t('activeDomains')} ({activeDomains.length})
        </h2>
        
        {activeDomains.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-500">
            {t('noActiveDomains')}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('store')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('domain')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('plan')}</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeDomains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{domain.name}</div>
                      <div className="text-sm text-gray-500">{domain.subdomain}.digitalcare.site</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-600">{domain.customDomain}</span>
                        <button onClick={() => copyToClipboard(domain.customDomain || '')} className="text-gray-400 hover:text-gray-600">
                          {copiedDomain === domain.customDomain ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <Check className="w-3 h-3" /> {t('active')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 capitalize">{domain.planType || 'free'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`https://${domain.customDomain}`} target="_blank" rel="noopener" className="p-2 text-gray-400 hover:text-gray-600">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <Form method="post">
                          <input type="hidden" name="storeId" value={domain.id} />
                          <input type="hidden" name="action" value="delete" />
                          <button type="submit" disabled={isSubmitting} className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50">
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
        )}
      </section>
      
      {/* Pending DNS/SSL */}
      {pendingDomains.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            {t('pendingDnsSsl')} ({pendingDomains.length})
          </h2>
          
          <div className="space-y-4">
            {pendingDomains.map((domain) => (
              <div key={domain.id} className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{domain.name}</div>
                    <div className="font-mono text-yellow-700 mt-1">{domain.customDomain}</div>
                    <div className="flex gap-2 mt-2">
                      <StatusBadge status={domain.sslStatus as 'pending' | 'active' | 'failed'} label="SSL" />
                      <StatusBadge status={domain.dnsVerified ? 'active' : 'pending'} label="DNS" />
                    </div>
                    {domain.ownerEmail && (
                      <p className="text-sm text-gray-500 mt-1">{domain.ownerEmail}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Form method="post">
                      <input type="hidden" name="storeId" value={domain.id} />
                      <input type="hidden" name="action" value="refresh" />
                      <button type="submit" disabled={isSubmitting} className="p-2 bg-white rounded-lg text-blue-600 hover:bg-blue-50 disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                      </button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="storeId" value={domain.id} />
                      <input type="hidden" name="action" value="delete" />
                      <button type="submit" disabled={isSubmitting} className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Pending Requests (Legacy) */}
      {pendingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            {t('pendingRequests')} ({pendingRequests.length})
          </h2>
          
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">{req.name}</div>
                    <div className="text-sm text-gray-500">{req.subdomain}.digitalcare.site</div>
                    <div className="font-mono text-blue-600 mt-1">{req.customDomainRequest}</div>
                    {req.ownerEmail && (
                      <p className="text-sm text-gray-500 mt-1">{req.ownerEmail}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Form method="post">
                      <input type="hidden" name="storeId" value={req.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                        <Check className="w-4 h-4" />
                      </button>
                    </Form>
                    <Form method="post">
                      <input type="hidden" name="storeId" value={req.id} />
                      <input type="hidden" name="action" value="reject" />
                      <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50">
                        <X className="w-4 h-4" />
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status, label }: { status: 'pending' | 'active' | 'failed'; label: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      {status === 'active' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {label}: {status}
    </span>
  );
}
