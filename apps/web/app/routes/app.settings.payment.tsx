import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigation, Link } from '@remix-run/react';
import React from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import { parseManualPaymentConfig, ManualPaymentConfig } from '@db/types';
import { Save, AlertCircle, CheckCircle, Wallet, ArrowLeft, CreditCard, Lock, Globe } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';
import {
  canUseAdvancedManualPayments,
  getAllowedCheckoutPaymentMethods,
  normalizePlanType,
} from '~/lib/payment-policy';
import { parseGatewayConfig, serializeGatewayConfig, StoreGatewayConfig } from '~/lib/gateway-config';

const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

const PaymentSettingsSchema = z.object({
  bkashPersonal: z.string().trim().optional(),
  bkashMerchant: z.string().trim().optional(),
  nagadPersonal: z.string().trim().optional(),
  nagadMerchant: z.string().trim().optional(),
  rocketPersonal: z.string().trim().optional(),
  rocketMerchant: z.string().trim().optional(),
  instructions: z.string().trim().max(1000).optional(),
  // Gateway fields
  sslEnabled: z.string().optional(),
  sslUseOwn: z.string().optional(),
  sslStoreId: z.string().trim().optional(),
  sslStorePassword: z.string().trim().optional(),
  sslIsLive: z.string().optional(),
  bkashGwEnabled: z.string().optional(),
  bkashGwAppKey: z.string().trim().optional(),
  bkashGwAppSecret: z.string().trim().optional(),
  bkashGwUsername: z.string().trim().optional(),
  bkashGwPassword: z.string().trim().optional(),
  bkashGwIsLive: z.string().optional(),
  nagadGwEnabled: z.string().optional(),
  nagadGwMerchantId: z.string().trim().optional(),
  nagadGwMerchantNumber: z.string().trim().optional(),
  nagadGwMerchantPrivateKey: z.string().trim().optional(),
  nagadGwNagadPublicKey: z.string().trim().optional(),
  nagadGwIsLive: z.string().optional(),
});

