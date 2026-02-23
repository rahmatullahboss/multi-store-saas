import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import { parseManualPaymentConfig, ManualPaymentConfig } from '@db/types';
import { Save, AlertCircle, CheckCircle, Wallet, ArrowLeft } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';
import {
  canUseAdvancedManualPayments,
  getAllowedCheckoutPaymentMethods,
} from '~/lib/payment-policy';

const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

const PaymentSettingsSchema = z.object({
  bkashPersonal: z.string().trim().optional(),
  bkashMerchant: z.string().trim().optional(),
  nagadPersonal: z.string().trim().optional(),
  nagadMerchant: z.string().trim().optional(),
  rocketPersonal: z.string().trim().optional(),
  rocketMerchant: z.string().trim().optional(),
  instructions: z.string().trim().max(1000).optional(),
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

  return json({
    storeName: store.name,
    planType: store.planType || 'free',
    canUseAdvancedManualPayments: canUseAdvancedManualPayments(store.planType || 'free'),
    manualPaymentConfig: parseManualPaymentConfig(store.manualPaymentConfig),
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

  const formData = await request.formData();
  const parsed = PaymentSettingsSchema.safeParse({
    bkashPersonal: (formData.get('bkashPersonal') as string) || undefined,
    bkashMerchant: (formData.get('bkashMerchant') as string) || undefined,
    nagadPersonal: (formData.get('nagadPersonal') as string) || undefined,
    nagadMerchant: (formData.get('nagadMerchant') as string) || undefined,
    rocketPersonal: (formData.get('rocketPersonal') as string) || undefined,
    rocketMerchant: (formData.get('rocketMerchant') as string) || undefined,
    instructions: (formData.get('instructions') as string) || undefined,
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

  await db
    .update(stores)
    .set({ manualPaymentConfig: JSON.stringify(normalized) })
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
  const { manualPaymentConfig, canUseAdvancedManualPayments: canUseAdvanced, planType } =
    useLoaderData<typeof loader>();
  const allowedMethods = getAllowedCheckoutPaymentMethods(planType || 'free');
  const canUseNagad = allowedMethods.includes('nagad');
  const canUseRocket = allowedMethods.includes('rocket');
  const fetcher = useFetcher<{ success: boolean; message: string }>();
  const navigation = useNavigation();
  const isSaving = fetcher.state === 'submitting' || navigation.state === 'submitting';
  const { t } = useTranslation();

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
