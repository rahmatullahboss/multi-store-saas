/**
 * Order Bumps Settings Page
 *
 * Route: /app/settings/order-bumps
 *
 * Allows merchants to create and manage order bump offers
 * that appear during checkout to increase Average Order Value (AOV).
 */

import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { useState } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { orderBumps, products, stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { useTranslation } from '~/contexts/LanguageContext';
import {
  Gift,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Package,
  Percent,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '~/lib/formatting';

export const meta: MetaFunction = () => {
  return [{ title: 'Order Bumps - Settings' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);

  // Get store currency
  const store = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .get();

  // Get all order bumps for this store
  const bumps = await db
    .select()
    .from(orderBumps)
    .where(eq(orderBumps.storeId, storeId))
    .orderBy(desc(orderBumps.createdAt));

  // Get all products for dropdowns
  const productsList = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .orderBy(products.title);

  // Enrich bumps with product details
  const enrichedBumps = bumps.map((bump) => {
    const mainProduct = productsList.find((p) => p.id === bump.productId);
    const bumpProduct = productsList.find((p) => p.id === bump.bumpProductId);
    return {
      ...bump,
      mainProductTitle: mainProduct?.title || 'Unknown Product',
      bumpProductTitle: bumpProduct?.title || 'Unknown Product',
      bumpProductPrice: bumpProduct?.price || 0,
      bumpProductImage: bumpProduct?.imageUrl,
    };
  });

  return json({
    bumps: enrichedBumps,
    products: productsList,
    currency: store?.currency || 'BDT',
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'create') {
    const productId = parseInt(formData.get('productId') as string);
    const bumpProductId = parseInt(formData.get('bumpProductId') as string);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const discount = parseFloat(formData.get('discount') as string) || 0;

    if (!productId || !bumpProductId || !title) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (productId === bumpProductId) {
      return json({ error: 'Bump product must be different from main product' }, { status: 400 });
    }

    await db.insert(orderBumps).values({
      storeId,
      productId,
      bumpProductId,
      title,
      description: description || null,
      discount: Math.min(Math.max(discount, 0), 100),
      isActive: true,
    });

    return json({ success: true, message: 'Order bump created!' });
  }

  if (intent === 'toggle') {
    const bumpId = parseInt(formData.get('bumpId') as string);
    if (isNaN(bumpId) || bumpId <= 0) {
      return json({ error: 'Invalid bump id' }, { status: 400 });
    }
    const isActive = formData.get('isActive') === 'true';

    await db
      .update(orderBumps)
      .set({ isActive: !isActive })
      .where(and(eq(orderBumps.id, bumpId), eq(orderBumps.storeId, storeId)));

    return json({ success: true });
  }

  if (intent === 'delete') {
    const bumpId = parseInt(formData.get('bumpId') as string);
    if (isNaN(bumpId) || bumpId <= 0) {
      return json({ error: 'Invalid bump id' }, { status: 400 });
    }

    await db
      .delete(orderBumps)
      .where(and(eq(orderBumps.id, bumpId), eq(orderBumps.storeId, storeId)));

    return json({ success: true, message: 'Order bump deleted' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function OrderBumpsSettings() {
  const { bumps, products, currency } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  return (
    <>
      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/app/settings" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="font-semibold text-gray-900">{t('orderBumps')}</h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="p-2 -mr-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-4 pb-32 space-y-4">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 text-sm">{t('whatAreOrderBumps')}</h3>
                <p className="text-xs text-amber-700 mt-1">{t('orderBumpExplainer')}</p>
              </div>
            </div>
          </div>

          {/* Create Form - Mobile */}
          {showForm && (
            <Form method="post" className="rounded-2xl border border-gray-100 shadow-sm bg-white p-4 space-y-4">
              <input type="hidden" name="intent" value="create" />
              <h3 className="font-semibold text-gray-900 text-sm">{t('createNewOrderBump')}</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('mainProduct')} *
                  </label>
                  <select
                    name="productId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">{t('select')}...</option>
                    {products.map((p) => (
                      <option key={`mobile-main-${p.id}`} value={p.id}>
                        {p.title} - {formatPrice(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('bumpProduct')} *
                  </label>
                  <select
                    name="bumpProductId"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">{t('select')}...</option>
                    {products.map((p) => (
                      <option key={`mobile-bump-${p.id}`} value={p.id}>
                        {p.title} - {formatPrice(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('offerTitle')} *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder={t('offerTitlePlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('description')} ({t('optional')})
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    placeholder={t('descriptionPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="w-28">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Percent className="w-3 h-3 inline mr-1" />
                    {t('discountPercentage')}
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl text-sm disabled:opacity-50"
                >
                  {isSubmitting ? t('creating') : t('create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            </Form>
          )}

          {/* Bumps List - Mobile */}
          <div className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 text-sm">
                {t('yourOrderBumps')}
                <span className="ml-2 text-xs font-normal text-gray-500">({bumps.length})</span>
              </h3>
            </div>

            {bumps.length === 0 ? (
              <div className="p-8 text-center">
                <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('noOrderBumpsYet')}</h4>
                <p className="text-xs text-gray-500 mb-3">{t('createFirstOrderBump')}</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  {t('createBump')}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {bumps.map((bump) => (
                  <div key={`mobile-bump-${bump.id}`} className="p-4">
                    <div className="flex items-start gap-3">
                      {bump.bumpProductImage ? (
                        <img
                          src={bump.bumpProductImage}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{bump.title}</span>
                          {(bump.discount ?? 0) > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                              {bump.discount}% {t('offLabel')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {bump.mainProductTitle} → {bump.bumpProductTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{bump.views ?? 0} {t('views')}</span>
                          <span>{bump.conversions ?? 0} {t('conversions')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Form method="post">
                        <input type="hidden" name="intent" value="toggle" />
                        <input type="hidden" name="bumpId" value={bump.id} />
                        <input type="hidden" name="isActive" value={bump.isActive ? 'true' : 'false'} />
                        <button
                          type="submit"
                          className={`p-2 rounded-lg transition ${
                            bump.isActive ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'
                          }`}
                        >
                          {bump.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </button>
                      </Form>
                      <Form
                        method="post"
                        onSubmit={(e) => {
                          if (!confirm(t('deleteBumpConfirm'))) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <input type="hidden" name="bumpId" value={bump.id} />
                        <button type="submit" className="p-2 text-red-500 bg-red-50 rounded-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-6 h-6 text-amber-500" />
                {t('orderBumps')}
              </h1>
              <p className="text-gray-600 mt-1">{t('orderBumpsDesc')}</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            {t('newBump')}
          </button>
        </div>

        {/* Info Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800">{t('whatAreOrderBumps')}</h3>
            <p className="text-sm text-amber-700 mt-1">{t('orderBumpExplainer')}</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <Form method="post" className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <input type="hidden" name="intent" value="create" />

          <h3 className="font-semibold text-gray-900">{t('createNewOrderBump')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('mainProduct')} *
              </label>
              <select
                name="productId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">{t('select')}...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} - {formatPrice(p.price)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{t('whenMainPurchased')}</p>
            </div>

            {/* Bump Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bumpProduct')} *
              </label>
              <select
                name="bumpProductId"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">{t('select')}...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} - {formatPrice(p.price)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">{t('productToOfferAsBump')}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('offerTitle')} *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder={t('offerTitlePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')} ({t('optional')})
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder={t('descriptionPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Percent className="w-4 h-4 inline mr-1" />
              {t('discountPercentage')}
            </label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              defaultValue="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50"
            >
              {isSubmitting ? t('creating') : t('create')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </Form>
      )}

      {/* Bumps List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">
            {t('yourOrderBumps')}
            <span className="ml-2 text-sm font-normal text-gray-500">({bumps.length})</span>
          </h3>
        </div>

        {bumps.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">{t('noOrderBumpsYet')}</h4>
            <p className="text-gray-500 mb-4">{t('createFirstOrderBump')}</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
            >
              <Plus className="w-4 h-4" />
              {t('createBump')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bumps.map((bump) => (
              <div key={bump.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Bump Product Image */}
                    {bump.bumpProductImage ? (
                      <img
                        src={bump.bumpProductImage}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{bump.title}</span>
                        {(bump.discount ?? 0) > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                            {bump.discount}% {t('offLabel')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {t('showsWhen')}
                        <span className="text-gray-700">{bump.mainProductTitle}</span>
                        {' → '}
                        {t('offersLabel')}
                        <span className="text-amber-600">{bump.bumpProductTitle}</span>
                      </p>
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>
                          {bump.views ?? 0} {t('views')}
                        </span>
                        <span>
                          {bump.conversions ?? 0} {t('conversions')}
                        </span>
                        {(bump.views ?? 0) > 0 && (
                          <span className="text-emerald-600">
                            {(((bump.conversions ?? 0) / (bump.views ?? 1)) * 100).toFixed(1)}%{' '}
                            {t('bumpConversionRate')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle Active */}
                    <Form method="post">
                      <input type="hidden" name="intent" value="toggle" />
                      <input type="hidden" name="bumpId" value={bump.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={bump.isActive ? 'true' : 'false'}
                      />
                      <button
                        type="submit"
                        className={`p-2 rounded-lg transition ${
                          bump.isActive
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={bump.isActive ? t('deactivate') : t('activate')}
                      >
                        {bump.isActive ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </button>
                    </Form>

                    {/* Delete */}
                    <Form
                      method="post"
                      onSubmit={(e) => {
                        if (!confirm(t('deleteBumpConfirm'))) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="bumpId" value={bump.id} />
                      <button
                        type="submit"
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