function validateOptionalPhone(input?: string) {
  if (!input) return true;
  return bdPhoneRegex.test(input);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).get();

  if (!store) throw new Response('Store not found', { status: 404 });

  const isPaidPlan = normalizePlanType(store.planType) !== 'free';

  return json({
    storeName: store.name,
    planType: store.planType || 'free',
    isPaidPlan,
    canUseAdvancedManualPayments: canUseAdvancedManualPayments(store.planType || 'free'),
    manualPaymentConfig: parseManualPaymentConfig(store.manualPaymentConfig),
    gatewayConfig: parseGatewayConfig(store.gatewayConfig),
    hasPlatformSsl: !!(context.cloudflare.env.SSLCOMMERZ_STORE_ID && context.cloudflare.env.SSLCOMMERZ_STORE_PASSWORD),
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });
  const userId = await getUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  const store = await db
    .select({ planType: stores.planType })
    .from(stores)
    .where(eq(stores.id, storeId))
    .get();

  if (!store) throw new Response('Store not found', { status: 404 });
  const canUseAdvanced = canUseAdvancedManualPayments(store.planType || 'free');

  const isPaidPlan = normalizePlanType(store.planType) !== 'free';
  const formData = await request.formData();
  const g = (key: string) => (formData.get(key) as string) || undefined;
  const parsed = PaymentSettingsSchema.safeParse({
    bkashPersonal: g('bkashPersonal'),
    bkashMerchant: g('bkashMerchant'),
    nagadPersonal: g('nagadPersonal'),
    nagadMerchant: g('nagadMerchant'),
    rocketPersonal: g('rocketPersonal'),
    rocketMerchant: g('rocketMerchant'),
    instructions: g('instructions'),
    sslEnabled: g('sslEnabled'),
    sslUseOwn: g('sslUseOwn'),
    sslStoreId: g('sslStoreId'),
    sslStorePassword: g('sslStorePassword'),
    sslIsLive: g('sslIsLive'),
    bkashGwEnabled: g('bkashGwEnabled'),
    bkashGwAppKey: g('bkashGwAppKey'),
    bkashGwAppSecret: g('bkashGwAppSecret'),
    bkashGwUsername: g('bkashGwUsername'),
    bkashGwPassword: g('bkashGwPassword'),
    bkashGwIsLive: g('bkashGwIsLive'),
    nagadGwEnabled: g('nagadGwEnabled'),
    nagadGwMerchantId: g('nagadGwMerchantId'),
    nagadGwMerchantNumber: g('nagadGwMerchantNumber'),
    nagadGwMerchantPrivateKey: g('nagadGwMerchantPrivateKey'),
    nagadGwNagadPublicKey: g('nagadGwNagadPublicKey'),
    nagadGwIsLive: g('nagadGwIsLive'),
  });
  if (!parsed.success) {
    return json({ success: false, message: 'invalid_input' }, { status: 400 });
  }

  const normalized: ManualPaymentConfig = {
    bkashPersonal: parsed.data.bkashPersonal || undefined,
    bkashMerchant: parsed.data.bkashMerchant || undefined,
    nagadPersonal: parsed.data.nagadPersonal || undefined,
    nagadMerchant: parsed.data.nagadMerchant || undefined,
    rocketPersonal: parsed.data.rocketPersonal || undefined,
    rocketMerchant: parsed.data.rocketMerchant || undefined,
    instructions: parsed.data.instructions || undefined,
  };

  if (!canUseAdvanced && (normalized.rocketMerchant || normalized.rocketPersonal)) {
    return json(
      {
        success: false,
        message: 'advanced_manual_payments_require_paid_plan',
      },
      { status: 403 }
    );
  }

  const allPhones = [
    normalized.bkashPersonal,
    normalized.bkashMerchant,
    normalized.nagadPersonal,
    normalized.nagadMerchant,
    normalized.rocketPersonal,
    normalized.rocketMerchant,
  ];
  if (!allPhones.every(validateOptionalPhone)) {
    return json({ success: false, message: 'invalid_phone_number' }, { status: 400 });
  }

  // Build gateway config (paid plan only)
  const newGatewayConfig: StoreGatewayConfig = {};
  if (isPaidPlan) {
    const d = parsed.data;
    newGatewayConfig.sslcommerz = {
      enabled: d.sslEnabled === 'on',
      useOwn: d.sslUseOwn === 'on',
      storeId: d.sslStoreId || undefined,
      storePassword: d.sslStorePassword || undefined,
      isLive: d.sslIsLive === 'on',
    };
    newGatewayConfig.bkash = {
      enabled: d.bkashGwEnabled === 'on',
      appKey: d.bkashGwAppKey || undefined,
      appSecret: d.bkashGwAppSecret || undefined,
      username: d.bkashGwUsername || undefined,
      password: d.bkashGwPassword || undefined,
      isLive: d.bkashGwIsLive === 'on',
    };
    newGatewayConfig.nagad = {
      enabled: d.nagadGwEnabled === 'on',
      merchantId: d.nagadGwMerchantId || undefined,
      merchantNumber: d.nagadGwMerchantNumber || undefined,
      merchantPrivateKey: d.nagadGwMerchantPrivateKey || undefined,
      nagadPublicKey: d.nagadGwNagadPublicKey || undefined,
      isLive: d.nagadGwIsLive === 'on',
    };
  }

  await db
    .update(stores)
    .set({
      manualPaymentConfig: JSON.stringify(normalized),
      gatewayConfig: isPaidPlan ? serializeGatewayConfig(newGatewayConfig) : undefined,
    })
    .where(eq(stores.id, storeId));

  await logActivity(db, {
    storeId,
    userId,
    action: 'settings_updated',
    entityType: 'settings',
    details: {
      section: 'payment',
      enabledMethods: {
        bkash: Boolean(normalized.bkashMerchant || normalized.bkashPersonal),
        nagad: Boolean(normalized.nagadMerchant || normalized.nagadPersonal),
        rocket: Boolean(normalized.rocketMerchant || normalized.rocketPersonal),
      },
    },
  });

  return json({ success: true, message: 'saved' });
}

