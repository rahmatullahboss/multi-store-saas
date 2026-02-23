/**
 * Discount Codes Management
 *
 * Route: /app/settings/discounts
 *
 * Create and manage promo codes with percentage or fixed discounts.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, Link, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, ne, desc } from 'drizzle-orm';
import { discounts, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Tag, Plus, Edit2, Trash2, ArrowLeft, Loader2, Percent, DollarSign, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/lib/formatting';
import { GlassCard } from '~/components/ui/GlassCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Discount Codes - Settings' }];
};

const DISCOUNT_CODE_REGEX = /^[A-Z0-9_-]{3,32}$/;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const codes = await db.select().from(discounts).where(eq(discounts.storeId, storeId)).orderBy(desc(discounts.createdAt));

  const store = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return json({
    codes,
    currency: store[0]?.currency || 'BDT',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'create' || intent === 'update') {
    const idRaw = formData.get('id');
    const id = idRaw ? Number.parseInt(String(idRaw), 10) : null;
    const code = String(formData.get('code') || '')
      .toUpperCase()
      .trim();
    const typeRaw = String(formData.get('type') || '');
    const type = typeRaw === 'fixed' ? 'fixed' : typeRaw === 'percentage' ? 'percentage' : null;
    const valueRaw = String(formData.get('value') || '').trim();
    const value = Number.parseFloat(valueRaw);
    const minOrderAmountRaw = String(formData.get('minOrderAmount') || '').trim();
    const minOrderAmount = minOrderAmountRaw ? Number.parseFloat(minOrderAmountRaw) : null;
    const maxDiscountAmountRaw = String(formData.get('maxDiscountAmount') || '').trim();
    const maxDiscountAmount = maxDiscountAmountRaw ? Number.parseFloat(maxDiscountAmountRaw) : null;
    const maxUsesRaw = String(formData.get('maxUses') || '').trim();
    const maxUses = maxUsesRaw ? Number.parseInt(maxUsesRaw, 10) : null;
    const expiresAtRaw = String(formData.get('expiresAt') || '').trim();
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

    if (intent === 'update' && (!id || Number.isNaN(id) || id <= 0)) {
      return json({ error: 'Invalid discount id' }, { status: 400 });
    }

    if (!code || !DISCOUNT_CODE_REGEX.test(code)) {
      return json(
        { error: 'Discount code must be 3-32 chars (A-Z, 0-9, _ or -)' },
        { status: 400 }
      );
    }

    if (!type) {
      return json({ error: 'Invalid discount type' }, { status: 400 });
    }

    if (!Number.isFinite(value) || value <= 0) {
      return json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    if (type === 'percentage' && value > 100) {
      return json({ error: 'Percentage discount cannot exceed 100' }, { status: 400 });
    }

    if (minOrderAmount !== null && (!Number.isFinite(minOrderAmount) || minOrderAmount < 0)) {
      return json({ error: 'Minimum order amount must be 0 or higher' }, { status: 400 });
    }

    if (
      maxDiscountAmount !== null &&
      (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)
    ) {
      return json({ error: 'Max discount amount must be greater than 0' }, { status: 400 });
    }

    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses <= 0)) {
      return json({ error: 'Max uses must be a positive integer' }, { status: 400 });
    }

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return json({ error: 'Invalid expiry date' }, { status: 400 });
    }

    const existingCode = await db
      .select({ id: discounts.id })
      .from(discounts)
      .where(
        intent === 'update' && id
          ? and(eq(discounts.storeId, storeId), eq(discounts.code, code), ne(discounts.id, id))
          : and(eq(discounts.storeId, storeId), eq(discounts.code, code))
      )
      .limit(1);

    if (existingCode.length > 0) {
      return json({ error: 'Discount code already exists' }, { status: 409 });
    }

    if (id) {
      await db
        .update(discounts)
        .set({
          code,
          type,
          value,
          minOrderAmount,
          maxDiscountAmount,
          maxUses,
          expiresAt,
          updatedAt: new Date(),
        })
        .where(and(eq(discounts.id, id), eq(discounts.storeId, storeId)));
    } else {
      await db.insert(discounts).values({
        storeId,
        code,
        type,
        value,
        minOrderAmount,
        maxDiscountAmount,
        maxUses,
        expiresAt,
      });
    }

    return json({ success: true });
  }

  if (intent === 'delete') {
    const id = Number.parseInt(String(formData.get('id') || ''), 10);
    if (!Number.isInteger(id) || id <= 0) {
      return json({ error: 'Invalid discount id' }, { status: 400 });
    }
    await db.delete(discounts).where(and(eq(discounts.id, id), eq(discounts.storeId, storeId)));
    return json({ success: true });
  }

  if (intent === 'toggle') {
    const id = Number.parseInt(String(formData.get('id') || ''), 10);
    if (!Number.isInteger(id) || id <= 0) {
      return json({ error: 'Invalid discount id' }, { status: 400 });
    }
    const isActive = formData.get('isActive') === 'true';
    await db
      .update(discounts)
      .set({ isActive: !isActive, updatedAt: new Date() })
      .where(and(eq(discounts.id, id), eq(discounts.storeId, storeId)));
    return json({ success: true });
  }

  return json({ error: 'Unknown intent' }, { status: 400 });
}

export default function DiscountCodesPage() {
  const { codes, currency } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

  const actionData = useActionData<typeof action>();
  const formRef = useRef<HTMLDivElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<(typeof codes)[0] | null>(null);

  const handleCancel = useCallback(() => {
    setEditingCode(null);
    setShowForm(false);
  }, []);

  const handleEdit = (code: (typeof codes)[0]) => {
    setEditingCode(code);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      handleCancel();
    }
  }, [actionData, handleCancel]);

  const isExpired = (expiresAt: string | Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Mobile Sticky Header */}
      <div className="md:hidden -mx-4 -mt-4">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 h-[60px]">
            <Link to="/app/settings" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight">{t('discounts')}</h1>
            <div className="w-10" />
          </div>
        </header>
        {/* Mobile content with p-4 padding */}
        <div className="p-4 pb-32 flex flex-col gap-5">
          {/* Mobile Add Code Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-2xl py-3 font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-5 h-5" />
              {t('addCode')}
            </button>
          )}

          {actionData && 'error' in actionData && actionData.error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
              {actionData.error}
            </div>
          )}
          {actionData && 'success' in actionData && actionData.success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> {t('saved')}
            </div>
          )}

          {/* Mobile Form */}
          {showForm && (
            <div ref={formRef} className="rounded-2xl border border-gray-100 shadow-sm bg-white p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                {editingCode ? t('editDiscountCode') : t('newDiscountCode')}
              </h2>
              <Form method="post" className="space-y-4">
                <input type="hidden" name="intent" value={editingCode ? 'update' : 'create'} />
                {editingCode && <input type="hidden" name="id" value={editingCode.id} />}

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('codeLabel')} *
                    </label>
                    <input
                      type="text"
                      name="code"
                      defaultValue={editingCode?.code || ''}
                      placeholder="SAVE20"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                    <select
                      name="type"
                      defaultValue={editingCode?.type || 'percentage'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      <option value="percentage">{t('percentage')} (%)</option>
                      <option value="fixed">
                        {t('fixedAmount')} ({currency})
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('discountValue')} *
                    </label>
                    <input
                      type="number"
                      name="value"
                      defaultValue={editingCode?.value || ''}
                      placeholder="20"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('minOrder')} ({currency})
                    </label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      defaultValue={editingCode?.minOrderAmount || ''}
                      placeholder="500 (optional)"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('maxDiscount')} ({currency})
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      defaultValue={editingCode?.maxDiscountAmount || ''}
                      placeholder="100 (optional)"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('maxUses')}
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      defaultValue={editingCode?.maxUses || ''}
                      placeholder="100 (optional)"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expiresAt')}
                    </label>
                    <input
                      type="date"
                      name="expiresAt"
                      defaultValue={
                        editingCode?.expiresAt
                          ? new Date(editingCode.expiresAt).toISOString().split('T')[0]
                          : ''
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingCode ? t('updateCode') : t('createCode')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition font-medium"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </Form>
            </div>
          )}

          {/* Mobile Codes List */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
              {t('discounts')}
            </h2>
            {codes.length > 0 ? (
              <div className="flex flex-col gap-3">
                {codes.map((code) => (
                  <div
                    key={code.id}
                    className={`rounded-2xl border border-gray-100 shadow-sm bg-white p-4 ${!code.isActive || isExpired(code.expiresAt) ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${code.type === 'percentage' ? 'bg-purple-100' : 'bg-emerald-100'}`}
                        >
                          {code.type === 'percentage' ? (
                            <Percent className="w-5 h-5 text-purple-600" />
                          ) : (
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-gray-900">{code.code}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {code.type === 'percentage' ? (
                              <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                {t('percentage')}
                              </span>
                            ) : (
                              <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                {t('fixedAmount')}
                              </span>
                            )}
                            {!code.isActive && (
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                {t('disabled')}
                              </span>
                            )}
                            {isExpired(code.expiresAt) && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                {t('expired')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p className="font-medium text-emerald-600">
                        {code.type === 'percentage'
                          ? t('percentageOff').replace('{{value}}', String(code.value))
                          : t('fixedOff').replace('{{value}}', formatPrice(code.value))}
                      </p>
                      {code.minOrderAmount && <p>{t('minOrder')}: {formatPrice(code.minOrderAmount)}</p>}
                      <p>
                        {t('usedCount')}: {code.usedCount || 0}
                        {code.maxUses ? `/${code.maxUses}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Form method="post" className="flex-1">
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="id" value={code.id} />
                        <input type="hidden" name="isActive" value={String(code.isActive)} />
                        <button
                          type="submit"
                          className={`w-full py-2 text-sm rounded-xl transition font-medium ${code.isActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                        >
                          {code.isActive ? t('disable') : t('enable')}
                        </button>
                      </Form>
                      <button
                        onClick={() => handleEdit(code)}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <Form method="post">
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="id" value={code.id} />
                        <button
                          type="submit"
                          className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition"
                          onClick={(e) => {
                            if (!confirm(t('deleteCodeConfirm'))) e.preventDefault();
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
              <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-8 text-center">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t('noDiscountCodes')}</p>
                <button onClick={() => setShowForm(true)} className="text-emerald-600 hover:underline font-medium">
                  {t('createFirstCode')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('discounts')}</h1>
              <p className="text-gray-600">{t('discountsDesc')}</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" />
              {t('addCode')}
            </button>
          )}
        </div>

        {actionData && 'error' in actionData && actionData.error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm">
            {actionData.error}
          </div>
        )}
        {actionData && 'success' in actionData && actionData.success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {t('saved')}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingCode ? t('editDiscountCode') : t('newDiscountCode')}
            </h2>
            <Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value={editingCode ? 'update' : 'create'} />
              {editingCode && <input type="hidden" name="id" value={editingCode.id} />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('codeLabel')} *
                  </label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={editingCode?.code || ''}
                    placeholder="SAVE20"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                  <select
                    name="type"
                    defaultValue={editingCode?.type || 'percentage'}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  >
                    <option value="percentage">{t('percentage')} (%)</option>
                    <option value="fixed">
                      {t('fixedAmount')} ({currency})
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('discountValue')} *
                  </label>
                  <input
                    type="number"
                    name="value"
                    defaultValue={editingCode?.value || ''}
                    placeholder="20"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('minOrder')} ({currency})
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    defaultValue={editingCode?.minOrderAmount || ''}
                    placeholder="500 (optional)"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maxDiscount')} ({currency})
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    defaultValue={editingCode?.maxDiscountAmount || ''}
                    placeholder="100 (optional)"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('maxUses')}
                  </label>
                  <input
                    type="number"
                    name="maxUses"
                    defaultValue={editingCode?.maxUses || ''}
                    placeholder="100 (optional)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('expiresAt')}
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    defaultValue={
                      editingCode?.expiresAt
                        ? new Date(editingCode.expiresAt).toISOString().split('T')[0]
                        : ''
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCode ? t('updateCode') : t('createCode')}
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
          </GlassCard>
        )}

        {/* Codes List */}
        <GlassCard intensity="low" className="overflow-hidden p-0">
          {codes.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className={`p-4 flex items-center justify-between hover:bg-white/40 transition ${!code.isActive || isExpired(code.expiresAt) ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${code.type === 'percentage' ? 'bg-purple-100/50' : 'bg-emerald-100/50'} backdrop-blur-sm`}
                    >
                      {code.type === 'percentage' ? (
                        <Percent className="w-5 h-5 text-purple-600" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-bold text-gray-900">{code.code}</p>
                        {!code.isActive && (
                          <span className="text-xs bg-gray-200/50 text-gray-600 px-2 py-0.5 rounded backdrop-blur-sm">
                            {t('disabled')}
                          </span>
                        )}
                        {isExpired(code.expiresAt) && (
                          <span className="text-xs bg-red-100/50 text-red-600 px-2 py-0.5 rounded backdrop-blur-sm">
                            {t('expired')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="font-medium text-emerald-600">
                          {code.type === 'percentage'
                            ? t('percentageOff').replace('{{value}}', String(code.value))
                            : t('fixedOff').replace('{{value}}', formatPrice(code.value))}
                        </span>
                        {code.minOrderAmount && <span>{t('minOrder')}: {formatPrice(code.minOrderAmount)}</span>}
                        <span>
                          {t('usedCount')}: {code.usedCount || 0}
                          {code.maxUses ? `/${code.maxUses}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Form method="post">
                      <input type="hidden" name="intent" value="toggle" />
                      <input type="hidden" name="id" value={code.id} />
                      <input type="hidden" name="isActive" value={String(code.isActive)} />
                      <button
                        type="submit"
                        className={`px-3 py-1 text-xs rounded-lg transition ${code.isActive ? 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50' : 'bg-emerald-100/50 text-emerald-600 hover:bg-emerald-200/50'}`}
                      >
                        {code.isActive ? t('disable') : t('enable')}
                      </button>
                    </Form>
                    <button
                      onClick={() => handleEdit(code)}
                      className="p-2 hover:bg-gray-100/50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <Form method="post">
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={code.id} />
                      <button
                        type="submit"
                        className="p-2 hover:bg-red-50/50 rounded-lg transition"
                        onClick={(e) => {
                          if (!confirm(t('deleteCodeConfirm'))) e.preventDefault();
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
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">{t('noDiscountCodes')}</p>
              <button onClick={() => setShowForm(true)} className="text-emerald-600 hover:underline">
                {t('createFirstCode')}
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
