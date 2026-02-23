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
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import { canUseCustomDomain, type PlanType } from '~/utils/plans.server';
import {
  createCustomHostname,
  getHostnameStatus,
  deleteCustomHostname,
  refreshHostnameValidation,
  isCloudflareConfigured,
  type CloudflareEnv,
} from '~/services/cloudflare.server';
import {
  ArrowLeft,
  Globe,
  Check,
  Clock,
  X,
  AlertTriangle,
  ExternalLink,
  Crown,
  Lock,
  RefreshCw,
  Trash2,
  Loader2,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { GlassCard } from '~/components/ui/GlassCard';
import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
import { invalidateUnifiedSettingsCache } from '~/services/unified-storefront-settings.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Domain Settings' }];
};

interface ActionData {
  success?: boolean;
  error?: string;
  message?: string;
}

const DomainActionSchema = z.enum(['update-subdomain', 'add', 'refresh', 'remove', 'cancel']);
const SUBDOMAIN_REGEX = /^[a-z0-9-]+$/;
const SUBDOMAIN_MIN_LENGTH = 2;
const SUBDOMAIN_MAX_LENGTH = 30;
const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'admin', 'app', 'mail', 'smtp', 'ftp', 'cdn', 'static',
  'assets', 'media', 'img', 'images', 'blog', 'shop', 'store', 'help',
  'support', 'status', 'staging', 'dev', 'test', 'dashboard', 'portal',
]);

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store[0]) {
    throw new Response('storeNotFound', { status: 404 });
  }

  const env = context.cloudflare.env as CloudflareEnv;
  const cloudflareConfigured = isCloudflareConfigured(env);

  // If store has a Cloudflare hostname, get fresh status
  let liveStatus = null;
  if (store[0].cloudflareHostnameId && cloudflareConfigured) {
    try {
      liveStatus = await getHostnameStatus(store[0].cloudflareHostnameId, env);

      // Update database if status changed
      if (
        liveStatus.sslStatus !== store[0].sslStatus ||
        (liveStatus.status === 'active' && !store[0].dnsVerified)
      ) {
        await db
          .update(stores)
          .set({
            sslStatus: liveStatus.sslStatus,
            dnsVerified: liveStatus.status === 'active',
            updatedAt: new Date(),
          })
          .where(eq(stores.id, storeId));
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
    dnsTarget: 'multi-store-saas.ozzyl.workers.dev',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json<ActionData>({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = await getUserId(request, context.cloudflare.env);

  const db = drizzle(context.cloudflare.env.DB);
  const env = context.cloudflare.env as CloudflareEnv;
  const formData = await request.formData();
  const actionTypeParsed = DomainActionSchema.safeParse(formData.get('actionType'));
  if (!actionTypeParsed.success) {
    return json<ActionData>({ error: 'Invalid action' }, { status: 400 });
  }
  const actionType = actionTypeParsed.data;

  // Get current store data
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) {
    return json<ActionData>({ error: 'storeNotFound' }, { status: 404 });
  }

  const planType = (store[0].planType as PlanType) || 'free';

  // ========================================================================
  // ACTION: Update Subdomain
  // ========================================================================
  if (actionType === 'update-subdomain') {
    const requestedSubdomain = (formData.get('subdomain') as string)?.trim().toLowerCase();

    if (!requestedSubdomain) {
      return json<ActionData>({ error: 'subdomainRequired' }, { status: 400 });
    }

    if (
      requestedSubdomain.length < SUBDOMAIN_MIN_LENGTH ||
      requestedSubdomain.length > SUBDOMAIN_MAX_LENGTH
    ) {
      return json<ActionData>({ error: 'subdomainLengthInvalid' }, { status: 400 });
    }

    if (!SUBDOMAIN_REGEX.test(requestedSubdomain)) {
      return json<ActionData>({ error: 'subdomainFormatInvalid' }, { status: 400 });
    }

    if (requestedSubdomain.startsWith('-') || requestedSubdomain.endsWith('-')) {
      return json<ActionData>({ error: 'subdomainFormatInvalid' }, { status: 400 });
    }

    if (RESERVED_SUBDOMAINS.has(requestedSubdomain)) {
      return json<ActionData>({ error: 'subdomainReserved' }, { status: 400 });
    }

    const currentSubdomain = (store[0].subdomain || '').toLowerCase();
    if (requestedSubdomain === currentSubdomain) {
      return json<ActionData>({ success: true, message: 'subdomainUnchanged' });
    }

    const existingStore = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.subdomain, requestedSubdomain))
      .limit(1);

    if (existingStore[0]) {
      return json<ActionData>({ error: 'subdomainAlreadyTaken' }, { status: 409 });
    }

    try {
      await db
        .update(stores)
        .set({
          subdomain: requestedSubdomain,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return json<ActionData>({ error: 'subdomainAlreadyTaken' }, { status: 409 });
      }
      throw error;
    }

    const kvNamespace = context.cloudflare.env.STORE_CACHE;
    if (kvNamespace) {
      const kvCache = new KVCache(kvNamespace);
      await Promise.all([
        kvCache.delete(`${CACHE_KEYS.TENANT_SUBDOMAIN}${currentSubdomain}`),
        kvCache.delete(`${CACHE_KEYS.TENANT_SUBDOMAIN}${requestedSubdomain}`),
        kvCache.delete(`${CACHE_KEYS.STORE_CONFIG}${storeId}`),
      ]);
    }

    // Invalidate all caches (D1+KV+DO) in one call
    await invalidateUnifiedSettingsCache(
      {
        KV: context.cloudflare.env.STORE_CACHE,
        STORE_CONFIG_SERVICE: ('STORE_CONFIG_SERVICE' in env && env.STORE_CONFIG_SERVICE) ? env.STORE_CONFIG_SERVICE as Fetcher : undefined,
      },
      storeId,
      { subdomain: currentSubdomain }
    );

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'domain',
        intent: 'update-subdomain',
        from: currentSubdomain,
        to: requestedSubdomain,
      },
    });

    return json<ActionData>({ success: true, message: 'subdomainUpdatedSuccess' });
  }

  // ========================================================================
  // ACTION: Add Domain (Direct Cloudflare Provisioning)
  // ========================================================================
  if (actionType === 'add') {
    const domain = (formData.get('domain') as string)?.toLowerCase().trim();

    // Security check - paid plan required
    if (!canUseCustomDomain(planType)) {
      console.warn(
        `[SECURITY] Free user (store ${storeId}) attempted to add custom domain: ${domain}`
      );
      return json<ActionData>(
        {
          error: 'premiumFeature',
        },
        { status: 403 }
      );
    }

    // Check if already has a domain
    if (store[0].customDomain) {
      return json<ActionData>(
        {
          error: 'domainAlreadyConfigured',
        },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domain || !domainRegex.test(domain)) {
      return json<ActionData>({ error: 'invalidDomainFormat' }, { status: 400 });
    }

    // Check if domain is already taken
    const existingStore = await db
      .select()
      .from(stores)
      .where(eq(stores.customDomain, domain))
      .limit(1);

    if (existingStore[0]) {
      return json<ActionData>({ error: 'domainAlreadyTaken' }, { status: 400 });
    }

    // Check Cloudflare configuration
    if (!isCloudflareConfigured(env)) {
      // Fallback to manual approval system
      await db
        .update(stores)
        .set({
          customDomainRequest: domain,
          customDomainStatus: 'pending',
          customDomainRequestedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      await logActivity(db, {
        storeId,
        userId,
        action: 'settings_updated',
        entityType: 'settings',
        details: {
          section: 'domain',
          intent: 'add',
          domain,
          mode: 'manual-request',
        },
      });

      return json<ActionData>({
        success: true,
        message: 'domainRequestSubmitted',
      });
    }

    // Create custom hostname in Cloudflare
    try {
      const result = await createCustomHostname(domain, env);

      // Save to database
      await db
        .update(stores)
        .set({
          customDomain: domain,
          cloudflareHostnameId: result.hostnameId,
          sslStatus: result.sslStatus,
          dnsVerified: false,
          customDomainStatus: 'approved',
          customDomainRequest: null,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      console.info(
        `[Domain] Store ${storeId} added domain: ${domain} (CF ID: ${result.hostnameId})`
      );

      await logActivity(db, {
        storeId,
        userId,
        action: 'settings_updated',
        entityType: 'settings',
        details: {
          section: 'domain',
          intent: 'add',
          domain,
          sslStatus: result.sslStatus,
        },
      });

      return json<ActionData>({
        success: true,
        message: 'domainAddedSuccess',
      });
    } catch (error) {
      console.error('[Domain] Cloudflare API error:', error);
      return json<ActionData>(
        { error: 'Domain verification failed. Please try again.' },
        { status: 500 }
      );
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

      await db
        .update(stores)
        .set({
          sslStatus: result.sslStatus,
          dnsVerified: result.status === 'active',
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      await logActivity(db, {
        storeId,
        userId,
        action: 'settings_updated',
        entityType: 'settings',
        details: {
          section: 'domain',
          intent: 'refresh',
          sslStatus: result.sslStatus,
          dnsVerified: result.status === 'active',
        },
      });

      return json<ActionData>({ success: true, message: 'hostnameRefreshSuccess' });
    } catch (error) {
      console.error('[Domain] Refresh failed:', error);
      return json<ActionData>({ error: 'hostnameRefreshFailed' }, { status: 500 });
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
      await db
        .update(stores)
        .set({
          customDomain: null,
          cloudflareHostnameId: null,
          sslStatus: 'pending',
          dnsVerified: false,
          customDomainStatus: 'none',
          customDomainRequest: null,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      console.info(`[Domain] Store ${storeId} removed custom domain`);

      await logActivity(db, {
        storeId,
        userId,
        action: 'settings_updated',
        entityType: 'settings',
        details: {
          section: 'domain',
          intent: 'remove',
        },
      });

      return json<ActionData>({ success: true, message: 'domainRemovalSuccess' });
    } catch (error) {
      console.error('[Domain] Remove failed:', error);
      return json<ActionData>({ error: 'domainRemovalFailed' }, { status: 500 });
    }
  }

  // ========================================================================
  // ACTION: Cancel Request (legacy)
  // ========================================================================
  if (actionType === 'cancel') {
    await db
      .update(stores)
      .set({
        customDomainRequest: null,
        customDomainStatus: 'none',
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'domain',
        intent: 'cancel',
      },
    });

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
  const { t } = useTranslation();

  const {
    subdomain,
    customDomain,
    customDomainRequest,
    customDomainStatus,
    sslStatus,
    dnsVerified,
    canUseDomain,
    dnsTarget,
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
  }, [customDomain, sslStatus, dnsVerified, revalidator]);

  // Shared content rendered in both mobile and desktop layouts
  const sharedContent = (
    <>
      {/* Success/Error Messages */}
      {actionData?.success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">
            {actionData.message ? t(actionData.message) : t('success')}
          </p>
        </div>
      )}

      {actionData?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{t(actionData.error)}</p>
        </div>
      )}

      {/* Current Domains */}
      <GlassCard className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('yourStoreUrls')}</h2>

        {/* Subdomain (Always Active) */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg mb-3 border border-gray-100/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-mono font-medium text-gray-900">{subdomain}.ozzyl.com</div>
              <p className="text-sm text-gray-500">{t('freeSubdomainActive')}</p>
            </div>
          </div>
          <a
            href={`https://${subdomain}.ozzyl.com`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
          >
            {t('visit')} <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Custom Domain (If Set) */}
        {customDomain && (
          <div
            className={`flex items-center justify-between p-4 rounded-lg border ${
              sslStatus === 'active' && dnsVerified
                ? 'bg-emerald-50/50 border-emerald-200/50'
                : 'bg-yellow-50/50 border-yellow-200/50'
            } backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              {sslStatus === 'active' && dnsVerified ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />
              )}
              <div>
                <div className="font-mono font-medium text-gray-900">{customDomain}</div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={sslStatus} label={t('ssl')} />
                  <StatusBadge status={dnsVerified ? 'active' : 'pending'} label={t('dns')} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {autoRefresh && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('autoChecking')}
                </div>
              )}
              {sslStatus === 'active' && dnsVerified && (
                <a
                  href={`https://${customDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                >
                  {t('visit')} <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Subdomain Settings */}
      <GlassCard className="p-6">
        <h2 className="font-semibold text-gray-900 mb-2">{t('subdomainSettings')}</h2>
        <p className="text-gray-600 text-sm mb-4">{t('subdomainSettingsDesc')}</p>

        <Form method="post" className="space-y-4">
          <input type="hidden" name="actionType" value="update-subdomain" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('subdomainLabel')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="subdomain"
                defaultValue={subdomain}
                minLength={SUBDOMAIN_MIN_LENGTH}
                maxLength={SUBDOMAIN_MAX_LENGTH}
                pattern="[-a-z0-9]+"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
              <span className="text-sm text-gray-600 font-mono">.ozzyl.com</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{t('subdomainHint')}</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('saveSubdomain')
            )}
          </button>
        </Form>
      </GlassCard>

      {/* Pending DNS Setup Instructions */}
      {customDomain && !(sslStatus === 'active' && dnsVerified) && (
        <GlassCard className="bg-blue-50/50 border-blue-200/50 p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            {t('completeDnsSetup')}
          </h3>
          <p className="text-blue-800 mb-4">{t('addCnameRecord')}</p>
          <div className="bg-white/80 rounded-lg p-4 font-mono text-sm mb-4 backdrop-blur-sm border border-blue-100/50">
            {/* Mobile DNS view */}
            <div className="md:hidden space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase">{t('type')}</p>
                <p className="font-semibold">CNAME</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase">{t('nameHost')}</p>
                <p className="font-semibold text-blue-600 break-all">{t('cnameNameHost')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase">{t('valueTarget')}</p>
                <p className="font-semibold text-emerald-600 break-all">{dnsTarget}</p>
              </div>
            </div>
            {/* Desktop DNS table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="pb-2">{t('type')}</th>
                  <th className="pb-2">{t('nameHost')}</th>
                  <th className="pb-2">{t('valueTarget')}</th>
                </tr>
              </thead>
              <tbody className="font-semibold">
                <tr>
                  <td className="py-1">CNAME</td>
                  <td className="py-1 text-blue-600">{t('cnameNameHost')}</td>
                  <td className="py-1 text-emerald-600">{dnsTarget}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-blue-700 mb-4">{t('dnsSetupWaitMsg')}</p>
          <div className="flex gap-3">
            <Form method="post">
              <input type="hidden" name="actionType" value="refresh" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                {t('refreshStatus')}
              </button>
            </Form>
            <Form method="post">
              <input type="hidden" name="actionType" value="remove" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100/80 text-red-700 rounded-lg hover:bg-red-200/80 disabled:opacity-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                {t('removeDomainBtn')}
              </button>
            </Form>
          </div>
        </GlassCard>
      )}

      {/* Active Domain - Management */}
      {customDomain && sslStatus === 'active' && dnsVerified && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Check className="w-6 h-6 text-emerald-600" />
            <h2 className="font-semibold text-gray-900">{t('domainConnected')}</h2>
          </div>
          <p className="text-gray-600 mb-4">{t('domainConnectedDesc')}</p>
          <Form method="post">
            <input type="hidden" name="actionType" value="remove" />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100/80 text-red-700 rounded-lg hover:bg-red-200/80 disabled:opacity-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              {t('removeDomainBtn')}
            </button>
          </Form>
        </GlassCard>
      )}

      {/* Pending Request (Legacy Manual System) */}
      {customDomainStatus === 'pending' && customDomainRequest && !customDomain && (
        <GlassCard className="bg-yellow-50/50 border-yellow-200/50 p-6">
          <div className="flex items-start gap-4">
            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">{t('domainRequestPending')}</h3>
              <p className="text-yellow-800 mt-1">
                {t('domainRequestReviewing', { domain: customDomainRequest })}
              </p>
              <p className="text-sm text-yellow-700 mt-2">{t('willNotifyOnceApproved')}</p>
              <Form method="post" className="mt-4">
                <input type="hidden" name="actionType" value="cancel" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-sm text-yellow-700 hover:text-yellow-900 underline disabled:opacity-50"
                >
                  {t('cancelRequest')}
                </button>
              </Form>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Add Custom Domain Form */}
      {!customDomain && customDomainStatus !== 'pending' && (
        <GlassCard className="p-6">
          <h2 className="font-semibold text-gray-900 mb-2">{t('addCustomDomain')}</h2>
          <p className="text-gray-600 text-sm mb-6">{t('addCustomDomainDesc')}</p>

          {!isPaid && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <p className="text-amber-900 font-bold text-lg">{t('premiumFeature')}</p>
                  </div>
                  <p className="text-amber-800 mt-2 leading-relaxed">
                    <strong>{t('upgradeToStarter')}</strong>{' '}
                    {t('upgradeToConnectDomain', { exampleDomain: 'myshop.com' })}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">{t('freePlanSubdomainOnly')}</p>
                  <a
                    href="/app/upgrade"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-md hover:shadow-lg"
                  >
                    <Crown className="w-5 h-5" />
                    {t('upgradeToStarterPlan')}
                  </a>
                </div>
              </div>
            </div>
          )}

          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="add" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('yourDomain')}
              </label>
              <input
                type="text"
                name="domain"
                placeholder={t('domainPlaceholder')}
                disabled={!isPaid}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-white/50 backdrop-blur-sm"
              />
              <p className="text-sm text-gray-500 mt-2">{t('enterDomainYouOwn')}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isPaid}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('addingDomain')}
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {t('addCustomDomain')}
                </>
              )}
            </button>
          </Form>

          {/* DNS Instructions Preview */}
          {isPaid && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {t('dnsInstructionsPreview')}
              </h3>
              <div className="bg-gray-50/50 rounded-lg p-4 font-mono text-sm border border-gray-100/50 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500">{t('type')}</span>
                  <span className="text-gray-500">{t('nameHost')}</span>
                  <span className="text-gray-500">{t('valueTarget')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 font-semibold">
                  <span>CNAME</span>
                  <span>@</span>
                  <span className="text-emerald-600">{dnsTarget}</span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-[60px] px-4">
            <Link to="/app/settings" className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{t('domainSettings')}</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex flex-col gap-5 p-4 pb-10">
          {sharedContent}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('domainSettings')}</h1>
          <p className="text-gray-600 mt-1">{t('domainSettingsDesc')}</p>
        </div>

        {sharedContent}
      </div>
    </>
  );
}

// Status Badge Component
function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  const knownStatus = (s: string): 'pending' | 'active' | 'failed' => {
    if (s === 'active') return 'active';
    if (s === 'failed') return 'failed';
    return 'pending'; // default/fallback for unknown values
  };

  const normalized = knownStatus(status);

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

  const Icon = icons[normalized];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[normalized]}`}
    >
      <Icon className="w-3 h-3" />
      {label}: {status}
    </span>
  );
}
