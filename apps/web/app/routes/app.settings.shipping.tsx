/**
 * Shipping Zones Management
 *
 * Route: /app/settings/shipping
 *
 * Manage delivery zones with rates and free shipping thresholds.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { shippingZones, stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { Truck, Plus, Edit2, Trash2, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Shipping Zones - Settings' }];
};

const zoneSchema = z.object({
  id: z.number().int().positive().nullable(),
  name: z.string().trim().min(1).max(80),
  rate: z.number().min(0).max(1000000),
  freeAbove: z.number().min(0).max(10000000).nullable(),
  estimatedDays: z.string().trim().max(80).nullable(),
  regions: z.string().trim().max(2000).nullable(),
});

const simpleShippingSchema = z.object({
  insideDhaka: z.number().min(0).max(1000000),
  outsideDhaka: z.number().min(0).max(1000000),
  freeShippingAbove: z.number().min(0).max(10000000),
  enabled: z.boolean(),
});

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);

  const zones = await db.select().from(shippingZones).where(eq(shippingZones.storeId, storeId));

  const store = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env });

  return json({
    zones,
    currency: store[0]?.currency || 'BDT',
    shippingConfig: unifiedSettings.shippingConfig,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'create' || intent === 'update') {
    const parsed = zoneSchema.safeParse({
      id: formData.get('id') ? Number(formData.get('id')) : null,
      name: (formData.get('name') as string) || '',
      rate: Number(formData.get('rate') || 0),
      freeAbove: formData.get('freeAbove') ? Number(formData.get('freeAbove')) : null,
      estimatedDays: ((formData.get('estimatedDays') as string) || '').trim() || null,
      regions: ((formData.get('regions') as string) || '').trim() || null,
    });
    if (!parsed.success) {
      return json({ error: 'invalid_zone_data' }, { status: 400 });
    }
    const { id, name, rate, freeAbove, estimatedDays, regions } = parsed.data;

    if (id) {
      // Update
      await db
        .update(shippingZones)
        .set({
          name,
          rate,
          freeAbove,
          estimatedDays: estimatedDays || null,
          regions: regions || null,
        })
        .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)));
    } else {
      // Create
      await db.insert(shippingZones).values({
        storeId,
        name,
        rate,
        freeAbove,
        estimatedDays: estimatedDays || null,
        regions: regions || null,
      });
    }

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'shipping',
        intent,
        zoneId: id ?? null,
        hasFreeAbove: freeAbove !== null,
      },
    });

    return json({ success: true });
  }

  if (intent === 'save-simple') {
    const parsed = simpleShippingSchema.safeParse({
      insideDhaka: Number(formData.get('insideDhaka') ?? 60),
      outsideDhaka: Number(formData.get('outsideDhaka') ?? 120),
      freeShippingAbove: Number(formData.get('freeShippingAbove') ?? 0),
      enabled: formData.get('enabled') === 'on',
    });
    if (!parsed.success) {
      return json({ error: 'invalid_shipping_config' }, { status: 400 });
    }
    const { insideDhaka, outsideDhaka, freeShippingAbove, enabled } = parsed.data;

    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      // DrizzleD1Database is generic; cast to the expected base type for this utility
      db as unknown as import('drizzle-orm/d1').DrizzleD1Database<Record<string, unknown>>,
      {
        KV: context.cloudflare.env.STORE_CACHE,
        STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
      },
      storeId,
      {
        shippingConfig: {
          insideDhaka,
          outsideDhaka,
          freeShippingAbove,
          enabled,
        },
      }
    );

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'shipping',
        intent: 'save-simple',
        enabled,
      },
    });

    return json({ success: true });
  }

  if (intent === 'delete') {
    const id = Number(formData.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      return json({ error: 'invalid_zone_id' }, { status: 400 });
    }
    await db
      .delete(shippingZones)
      .where(and(eq(shippingZones.id, id), eq(shippingZones.storeId, storeId)));

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: {
        section: 'shipping',
        intent: 'delete',
        zoneId: id,
      },
    });

    return json({ success: true });
  }

  return json({ error: 'Unknown intent' }, { status: 400 });
}

export default function ShippingZonesPage() {
  const { zones, currency, shippingConfig } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<(typeof zones)[0] | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (zone: (typeof zones)[0]) => {
    setEditingZone(zone);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingZone(null);
    setShowForm(false);
  };

  return (
    <div>
      {actionData && 'error' in actionData && actionData.error && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {actionData.error}
        </div>
      )}
      {actionData && 'success' in actionData && actionData.success && (
        <div className="mx-4 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {t('settingsSaved')}
        </div>
      )}
      {/* Mobile Layout */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-[60px] px-4">
            <Link to="/app/settings" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{t('shippingZones')}</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex flex-col gap-5 p-4 pb-32">
          {/* Simple Shipping Section */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('simpleShipping')}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Form method="post" id="simple-shipping-form-mobile" className="p-4 space-y-4">
                <input type="hidden" name="intent" value="save-simple" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('insideDhaka')} ({currency})
                    </label>
                    <input
                      type="number"
                      name="insideDhaka"
                      defaultValue={shippingConfig.insideDhaka}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('outsideDhaka')} ({currency})
                    </label>
                    <input
                      type="number"
                      name="outsideDhaka"
                      defaultValue={shippingConfig.outsideDhaka}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min="0"
                      step="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('freeShippingAbove')} ({currency})
                    </label>
                    <input
                      type="number"
                      name="freeShippingAbove"
                      defaultValue={shippingConfig.freeShippingAbove}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      min="0"
                      step="50"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="enabled"
                    defaultChecked={shippingConfig.enabled}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  {t('enableShippingCharges')}
                </label>
                <p className="text-xs text-gray-500">
                  {t('shippingChargesHint')}
                </p>
              </Form>
            </div>
          </div>

          {/* Zone Form Section (Mobile) */}
          {showForm && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                {editingZone ? t('editZone') : t('newShippingZone')}
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Form method="post" className="p-4 space-y-4">
                  <input type="hidden" name="intent" value={editingZone ? 'update' : 'create'} />
                  {editingZone && <input type="hidden" name="id" value={editingZone.id} />}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('zoneName')} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingZone?.name || ''}
                        placeholder={String(t('zoneNamePlaceholder'))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('deliveryRate')} ({currency})
                      </label>
                      <input
                        type="number"
                        name="rate"
                        defaultValue={editingZone?.rate ?? ''}
                        placeholder="60"
                        step="0.01"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('freeShippingAbove')} ({currency})
                      </label>
                      <input
                        type="number"
                        name="freeAbove"
                        defaultValue={editingZone?.freeAbove ?? ''}
                        placeholder={String(t('freeAbovePlaceholder'))}
                        step="0.01"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('estimatedDeliveryTime')}
                      </label>
                      <input
                        type="text"
                        name="estimatedDays"
                        defaultValue={editingZone?.estimatedDays || ''}
                        placeholder={String(t('estimatedDaysPlaceholder'))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('regionsDistricts')}
                      </label>
                      <input
                        type="text"
                        name="regions"
                        defaultValue={editingZone?.regions || ''}
                        placeholder={String(t('regionsPlaceholder'))}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {editingZone ? t('updateZone') : t('createZone')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}

          {/* Zones List Section (Mobile) */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {t('shippingZones')}
              </h2>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="text-xs font-medium text-emerald-600 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {t('addZone')}
                </button>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {zones.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {zones.map((zone) => (
                    <div key={zone.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{zone.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {zone.rate === 0 ? t('free') : formatPrice(zone.rate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <Form method="post">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={zone.id} />
                          <button
                            type="submit"
                            className="p-2 hover:bg-red-50 rounded-lg transition"
                            onClick={(e) => {
                              if (!confirm(t('deleteZoneConfirm'))) e.preventDefault();
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </Form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-3">{t('noShippingZones')}</p>
                  <button onClick={() => setShowForm(true)} className="text-emerald-600 text-sm hover:underline">
                    {t('addFirstZone')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed Save Button (Mobile) */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
          <button
            type="submit"
            form="simple-shipping-form-mobile"
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-2xl hover:bg-emerald-700 transition shadow-lg"
          >
            {t('saveShippingSettings')}
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('shippingZones')}</h1>
            <p className="text-gray-600">{t('shippingZonesSubtitle')}</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            {t('addZone')}
          </button>
        )}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('simpleShippingRecommended')}</h2>
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="save-simple" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('insideDhaka')} ({currency})
              </label>
              <input
                type="number"
                name="insideDhaka"
                defaultValue={shippingConfig.insideDhaka}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                min="0"
                step="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('outsideDhaka')} ({currency})
              </label>
              <input
                type="number"
                name="outsideDhaka"
                defaultValue={shippingConfig.outsideDhaka}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                min="0"
                step="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('freeShippingAbove')} ({currency})
              </label>
              <input
                type="number"
                name="freeShippingAbove"
                defaultValue={shippingConfig.freeShippingAbove}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                min="0"
                step="50"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={shippingConfig.enabled}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            {t('enableShippingCharges')}
          </label>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              {t('saveShippingSettings')}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {t('shippingChargesHint')}
          </p>
        </Form>
      </div>

      {/* Zones Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingZone ? t('editZone') : t('newShippingZone')}
          </h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value={editingZone ? 'update' : 'create'} />
            {editingZone && <input type="hidden" name="id" value={editingZone.id} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('zoneName')} *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingZone?.name || ''}
                  placeholder={String(t('zoneNamePlaceholder'))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('deliveryRate')} ({currency})
                </label>
                <input
                  type="number"
                  name="rate"
                  defaultValue={editingZone?.rate ?? ''}
                  placeholder="60"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('freeShippingAbove')} ({currency})
                </label>
                <input
                  type="number"
                  name="freeAbove"
                  defaultValue={editingZone?.freeAbove ?? ''}
                  placeholder={String(t('freeAbovePlaceholder'))}
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('estimatedDeliveryTime')}
                </label>
                <input
                  type="text"
                  name="estimatedDays"
                  defaultValue={editingZone?.estimatedDays || ''}
                  placeholder={String(t('estimatedDaysPlaceholder'))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('regionsDistricts')}
              </label>
              <input
                type="text"
                name="regions"
                defaultValue={editingZone?.regions || ''}
                placeholder={String(t('regionsPlaceholder'))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingZone ? t('updateZone') : t('createZone')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                {t('cancel')}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Zones List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {zones.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {zones.map((zone) => (
              <div key={zone.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{zone.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {zone.rate === 0 ? t('free') : formatPrice(zone.rate)}
                      </span>
                      {zone.freeAbove && (
                        <span>
                          {t('freeAbove')} {formatPrice(zone.freeAbove)}
                        </span>
                      )}
                      {zone.estimatedDays && <span>{zone.estimatedDays}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(zone)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={zone.id} />
                    <button
                      type="submit"
                      className="p-2 hover:bg-red-50 rounded-lg transition"
                      onClick={(e) => {
                        if (!confirm(t('deleteZoneConfirm'))) e.preventDefault();
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t('noShippingZones')}</p>
            <button onClick={() => setShowForm(true)} className="text-emerald-600 hover:underline">
              {t('addFirstZone')}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
