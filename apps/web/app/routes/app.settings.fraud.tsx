/**
 * Fraud Settings Page
 *
 * Route: /app/settings/fraud
 *
 * Features:
 * - Enable/disable fraud detection
 * - Configure risk thresholds (verify/hold/block)
 * - Max COD amount setting
 * - Phone blacklist management
 * - Review queue for held orders
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  useFetcher,
  Link,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { stores, phoneBlacklist, fraudEvents, orders } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import {
  parseFraudSettings,
  DEFAULT_FRAUD_SETTINGS,
  normalizePhone,
} from '~/services/fraud-engine.server';
import {
  ArrowLeft,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Phone,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Ban,
  Eye,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { GlassCard } from '~/components/ui/GlassCard';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Fraud Detection Settings - Ozzyl' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env as unknown as Env);
  if (!storeId) return redirect('/auth/login');

  const db = drizzle(context.cloudflare.env.DB);

  const store = await db.select({ fraudSettings: stores.fraudSettings }).from(stores).where(eq(stores.id, storeId)).get();
  const settings = parseFraudSettings(store?.fraudSettings);

  // Get blacklist
  const blacklist = await db
    .select()
    .from(phoneBlacklist)
    .where(eq(phoneBlacklist.storeId, storeId))
    .orderBy(desc(phoneBlacklist.createdAt))
    .limit(100);

  // Get recent held orders (review queue)
  const heldEvents = await db
    .select({
      id: fraudEvents.id,
      orderId: fraudEvents.orderId,
      phone: fraudEvents.phone,
      riskScore: fraudEvents.riskScore,
      decision: fraudEvents.decision,
      signals: fraudEvents.signals,
      resolvedBy: fraudEvents.resolvedBy,
      createdAt: fraudEvents.createdAt,
    })
    .from(fraudEvents)
    .where(
      and(
        eq(fraudEvents.storeId, storeId),
        eq(fraudEvents.decision, 'hold')
      )
    )
    .orderBy(desc(fraudEvents.createdAt))
    .limit(20);

  // Stats — wrapped in try/catch so a DB failure here doesn't break the whole page
  let stats = { total: 0, allowed: 0, verified: 0, held: 0, blocked: 0 };
  try {
    const allEvents = await db
      .select({
        id: fraudEvents.id,
        decision: fraudEvents.decision,
      })
      .from(fraudEvents)
      .where(eq(fraudEvents.storeId, storeId))
      .limit(1000);

    stats = {
      total: allEvents.length,
      allowed: allEvents.filter(e => e.decision === 'allow').length,
      verified: allEvents.filter(e => e.decision === 'verify').length,
      held: allEvents.filter(e => e.decision === 'hold').length,
      blocked: allEvents.filter(e => e.decision === 'block').length,
    };
  } catch (statsError) {
    console.error('Failed to load fraud stats:', statsError);
    // stats remains zeroed — page still renders with settings and blacklist
  }

  return json({ settings, blacklist, heldEvents, stats });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env as unknown as Env);
  if (!storeId) return redirect('/auth/login');

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // Save settings
  if (intent === 'save_settings') {
    const enabled = formData.get('enabled') === 'true';
    const verifyThreshold = parseInt(formData.get('verifyThreshold') as string) || 30;
    const holdThreshold = parseInt(formData.get('holdThreshold') as string) || 60;
    const blockThreshold = parseInt(formData.get('blockThreshold') as string) || 80;
    const autoHideCOD = formData.get('autoHideCOD') === 'true';
    const requireOTPForCOD = formData.get('requireOTPForCOD') === 'true';
    const maxCODAmount = formData.get('maxCODAmount')
      ? parseInt(formData.get('maxCODAmount') as string)
      : null;

    // COD Rate Control fields
    const codRateControlEnabled = formData.get('codRateControlEnabled') === 'true';
    const codBlockBelowRate = Math.max(0, Math.min(100, parseInt(formData.get('codBlockBelowRate') as string) || 30));
    const codAutoConfirmAboveRate = Math.max(0, Math.min(100, parseInt(formData.get('codAutoConfirmAboveRate') as string) || 80));
    const codMinOrdersRequired = Math.max(1, Math.min(50, parseInt(formData.get('codMinOrdersRequired') as string) || 3));
    const autoDispatchCourier = formData.get('autoDispatchCourier') === 'true';

    // Validate: block threshold must be below auto-confirm threshold
    if (codBlockBelowRate >= codAutoConfirmAboveRate) {
      return json(
        { success: false, error: 'Block threshold must be lower than Auto-Confirm threshold' },
        { status: 400 }
      );
    }

    // Validate threshold ordering: verify < hold < block
    if (!(verifyThreshold < holdThreshold && holdThreshold < blockThreshold)) {
      return json(
        { success: false, error: 'Thresholds must be in order: Verify < Hold < Block' },
        { status: 400 }
      );
    }

    const settings = {
      enabled,
      thresholds: {
        verify: Math.max(10, Math.min(90, verifyThreshold)),
        hold: Math.max(20, Math.min(95, holdThreshold)),
        block: Math.max(30, Math.min(100, blockThreshold)),
      },
      autoHideCOD,
      requireOTPForCOD,
      maxCODAmount,
      // COD Rate Control
      codRateControlEnabled,
      codBlockBelowRate,
      codAutoConfirmAboveRate,
      codMinOrdersRequired,
      // Auto-Dispatch (opt-in)
      autoDispatchCourier,
    };

    await db
      .update(stores)
      .set({
        fraudSettings: JSON.stringify(settings),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Fraud settings saved!' });
  }

  // Add to blacklist
  if (intent === 'blacklist_add') {
    const phone = formData.get('phone') as string;
    const reason = (formData.get('reason') as string) || 'Manually added';

    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    const normalized = normalizePhone(phone);
    await db.insert(phoneBlacklist).values({
      phone: normalized,
      storeId,
      reason,
      addedBy: 'merchant',
    });

    return json({ success: true, message: `${normalized} added to blacklist` });
  }

  // Remove from blacklist
  if (intent === 'blacklist_remove') {
    const id = parseInt(formData.get('id') as string);
    if (!id) return json({ error: 'ID required' }, { status: 400 });

    await db
      .delete(phoneBlacklist)
      .where(
        and(
          eq(phoneBlacklist.id, id),
          eq(phoneBlacklist.storeId, storeId)
        )
      );

    return json({ success: true, message: 'Removed from blacklist' });
  }

  // Resolve held order
  if (intent === 'resolve') {
    const eventId = parseInt(formData.get('eventId') as string);
    // Renamed from 'action' to 'resolveAction' to avoid shadowing the exported action function
    const resolveAction = formData.get('action') as string;

    if (!eventId || !resolveAction) {
      return json({ error: 'Event ID and action required' }, { status: 400 });
    }

    const event = await db.select().from(fraudEvents).where(
      and(eq(fraudEvents.id, eventId), eq(fraudEvents.storeId, storeId))
    ).get();

    if (!event) return json({ error: 'Event not found' }, { status: 404 });

    await db.update(fraudEvents).set({
      resolvedBy: `merchant:${resolveAction}`,
      resolvedAt: new Date(),
    }).where(eq(fraudEvents.id, eventId));

    if (event.orderId) {
      if (resolveAction === 'approve') {
        await db.update(orders).set({ status: 'confirmed', updatedAt: new Date() })
          .where(and(eq(orders.id, event.orderId), eq(orders.storeId, storeId)));
      } else if (resolveAction === 'reject' || resolveAction === 'blacklist') {
        await db.update(orders).set({ status: 'cancelled', updatedAt: new Date() })
          .where(and(eq(orders.id, event.orderId), eq(orders.storeId, storeId)));

        if (resolveAction === 'blacklist') {
          await db.insert(phoneBlacklist).values({
            phone: event.phone,
            storeId,
            reason: `Blacklisted from review (Event #${eventId})`,
            addedBy: 'merchant',
          });
        }
      }
    }

    return json({ success: true, message: `Order ${resolveAction}d` });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function FraudSettingsPage() {
  const { settings, blacklist, heldEvents, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();
  const blacklistFetcher = useFetcher();

  const [newPhone, setNewPhone] = useState('');
  const [newReason, setNewReason] = useState('');

  const pct = (n: number) => (stats.total > 0 ? Math.round((n / stats.total) * 100) : 0);

  // Animated pulse badge
  const ActiveBadge = () =>
    settings.enabled ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Inactive
      </span>
    );

  // Toggle switch helper — renders a proper pill toggle
  const Toggle = ({
    name,
    id,
    defaultChecked,
    value = 'true',
  }: {
    name: string;
    id: string;
    defaultChecked: boolean;
    value?: string;
  }) => (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        id={id}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
    </label>
  );

  return (
    <>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden -mx-4 -mt-4 pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <Link to="/app/settings" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Fraud Detection</h1>
          <ActiveBadge />
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Status Messages */}
          {actionData && 'success' in actionData && (
            <div className="bg-emerald-50/50 border border-emerald-200/50 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              {actionData.message}
            </div>
          )}
          {actionData && 'error' in actionData && (
            <div className="bg-red-50/50 border border-red-200/50 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {actionData.error}
            </div>
          )}

          {/* Stats - 3 columns on mobile */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-gray-100 shadow-sm p-3 text-center bg-white">
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-2xl border border-gray-100 shadow-sm p-3 text-center bg-white">
              <p className="text-xl font-bold text-emerald-600">{stats.allowed}</p>
              <p className="text-xs text-gray-500">Allowed</p>
            </div>
            <div className="rounded-2xl border border-gray-100 shadow-sm p-3 text-center bg-white">
              <p className="text-xl font-bold text-red-600">{stats.blocked}</p>
              <p className="text-xs text-gray-500">Blocked</p>
            </div>
          </div>

          {/* Settings Form - Mobile */}
          <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              Risk Thresholds
            </h2>

            <Form method="post" id="fraud-settings-form-mobile" className="space-y-5">
              <input type="hidden" name="intent" value="save_settings" />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enabled"
                  value="true"
                  defaultChecked={settings.enabled}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Fraud Detection</span>
              </label>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ⚠️ Verify Threshold
                  </label>
                  <input
                    type="number"
                    name="verifyThreshold"
                    defaultValue={settings.thresholds.verify}
                    min={10} max={90}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Score {settings.thresholds.verify}+ → verify করতে হবে</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔶 Hold Threshold
                  </label>
                  <input
                    type="number"
                    name="holdThreshold"
                    defaultValue={settings.thresholds.hold}
                    min={20} max={95}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Score {settings.thresholds.hold}+ → review queue</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🚫 Block Threshold
                  </label>
                  <input
                    type="number"
                    name="blockThreshold"
                    defaultValue={settings.thresholds.block}
                    min={30} max={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Score {settings.thresholds.block}+ → auto block</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">COD Controls</h3>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoHideCOD"
                    value="true"
                    defaultChecked={settings.autoHideCOD}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600"
                  />
                  <span className="text-sm text-gray-600">High risk এ COD লুকাও</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requireOTPForCOD"
                    value="true"
                    defaultChecked={settings.requireOTPForCOD}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600"
                  />
                  <span className="text-sm text-gray-600">সব COD এ OTP লাগবে</span>
                </label>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Max COD Amount (৳)</label>
                  <input
                    type="number"
                    name="maxCODAmount"
                    defaultValue={settings.maxCODAmount || ''}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </Form>
          </div>

          {/* COD Rate Control - Mobile */}
          <div className="rounded-2xl border border-orange-100 shadow-sm bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              COD ডেলিভারি রেট কন্ট্রোল
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              অর্ডার দেওয়ার সময় কাস্টমারের ডেলিভারি হিস্টরি চেক করে স্বয়ংক্রিয়ভাবে COD ব্লক বা কনফার্ম করে।
            </p>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="save_settings" />
              <input type="hidden" name="enabled" value={settings.enabled ? 'true' : 'false'} />
              <input type="hidden" name="verifyThreshold" value={settings.thresholds.verify} />
              <input type="hidden" name="holdThreshold" value={settings.thresholds.hold} />
              <input type="hidden" name="blockThreshold" value={settings.thresholds.block} />
              <input type="hidden" name="autoHideCOD" value={settings.autoHideCOD ? 'true' : 'false'} />
              <input type="hidden" name="requireOTPForCOD" value={settings.requireOTPForCOD ? 'true' : 'false'} />
              <input type="hidden" name="maxCODAmount" value={settings.maxCODAmount ?? ''} />

              {/* Master switch */}
              <label className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="codRateControlEnabled"
                  value="true"
                  defaultChecked={settings.codRateControlEnabled}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800">রেট কন্ট্রোল চালু রাখুন</span>
                  <p className="text-xs text-gray-500">বন্ধ করলে সব COD অর্ডার pending হবে</p>
                </div>
              </label>

              {/* Block threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🚫 Block Threshold (%)
                </label>
                <input
                  type="number"
                  name="codBlockBelowRate"
                  defaultValue={settings.codBlockBelowRate}
                  min={0} max={99}
                  className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  এর নিচে ডেলিভারি রেট হলে COD সম্পূর্ণ ব্লক হবে (Default: 30%)
                </p>
              </div>

              {/* Auto-confirm threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ✅ Auto-Confirm Threshold (%)
                </label>
                <input
                  type="number"
                  name="codAutoConfirmAboveRate"
                  defaultValue={settings.codAutoConfirmAboveRate}
                  min={1} max={100}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  এর উপরে ডেলিভারি রেট হলে অর্ডার স্বয়ংক্রিয়ভাবে Confirmed হবে (Default: 80%)
                </p>
              </div>

              {/* Min orders required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📦 Minimum Order History
                </label>
                <input
                  type="number"
                  name="codMinOrdersRequired"
                  defaultValue={settings.codMinOrdersRequired}
                  min={1} max={50}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  এর কম অর্ডার থাকলে নতুন কাস্টমার হিসেবে pending রাখবে (Default: 3)
                </p>
              </div>

              {/* Visual guide */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5 border border-gray-100">
                <p className="font-medium text-gray-700 mb-2">📊 কীভাবে সিদ্ধান্ত নেয়:</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-gray-600">ডেলিভারি রেট &lt; <strong>{settings.codBlockBelowRate}%</strong> → COD ব্লক</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span className="text-gray-600"><strong>{settings.codBlockBelowRate}%</strong> – <strong>{settings.codAutoConfirmAboveRate}%</strong> → Pending (আপনি কল করে confirm করবেন)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-gray-600">ডেলিভারি রেট &gt; <strong>{settings.codAutoConfirmAboveRate}%</strong> → Auto-Confirmed ✅</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Rate Control Settings
              </button>
            </Form>
          </div>

          {/* Auto-Dispatch - Mobile */}
          <div className="rounded-2xl border border-emerald-100 shadow-sm bg-white p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🚀</span>
              <h2 className="text-base font-semibold text-gray-900">অটো কুরিয়ার ডিসপ্যাচ</h2>
              <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Advanced</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              যে কাস্টমারের ডেলিভারি রেট <strong>{settings.codAutoConfirmAboveRate}%</strong>-এর উপরে, তাদের অর্ডার অটো-কনফার্মের পরপরই কুরিয়ারে বুক হয়ে যাবে। কোনো হাত দিতে হবে না।
            </p>

            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="save_settings" />
              <input type="hidden" name="enabled" value={String(settings.enabled)} />
              <input type="hidden" name="verifyThreshold" value={String(settings.thresholds.verify)} />
              <input type="hidden" name="holdThreshold" value={String(settings.thresholds.hold)} />
              <input type="hidden" name="blockThreshold" value={String(settings.thresholds.block)} />
              <input type="hidden" name="autoHideCOD" value={String(settings.autoHideCOD)} />
              <input type="hidden" name="requireOTPForCOD" value={String(settings.requireOTPForCOD)} />
              <input type="hidden" name="maxCODAmount" value={settings.maxCODAmount ?? ''} />
              <input type="hidden" name="codRateControlEnabled" value={String(settings.codRateControlEnabled)} />
              <input type="hidden" name="codBlockBelowRate" value={String(settings.codBlockBelowRate)} />
              <input type="hidden" name="codAutoConfirmAboveRate" value={String(settings.codAutoConfirmAboveRate)} />
              <input type="hidden" name="codMinOrdersRequired" value={String(settings.codMinOrdersRequired)} />

              {/* Toggle */}
              <label className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-gray-800">অটো কুরিয়ার ডিসপ্যাচ চালু করুন</p>
                  <p className="text-xs text-gray-500 mt-0.5">ডিফল্টে বন্ধ — আপনি চাইলে চালু করতে পারবেন</p>
                </div>
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    name="autoDispatchCourier"
                    value="true"
                    defaultChecked={settings.autoDispatchCourier}
                    className="sr-only peer"
                    id="autoDispatchMobile"
                  />
                  <label
                    htmlFor="autoDispatchMobile"
                    className="w-11 h-6 bg-gray-200 peer-checked:bg-emerald-500 rounded-full block cursor-pointer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"
                  />
                </div>
              </label>

              {/* Info box */}
              <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700 border border-emerald-100">
                <p className="font-semibold mb-1">⚙️ এটি চালু থাকলে:</p>
                <ul className="space-y-1 list-disc list-inside text-emerald-600">
                  <li>অর্ডার auto-confirm হওয়ার সাথে সাথে কুরিয়ারে বুক হবে</li>
                  <li>Settings &gt; Courier-এ যে provider সেট আছে সেটিতে বুক হবে</li>
                  <li>Courier বুকিং ব্যর্থ হলেও অর্ডার cancel হবে না</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Auto-Dispatch Setting
              </button>
            </Form>
          </div>

          {/* Phone Blacklist - Mobile */}
          <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Blacklist ({blacklist.length})
            </h2>

            <Form method="post" className="flex gap-2 mb-4" onSubmit={() => { setNewPhone(''); setNewReason(''); }}>
              <input type="hidden" name="intent" value="blacklist_add" />
              <input
                type="text"
                name="phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                required
              />
              <input
                type="text"
                name="reason"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="Reason"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              />
              <button type="submit" className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                <Plus className="w-4 h-4" />
              </button>
            </Form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {blacklist.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No blacklisted numbers</p>
              ) : (
                blacklist.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg">
                    <div>
                      <p className="text-sm font-mono font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-red-500" />
                        {entry.phone}
                      </p>
                      {entry.reason && <p className="text-xs text-gray-500 mt-0.5">{entry.reason}</p>}
                    </div>
                    <blacklistFetcher.Form method="post">
                      <input type="hidden" name="intent" value="blacklist_remove" />
                      <input type="hidden" name="id" value={entry.id} />
                      <button type="submit" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </blacklistFetcher.Form>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Review Queue - Mobile (existing card view) */}
          <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-500" />
              Review ({heldEvents.filter(e => !e.resolvedBy).length})
            </h2>

            {heldEvents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No orders pending 🎉</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {heldEvents.map((event) => {
                  const signals = event.signals ? JSON.parse(event.signals as string) : [];
                  const isPending = !event.resolvedBy;
                  return (
                    <div key={event.id} className={`py-3 space-y-2 ${isPending ? '' : 'opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-medium">{event.phone}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          event.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                          event.riskScore >= 60 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.riskScore}/100
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {signals.slice(0, 3).map((s: { name: string }, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.name}</span>
                        ))}
                      </div>
                      {isPending && (
                        <div className="flex gap-2 pt-1">
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="resolve" />
                            <input type="hidden" name="eventId" value={event.id} />
                            <input type="hidden" name="action" value="approve" />
                            <button type="submit" className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg">✅ Approve</button>
                          </Form>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="resolve" />
                            <input type="hidden" name="eventId" value={event.id} />
                            <input type="hidden" name="action" value="reject" />
                            <button type="submit" className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg">❌ Reject</button>
                          </Form>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="resolve" />
                            <input type="hidden" name="eventId" value={event.id} />
                            <input type="hidden" name="action" value="blacklist" />
                            <button type="submit" className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg">🚫 Block</button>
                          </Form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* How it works - Mobile */}
          <div className="rounded-2xl border border-blue-100/50 shadow-sm bg-blue-50/30 p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📖 কীভাবে কাজ করে?</h3>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• Risk score (0-100) তৈরি হয়</p>
              <p>• <strong>ALLOW</strong> (0-{settings.thresholds.verify - 1}): অটো</p>
              <p>• <strong>VERIFY</strong> ({settings.thresholds.verify}-{settings.thresholds.hold - 1}): OTP</p>
              <p>• <strong>HOLD</strong> ({settings.thresholds.hold}-{settings.thresholds.block - 1}): Review</p>
              <p>• <strong>BLOCK</strong> ({settings.thresholds.block}+): ব্লক</p>
            </div>
          </div>
        </div>

        {/* Fixed Save Button - Mobile */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
          <button
            type="submit"
            form="fraud-settings-form-mobile"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50 shadow-lg"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? t('savingSettings') : t('saveSettings')}
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-emerald-600" />
                Fraud Detection
              </h1>
              <p className="text-gray-600">COD ফ্রড প্রতিরোধ এবং রিস্ক স্কোরিং</p>
            </div>
          </div>
          <ActiveBadge />
        </div>

      {/* Status Messages */}
      {actionData && 'success' in actionData && (
        <div className="bg-emerald-50/50 border border-emerald-200/50 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {actionData.message}
        </div>
      )}
      {actionData && 'error' in actionData && (
        <div className="bg-red-50/50 border border-red-200/50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {actionData.error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-slate-400 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</span>
            <Shield className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-400 mt-0.5">Checks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-emerald-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Allowed</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.allowed}</p>
          <p className="text-xs text-emerald-500 mt-0.5 font-medium">{pct(stats.allowed)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-yellow-400 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Verified</span>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.verified}</p>
          <p className="text-xs text-yellow-500 mt-0.5 font-medium">{pct(stats.verified)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-orange-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Held</span>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.held}</p>
          <p className="text-xs text-orange-500 mt-0.5 font-medium">{pct(stats.held)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-red-500 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Blocked</span>
            <ShieldX className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.blocked}</p>
          <p className="text-xs text-red-500 mt-0.5 font-medium">{pct(stats.blocked)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              Risk Thresholds
            </h2>
          </div>

          <Form method="post" className="space-y-5">
            <input type="hidden" name="intent" value="save_settings" />

            {/* Enable/Disable toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Enable Fraud Detection</p>
                <p className="text-xs text-slate-500 mt-0.5">ফ্রড স্ক্যানিং চালু/বন্ধ করুন</p>
              </div>
              <label htmlFor="enabled-desktop" className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" id="enabled-desktop" name="enabled" value="true" defaultChecked={settings.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Thresholds — 3 column horizontal grid */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Score Thresholds (0–100)</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="border-2 border-yellow-300 rounded-xl p-3 bg-yellow-50/40">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Verify</span>
                  </div>
                  <input
                    type="number"
                    name="verifyThreshold"
                    defaultValue={settings.thresholds.verify}
                    min={10} max={90}
                    className="w-full text-center text-xl font-bold text-yellow-800 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                  />
                  <p className="text-xs text-yellow-600/80 mt-1.5 text-center">OTP / কলে কনফার্ম</p>
                </div>
                <div className="border-2 border-orange-400 rounded-xl p-3 bg-orange-50/40">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Hold</span>
                  </div>
                  <input
                    type="number"
                    name="holdThreshold"
                    defaultValue={settings.thresholds.hold}
                    min={20} max={95}
                    className="w-full text-center text-xl font-bold text-orange-800 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                  />
                  <p className="text-xs text-orange-600/80 mt-1.5 text-center">ম্যানুয়াল রিভিউ queue</p>
                </div>
                <div className="border-2 border-red-400 rounded-xl p-3 bg-red-50/40">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">Block</span>
                  </div>
                  <input
                    type="number"
                    name="blockThreshold"
                    defaultValue={settings.thresholds.block}
                    min={30} max={100}
                    className="w-full text-center text-xl font-bold text-red-800 bg-transparent border-0 focus:outline-none focus:ring-0 p-0"
                  />
                  <p className="text-xs text-red-600/80 mt-1.5 text-center">অটো-ব্লক, prepay লাগবে</p>
                </div>
              </div>
            </div>

            {/* COD Controls */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">COD Controls</h3>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">High risk কাস্টমারের জন্য COD লুকাও</span>
                <label htmlFor="autoHideCOD-d" className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" id="autoHideCOD-d" name="autoHideCOD" value="true" defaultChecked={settings.autoHideCOD} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">সব COD অর্ডারে OTP verify লাগবে</span>
                <label htmlFor="requireOTPForCOD-d" className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" id="requireOTPForCOD-d" name="requireOTPForCOD" value="true" defaultChecked={settings.requireOTPForCOD} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Max COD Amount (৳) — এর বেশি হলে advance লাগবে</label>
                <input
                  type="number"
                  name="maxCODAmount"
                  defaultValue={settings.maxCODAmount || ''}
                  placeholder="No limit"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 font-medium shadow-sm shadow-emerald-200"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? t('savingSettings') : t('saveSettings')}
            </button>
          </Form>
        </div>

        {/* COD Delivery Rate Control - Desktop */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-orange-400 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                COD ডেলিভারি রেট কন্ট্রোল
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                অর্ডার দেওয়ার সময় কাস্টমারের ডেলিভারি হিস্টরি চেক করে স্বয়ংক্রিয়ভাবে COD ব্লক বা কনফার্ম করে।
                নন-COD অর্ডার (bKash, Nagad ইত্যাদি) সবসময় freely pass হবে।
              </p>
            </div>
          </div>

          <Form method="post" className="space-y-5">
            <input type="hidden" name="intent" value="save_settings" />
            <input type="hidden" name="enabled" value={settings.enabled ? 'true' : 'false'} />
            <input type="hidden" name="verifyThreshold" value={settings.thresholds.verify} />
            <input type="hidden" name="holdThreshold" value={settings.thresholds.hold} />
            <input type="hidden" name="blockThreshold" value={settings.thresholds.block} />
            <input type="hidden" name="autoHideCOD" value={settings.autoHideCOD ? 'true' : 'false'} />
            <input type="hidden" name="requireOTPForCOD" value={settings.requireOTPForCOD ? 'true' : 'false'} />
            <input type="hidden" name="maxCODAmount" value={settings.maxCODAmount ?? ''} />

            {/* Master switch — pill toggle */}
            <div className="flex items-center justify-between p-3.5 bg-orange-50 border border-orange-100 rounded-xl">
              <div>
                <span className="text-sm font-semibold text-gray-800">রেট কন্ট্রোল চালু রাখুন</span>
                <p className="text-xs text-gray-500 mt-0.5">বন্ধ করলে সব COD অর্ডার pending — কোনো auto-confirm বা block নয়</p>
              </div>
              <label htmlFor="codRateCtrl-d" className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input type="checkbox" id="codRateCtrl-d" name="codRateControlEnabled" value="true" defaultChecked={settings.codRateControlEnabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
              </label>
            </div>

            {/* Thresholds — 3 columns */}
            <div className="grid grid-cols-3 gap-4">
              {/* Block */}
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-lg">
                <label className="block text-sm font-semibold text-red-700 mb-2">
                  🚫 Block Threshold
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    name="codBlockBelowRate"
                    defaultValue={settings.codBlockBelowRate}
                    min={0} max={99}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-400 text-sm font-medium"
                  />
                  <span className="text-gray-500 font-medium">%</span>
                </div>
                <p className="text-xs text-red-600 mt-2">এর নিচে → COD সম্পূর্ণ ব্লক</p>
              </div>

              {/* Pending zone (read-only label) */}
              <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-lg flex flex-col justify-between">
                <label className="block text-sm font-semibold text-yellow-700 mb-2">
                  ⏳ Pending Zone
                </label>
                <p className="text-2xl font-bold text-yellow-600 text-center py-2">
                  {settings.codBlockBelowRate}% – {settings.codAutoConfirmAboveRate}%
                </p>
                <p className="text-xs text-yellow-700 text-center">আপনি কল করে confirm করবেন</p>
              </div>

              {/* Auto-confirm */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <label className="block text-sm font-semibold text-emerald-700 mb-2">
                  ✅ Auto-Confirm Threshold
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    name="codAutoConfirmAboveRate"
                    defaultValue={settings.codAutoConfirmAboveRate}
                    min={1} max={100}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 text-sm font-medium"
                  />
                  <span className="text-gray-500 font-medium">%</span>
                </div>
                <p className="text-xs text-emerald-600 mt-2">এর উপরে → Auto-Confirmed ✅</p>
              </div>
            </div>

            {/* Min orders */}
            <div className="flex items-center gap-4 p-4 bg-blue-50/40 border border-blue-100 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  📦 Minimum Order History
                </label>
                <p className="text-xs text-gray-500">
                  এর কম অর্ডার হিস্টরি থাকলে নতুন কাস্টমার হিসেবে <strong>pending</strong> রাখবে — block করবে না
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="number"
                  name="codMinOrdersRequired"
                  defaultValue={settings.codMinOrdersRequired}
                  min={1} max={50}
                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 text-sm font-medium text-center"
                />
                <span className="text-gray-500 text-sm">orders</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 font-medium"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Rate Control Settings
            </button>
          </Form>
        </div>

        {/* Auto-Dispatch - Desktop */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500 p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🚀</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">অটো কুরিয়ার ডিসপ্যাচ</h2>
              <p className="text-xs text-gray-500">Full Automation — অর্ডার নিজে নিজে কুরিয়ারে চলে যাবে</p>
            </div>
            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Advanced Feature</span>
          </div>

          <p className="text-sm text-gray-600 mb-5">
            যে কাস্টমারের ডেলিভারি রেট <strong>{settings.codAutoConfirmAboveRate}%</strong>-এর উপরে —
            তাদের অর্ডার auto-confirm হওয়ার সাথে সাথে আপনার সিলেক্টেড কুরিয়ারে বুক হয়ে যাবে।
            কোনো হাত দিতে হবে না।
          </p>

          <Form method="post" className="space-y-5">
            <input type="hidden" name="intent" value="save_settings" />
            <input type="hidden" name="enabled" value={String(settings.enabled)} />
            <input type="hidden" name="verifyThreshold" value={String(settings.thresholds.verify)} />
            <input type="hidden" name="holdThreshold" value={String(settings.thresholds.hold)} />
            <input type="hidden" name="blockThreshold" value={String(settings.thresholds.block)} />
            <input type="hidden" name="autoHideCOD" value={String(settings.autoHideCOD)} />
            <input type="hidden" name="requireOTPForCOD" value={String(settings.requireOTPForCOD)} />
            <input type="hidden" name="maxCODAmount" value={settings.maxCODAmount ?? ''} />
            <input type="hidden" name="codRateControlEnabled" value={String(settings.codRateControlEnabled)} />
            <input type="hidden" name="codBlockBelowRate" value={String(settings.codBlockBelowRate)} />
            <input type="hidden" name="codAutoConfirmAboveRate" value={String(settings.codAutoConfirmAboveRate)} />
            <input type="hidden" name="codMinOrdersRequired" value={String(settings.codMinOrdersRequired)} />

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-800">অটো কুরিয়ার ডিসপ্যাচ চালু করুন</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  ডিফল্টে বন্ধ — সতর্কভাবে ব্যবহার করুন। Courier settings সঠিকভাবে সেটআপ থাকতে হবে।
                </p>
              </div>
              <div className="relative flex-shrink-0 ml-4">
                <input
                  type="checkbox"
                  name="autoDispatchCourier"
                  value="true"
                  defaultChecked={settings.autoDispatchCourier}
                  className="sr-only peer"
                  id="autoDispatchDesktop"
                />
                <label
                  htmlFor="autoDispatchDesktop"
                  className="w-12 h-6 bg-gray-200 peer-checked:bg-emerald-500 rounded-full block cursor-pointer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"
                />
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-sm font-semibold text-emerald-800 mb-2">⚙️ এটি চালু থাকলে যা হবে:</p>
              <ul className="space-y-1.5 text-sm text-emerald-700 list-disc list-inside">
                <li>Delivery rate &gt; {settings.codAutoConfirmAboveRate}% হলে → অর্ডার auto-confirm + কুরিয়ারে বুক</li>
                <li>Settings → Courier-এ যে provider সেট আছে সেটিতে বুক হবে</li>
                <li>Courier বুকিং ব্যর্থ হলেও অর্ডার cancel হবে না (fail-safe)</li>
                <li>Activity log-এ courier booking record রাখা হবে</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Auto-Dispatch Setting
              </button>
            </div>
          </Form>
        </div>

        {/* Phone Blacklist */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-red-400 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            Phone Blacklist ({blacklist.length})
          </h2>

          {/* Add to blacklist */}
          <Form method="post" className="flex gap-2 mb-4" onSubmit={() => { setNewPhone(''); setNewReason(''); }}>
            <input type="hidden" name="intent" value="blacklist_add" />
            <input
              type="text"
              name="phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              required
            />
            <input
              type="text"
              name="reason"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Reason"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </Form>

          {/* Blacklist entries */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {blacklist.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No blacklisted numbers</p>
            ) : (
              blacklist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-mono font-medium text-gray-900 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-red-500" />
                      {entry.phone}
                    </p>
                    {entry.reason && (
                      <p className="text-xs text-gray-500 mt-0.5">{entry.reason}</p>
                    )}
                  </div>
                  <blacklistFetcher.Form method="post">
                    <input type="hidden" name="intent" value="blacklist_remove" />
                    <input type="hidden" name="id" value={entry.id} />
                    <button
                      type="submit"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </blacklistFetcher.Form>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm border-t-4 border-t-orange-400 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-orange-500" />
          Review Queue ({heldEvents.filter(e => !e.resolvedBy).length} pending)
        </h2>

        {heldEvents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No orders pending review 🎉</p>
        ) : (
          <>
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100">
            {heldEvents.map((event) => {
              const signals = event.signals ? JSON.parse(event.signals as string) : [];
              const isPending = !event.resolvedBy;
              return (
                <div key={event.id} className={`p-4 space-y-2 ${isPending ? 'bg-orange-50/30' : 'opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium">{event.phone}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                      event.riskScore >= 60 ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.riskScore}/100
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {signals.slice(0, 3).map((s: { name: string }, i: number) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.name}</span>
                    ))}
                  </div>
                  {isPending && (
                    <div className="flex gap-2 pt-1">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="resolve" />
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="action" value="approve" />
                        <button type="submit" className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg">✅ Approve</button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="resolve" />
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="action" value="reject" />
                        <button type="submit" className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg">❌ Reject</button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="resolve" />
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="action" value="blacklist" />
                        <button type="submit" className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg">🚫 Block</button>
                      </Form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Phone</th>
                  <th className="pb-2 font-medium">Risk Score</th>
                  <th className="pb-2 font-medium">Signals</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {heldEvents.map((event) => {
                  const signals = event.signals ? JSON.parse(event.signals as string) : [];
                  const isPending = !event.resolvedBy;

                  return (
                    <tr key={event.id} className={isPending ? 'bg-orange-50/30' : 'opacity-60'}>
                      <td className="py-3 font-mono">{event.phone}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                          event.riskScore >= 60 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.riskScore}/100
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {signals.slice(0, 3).map((s: { name: string; description: string }, i: number) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {s.name}
                            </span>
                          ))}
                          {signals.length > 3 && (
                            <span className="text-xs text-gray-400">+{signals.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {isPending ? (
                          <span className="text-xs text-orange-600 font-medium">⏳ Pending</span>
                        ) : (
                          <span className="text-xs text-gray-500">{event.resolvedBy}</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isPending && (
                          <div className="flex items-center gap-1 justify-end">
                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="resolve" />
                              <input type="hidden" name="eventId" value={event.id} />
                              <input type="hidden" name="action" value="approve" />
                              <button
                                type="submit"
                                className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition"
                                title="Approve order"
                              >
                                ✅ Approve
                              </button>
                            </Form>
                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="resolve" />
                              <input type="hidden" name="eventId" value={event.id} />
                              <input type="hidden" name="action" value="reject" />
                              <button
                                type="submit"
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                title="Reject order"
                              >
                                ❌ Reject
                              </button>
                            </Form>
                            <Form method="post" className="inline">
                              <input type="hidden" name="intent" value="resolve" />
                              <input type="hidden" name="eventId" value={event.id} />
                              <input type="hidden" name="action" value="blacklist" />
                              <button
                                type="submit"
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                                title="Reject & blacklist"
                              >
                                🚫 Block
                              </button>
                            </Form>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📖 কীভাবে কাজ করে?</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• প্রতিটি অর্ডারে ফোন নম্বর, পেমেন্ট মেথড, অর্ডার ইতিহাস, এবং ঠিকানা চেক করে risk score (0-100) তৈরি হয়</p>
          <p>• <strong>ALLOW</strong> (0-{settings.thresholds.verify - 1}): অটো প্রসেস </p>
          <p>• <strong>VERIFY</strong> ({settings.thresholds.verify}-{settings.thresholds.hold - 1}): OTP/কলে কনফার্ম লাগবে</p>
          <p>• <strong>HOLD</strong> ({settings.thresholds.hold}-{settings.thresholds.block - 1}): Review Queue-তে আসবে, আপনি approve/reject করবেন</p>
          <p>• <strong>BLOCK</strong> ({settings.thresholds.block}+): অটো-ব্লক, COD দেওয়া হবে না</p>
          <p>• ব্ল্যাকলিস্টে থাকা নম্বর সরাসরি BLOCK হবে (score 100)</p>
        </div>
      </div>
      </div>
    </>
  );
}
