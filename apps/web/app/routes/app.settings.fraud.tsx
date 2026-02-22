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

  // Stats
  const allEvents = await db
    .select({
      id: fraudEvents.id,
      decision: fraudEvents.decision,
    })
    .from(fraudEvents)
    .where(eq(fraudEvents.storeId, storeId))
    .limit(1000);

  const stats = {
    total: allEvents.length,
    allowed: allEvents.filter(e => e.decision === 'allow').length,
    verified: allEvents.filter(e => e.decision === 'verify').length,
    held: allEvents.filter(e => e.decision === 'hold').length,
    blocked: allEvents.filter(e => e.decision === 'block').length,
  };

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
    const action = formData.get('action') as string;

    if (!eventId || !action) {
      return json({ error: 'Event ID and action required' }, { status: 400 });
    }

    const event = await db.select().from(fraudEvents).where(
      and(eq(fraudEvents.id, eventId), eq(fraudEvents.storeId, storeId))
    ).get();

    if (!event) return json({ error: 'Event not found' }, { status: 404 });

    await db.update(fraudEvents).set({
      resolvedBy: `merchant:${action}`,
      resolvedAt: new Date(),
    }).where(eq(fraudEvents.id, eventId));

    if (event.orderId) {
      if (action === 'approve') {
        await db.update(orders).set({ status: 'confirmed', updatedAt: new Date() })
          .where(and(eq(orders.id, event.orderId), eq(orders.storeId, storeId)));
      } else if (action === 'reject' || action === 'blacklist') {
        await db.update(orders).set({ status: 'cancelled', updatedAt: new Date() })
          .where(and(eq(orders.id, event.orderId), eq(orders.storeId, storeId)));

        if (action === 'blacklist') {
          await db.insert(phoneBlacklist).values({
            phone: event.phone,
            storeId,
            reason: `Blacklisted from review (Event #${eventId})`,
            addedBy: 'merchant',
          });
        }
      }
    }

    return json({ success: true, message: `Order ${action}d` });
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

  return (
    <div className="space-y-6">
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

        <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
          settings.enabled
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}>
          {settings.enabled ? (
            <><ShieldCheck className="w-4 h-4" /><span className="text-sm font-medium">Active</span></>
          ) : (
            <><ShieldX className="w-4 h-4" /><span className="text-sm font-medium">Inactive</span></>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {actionData && 'success' in actionData && (
        <GlassCard className="bg-emerald-50/50 border-emerald-200/50 text-emerald-800 px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {actionData.message}
        </GlassCard>
      )}
      {actionData && 'error' in actionData && (
        <GlassCard className="bg-red-50/50 border-red-200/50 text-red-600 px-4 py-3 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {actionData.error}
        </GlassCard>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Checks</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.allowed}</p>
          <p className="text-xs text-gray-500">Allowed</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.verified}</p>
          <p className="text-xs text-gray-500">Verified</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.held}</p>
          <p className="text-xs text-gray-500">Held</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
          <p className="text-xs text-gray-500">Blocked</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
            Risk Thresholds
          </h2>

          <Form method="post" className="space-y-5">
            <input type="hidden" name="intent" value="save_settings" />

            {/* Enable/Disable */}
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

            {/* Thresholds */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ⚠️ Verify Threshold (OTP/কলে কনফার্ম)
                </label>
                <input
                  type="number"
                  name="verifyThreshold"
                  defaultValue={settings.thresholds.verify}
                  min={10} max={90}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Score {settings.thresholds.verify}+ → অর্ডার verify করতে হবে</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔶 Hold Threshold (ম্যানুয়াল রিভিউ)
                </label>
                <input
                  type="number"
                  name="holdThreshold"
                  defaultValue={settings.thresholds.hold}
                  min={20} max={95}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-400 mt-1">Score {settings.thresholds.hold}+ → মার্চেন্ট রিভিউ queue-তে যাবে</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🚫 Block Threshold (অটো-ব্লক)
                </label>
                <input
                  type="number"
                  name="blockThreshold"
                  defaultValue={settings.thresholds.block}
                  min={30} max={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-400 mt-1">Score {settings.thresholds.block}+ → COD ব্লক, prepay লাগবে</p>
              </div>
            </div>

            {/* COD Controls */}
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
                <span className="text-sm text-gray-600">High risk কাস্টমারের জন্য COD লুকাও</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requireOTPForCOD"
                  value="true"
                  defaultChecked={settings.requireOTPForCOD}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600"
                />
                <span className="text-sm text-gray-600">সব COD অর্ডারে OTP verify লাগবে</span>
              </label>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Max COD Amount (৳) — এর বেশি হলে advance লাগবে</label>
                <input
                  type="number"
                  name="maxCODAmount"
                  defaultValue={settings.maxCODAmount || ''}
                  placeholder="No limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </Form>
        </GlassCard>

        {/* Phone Blacklist */}
        <GlassCard className="p-6">
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
        </GlassCard>
      </div>

      {/* Review Queue */}
      <GlassCard className="p-6">
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
      </GlassCard>

      {/* How it works */}
      <GlassCard className="p-6 bg-blue-50/30 border-blue-100/50">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📖 কীভাবে কাজ করে?</h3>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• প্রতিটি অর্ডারে ফোন নম্বর, পেমেন্ট মেথড, অর্ডার ইতিহাস, এবং ঠিকানা চেক করে risk score (0-100) তৈরি হয়</p>
          <p>• <strong>ALLOW</strong> (0-{settings.thresholds.verify - 1}): অটো প্রসেস </p>
          <p>• <strong>VERIFY</strong> ({settings.thresholds.verify}-{settings.thresholds.hold - 1}): OTP/কলে কনফার্ম লাগবে</p>
          <p>• <strong>HOLD</strong> ({settings.thresholds.hold}-{settings.thresholds.block - 1}): Review Queue-তে আসবে, আপনি approve/reject করবেন</p>
          <p>• <strong>BLOCK</strong> ({settings.thresholds.block}+): অটো-ব্লক, COD দেওয়া হবে না</p>
          <p>• ব্ল্যাকলিস্টে থাকা নম্বর সরাসরি BLOCK হবে (score 100)</p>
        </div>
      </GlassCard>
    </div>
  );
}
