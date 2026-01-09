/**
 * Discount Codes Management
 * 
 * Route: /app/discounts
 * 
 * Features:
 * - Create/edit discount codes
 * - Percentage or fixed amount discounts
 * - Set min order, max uses, expiry date
 * - Toggle active/inactive
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { discounts, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  Percent, 
  DollarSign,
  Calendar,
  Users,
  Copy
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Discount Codes - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const [allDiscounts, storeData] = await Promise.all([
    db.select().from(discounts).where(eq(discounts.storeId, storeId)),
    db.select({ currency: stores.currency }).from(stores).where(eq(stores.id, storeId)).limit(1),
  ]);

  return json({
    discounts: allDiscounts,
    currency: storeData[0]?.currency || 'BDT',
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  try {
    if (intent === 'create' || intent === 'update') {
      const id = formData.get('id') as string;
      const code = (formData.get('code') as string)?.toUpperCase().trim();
      const type = formData.get('type') as 'percentage' | 'fixed';
      const value = parseFloat(formData.get('value') as string) || 0;
      const minOrderAmount = formData.get('minOrderAmount') as string;
      const maxDiscountAmount = formData.get('maxDiscountAmount') as string;
      const maxUses = formData.get('maxUses') as string;
      const expiresAt = formData.get('expiresAt') as string;
      const isActive = formData.get('isActive') === 'true';

      // Validation
      if (!code || code.length < 3) {
        return json({ error: 'Code must be at least 3 characters' }, { status: 400 });
      }
      if (value <= 0) {
        return json({ error: 'Discount value must be greater than 0' }, { status: 400 });
      }
      if (type === 'percentage' && value > 100) {
        return json({ error: 'Percentage cannot exceed 100%' }, { status: 400 });
      }

      const data = {
        code,
        type,
        value,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
        updatedAt: new Date(),
      };

      if (intent === 'create') {
        // Check if code already exists
        const existing = await db
          .select()
          .from(discounts)
          .where(and(eq(discounts.storeId, storeId), eq(discounts.code, code)))
          .limit(1);

        if (existing.length > 0) {
          return json({ error: 'This code already exists' }, { status: 400 });
        }

        await db.insert(discounts).values({
          storeId,
          ...data,
        });
        return json({ success: true, message: 'Discount code created!' });
      } else {
        await db
          .update(discounts)
          .set(data)
          .where(and(eq(discounts.id, parseInt(id)), eq(discounts.storeId, storeId)));
        return json({ success: true, message: 'Discount code updated!' });
      }
    }

    if (intent === 'delete') {
      const id = formData.get('id') as string;
      await db
        .delete(discounts)
        .where(and(eq(discounts.id, parseInt(id)), eq(discounts.storeId, storeId)));
      return json({ success: true, message: 'Discount code deleted!' });
    }

    if (intent === 'toggle') {
      const id = formData.get('id') as string;
      const isActive = formData.get('isActive') === 'true';
      await db
        .update(discounts)
        .set({ isActive: !isActive, updatedAt: new Date() })
        .where(and(eq(discounts.id, parseInt(id)), eq(discounts.storeId, storeId)));
      return json({ success: true });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Discount action error:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function DiscountsPage() {
  const { discounts: allDiscounts, currency } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<typeof allDiscounts[0] | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    const symbols: Record<string, string> = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const handleEdit = (discount: typeof allDiscounts[0]) => {
    setEditingDiscount(discount);
    setDiscountType(discount.type || 'percentage');
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingDiscount(null);
    setDiscountType('percentage');
    setShowForm(false);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: Date | string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('discounts')}</h1>
          <p className="text-gray-600">{lang === 'bn' ? 'বিক্রয় বাড়াতে প্রোমো কোড তৈরি করুন' : 'Create promo codes to boost sales'}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Code
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {actionData && 'success' in actionData && actionData.success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {'message' in actionData ? String(actionData.message) : 'Action completed!'}
        </div>
      )}
      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
          </h2>
          
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value={editingDiscount ? 'update' : 'create'} />
            {editingDiscount && <input type="hidden" name="id" value={editingDiscount.id} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Code *
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  required
                  defaultValue={editingDiscount?.code || ''}
                  placeholder="e.g., SAVE20"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 flex items-center justify-center gap-2 transition ${
                      discountType === 'percentage'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 flex items-center justify-center gap-2 transition ${
                      discountType === 'fixed'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Fixed
                  </button>
                </div>
                <input type="hidden" name="type" value={discountType} />
              </div>

              {/* Value */}
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                  {discountType === 'percentage' ? 'Percentage Off (%)' : `Amount Off (${currency})`}
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  required
                  min="0"
                  max={discountType === 'percentage' ? 100 : undefined}
                  step={discountType === 'percentage' ? 1 : 0.01}
                  defaultValue={editingDiscount?.value || ''}
                  placeholder={discountType === 'percentage' ? '20' : '100'}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Min Order */}
              <div>
                <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order ({currency})
                </label>
                <input
                  type="number"
                  id="minOrderAmount"
                  name="minOrderAmount"
                  min="0"
                  step="0.01"
                  defaultValue={editingDiscount?.minOrderAmount || ''}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Max Discount (for percentage) */}
              {discountType === 'percentage' && (
                <div>
                  <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Discount Cap ({currency})
                  </label>
                  <input
                    type="number"
                    id="maxDiscountAmount"
                    name="maxDiscountAmount"
                    min="0"
                    step="0.01"
                    defaultValue={editingDiscount?.maxDiscountAmount || ''}
                    placeholder="Optional"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Max Uses */}
              <div>
                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Uses (Total)
                </label>
                <input
                  type="number"
                  id="maxUses"
                  name="maxUses"
                  min="1"
                  defaultValue={editingDiscount?.maxUses || ''}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  defaultValue={editingDiscount?.expiresAt ? new Date(editingDiscount.expiresAt).toISOString().split('T')[0] : ''}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                value="true"
                defaultChecked={editingDiscount?.isActive !== false}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Code is active
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingDiscount ? 'Update Code' : 'Create Code'
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Discounts List */}
      {allDiscounts.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              Your Discount Codes ({allDiscounts.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {allDiscounts.map((discount) => {
              const expired = isExpired(discount.expiresAt);
              const exhausted = discount.maxUses && (discount.usedCount || 0) >= discount.maxUses;
              const inactive = !discount.isActive || expired || exhausted;

              return (
                <div
                  key={discount.id}
                  className={`p-4 flex items-center justify-between ${inactive ? 'bg-gray-50 opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      inactive ? 'bg-gray-200' : 'bg-emerald-100'
                    }`}>
                      {discount.type === 'percentage' ? (
                        <Percent className={`w-6 h-6 ${inactive ? 'text-gray-400' : 'text-emerald-600'}`} />
                      ) : (
                        <DollarSign className={`w-6 h-6 ${inactive ? 'text-gray-400' : 'text-emerald-600'}`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 font-mono">{discount.code}</h3>
                        <button
                          onClick={() => copyCode(discount.code)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                          title="Copy code"
                        >
                          {copiedCode === discount.code ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="font-medium text-emerald-600">
                          {discount.type === 'percentage' 
                            ? `${discount.value}% off` 
                            : `${formatPrice(discount.value)} off`
                          }
                        </span>
                        {discount.minOrderAmount && (
                          <span>Min: {formatPrice(discount.minOrderAmount)}</span>
                        )}
                        {discount.maxUses && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {discount.usedCount || 0}/{discount.maxUses} used
                          </span>
                        )}
                        {discount.expiresAt && (
                          <span className={`flex items-center gap-1 ${expired ? 'text-red-500' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            {expired ? 'Expired' : `Expires ${new Date(discount.expiresAt).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Active */}
                    <Form method="post">
                      <input type="hidden" name="intent" value="toggle" />
                      <input type="hidden" name="id" value={discount.id} />
                      <input type="hidden" name="isActive" value={discount.isActive ? 'true' : 'false'} />
                      <button
                        type="submit"
                        className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                          discount.isActive
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </Form>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(discount)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <Form method="post" onSubmit={(e) => {
                      if (!confirm('Delete this discount code?')) {
                        e.preventDefault();
                      }
                    }}>
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={discount.id} />
                      <button
                        type="submit"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discount codes yet</h3>
          <p className="text-gray-500 mb-6">Create promo codes to attract more customers</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Your First Code
          </button>
        </div>
      )}
    </div>
  );
}