export default function PaymentSettings() {
  const { manualPaymentConfig, canUseAdvancedManualPayments: canUseAdvanced, planType, isPaidPlan, gatewayConfig, hasPlatformSsl } =
    useLoaderData<typeof loader>();
  const allowedMethods = getAllowedCheckoutPaymentMethods(planType || 'free');
  const canUseNagad = allowedMethods.includes('nagad');
  const canUseRocket = allowedMethods.includes('rocket');
  const fetcher = useFetcher<{ success: boolean; message: string }>();
  const navigation = useNavigation();
  const isSaving = fetcher.state === 'submitting' || navigation.state === 'submitting';
  const { t } = useTranslation();

  // Gateway local state
  const [sslEnabled, setSslEnabled] = React.useState(gatewayConfig?.sslcommerz?.enabled ?? false);
  const [sslUseOwn, setSslUseOwn] = React.useState(gatewayConfig?.sslcommerz?.useOwn ?? false);
  const [bkashGwEnabled, setBkashGwEnabled] = React.useState(gatewayConfig?.bkash?.enabled ?? false);
  const [nagadGwEnabled, setNagadGwEnabled] = React.useState(gatewayConfig?.nagad?.enabled ?? false);

  return (
    <div className="space-y-8">

      {/* ===== DESKTOP HEADER (md+) ===== */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          to="/app/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('manualPaymentSettings')}</h1>
          <p className="text-gray-500 mt-1">{t('paymentSettingsDesc')}</p>
        </div>
      </div>

      {/* ===== SINGLE FORM wrapping both mobile + desktop layouts ===== */}
      <fetcher.Form method="post">

      {/* ===== MOBILE LAYOUT (below md) ===== */}
      <div className="md:hidden -mx-4 -mt-4">

        {/* Sticky Mobile Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 h-[60px]">
            <Link
              to="/app/settings"
              className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">{t('manualPaymentSettings')}</h1>
            <div className="w-10" />
          </div>
        </header>

        <div className="flex flex-col gap-5 p-4 pb-32">

            {/* Success Banner */}
            {fetcher.data?.success === true && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {t('saved')}
              </div>
            )}

            {/* Error Banner */}
            {fetcher.data?.success === false && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {fetcher.data.message === 'invalid_phone_number'
                  ? t('invalidPhoneNumber')
                  : fetcher.data.message === 'advanced_manual_payments_require_paid_plan'
                  ? t('rocketRequiresPaidPlan')
                  : t('failedToSavePayment')}
              </div>
            )}

            {/* Free Plan Warning */}
            {!canUseAdvanced && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{t('freePlanPaymentPolicy')}</p>
                  <p className="mt-0.5 leading-snug">
                    {t('freePlanPaymentDesc')}
                  </p>
                </div>
              </div>
            )}

        </div>{/* end flex flex-col gap-5 */}

        {/* Fixed Save Button at bottom — z-[70] sits above bottom nav z-[65] */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70]">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Save className="w-5 h-5 animate-pulse" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? t('saving') : t('saveSettings')}
          </button>
        </div>
      </div>{/* end md:hidden mobile wrapper */}

      {/* ===== SHARED PAYMENT CARDS (rendered once for all breakpoints) ===== */}
      <div className="space-y-4 md:space-y-6">

        {/* ===== DESKTOP-ONLY banners (md+) ===== */}
        <div className="hidden md:block space-y-4">
          {fetcher.data?.success === true && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('saved')}
            </div>
          )}

          {fetcher.data?.success === false && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {fetcher.data.message === 'invalid_phone_number'
                ? t('invalidPhoneNumber')
                : fetcher.data.message === 'advanced_manual_payments_require_paid_plan'
                ? t('rocketRequiresPaidPlan')
                : t('failedToSavePayment')}
            </div>
          )}

          {!canUseAdvanced && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('freePlanPaymentPolicy')}</p>
                <p className="text-sm">{t('freePlanPaymentDesc')}</p>
              </div>
            </div>
          )}
        </div>

        {/* bKash Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-pink-50/50 px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 md:w-auto md:h-auto bg-pink-100 p-2 rounded-lg text-pink-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t('bkashPayment')}</h3>
              <p className="text-sm text-gray-500">{t('bkashDesc')}</p>
            </div>
          </div>
          <div className="p-4 md:p-6 grid gap-4 md:gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="bkashPersonal" className="block text-sm font-medium text-gray-700 mb-1">
                {t('personalNumber')}
              </label>
              <input
                id="bkashPersonal"
                type="tel"
                inputMode="numeric"
                name="bkashPersonal"
                defaultValue={manualPaymentConfig?.bkashPersonal}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-sm"
              />
            </div>
            <div>
              <label htmlFor="bkashMerchant" className="block text-sm font-medium text-gray-700 mb-1">
                {t('merchantNumber')}
              </label>
              <input
                id="bkashMerchant"
                type="tel"
                inputMode="numeric"
                name="bkashMerchant"
                defaultValue={manualPaymentConfig?.bkashMerchant}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* Nagad Card */}
        {canUseNagad && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-orange-50/50 px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 md:w-auto md:h-auto bg-orange-100 p-2 rounded-lg text-orange-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('nagadPayment')}</h3>
                <p className="text-sm text-gray-500">{t('nagadDesc')}</p>
              </div>
            </div>
            <div className="p-4 md:p-6 grid gap-4 md:gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="nagadPersonal" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('personalNumber')}
                </label>
                <input
                  id="nagadPersonal"
                  type="tel"
                  inputMode="numeric"
                  name="nagadPersonal"
                  defaultValue={manualPaymentConfig?.nagadPersonal}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-sm"
                />
              </div>
              <div>
                <label htmlFor="nagadMerchant" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('merchantNumber')}
                </label>
                <input
                  id="nagadMerchant"
                  type="tel"
                  inputMode="numeric"
                  name="nagadMerchant"
                  defaultValue={manualPaymentConfig?.nagadMerchant}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rocket Card */}
        {canUseRocket && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-purple-50/50 px-4 md:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 md:w-auto md:h-auto bg-purple-100 p-2 rounded-lg text-purple-600 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('rocketPayment')}</h3>
                <p className="text-sm text-gray-500">{t('rocketDesc')}</p>
              </div>
            </div>
            <div className="p-4 md:p-6 grid gap-4 md:gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="rocketPersonal" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('personalNumber')}
                </label>
                <input
                  id="rocketPersonal"
                  type="tel"
                  inputMode="numeric"
                  name="rocketPersonal"
                  defaultValue={manualPaymentConfig?.rocketPersonal}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                />
              </div>
              <div>
                <label htmlFor="rocketMerchant" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('merchantNumber')}
                </label>
                <input
                  id="rocketMerchant"
                  type="tel"
                  inputMode="numeric"
                  name="rocketMerchant"
                  defaultValue={manualPaymentConfig?.rocketMerchant}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-100 md:border-blue-200 rounded-xl md:rounded-lg p-4 text-sm text-blue-700 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="leading-snug">{t('manualPaymentInstructions')}</p>
        </div>

        {/* ===== PAYMENT GATEWAY SECTION (Paid Plan Only) ===== */}
        {isPaidPlan ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pt-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-gray-900">পেমেন্ট গেটওয়ে</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
            </div>
            <p className="text-sm text-gray-500">অনলাইন পেমেন্ট গেটওয়ে সেটআপ করুন — কার্ড, মোবাইল ব্যাংকিং গেটওয়ে।</p>

            {/* SSLCommerz */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">SSLCommerz</h3>
                    <p className="text-xs text-gray-500">কার্ড, নেট ব্যাংকিং, মোবাইল ব্যাংকিং — সব এক জায়গায়</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="sslEnabled" checked={sslEnabled} onChange={e => setSslEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              {sslEnabled && (
                <div className="p-4 md:p-6 space-y-4">
                  {hasPlatformSsl && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>Platform SSLCommerz account active আছে। নিজের credentials ব্যবহার না করলে platform account দিয়েই কাজ হবে।</span>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="sslUseOwn" checked={sslUseOwn} onChange={e => setSslUseOwn(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">নিজের SSLCommerz credentials ব্যবহার করব</span>
                  </label>
                  {sslUseOwn && (
                    <div className="grid gap-3 md:grid-cols-2 pl-7">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Store ID</label>
                        <input type="text" name="sslStoreId" defaultValue={gatewayConfig?.sslcommerz?.storeId} placeholder="your_store_id" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Store Password</label>
                        <input type="password" name="sslStorePassword" defaultValue={gatewayConfig?.sslcommerz?.storePassword} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="sslIsLive" defaultChecked={gatewayConfig?.sslcommerz?.isLive} className="w-4 h-4 text-indigo-600 rounded" />
                          <span className="text-sm text-gray-700">Live mode (uncheck = Sandbox)</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* bKash Gateway */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">bKash Payment Gateway</h3>
                    <p className="text-xs text-gray-500">bKash merchant API দিয়ে অটোমেটিক পেমেন্ট ভেরিফিকেশন</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="bkashGwEnabled" checked={bkashGwEnabled} onChange={e => setBkashGwEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              {bkashGwEnabled && (
                <div className="p-4 md:p-6 space-y-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>bKash merchant API access দরকার। bKash এর সাথে চুক্তির পরে App Key ও Secret পাবেন।</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">App Key</label>
                      <input type="text" name="bkashGwAppKey" defaultValue={gatewayConfig?.bkash?.appKey} placeholder="bKash App Key" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">App Secret</label>
                      <input type="password" name="bkashGwAppSecret" defaultValue={gatewayConfig?.bkash?.appSecret} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                      <input type="text" name="bkashGwUsername" defaultValue={gatewayConfig?.bkash?.username} placeholder="bKash Username" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                      <input type="password" name="bkashGwPassword" defaultValue={gatewayConfig?.bkash?.password} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="bkashGwIsLive" defaultChecked={gatewayConfig?.bkash?.isLive} className="w-4 h-4 text-pink-600 rounded" />
                        <span className="text-sm text-gray-700">Live mode (uncheck = Sandbox)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nagad Gateway */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Nagad Payment Gateway</h3>
                    <p className="text-xs text-gray-500">Nagad merchant API দিয়ে অটোমেটিক পেমেন্ট ভেরিফিকেশন</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="nagadGwEnabled" checked={nagadGwEnabled} onChange={e => setNagadGwEnabled(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
              {nagadGwEnabled && (
                <div className="p-4 md:p-6 space-y-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>Nagad merchant API access দরকার। Nagad এর সাথে চুক্তির পরে Merchant ID ও Private Key পাবেন।</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Merchant ID</label>
                      <input type="text" name="nagadGwMerchantId" defaultValue={gatewayConfig?.nagad?.merchantId} placeholder="Nagad Merchant ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Merchant Wallet Number</label>
                      <input type="text" name="nagadGwMerchantNumber" defaultValue={gatewayConfig?.nagad?.merchantNumber} placeholder="01XXXXXXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Merchant Private Key (Base64)</label>
                      <input type="password" name="nagadGwMerchantPrivateKey" defaultValue={gatewayConfig?.nagad?.merchantPrivateKey} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nagad Public Key (Base64)</label>
                      <input type="password" name="nagadGwNagadPublicKey" defaultValue={gatewayConfig?.nagad?.nagadPublicKey} placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="nagadGwIsLive" defaultChecked={gatewayConfig?.nagad?.isLive} className="w-4 h-4 text-orange-500 rounded" />
                        <span className="text-sm text-gray-700">Live mode (uncheck = Sandbox)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 text-xs text-gray-500 px-1">
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>সব credentials আপনার স্টোরের সাথে সুরক্ষিতভাবে সংরক্ষিত হয়। কাউকে শেয়ার করবেন না।</span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">পেমেন্ট গেটওয়ে — Paid Plan</h3>
              <p className="text-sm text-gray-600 mb-3">SSLCommerz, bKash Gateway, Nagad Gateway সেটআপ করতে Paid Plan এ upgrade করুন।</p>
              <Link to="/app/billing" className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Upgrade করুন →
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Save Button */}
        <div className="hidden md:flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSaving ? (
              <Save className="w-4 h-4 animate-pulse" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? t('saving') : t('saveSettings')}
          </button>
        </div>

      </div>{/* end shared payment cards */}

      </fetcher.Form>{/* end single shared form */}
    </div>
  );
}
