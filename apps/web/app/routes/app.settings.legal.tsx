/**
 * Legal Settings Page
 * 
 * Route: /app/settings/legal
 * 
 * Allows merchants to customize their legal policy pages:
 * - Privacy Policy
 * - Terms of Service
 * - Refund Policy
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { policyVersions, generatePolicyVersionId } from '@db/schema_versions';
import { getSession, getStoreId } from '~/services/auth.server';
import { getPolicyContent } from '~/lib/policies';
import { useState } from 'react';
import { FileText, Eye, Save, RotateCcw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { desc } from 'drizzle-orm';

export const meta: MetaFunction = () => [
  { title: 'Legal Policies - Settings' },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const db = drizzle(context.cloudflare.env.DB);
  const [store] = await db
    .select({
      id: stores.id,
      name: stores.name,
      customPrivacyPolicy: stores.customPrivacyPolicy,
      customTermsOfService: stores.customTermsOfService,
      customRefundPolicy: stores.customRefundPolicy,
      customShippingPolicy: stores.customShippingPolicy,
      customSubscriptionPolicy: stores.customSubscriptionPolicy,
      customLegalNotice: stores.customLegalNotice,
      businessInfo: stores.businessInfo,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (!store) {
    throw redirect('/auth/login');
  }

  // Get contact email from business info
  let contactEmail = 'support@yourstore.com';
  if (store.businessInfo) {
    try {
      const info = JSON.parse(store.businessInfo);
      if (info.email) contactEmail = info.email;
    } catch {
      // Use default
    }
  }

  // Generate default policies for preview
  const defaultPolicies = {
    privacy: getPolicyContent('privacy', store.name, contactEmail).content,
    terms: getPolicyContent('terms', store.name, contactEmail).content,
    refund: getPolicyContent('refund', store.name, contactEmail).content,
    shipping: getPolicyContent('shipping', store.name, contactEmail).content,
    subscription: getPolicyContent('subscription', store.name, contactEmail).content,
    legal: getPolicyContent('legal', store.name, contactEmail).content,
  };

  const policyHistory = await db
    .select({
      id: policyVersions.id,
      version: policyVersions.version,
      label: policyVersions.label,
      changedBy: policyVersions.changedBy,
      createdAt: policyVersions.createdAt,
    })
    .from(policyVersions)
    .where(eq(policyVersions.storeId, storeId))
    .orderBy(desc(policyVersions.version))
    .limit(10);

  return json({
    store,
    defaultPolicies,
    contactEmail,
    policyHistory,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  
  const db = drizzle(context.cloudflare.env.DB);
  const session = await getSession(request, context.cloudflare.env);
  const userId = session.get('userId');
  let changedBy: string | null = null;
  if (userId) {
    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    changedBy = user[0]?.email || null;
  }
  if (!changedBy) changedBy = 'system';

  const getNextPolicyVersion = async () => {
    const latest = await db
      .select({ version: policyVersions.version })
      .from(policyVersions)
      .where(eq(policyVersions.storeId, storeId))
      .orderBy(desc(policyVersions.version))
      .limit(1);
    return (latest[0]?.version || 0) + 1;
  };

  const buildPolicySnapshot = (data: {
    privacy?: string | null;
    terms?: string | null;
    refund?: string | null;
    shipping?: string | null;
    subscription?: string | null;
    legal?: string | null;
  }) => ({
    privacy: data.privacy ?? null,
    terms: data.terms ?? null,
    refund: data.refund ?? null,
    shipping: data.shipping ?? null,
    subscription: data.subscription ?? null,
    legal: data.legal ?? null,
  });

  if (intent === 'save') {
    const privacyPolicy = formData.get('privacyPolicy') as string || null;
    const termsOfService = formData.get('termsOfService') as string || null;
    const refundPolicy = formData.get('refundPolicy') as string || null;
    const shippingPolicy = formData.get('shippingPolicy') as string || null;
    const subscriptionPolicy = formData.get('subscriptionPolicy') as string || null;
    const legalNotice = formData.get('legalNotice') as string || null;

    const snapshot = buildPolicySnapshot({
      privacy: privacyPolicy?.trim() || null,
      terms: termsOfService?.trim() || null,
      refund: refundPolicy?.trim() || null,
      shipping: shippingPolicy?.trim() || null,
      subscription: subscriptionPolicy?.trim() || null,
      legal: legalNotice?.trim() || null,
    });

    const nextVersion = await getNextPolicyVersion();

    await db.batch([
      db
        .update(stores)
        .set({
          customPrivacyPolicy: snapshot.privacy,
          customTermsOfService: snapshot.terms,
          customRefundPolicy: snapshot.refund,
          customShippingPolicy: snapshot.shipping,
          customSubscriptionPolicy: snapshot.subscription,
          customLegalNotice: snapshot.legal,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId)),
      db.insert(policyVersions).values({
        id: generatePolicyVersionId(storeId, nextVersion),
        storeId,
        version: nextVersion,
        label: 'Manual update',
        policiesJson: JSON.stringify(snapshot),
        changedBy,
      }),
    ]);

    // ========================================================================
    // AI AUTO-SYNC: Update Vector Database
    // ========================================================================
    try {
      const { createAIService } = await import('~/services/ai.server');
      const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
          context: context.cloudflare.env 
      });

      // Fetch refined store data for policy generation
      const [updatedStore] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
      
      let contactEmail = 'support@yourstore.com';
      if (updatedStore?.businessInfo) {
        try {
          const info = JSON.parse(updatedStore.businessInfo as string);
          if (info.email) contactEmail = info.email;
        } catch {}
      }

      // Generate effective policies (Custom OR Auto-generated)
      const effectivePrivacy = updatedStore.customPrivacyPolicy || getPolicyContent('privacy', updatedStore.name, contactEmail).content;
      const effectiveTerms = updatedStore.customTermsOfService || getPolicyContent('terms', updatedStore.name, contactEmail).content;
      const effectiveRefund = updatedStore.customRefundPolicy || getPolicyContent('refund', updatedStore.name, contactEmail).content;
      const effectiveShipping = updatedStore.customShippingPolicy || getPolicyContent('shipping', updatedStore.name, contactEmail).content;
      const effectiveSubscription = updatedStore.customSubscriptionPolicy || getPolicyContent('subscription', updatedStore.name, contactEmail).content;
      const effectiveLegal = updatedStore.customLegalNotice || getPolicyContent('legal', updatedStore.name, contactEmail).content;

      const policiesText = `Store Policies:
      
Privacy Policy:
${effectivePrivacy}

Terms of Service:
${effectiveTerms}

Refund Policy:
${effectiveRefund}

Shipping Policy:
${effectiveShipping}

Subscription Policy:
${effectiveSubscription}

Legal Notice:
${effectiveLegal}`;
      
      context.cloudflare.ctx.waitUntil(
          ai.insertVector(policiesText, {
              storeId,
              type: 'policies',
              title: 'Legal Policies',
              customId: `policies-${storeId}` // Deterministic ID for upsert
          })
      );
      console.log(`[AI SYNC] Queued vector update for policies-${storeId}`);
    } catch (err) {
      console.error('[AI SYNC] Failed to update policies vector:', err);
    }

    return json({ success: true, message: 'Policies saved successfully!' });
  }

  if (intent === 'reset') {
    const policyType = formData.get('policyType') as string;
    
    const updateData: Record<string, null> = {};
    if (policyType === 'privacy') updateData.customPrivacyPolicy = null;
    if (policyType === 'terms') updateData.customTermsOfService = null;
    if (policyType === 'refund') updateData.customRefundPolicy = null;
    if (policyType === 'shipping') updateData.customShippingPolicy = null;
    if (policyType === 'subscription') updateData.customSubscriptionPolicy = null;
    if (policyType === 'legal') updateData.customLegalNotice = null;
    
    if (Object.keys(updateData).length > 0) {
      const [current] = await db
        .select({
          customPrivacyPolicy: stores.customPrivacyPolicy,
          customTermsOfService: stores.customTermsOfService,
          customRefundPolicy: stores.customRefundPolicy,
          customShippingPolicy: stores.customShippingPolicy,
          customSubscriptionPolicy: stores.customSubscriptionPolicy,
          customLegalNotice: stores.customLegalNotice,
        })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);

      const snapshot = buildPolicySnapshot({
        privacy: policyType === 'privacy' ? null : current?.customPrivacyPolicy ?? null,
        terms: policyType === 'terms' ? null : current?.customTermsOfService ?? null,
        refund: policyType === 'refund' ? null : current?.customRefundPolicy ?? null,
        shipping: policyType === 'shipping' ? null : current?.customShippingPolicy ?? null,
        subscription: policyType === 'subscription' ? null : current?.customSubscriptionPolicy ?? null,
        legal: policyType === 'legal' ? null : current?.customLegalNotice ?? null,
      });

      const nextVersion = await getNextPolicyVersion();

      await db.batch([
        db
          .update(stores)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(stores.id, storeId)),
        db.insert(policyVersions).values({
          id: generatePolicyVersionId(storeId, nextVersion),
          storeId,
          version: nextVersion,
          label: `Reset ${policyType} to auto-generated`,
          policiesJson: JSON.stringify(snapshot),
          changedBy,
        }),
      ]);

      // Trigger AI policy sync after reset
      try {
        const { createAIService } = await import('~/services/ai.server');
        const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
          context: context.cloudflare.env,
        });

        const [updatedStore] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
        let contactEmail = 'support@yourstore.com';
        if (updatedStore?.businessInfo) {
          try {
            const info = JSON.parse(updatedStore.businessInfo as string);
            if (info.email) contactEmail = info.email;
          } catch {}
        }

        const effectivePrivacy = updatedStore.customPrivacyPolicy || getPolicyContent('privacy', updatedStore.name, contactEmail).content;
        const effectiveTerms = updatedStore.customTermsOfService || getPolicyContent('terms', updatedStore.name, contactEmail).content;
        const effectiveRefund = updatedStore.customRefundPolicy || getPolicyContent('refund', updatedStore.name, contactEmail).content;
        const effectiveShipping = updatedStore.customShippingPolicy || getPolicyContent('shipping', updatedStore.name, contactEmail).content;
        const effectiveSubscription = updatedStore.customSubscriptionPolicy || getPolicyContent('subscription', updatedStore.name, contactEmail).content;
        const effectiveLegal = updatedStore.customLegalNotice || getPolicyContent('legal', updatedStore.name, contactEmail).content;

        const policiesText = `Store Policies:
      
Privacy Policy:
${effectivePrivacy}

Terms of Service:
${effectiveTerms}

Refund Policy:
${effectiveRefund}

Shipping Policy:
${effectiveShipping}

Subscription Policy:
${effectiveSubscription}

Legal Notice:
${effectiveLegal}`;
        
        context.cloudflare.ctx.waitUntil(
          ai.insertVector(policiesText, {
            storeId,
            type: 'policies',
            title: 'Legal Policies',
            customId: `policies-${storeId}`,
          })
        );
      } catch (err) {
        console.error('[AI SYNC] Failed to update policies vector:', err);
      }
    }

    return json({ success: true, message: 'Policy reset to auto-generated' });
  }

  if (intent === 'rollback') {
    const versionId = formData.get('versionId') as string | null;
    if (!versionId) {
      return json({ error: 'Version ID required' }, { status: 400 });
    }

    const version = await db
      .select()
      .from(policyVersions)
      .where(eq(policyVersions.id, versionId))
      .limit(1);

    const record = version[0];
    if (!record || record.storeId !== storeId) {
      return json({ error: 'Version not found' }, { status: 404 });
    }

    const policies = JSON.parse(record.policiesJson || '{}') as Record<string, string | null>;
    const nextVersion = await getNextPolicyVersion();

    await db.batch([
      db
        .update(stores)
        .set({
          customPrivacyPolicy: policies.privacy ?? null,
          customTermsOfService: policies.terms ?? null,
          customRefundPolicy: policies.refund ?? null,
          customShippingPolicy: policies.shipping ?? null,
          customSubscriptionPolicy: policies.subscription ?? null,
          customLegalNotice: policies.legal ?? null,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId)),
      db.insert(policyVersions).values({
        id: generatePolicyVersionId(storeId, nextVersion),
        storeId,
        version: nextVersion,
        label: `Rollback to v${record.version}`,
        policiesJson: record.policiesJson,
        changedBy,
      }),
    ]);

    // Trigger AI policy sync for rollback
    try {
      const { createAIService } = await import('~/services/ai.server');
      const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
        context: context.cloudflare.env,
      });

      const [updatedStore] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
      let contactEmail = 'support@yourstore.com';
      if (updatedStore?.businessInfo) {
        try {
          const info = JSON.parse(updatedStore.businessInfo as string);
          if (info.email) contactEmail = info.email;
        } catch {}
      }

      const effectivePrivacy = updatedStore.customPrivacyPolicy || getPolicyContent('privacy', updatedStore.name, contactEmail).content;
      const effectiveTerms = updatedStore.customTermsOfService || getPolicyContent('terms', updatedStore.name, contactEmail).content;
      const effectiveRefund = updatedStore.customRefundPolicy || getPolicyContent('refund', updatedStore.name, contactEmail).content;
      const effectiveShipping = updatedStore.customShippingPolicy || getPolicyContent('shipping', updatedStore.name, contactEmail).content;
      const effectiveSubscription = updatedStore.customSubscriptionPolicy || getPolicyContent('subscription', updatedStore.name, contactEmail).content;
      const effectiveLegal = updatedStore.customLegalNotice || getPolicyContent('legal', updatedStore.name, contactEmail).content;

      const policiesText = `Store Policies:
      
Privacy Policy:
${effectivePrivacy}

Terms of Service:
${effectiveTerms}

Refund Policy:
${effectiveRefund}

Shipping Policy:
${effectiveShipping}

Subscription Policy:
${effectiveSubscription}

Legal Notice:
${effectiveLegal}`;
      
      context.cloudflare.ctx.waitUntil(
        ai.insertVector(policiesText, {
          storeId,
          type: 'policies',
          title: 'Legal Policies',
          customId: `policies-${storeId}`,
        })
      );
      console.log(`[AI SYNC] Queued vector update for policies-${storeId}`);
    } catch (err) {
      console.error('[AI SYNC] Failed to update policies vector:', err);
    }

    return json({ success: true, message: `Rolled back to version ${record.version}` });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export default function LegalSettingsPage() {
  const { store, defaultPolicies, contactEmail, policyHistory } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  // Local state for policy content
  const [privacyPolicy, setPrivacyPolicy] = useState(store.customPrivacyPolicy || '');
  const [termsOfService, setTermsOfService] = useState(store.customTermsOfService || '');
  const [refundPolicy, setRefundPolicy] = useState(store.customRefundPolicy || '');
  const [shippingPolicy, setShippingPolicy] = useState(store.customShippingPolicy || '');
  const [subscriptionPolicy, setSubscriptionPolicy] = useState(store.customSubscriptionPolicy || '');
  const [legalNotice, setLegalNotice] = useState(store.customLegalNotice || '');

  // Expanded states for each section
  const [expanded, setExpanded] = useState({
    privacy: false,
    terms: false,
    refund: false,
    shipping: false,
    subscription: false,
    legal: false,
  });

  const toggleExpanded = (key: 'privacy' | 'terms' | 'refund' | 'shipping' | 'subscription' | 'legal') => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('legalSettings')}</h1>
            <p className="text-gray-500 text-sm">{t('legalPagesDesc')}</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-blue-900">{t('autoGeneratedPolicies')}</h3>
            <p className="text-sm text-blue-700 mt-1">
              {t('autoGeneratedDesc')
                .replace('{{name}}', store.name)
                .replace('{{email}}', contactEmail)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <Form method="post">
        <input type="hidden" name="intent" value="save" />
        
        <div className="space-y-6">
          {/* Privacy Policy */}
          <PolicySection
            title={t('privacyPolicy')}
            description={t('privacyPolicyDesc')}
            icon="🔒"
            policyKey="privacy"
            value={privacyPolicy}
            onChange={setPrivacyPolicy}
            defaultContent={defaultPolicies.privacy}
            expanded={expanded.privacy}
            onToggle={() => toggleExpanded('privacy')}
            inputName="privacyPolicy"
            previewUrl="/policies/privacy"
          />

          {/* Terms of Service */}
          <PolicySection
            title={t('termsOfService')}
            description={t('termsDesc')}
            icon="📋"
            policyKey="terms"
            value={termsOfService}
            onChange={setTermsOfService}
            defaultContent={defaultPolicies.terms}
            expanded={expanded.terms}
            onToggle={() => toggleExpanded('terms')}
            inputName="termsOfService"
            previewUrl="/policies/terms"
          />

          {/* Refund Policy */}
          <PolicySection
            title={t('refundPolicy')}
            description={t('refundDesc')}
            icon="↩️"
            policyKey="refund"
            value={refundPolicy}
            onChange={setRefundPolicy}
            defaultContent={defaultPolicies.refund}
            expanded={expanded.refund}
            onToggle={() => toggleExpanded('refund')}
            inputName="refundPolicy"
            previewUrl="/policies/refund"
          />

          {/* Shipping Policy */}
          <PolicySection
            title={t('shippingPolicy')}
            description={t('shippingPolicyDesc')}
            icon="🚚"
            policyKey="shipping"
            value={shippingPolicy}
            onChange={setShippingPolicy}
            defaultContent={defaultPolicies.shipping}
            expanded={expanded.shipping}
            onToggle={() => toggleExpanded('shipping')}
            inputName="shippingPolicy"
            previewUrl="/policies/shipping"
          />

          {/* Subscription Policy */}
          <PolicySection
            title={t('subscriptionPolicy')}
            description={t('subscriptionPolicyDesc')}
            icon="🔁"
            policyKey="subscription"
            value={subscriptionPolicy}
            onChange={setSubscriptionPolicy}
            defaultContent={defaultPolicies.subscription}
            expanded={expanded.subscription}
            onToggle={() => toggleExpanded('subscription')}
            inputName="subscriptionPolicy"
            previewUrl="/policies/subscription"
          />

          {/* Legal Notice */}
          <PolicySection
            title={t('legalNotice')}
            description={t('legalNoticeDesc')}
            icon="⚖️"
            policyKey="legal"
            value={legalNotice}
            onChange={setLegalNotice}
            defaultContent={defaultPolicies.legal}
            expanded={expanded.legal}
            onToggle={() => toggleExpanded('legal')}
            inputName="legalNotice"
            previewUrl="/policies/legal"
          />
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <Link
            to="/app/settings"
            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? t('saving') : t('savePolicies')}
          </button>
        </div>
      </Form>

      {/* Policy History */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('policyHistory')}</h2>
        {policyHistory && policyHistory.length > 0 ? (
          <div className="space-y-3">
            {policyHistory.map((ver: any) => (
              <div
                key={ver.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-100 rounded-lg p-3"
              >
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{t('versionLabel')} {ver.version}</span>
                  {ver.label ? <span className="text-gray-500"> • {ver.label}</span> : null}
                  <div className="text-xs text-gray-500 mt-1">
                    {t('savedAt')}: {ver.createdAt ? new Date(ver.createdAt).toLocaleString() : '—'} • {t('savedBy')}:{' '}
                    {ver.changedBy || '—'}
                  </div>
                </div>
                <Form method="post">
                  <input type="hidden" name="intent" value="rollback" />
                  <input type="hidden" name="versionId" value={ver.id} />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
                  >
                    {t('restore')}
                  </button>
                </Form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('noPolicyHistory')}</p>
        )}
      </div>
    </div>
  );
}

interface PolicySectionProps {
  title: string;
  description: string;
  icon: string;
  policyKey: 'privacy' | 'terms' | 'refund' | 'shipping' | 'subscription' | 'legal';
  value: string;
  onChange: (value: string) => void;
  defaultContent: string;
  expanded: boolean;
  onToggle: () => void;
  inputName: string;
  previewUrl: string;
}

function PolicySection({
  title,
  description,
  icon,
  policyKey,
  value,
  onChange,
  defaultContent,
  expanded,
  onToggle,
  inputName,
  previewUrl,
}: PolicySectionProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const isUsingCustom = value.trim().length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            isUsingCustom 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {isUsingCustom ? t('custom') : t('autoGenerated')}
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4 space-y-4">
            {/* Toggle and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? t('hidePreview') : t('showPreview')}
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('viewLivePage')}
                </a>
              </div>
              {isUsingCustom && (
                <Form method="post" className="inline">
                  <input type="hidden" name="intent" value="reset" />
                  <input type="hidden" name="policyType" value={policyKey} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('resetToAutoGenerated')}
                  </button>
                </Form>
              )}
            </div>

            {/* Preview of Auto-Generated */}
            {showPreview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="text-xs text-gray-500 mb-2 font-medium">AUTO-GENERATED PREVIEW:</div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {defaultContent}
                </pre>
              </div>
            )}

            {/* Custom Content Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('customContentOptional')}
              </label>
              <textarea
                name={inputName}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Leave empty to use auto-generated policy, or paste your custom policy text here..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y text-sm"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                {t('markdownHint')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
