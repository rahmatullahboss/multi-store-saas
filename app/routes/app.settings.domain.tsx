/**
 * Domain Settings Page - Auto Cloudflare Provisioning
 * 
 * Route: /app/settings/domain
 * 
 * Features:
 * - View current subdomain
 * - Paid users can directly add custom domain (auto-provisioned via Cloudflare API)
 * - Real-time SSL/DNS status display
 * - DNS configuration instructions
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation, useRevalidator } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { canUseCustomDomain, type PlanType } from '~/utils/plans.server';
import { 
  createCustomHostname, 
  getHostnameStatus, 
  deleteCustomHostname,
  refreshHostnameValidation,
  isCloudflareConfigured,
  type CloudflareEnv 
} from '~/services/cloudflare.server';
import { Globe, Check, Clock, X, AlertTriangle, ExternalLink, Crown, Lock, RefreshCw, Trash2, Loader2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Domain Settings' }];
};

interface ActionData {
  success?: boolean;
  error?: string;
  message?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) {
    throw new Response('Store not found', { status: 404 });
  }
  
  const env = context.cloudflare.env as CloudflareEnv;
  const cloudflareConfigured = isCloudflareConfigured(env);
  
  // If store has a Cloudflare hostname, get fresh status
  let liveStatus = null;
  if (store[0].cloudflareHostnameId && cloudflareConfigured) {
    try {
      liveStatus = await getHostnameStatus(store[0].cloudflareHostnameId, env);
      
      // Update database if status changed
      if (liveStatus.sslStatus !== store[0].sslStatus || 
          (liveStatus.status === 'active' && !store[0].dnsVerified)) {
        await db.update(stores).set({
          sslStatus: liveStatus.sslStatus,
          dnsVerified: liveStatus.status === 'active',
          updatedAt: new Date(),
        }).where(eq(stores.id, storeId));
      }
    } catch (error) {
      console.error('[Domain] Failed to get Cloudflare status:', error);
    }
  }
  
  return json({
    subdomain: store[0].subdomain,
    customDomain: store[0].customDomain,
    customDomainRequest: store[0].customDomainRequest,
    customDomainStatus: store[0].customDomainStatus,
    cloudflareHostnameId: store[0].cloudflareHostnameId,
    sslStatus: liveStatus?.sslStatus || store[0].sslStatus || 'pending',
    dnsVerified: liveStatus?.status === 'active' || store[0].dnsVerified || false,
    planType: store[0].planType as PlanType,
    canUseDomain: canUseCustomDomain((store[0].planType as PlanType) || 'free'),
    cloudflareConfigured,
    dnsTarget: 'multi-store-saas.pages.dev',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json<ActionData>({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const db = drizzle(context.cloudflare.env.DB);
  const env = context.cloudflare.env as CloudflareEnv;
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  
  // Get current store data
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) {
    return json<ActionData>({ error: 'Store not found' }, { status: 404 });
  }
  
  const planType = (store[0].planType as PlanType) || 'free';
  
  // ========================================================================
  // ACTION: Add Domain (Direct Cloudflare Provisioning)
  // ========================================================================
  if (actionType === 'add') {
    const domain = (formData.get('domain') as string)?.toLowerCase().trim();
    
    // Security check - paid plan required
    if (!canUseCustomDomain(planType)) {
      console.warn(`[SECURITY] Free user (store ${storeId}) attempted to add custom domain: ${domain}`);
      return json<ActionData>({ 
        error: 'Custom domains require a paid plan. Please upgrade to Starter or Premium.' 
      }, { status: 403 });
    }
    
    // Check if already has a domain
    if (store[0].customDomain) {
      return json<ActionData>({ 
        error: 'You already have a custom domain configured. Remove it first to add a new one.' 
      }, { status: 400 });
    }
    
    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domain || !domainRegex.test(domain)) {
      return json<ActionData>({ error: 'Invalid domain format. Example: shop.example.com' }, { status: 400 });
    }
    
    // Check if domain is already taken
    const existingStore = await db.select().from(stores)
      .where(eq(stores.customDomain, domain))
      .limit(1);
    
    if (existingStore[0]) {
      return json<ActionData>({ error: 'This domain is already in use by another store.' }, { status: 400 });
    }
    
    // Check Cloudflare configuration
    if (!isCloudflareConfigured(env)) {
      // Fallback to manual approval system
      await db.update(stores).set({
        customDomainRequest: domain,
        customDomainStatus: 'pending',
        customDomainRequestedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      return json<ActionData>({ 
        success: true, 
        message: 'Domain request submitted. Our team will set it up within 24 hours.' 
      });
    }
    
    // Create custom hostname in Cloudflare
    try {
      const result = await createCustomHostname(domain, env);
      
      // Save to database
      await db.update(stores).set({
        customDomain: domain,
        cloudflareHostnameId: result.hostnameId,
        sslStatus: result.sslStatus,
        dnsVerified: false,
        customDomainStatus: 'approved',
        customDomainRequest: null,
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      console.log(`[Domain] Store ${storeId} added domain: ${domain} (CF ID: ${result.hostnameId})`);
      
      return json<ActionData>({ 
        success: true, 
        message: 'Domain added! Now configure your DNS to complete the setup.' 
      });
    } catch (error) {
      console.error('[Domain] Cloudflare API error:', error);
      return json<ActionData>({ 
        error: `Failed to add domain: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, { status: 500 });
    }
  }
  
  // ========================================================================
  // ACTION: Refresh Status
  // ========================================================================
  if (actionType === 'refresh') {
    if (!store[0].cloudflareHostnameId) {
      return json<ActionData>({ error: 'No Cloudflare hostname to refresh' }, { status: 400 });
    }
    
    try {
      const result = await refreshHostnameValidation(store[0].cloudflareHostnameId, env);
      
      await db.update(stores).set({
        sslStatus: result.sslStatus,
        dnsVerified: result.status === 'active',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      return json<ActionData>({ success: true, message: 'Status refreshed!' });
    } catch (error) {
      console.error('[Domain] Refresh failed:', error);
      return json<ActionData>({ error: 'Failed to refresh status' }, { status: 500 });
    }
  }
  
  // ========================================================================
  // ACTION: Remove Domain
  // ========================================================================
  if (actionType === 'remove') {
    try {
      // Delete from Cloudflare if we have a hostname ID
      if (store[0].cloudflareHostnameId && isCloudflareConfigured(env)) {
        await deleteCustomHostname(store[0].cloudflareHostnameId, env);
      }
      
      // Clear from database
      await db.update(stores).set({
        customDomain: null,
        cloudflareHostnameId: null,
        sslStatus: 'pending',
        dnsVerified: false,
        customDomainStatus: 'none',
        customDomainRequest: null,
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      console.log(`[Domain] Store ${storeId} removed custom domain`);
      
      return json<ActionData>({ success: true, message: 'Domain removed successfully.' });
    } catch (error) {
      console.error('[Domain] Remove failed:', error);
      return json<ActionData>({ error: 'Failed to remove domain' }, { status: 500 });
    }
  }
  
  // ========================================================================
  // ACTION: Cancel Request (legacy)
  // ========================================================================
  if (actionType === 'cancel') {
    await db.update(stores).set({
      customDomainRequest: null,
      customDomainStatus: 'none',
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    
    return json<ActionData>({ success: true });
  }
  
  return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
}

export default function DomainSettings() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  
  const { 
    subdomain, 
    customDomain, 
    customDomainRequest,
    customDomainStatus,
    sslStatus, 
    dnsVerified, 
    planType, 
    canUseDomain,
    cloudflareConfigured,
    dnsTarget 
  } = data;
  
  const isPaid = canUseDomain;
  
  // Auto-refresh status every 30 seconds if domain is pending
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  useEffect(() => {
    if (customDomain && sslStatus === 'pending' && !dnsVerified) {
      setAutoRefresh(true);
      const interval = setInterval(() => {
        revalidator.revalidate();
      }, 30000);
      return () => clearInterval(interval);
    }
    setAutoRefresh(false);
  }, [customDomain, sslStatus, dnsVerified]);
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('domainSettings')}</h1>
        <p className="text-gray-600 mt-1">{lang === 'bn' ? 'আপনার স্টোরের ডোমেইন ও URL পরিচালনা করুন' : "Manage your store's domain and URL"}</p>
      </div>
      
      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{actionData.message || 'Success!'}</p>
        </div>
      )}
      
      {actionData?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}
      
      {/* Current Domains */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Your Store URLs</h2>
        
        {/* Subdomain (Always Active) */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-mono font-medium text-gray-900">
                {subdomain}.digitalcare.site
              </div>
              <p className="text-sm text-gray-500">Free subdomain (always active)</p>
            </div>
          </div>
          <a
            href={`https://${subdomain}.digitalcare.site`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
          >
            Visit <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        {/* Custom Domain (If Set) */}
        {customDomain && (
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            sslStatus === 'active' && dnsVerified 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {sslStatus === 'active' && dnsVerified ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
              )}
              <div>
                <div className="font-mono font-medium text-gray-900">
                  {customDomain}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={sslStatus} label="SSL" />
                  <StatusBadge status={dnsVerified ? 'active' : 'pending'} label="DNS" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {autoRefresh && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Auto-checking...
                </div>
              )}
              {sslStatus === 'active' && dnsVerified && (
                <a
                  href={`https://${customDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                >
                  Visit <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Pending DNS Setup Instructions */}
      {customDomain && !(sslStatus === 'active' && dnsVerified) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Complete DNS Setup
          </h3>
          <p className="text-blue-800 mb-4">
            Add this CNAME record to your domain's DNS settings:
          </p>
          <div className="bg-white rounded-lg p-4 font-mono text-sm mb-4">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Name/Host</th>
                  <th className="pb-2">Value/Target</th>
                </tr>
              </thead>
              <tbody className="font-semibold">
                <tr>
                  <td className="py-1">CNAME</td>
                  <td className="py-1 text-blue-600">@ (or www)</td>
                  <td className="py-1 text-emerald-600">{dnsTarget}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            After adding the DNS record, SSL certificate will be automatically issued (usually 5-15 minutes).
          </p>
          <div className="flex gap-3">
            <Form method="post">
              <input type="hidden" name="actionType" value="refresh" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            </Form>
            <Form method="post">
              <input type="hidden" name="actionType" value="remove" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Remove Domain
              </button>
            </Form>
          </div>
        </div>
      )}
      
      {/* Active Domain - Management */}
      {customDomain && sslStatus === 'active' && dnsVerified && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">Domain Connected!</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Your custom domain is active and serving your store with HTTPS.
          </p>
          <Form method="post">
            <input type="hidden" name="actionType" value="remove" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Disconnect Domain
            </button>
          </Form>
        </div>
      )}
      
      {/* Pending Request (Legacy Manual System) */}
      {customDomainStatus === 'pending' && customDomainRequest && !customDomain && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Domain Request Pending</h3>
              <p className="text-yellow-800 mt-1">
                Your request for <span className="font-mono font-semibold">{customDomainRequest}</span> is being reviewed.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                We'll notify you once it's approved. This usually takes 24 hours.
              </p>
              <Form method="post" className="mt-4">
                <input type="hidden" name="actionType" value="cancel" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline disabled:opacity-50"
                >
                  Cancel request
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Custom Domain Form */}
      {!customDomain && customDomainStatus !== 'pending' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Add Custom Domain</h2>
          <p className="text-gray-600 text-sm mb-6">
            Connect your own domain to your store. {cloudflareConfigured ? 'SSL certificate will be issued automatically.' : 'Our team will set it up within 24 hours.'}
          </p>
          
          {!isPaid && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <p className="text-amber-900 font-bold text-lg">Premium Feature</p>
                  </div>
                  <p className="text-amber-800 mt-2 leading-relaxed">
                    <strong>Upgrade to Starter</strong> to connect your own domain (e.g., <span className="font-mono bg-white/50 px-1 rounded">myshop.com</span>).
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Free plans use subdomains only. Custom domains require a paid subscription.
                  </p>
                  <a 
                    href="/app/upgrade" 
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-md hover:shadow-lg"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Starter Plan
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="add" />
            
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                Your Domain
              </label>
              <input
                type="text"
                id="domain"
                name="domain"
                placeholder="shop.yourdomain.com"
                disabled={!isPaid}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the domain you want to use for your store. You must own this domain.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !isPaid}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding Domain...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Add Domain
                </>
              )}
            </button>
          </Form>
          
          {/* DNS Instructions Preview */}
          {isPaid && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">After adding, you'll need to add this DNS record:</h3>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500">Type</span>
                  <span className="text-gray-500">Name</span>
                  <span className="text-gray-500">Value</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 font-semibold">
                  <span>CNAME</span>
                  <span>@</span>
                  <span className="text-emerald-600">{dnsTarget}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status, label }: { status: 'pending' | 'active' | 'failed'; label: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  
  const icons = {
    pending: Clock,
    active: Check,
    failed: X,
  };
  
  const Icon = icons[status];
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      <Icon className="w-3 h-3" />
      {label}: {status}
    </span>
  );
}
