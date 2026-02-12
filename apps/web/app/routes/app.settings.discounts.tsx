/**
 * Discount Codes Management
 *
 * Route: /app/settings/discounts
 *
 * Create and manage promo codes with percentage or fixed discounts.
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { discounts, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Tag, Plus, Edit2, Trash2, ArrowLeft, Loader2, Percent, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { GlassCard } from '~/components/ui/GlassCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Discount Codes - Settings' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const codes = await db.select().from(discounts).where(eq(discounts.storeId, storeId));

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
    const id = formData.get('id') ? parseInt(formData.get('id') as string) : null;
    const code = (formData.get('code') as string).toUpperCase().trim();
    const type = formData.get('type') as 'percentage' | 'fixed';
    const value = parseFloat(formData.get('value') as string);
    const minOrderAmount = formData.get('minOrderAmount')
      ? parseFloat(formData.get('minOrderAmount') as string)
      : null;
    const maxDiscountAmount = formData.get('maxDiscountAmount')
      ? parseFloat(formData.get('maxDiscountAmount') as string)
      : null;
    const maxUses = formData.get('maxUses') ? parseInt(formData.get('maxUses') as string) : null;
    const expiresAt = formData.get('expiresAt')
      ? new Date(formData.get('expiresAt') as string)
      : null;

    if (!code || !value) {
      return json({ error: 'Code and value are required' }, { status: 400 });
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
    const id = parseInt(formData.get('id') as string);
    await db.delete(discounts).where(and(eq(discounts.id, id), eq(discounts.storeId, storeId)));
    return json({ success: true });
  }

  if (intent === 'toggle') {
    const id = parseInt(formData.get('id') as string);
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
  const { t, lang } = useTranslation();

  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<(typeof codes)[0] | null>(null);

  const handleEdit = (code: (typeof codes)[0]) => {
    setEditingCode(code);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingCode(null);
    setShowForm(false);
  };

  const isExpired = (expiresAt: string | Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
                      {code.minOrderAmount && <span>Min: {formatPrice(code.minOrderAmount)}</span>}
                      <span>
                        Used: {code.usedCount || 0}
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
  );
}
