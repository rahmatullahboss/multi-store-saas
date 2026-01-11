/**
 * Upsell Settings Page
 * 
 * Admin UI to configure post-purchase upsell/downsell offers.
 * Route: /app/settings/upsells
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Form, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { upsellOffers, products, stores } from '@db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { useState } from 'react';
import { Plus, Edit2, Trash2, ArrowRight, ArrowUpRight, ArrowDownRight, BarChart3, Eye, CheckCircle } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch all upsell offers for this store
  const offers = await db
    .select({
      id: upsellOffers.id,
      productId: upsellOffers.productId,
      offerProductId: upsellOffers.offerProductId,
      type: upsellOffers.type,
      headline: upsellOffers.headline,
      subheadline: upsellOffers.subheadline,
      description: upsellOffers.description,
      discount: upsellOffers.discount,
      displayOrder: upsellOffers.displayOrder,
      nextOfferId: upsellOffers.nextOfferId,
      isActive: upsellOffers.isActive,
      views: upsellOffers.views,
      conversions: upsellOffers.conversions,
      revenue: upsellOffers.revenue,
      createdAt: upsellOffers.createdAt,
    })
    .from(upsellOffers)
    .where(eq(upsellOffers.storeId, storeId))
    .orderBy(desc(upsellOffers.createdAt));

  // Fetch all products for dropdown
  const allProducts = await db
    .select({ id: products.id, title: products.title, price: products.price })
    .from(products)
    .where(eq(products.storeId, storeId));

  // Get store currency
  const store = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  // Map product IDs to titles
  const productMap = new Map(allProducts.map(p => [p.id, p]));

  const offersWithProducts = offers.map(offer => ({
    ...offer,
    triggerProduct: productMap.get(offer.productId),
    offerProduct: productMap.get(offer.offerProductId),
    conversionRate: (offer.views ?? 0) > 0 ? (((offer.conversions ?? 0) / (offer.views ?? 1)) * 100).toFixed(1) : '0',
  }));

  return json({
    offers: offersWithProducts,
    products: allProducts,
    currency: store[0]?.currency || 'BDT',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    if (intent === 'create') {
      const productId = Number(formData.get('productId'));
      const offerProductId = Number(formData.get('offerProductId'));
      const type = formData.get('type') as 'upsell' | 'downsell';
      const headline = formData.get('headline') as string;
      const subheadline = formData.get('subheadline') as string;
      const description = formData.get('description') as string;
      const discount = Number(formData.get('discount')) || 0;
      const nextOfferId = formData.get('nextOfferId') ? Number(formData.get('nextOfferId')) : null;

      if (!productId || !offerProductId || !headline) {
        return json({ success: false, error: 'Required fields missing' }, { status: 400 });
      }

      await db.insert(upsellOffers).values({
        storeId,
        productId,
        offerProductId,
        type,
        headline,
        subheadline: subheadline || null,
        description: description || null,
        discount,
        nextOfferId,
        isActive: true,
      });

      return json({ success: true, message: 'Upsell offer created!' });
    }

    if (intent === 'toggle') {
      const id = Number(formData.get('id'));
      const isActive = formData.get('isActive') === 'true';

      await db
        .update(upsellOffers)
        .set({ isActive: !isActive })
        .where(and(eq(upsellOffers.id, id), eq(upsellOffers.storeId, storeId)));

      return json({ success: true });
    }

    if (intent === 'delete') {
      const id = Number(formData.get('id'));

      await db
        .delete(upsellOffers)
        .where(and(eq(upsellOffers.id, id), eq(upsellOffers.storeId, storeId)));

      return json({ success: true, message: 'Deleted!' });
    }

    return json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Upsell action error:', error);
    return json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}

export default function UpsellSettingsPage() {
  const { offers, products, currency } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t, lang } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('upsellSettings')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('upsellSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          <Plus size={20} />
          {t('createUpsellOffer')}
        </button>
      </div>

      {/* Action Feedback */}
      {actionData?.success && 'message' in actionData && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
          <span className="text-green-800 dark:text-green-300">{actionData.message as string}</span>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('newUpsellOffer')}</h2>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trigger Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('triggerProduct')}
                </label>
                <select 
                  name="productId"
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">{t('selectProduct')}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - {formatPrice(p.price)}</option>
                  ))}
                </select>
              </div>

              {/* Offer Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('offerProduct')}
                </label>
                <select 
                  name="offerProductId"
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">{t('selectProduct')}</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - {formatPrice(p.price)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('offerType')}
                </label>
                <select 
                  name="type"
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="upsell">{t('upsell')}</option>
                  <option value="downsell">{t('downsell')}</option>
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('discountPercentage')}
                </label>
                <input
                  type="number"
                  name="discount"
                  min="0"
                  max="90"
                  defaultValue="0"
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              {/* Next Offer (for sequence) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('nextOffer')}
                </label>
                <select 
                  name="nextOfferId"
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                >
                  <option value="">{t('upsellNone')}</option>
                  {offers.filter(o => o.type === 'downsell').map(o => (
                    <option key={o.id} value={o.id}>{o.headline}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('headline')} *
              </label>
              <input
                type="text"
                name="headline"
                required
                placeholder={String(t('headlinePlaceholder'))}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('upsellSubheadline')}
              </label>
              <input
                type="text"
                name="subheadline"
                placeholder={String(t('subheadlinePlaceholder'))}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('upsellDescription')}
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder={String(t('upsellDescriptionPlaceholder'))}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? t('savingSettings') : t('saveSettings')}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                {t('cancel')}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* Stats Overview */}
      {offers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalOffers')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{offers.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalViews')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {offers.reduce((sum, o) => sum + (o.views ?? 0), 0)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalConversions')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {offers.reduce((sum, o) => sum + (o.conversions ?? 0), 0)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue')}</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatPrice(offers.reduce((sum, o) => sum + (o.revenue ?? 0), 0))}
            </p>
          </div>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('noUpsellOffers')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('createFirstUpsell')}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {t('createUpsellOffer')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => (
            <div 
              key={offer.id}
              className={`p-5 bg-white dark:bg-gray-800 rounded-xl border transition ${
                offer.isActive 
                  ? 'border-green-200 dark:border-green-800' 
                  : 'border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {offer.type === 'upsell' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded">
                        <ArrowUpRight size={12} /> Upsell
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded">
                        <ArrowDownRight size={12} /> Downsell
                      </span>
                    )}
                    {!offer.isActive && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        {t('inactive')}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {offer.headline}
                  </h3>
                  
                  {offer.subheadline && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{offer.subheadline}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      <strong>{t('trigger')}:</strong> {offer.triggerProduct?.title || 'Unknown'}
                    </span>
                    <ArrowRight size={14} />
                    <span>
                      <strong>{t('offer')}:</strong> {offer.offerProduct?.title || 'Unknown'}
                      {(offer.discount ?? 0) > 0 && (
                        <span className="ml-1 text-green-600">(-{offer.discount}%)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Eye size={14} />
                      <span>{offer.views ?? 0}</span>
                    </div>
                    <span className="text-xs text-gray-400">{t('views')}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 dark:text-green-400 font-medium">
                      {offer.conversions ?? 0}
                    </div>
                    <span className="text-xs text-gray-400">{t('conversions')}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {offer.conversionRate}%
                    </div>
                    <span className="text-xs text-gray-400">{t('bumpConversionRate')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={offer.id} />
                    <input type="hidden" name="isActive" value={String(offer.isActive)} />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded text-sm ${
                        offer.isActive 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
                      }`}
                    >
                      {offer.isActive ? t('inactive') : t('active')}
                    </button>

                  </Form>
                  <Form method="post" onSubmit={(e) => {
                    if (!confirm(t('deleteOfferConfirm'))) e.preventDefault();
                  }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={offer.id} />
                    <button
                      type="submit"
                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 {t('howItWorks')}</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• {t('howItWorks1')}</li>
          <li>• {t('howItWorks2')}</li>
          <li>• {t('howItWorks3')}</li>
          <li>• {t('howItWorks4')}</li>
        </ul>
      </div>
    </div>
  );
}
