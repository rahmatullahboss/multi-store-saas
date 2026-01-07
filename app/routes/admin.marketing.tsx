/**
 * Admin Marketing - Coupon Management
 * 
 * Route: /admin/marketing
 * 
 * Super Admin UI for managing SaaS subscription coupons.
 * These coupons discount the subscription plan fees, not product prices.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { requireSuperAdmin } from '~/services/auth.server';
import {
  getAllSaasCoupons,
  createSaasCoupon,
  deleteSaasCoupon,
  toggleCouponStatus,
} from '~/utils/coupon.server';
import type { SaasCoupon } from '@db/schema';

export const meta: MetaFunction = () => {
  return [{ title: 'Marketing - Coupons | Super Admin' }];
};

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, db);

  const coupons = await getAllSaasCoupons(db);

  return json({ coupons });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const db = context.cloudflare.env.DB;
  await requireSuperAdmin(request, db);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'create') {
    const code = formData.get('code') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountAmount = parseFloat(formData.get('discountAmount') as string);
    const maxUses = formData.get('maxUses') as string;
    const expiresAt = formData.get('expiresAt') as string;

    if (!code || !discountType || isNaN(discountAmount)) {
      return json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    const result = await createSaasCoupon(db, {
      code,
      discountType,
      discountAmount,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    if (!result.success) {
      return json({ error: result.error }, { status: 400 });
    }

    return json({ success: true, message: 'Coupon created successfully' });
  }

  if (intent === 'delete') {
    const couponId = parseInt(formData.get('couponId') as string);
    await deleteSaasCoupon(db, couponId);
    return json({ success: true, message: 'Coupon deleted' });
  }

  if (intent === 'toggle') {
    const couponId = parseInt(formData.get('couponId') as string);
    const result = await toggleCouponStatus(db, couponId);
    return json({ success: true, isActive: result.isActive });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminMarketingPage() {
  const { coupons } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ error?: string; success?: boolean }>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountAmount: '',
    maxUses: '',
    expiresAt: '',
  });

  const isSubmitting = fetcher.state === 'submitting';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      { intent: 'create', ...formData },
      { method: 'POST' }
    );
    // Reset form after submission
    setFormData({
      code: '',
      discountType: 'percentage',
      discountAmount: '',
      maxUses: '',
      expiresAt: '',
    });
    setShowForm(false);
  };

  const formatDiscount = (coupon: typeof coupons[0]) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountAmount}%`;
    }
    return `৳${coupon.discountAmount}`;
  };

  const formatUsage = (coupon: typeof coupons[0]) => {
    const usedCount = coupon.usedCount ?? 0;
    if (coupon.maxUses === null) {
      return `${usedCount}/∞`;
    }
    return `${usedCount}/${coupon.maxUses}`;
  };

  const getStatus = (coupon: typeof coupons[0]) => {
    if (!coupon.isActive) {
      return { label: 'Inactive', color: 'gray' };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { label: 'Expired', color: 'red' };
    }
    if (coupon.maxUses !== null && (coupon.usedCount ?? 0) >= coupon.maxUses) {
      return { label: 'Exhausted', color: 'orange' };
    }
    return { label: 'Active', color: 'green' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            Marketing - Coupons
          </h1>
          <p className="text-slate-400 mt-1">
            Manage subscription discount coupons for plan upgrades
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="w-4 h-4" />
          New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Coupon Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., START50"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Discount Type *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, discountType: 'percentage' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                    formData.discountType === 'percentage'
                      ? 'bg-pink-600 border-pink-500 text-white'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, discountType: 'fixed' }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
                    formData.discountType === 'fixed'
                      ? 'bg-pink-600 border-pink-500 text-white'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Fixed (৳)
                </button>
              </div>
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount (৳)'} *
              </label>
              <input
                type="number"
                value={formData.discountAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, discountAmount: e.target.value }))}
                placeholder={formData.discountType === 'percentage' ? 'e.g., 50' : 'e.g., 500'}
                min="1"
                max={formData.discountType === 'percentage' ? '100' : undefined}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Uses (optional)
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Expires At */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expiry Date (optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Coupon
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {fetcher.data?.error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {fetcher.data.error}
            </div>
          )}
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No coupons yet</p>
                    <p className="text-sm">Create your first coupon to offer discounts on subscriptions</p>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const status = getStatus(coupon);
                  return (
                    <tr key={coupon.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <span className="font-mono text-lg font-bold text-pink-400">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {coupon.discountType === 'percentage' ? (
                            <Percent className="w-4 h-4 text-slate-400" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-white font-medium">
                            {formatDiscount(coupon)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">
                          {formatUsage(coupon)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">
                          {coupon.expiresAt 
                            ? new Date(coupon.expiresAt).toLocaleDateString() 
                            : 'Never'
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          status.color === 'green' ? 'bg-green-500/20 text-green-400' :
                          status.color === 'red' ? 'bg-red-500/20 text-red-400' :
                          status.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active */}
                          <fetcher.Form method="POST">
                            <input type="hidden" name="intent" value="toggle" />
                            <input type="hidden" name="couponId" value={coupon.id} />
                            <button
                              type="submit"
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                              title={coupon.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {coupon.isActive ? (
                                <ToggleRight className="w-5 h-5 text-green-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                          </fetcher.Form>

                          {/* Delete */}
                          <fetcher.Form 
                            method="POST"
                            onSubmit={(e) => {
                              if (!confirm('Are you sure you want to delete this coupon?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="couponId" value={coupon.id} />
                            <button
                              type="submit"
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </fetcher.Form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
