/**
 * Super Admin - Domain Health Monitor
 * 
 * Route: /admin/domains
 * 
 * Features:
 * - View all custom domains connected to the platform
 * - Real-time status checking via Cloudflare API
 * - Force remove domains for policy violations
 * - DNS configuration guide for pending domains
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation, useRevalidator } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, isNotNull, or, desc } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { requireSuperAdmin } from '~/services/auth.server';
import { 
  getHostnameStatus, 
  deleteCustomHostname,
  refreshHostnameValidation,
  isCloudflareConfigured,
  type CloudflareEnv 
} from '~/services/cloudflare.server';
import { 
  Globe, 
  Check, 
  X, 
  Clock, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Zap,
  Shield,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Domain Health Monitor - Super Admin' }];
};

// ============================================================================
// TYPES
// ============================================================================
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
  createdAt: Date | null;
}

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  
  // Require super admin access
  await requireSuperAdmin(request, db);
  
  const drizzleDb = drizzle(db);
  const env = context.cloudflare.env as CloudflareEnv;
  const cloudflareConfigured = isCloudflareConfigured(env);
  
  // Get all stores with custom domains or pending requests
  const domainsData = await drizzleDb
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
      createdAt: stores.createdAt,
    })
    .from(stores)
    .where(or(isNotNull(stores.customDomain), isNotNull(stores.customDomainRequest)))
    .orderBy(desc(stores.createdAt));
  
  // Get store owner emails
  const domains: DomainEntry[] = [];
  for (const store of domainsData) {
    const owner = await drizzleDb
      .select({ email: users.email })
      .from(users)
      .where(eq(users.storeId, store.id))
      .limit(1);
    domains.push({
      ...store,
      ownerEmail: owner[0]?.email || null,
    });
  }
  
  // Separate by status
  const activeDomains = domains.filter(d => d.customDomain && d.sslStatus === 'active');
  const pendingDomains = domains.filter(d => d.customDomain && d.sslStatus !== 'active');
  const failedDomains = domains.filter(d => d.customDomain && d.sslStatus === 'failed');
  
  // DNS target for CNAME records
  const dnsTarget = 'multi-store-saas.pages.dev';
  
  return json({ 
    domains,
    activeDomains, 
    pendingDomains,
    failedDomains,
    cloudflareConfigured,
    dnsTarget,
    stats: {
      total: domains.length,
      active: activeDomains.length,
      pending: pendingDomains.length,
      failed: failedDomains.length,
    }
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  
  // Require super admin access
  await requireSuperAdmin(request, db);
  
  const drizzleDb = drizzle(db);
  const env = context.cloudflare.env as CloudflareEnv;
  
  const formData = await request.formData();
  const storeId = Number(formData.get('storeId'));
  const actionType = formData.get('action') as string;
  
  if (!storeId || !actionType) {
    return json({ error: 'Invalid request', success: false }, { status: 400 });
  }
  
  // Get the store
  const store = await drizzleDb
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  if (!store[0]) {
    return json({ error: 'Store not found', success: false }, { status: 404 });
  }
  
  // Refresh status from Cloudflare
  if (actionType === 'refresh' && store[0].cloudflareHostnameId) {
    try {
      const result = await getHostnameStatus(store[0].cloudflareHostnameId, env);
      await drizzleDb.update(stores).set({
        sslStatus: result.sslStatus,
        dnsVerified: result.status === 'active',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      return json({ 
        success: true, 
        message: `Status refreshed: SSL ${result.sslStatus}, DNS ${result.status === 'active' ? 'verified' : 'pending'}`,
        storeId,
      });
    } catch (error) {
      console.error('[Admin Domains] Refresh error:', error);
      return json({ 
        error: 'Failed to refresh status from Cloudflare', 
        success: false 
      }, { status: 500 });
    }
  }
  
  // Force refresh/retry validation
  if (actionType === 'retry' && store[0].cloudflareHostnameId) {
    try {
      const result = await refreshHostnameValidation(store[0].cloudflareHostnameId, env);
      await drizzleDb.update(stores).set({
        sslStatus: result.sslStatus,
        dnsVerified: result.status === 'active',
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      return json({ 
        success: true, 
        message: 'Validation retry triggered. Check status again in a few minutes.',
        storeId,
      });
    } catch (error) {
      console.error('[Admin Domains] Retry validation error:', error);
      return json({ 
        error: 'Failed to trigger validation retry', 
        success: false 
      }, { status: 500 });
    }
  }
  
  // Force remove domain
  if (actionType === 'delete') {
    try {
      // Delete from Cloudflare if configured
      if (store[0].cloudflareHostnameId && isCloudflareConfigured(env)) {
        await deleteCustomHostname(store[0].cloudflareHostnameId, env);
      }
      
      // Clear domain from database
      await drizzleDb.update(stores).set({
        customDomain: null,
        cloudflareHostnameId: null,
        sslStatus: 'pending',
        dnsVerified: false,
        customDomainStatus: 'none',
        customDomainRequest: null,
        updatedAt: new Date(),
      }).where(eq(stores.id, storeId));
      
      return json({ 
        success: true, 
        message: `Domain ${store[0].customDomain} removed successfully`,
        storeId,
      });
    } catch (error) {
      console.error('[Admin Domains] Delete error:', error);
      return json({ 
        error: 'Failed to remove domain', 
        success: false 
      }, { status: 500 });
    }
  }
  
  return json({ error: 'Invalid action', success: false }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminDomainHealthMonitor() {
  const { domains, stats, cloudflareConfigured, dnsTarget } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isSubmitting = navigation.state === 'submitting';
  
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'failed'>('all');
  const [expandedDomain, setExpandedDomain] = useState<number | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };
  
  // Filter domains
  const filteredDomains = domains.filter(d => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      d.name.toLowerCase().includes(searchLower) ||
      d.customDomain?.toLowerCase().includes(searchLower) ||
      d.ownerEmail?.toLowerCase().includes(searchLower);
    
    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = d.sslStatus === 'active' && d.dnsVerified === true;
    } else if (statusFilter === 'pending') {
      matchesStatus = d.sslStatus === 'pending' || d.dnsVerified === false;
    } else if (statusFilter === 'failed') {
      matchesStatus = d.sslStatus === 'failed';
    }
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="w-7 h-7 text-blue-400" />
            Domain Health Monitor
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor and debug custom domain configurations across all stores
          </p>
        </div>
        <button
          onClick={() => revalidator.revalidate()}
          disabled={revalidator.state === 'loading'}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${revalidator.state === 'loading' ? 'animate-spin' : ''}`} />
          Refresh All
        </button>
      </div>
      
      {/* Action feedback */}
      {actionData && (
        <div className={`p-4 rounded-lg border ${
          actionData.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {actionData.success 
            ? ('message' in actionData ? actionData.message : 'Success') 
            : ('error' in actionData ? actionData.error : 'An error occurred')}
        </div>
      )}
      
      {/* Cloudflare Status */}
      <div className={`p-4 rounded-xl flex items-center gap-3 ${
        cloudflareConfigured 
          ? 'bg-emerald-500/10 border border-emerald-500/30' 
          : 'bg-yellow-500/10 border border-yellow-500/30'
      }`}>
        <Zap className={`w-5 h-5 ${cloudflareConfigured ? 'text-emerald-400' : 'text-yellow-400'}`} />
        <div className="flex-1">
          <p className={`font-medium ${cloudflareConfigured ? 'text-emerald-300' : 'text-yellow-300'}`}>
            {cloudflareConfigured 
              ? 'Cloudflare API Connected' 
              : 'Cloudflare API Not Configured'}
          </p>
          {!cloudflareConfigured && (
            <p className="text-sm text-yellow-400/80 mt-0.5">
              Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID environment variables
            </p>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-slate-400">Total Domains</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
              <p className="text-sm text-slate-400">Active (SSL Ready)</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              <p className="text-sm text-slate-400">Pending DNS/SSL</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
              <p className="text-sm text-slate-400">Failed</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by store name, domain, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="appearance-none w-full sm:w-48 px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
      
      {/* Domains Table */}
      {filteredDomains.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-12 text-center">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            {searchQuery || statusFilter !== 'all' 
              ? 'No domains match your filters' 
              : 'No custom domains configured yet'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Store</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Domain URL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">SSL Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">DNS Verified</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredDomains.map((domain) => (
                  <>
                    <tr key={domain.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-white">{domain.name}</p>
                          <p className="text-sm text-slate-400">{domain.ownerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-blue-400 font-mono text-sm">
                            {domain.customDomain}
                          </code>
                          <button
                            onClick={() => copyToClipboard(domain.customDomain || '')}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Copy domain"
                          >
                            {copiedText === domain.customDomain 
                              ? <Check className="w-4 h-4 text-emerald-400" /> 
                              : <Copy className="w-4 h-4" />}
                          </button>
                          <a
                            href={`https://${domain.customDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                            title="Open domain"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SSLStatusBadge status={domain.sslStatus as 'pending' | 'active' | 'failed' | null} />
                      </td>
                      <td className="px-4 py-4">
                        <DNSStatusBadge verified={domain.dnsVerified} />
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-700 text-slate-300 capitalize">
                          {domain.planType || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Show DNS Guide button for pending domains */}
                          {(domain.sslStatus !== 'active' || !domain.dnsVerified) && (
                            <button
                              onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                              title="DNS Configuration Guide"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Refresh Status */}
                          <Form method="post">
                            <input type="hidden" name="storeId" value={domain.id} />
                            <input type="hidden" name="action" value="refresh" />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                              title="Refresh Status"
                            >
                              <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                            </button>
                          </Form>
                          
                          {/* Remove Domain */}
                          <Form method="post" onSubmit={(e) => {
                            if (!confirm(`Are you sure you want to remove ${domain.customDomain}? This action cannot be undone.`)) {
                              e.preventDefault();
                            }
                          }}>
                            <input type="hidden" name="storeId" value={domain.id} />
                            <input type="hidden" name="action" value="delete" />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                              title="Remove Domain"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Form>
                        </div>
                      </td>
                    </tr>
                    
                    {/* DNS Configuration Guide (expandable) */}
                    {expandedDomain === domain.id && (
                      <tr key={`${domain.id}-dns`}>
                        <td colSpan={6} className="px-4 py-4 bg-slate-900/50">
                          <DNSConfigGuide 
                            domain={domain.customDomain || ''} 
                            dnsTarget={dnsTarget}
                            onCopy={copyToClipboard}
                            copiedText={copiedText}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SSLStatusBadge({ status }: { status: 'pending' | 'active' | 'failed' | null }) {
  const config = {
    active: {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      icon: CheckCircle2,
      label: 'Active',
    },
    pending: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      icon: Clock,
      label: 'Pending',
    },
    failed: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      icon: XCircle,
      label: 'Failed',
    },
  };
  
  const { bg, text, icon: Icon, label } = config[status || 'pending'];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function DNSStatusBadge({ verified }: { verified: boolean | null }) {
  const isVerified = verified === true;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      isVerified 
        ? 'bg-emerald-500/20 text-emerald-400' 
        : 'bg-yellow-500/20 text-yellow-400'
    }`}>
      {isVerified ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified
        </>
      ) : (
        <>
          <AlertCircle className="w-3.5 h-3.5" />
          Pending
        </>
      )}
    </span>
  );
}

function DNSConfigGuide({ 
  domain, 
  dnsTarget, 
  onCopy, 
  copiedText 
}: { 
  domain: string; 
  dnsTarget: string;
  onCopy: (text: string) => void;
  copiedText: string | null;
}) {
  // Determine if this is a subdomain or root domain
  const parts = domain.split('.');
  const isSubdomain = parts.length > 2;
  const subdomain = isSubdomain ? parts.slice(0, -2).join('.') : '@';
  
  return (
    <div className="rounded-lg bg-slate-800 border border-slate-700 p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h4 className="font-medium text-white">DNS Configuration Required</h4>
          <p className="text-sm text-slate-400 mt-0.5">
            The merchant needs to add the following DNS records to their domain registrar:
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* CNAME Record */}
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-400 uppercase">CNAME Record</span>
            <span className="text-xs text-slate-500">(Recommended)</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-xs mb-1">Type</p>
              <code className="text-white bg-slate-800 px-2 py-1 rounded">CNAME</code>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Name/Host</p>
              <div className="flex items-center gap-2">
                <code className="text-white bg-slate-800 px-2 py-1 rounded">{subdomain}</code>
                <button
                  onClick={() => onCopy(subdomain)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedText === subdomain ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Value/Target</p>
              <div className="flex items-center gap-2">
                <code className="text-emerald-400 bg-slate-800 px-2 py-1 rounded">{dnsTarget}</code>
                <button
                  onClick={() => onCopy(dnsTarget)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedText === dnsTarget ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyable message for support chat */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-400">📋 Quick Copy for Support Chat</span>
            <button
              onClick={() => onCopy(`Please add this DNS record to your domain:\n\nType: CNAME\nName: ${subdomain}\nValue: ${dnsTarget}\n\nAfter adding the record, wait 5-10 minutes for propagation, then click "Refresh Status" in your settings.`)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              {copiedText?.includes('Please add this DNS record') 
                ? <><Check className="w-3 h-3" /> Copied!</>
                : <><Copy className="w-3 h-3" /> Copy Message</>}
            </button>
          </div>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded">
{`Please add this DNS record to your domain:

Type: CNAME
Name: ${subdomain}
Value: ${dnsTarget}

After adding the record, wait 5-10 minutes for propagation, then click "Refresh Status" in your settings.`}
          </pre>
        </div>
      </div>
    </div>
  );
}
