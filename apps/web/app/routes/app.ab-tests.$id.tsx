/**
 * A/B Test Detail/Results Page
 *
 * Shows detailed stats and comparison for an A/B test.
 * Route: /app/ab-tests/$id
 */

import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData, Form, Link, useNavigation } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { abTests, abTestVariants, abTestAssignments, products, stores } from '@db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { calculateSignificance } from '~/utils/ab-testing.server';
import {
  ArrowLeft,
  Trophy,
  Play,
  Pause,
  CheckCircle,
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Copy,
} from 'lucide-react';
import { formatPrice } from '~/utils/formatPrice';

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });

  const testId = Number(params.id);
  if (!testId) {
    throw new Response('Test not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch test
  const test = await db
    .select()
    .from(abTests)
    .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)))
    .limit(1);

  if (test.length === 0) {
    throw new Response('Test not found', { status: 404 });
  }

  // Fetch variants
  const variants = await db.select().from(abTestVariants).where(eq(abTestVariants.testId, testId));

  // Calculate stats for each variant
  const variantsWithStats = variants.map((v) => {
    const cr = v.visitors ? ((v.conversions || 0) / v.visitors) * 100 : 0;
    const revenuePerVisitor = v.visitors ? (v.revenue || 0) / v.visitors : 0;
    return {
      ...v,
      conversionRate: cr.toFixed(2),
      revenuePerVisitor: revenuePerVisitor.toFixed(0),
    };
  });

  // Calculate significance
  let significance = { significant: false, confidence: 0 };
  let bestVariant = variantsWithStats[0];
  const controlVariant =
    variantsWithStats.find((v) => v.name.toLowerCase().includes('control')) || variantsWithStats[0];

  if (variantsWithStats.length >= 2) {
    const variant = variantsWithStats.find((v) => v.id !== controlVariant?.id);

    if (controlVariant && variant) {
      significance = calculateSignificance(
        controlVariant.visitors || 0,
        controlVariant.conversions || 0,
        variant.visitors || 0,
        variant.conversions || 0
      );
    }

    // Find best performer
    bestVariant = variantsWithStats.reduce(
      (best, v) => (parseFloat(v.conversionRate) > parseFloat(best.conversionRate) ? v : best),
      variantsWithStats[0]
    );
  }

  // Get store currency
  const store = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return json({
    test: test[0],
    variants: variantsWithStats,
    significance,
    bestVariantId: bestVariant?.id,
    currency: store[0]?.currency || 'BDT',
  });
}

export async function action({ params, request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });

  const testId = Number(params.id);
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'start') {
    await db
      .update(abTests)
      .set({ status: 'active', startedAt: new Date() })
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
  }

  if (intent === 'pause') {
    await db
      .update(abTests)
      .set({ status: 'paused' })
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
  }

  if (intent === 'complete') {
    // const winningVariantId = Number(formData.get('winningVariantId')); // Not stored in DB yet
    await db
      .update(abTests)
      .set({ status: 'concluded', endedAt: new Date() })
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
  }

  if (intent === 'apply-winner') {
    const variantId = Number(formData.get('variantId'));
    const variant = await db
      .select({ landingConfig: abTestVariants.landingConfig })
      .from(abTestVariants)
      .where(eq(abTestVariants.id, variantId))
      .limit(1);

    if (variant[0]?.landingConfig) {
      await db
        .update(stores)
        .set({ landingConfig: variant[0].landingConfig })
        .where(eq(stores.id, storeId));
    }
  }

  return json({ success: true });
}

export default function ABTestDetailPage() {
  const { test, variants, significance, bestVariantId, currency } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const totalVisitors = variants.reduce((sum, v) => sum + (v.visitors || 0), 0);
  const totalConversions = variants.reduce((sum, v) => sum + (v.conversions || 0), 0);
  const totalRevenue = variants.reduce((sum, v) => sum + (v.revenue || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/app/ab-tests"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={18} />
          সব টেস্ট
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
              {test.status === 'active' && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  চলমান
                </span>
              )}
              {test.status === 'paused' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  বিরতি
                </span>
              )}
              {test.status === 'concluded' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  সম্পন্ন
                </span>
              )}
            </div>
            {/* removed productName */}
          </div>

          <div className="flex gap-2">
            {test.status === 'paused' && ( // Treat paused as startable (drafts are now paused)
              <Form method="post">
                <input type="hidden" name="intent" value="start" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <Play size={18} /> চালু করুন
                </button>
              </Form>
            )}
            {test.status === 'active' && (
              <Form method="post">
                <input type="hidden" name="intent" value="pause" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  <Pause size={18} /> বিরতি
                </button>
              </Form>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users size={16} /> মোট ভিজিটর
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalVisitors}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <CheckCircle size={16} /> কনভার্সন
          </div>
          <p className="text-2xl font-bold text-green-600">
            {totalConversions}
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <TrendingUp size={16} /> CR
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalVisitors ? ((totalConversions / totalVisitors) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <DollarSign size={16} /> রেভিনিউ
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Significance Alert */}
      {significance.significant && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <p className="font-semibold text-green-800">
              পরিসংখ্যানগতভাবে উল্লেখযোগ্য ফলাফল!
            </p>
            <p className="text-sm text-green-700">
              {significance.confidence}% কনফিডেন্স - Winner ঘোষণা করতে পারেন
            </p>
          </div>
        </div>
      )}

      {/* Variants Comparison */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            ভ্যারিয়েন্ট তুলনা
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  ভ্যারিয়েন্ট
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  ভিজিটর
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  কনভার্সন
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  CR
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  রেভিনিউ
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {variants.map((v) => {
                const isBest = v.id === bestVariantId;
                return (
                  <tr key={v.id} className={isBest ? 'bg-green-50' : ''}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{v.name}</span>
                        {isBest && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            <Trophy size={12} /> Best
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {v.trafficWeight}% ট্রাফিক
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-900">
                      {v.visitors || 0}
                    </td>
                    <td className="px-4 py-4 text-center text-green-600 font-medium">
                      {v.conversions || 0}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-gray-900">
                        {v.conversionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-indigo-600">
                      {formatPrice(v.revenue || 0)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {v.landingConfig && test.status !== 'concluded' && (
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="apply-winner" />
                          <input type="hidden" name="variantId" value={v.id} />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200"
                          >
                            <Copy size={14} /> লাইভ করুন
                          </button>
                        </Form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declare Winner */}
      {test.status !== 'concluded' && test.status !== 'paused' && significance.significant && (
        <div className="p-6 bg-white rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏆 Winner ঘোষণা করুন
          </h3>
          <Form method="post" className="flex items-center gap-4">
            <input type="hidden" name="intent" value="complete" />
            <select
              name="winningVariantId"
              required
              className="flex-1 px-3 py-2 border rounded-lg bg-white text-gray-900 border-gray-300"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.conversionRate}% CR)
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Winner সিলেক্ট করুন
            </button>
          </Form>
        </div>
      )}

      {/* Test Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            শুরু:{' '}
            {test.startedAt ? new Date(test.startedAt).toLocaleDateString('bn-BD') : 'শুরু হয়নি'}
          </span>
          {test.endedAt && <span>শেষ: {new Date(test.endedAt).toLocaleDateString('bn-BD')}</span>}
        </div>
      </div>
    </div>
  );
}
