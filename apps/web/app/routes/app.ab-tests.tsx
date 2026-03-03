/**
 * A/B Tests List Page
 * 
 * Admin UI to view and manage A/B tests.
 * Route: /app/ab-tests
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { abTests, abTestVariants } from '@db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { calculateSignificance } from '~/utils/ab-testing.server';
import { Plus, Play, Pause, BarChart3, Trash2, Trophy, Eye, TrendingUp, CheckCircle } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch all tests with variants
  const tests = await db
    .select()
    .from(abTests)
    .where(eq(abTests.storeId, storeId))
    .orderBy(desc(abTests.createdAt));

  // Fetch variants for each test
  const testsWithVariants = await Promise.all(
    tests.map(async (test) => {
      const variants = await db
        .select()
        .from(abTestVariants)
        .where(eq(abTestVariants.testId, test.id));

      // Calculate stats
      const totalVisitors = variants.reduce((sum, v) => sum + (v.visitors || 0), 0);
      const totalConversions = variants.reduce((sum, v) => sum + (v.conversions || 0), 0);
      const totalRevenue = variants.reduce((sum, v) => sum + (v.revenue || 0), 0);
      const overallCR = totalVisitors > 0 ? ((totalConversions / totalVisitors) * 100).toFixed(1) : '0';

      // Find best variant
      let bestVariant = variants[0];
      let significance = { significant: false, confidence: 0 };
      
      if (variants.length >= 2) {
        const control = variants.find(v => v.name.toLowerCase().includes('control')) || variants[0];
        const variant = variants.find(v => v.id !== control?.id);
        
        if (control && variant) {
          significance = calculateSignificance(
            control.visitors || 0,
            control.conversions || 0,
            variant.visitors || 0,
            variant.conversions || 0
          );
          
          const controlRate = control.visitors ? (control.conversions || 0) / control.visitors : 0;
          const variantRate = variant.visitors ? (variant.conversions || 0) / variant.visitors : 0;
          
          bestVariant = variantRate > controlRate ? variant : control;
        }
      }

      // No productId linking anymore

      return {
        ...test,
        variants,
        stats: {
          totalVisitors,
          totalConversions,
          totalRevenue,
          overallCR,
          bestVariantId: bestVariant?.id,
          bestVariantName: bestVariant?.name,
          significance,
        },
      };
    })
  );

  return json({ tests: testsWithVariants });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent');
  const testId = Number(formData.get('testId'));

  if (intent === 'start') {
    await db.update(abTests)
      .set({ status: 'active', startedAt: new Date() })
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
    return json({ success: true });
  }

  if (intent === 'pause') {
    await db.update(abTests)
      .set({ status: 'paused' })
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
    return json({ success: true });
  }

  if (intent === 'complete') {
    const winningVariantId = Number(formData.get('winningVariantId'));
    await db.update(abTests)
      // Remove winningVariantId because schema doesn't have it
      .set({ status: 'concluded', endedAt: new Date() }) 
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
    return json({ success: true });
  }

  if (intent === 'delete') {
    await db.delete(abTests)
      .where(and(eq(abTests.id, testId), eq(abTests.storeId, storeId)));
    return json({ success: true });
  }

  return json({ success: false, error: 'Unknown action' });
}

export default function ABTestsPage() {
  const { tests } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">চলমান</span>;
      case 'paused':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">বিরতি</span>;
      case 'concluded':
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">সম্পন্ন</span>;
      default:
        // Treat others as draft/paused
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">খসড়া</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🧪 A/B টেস্ট
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            ল্যান্ডিং পেজ ভ্যারিয়েন্ট টেস্ট করে বেস্ট পারফর্মার খুঁজুন
          </p>
        </div>
        <Link
          to="/app/ab-tests/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          <Plus size={20} />
          নতুন টেস্ট
        </Link>
      </div>

      {/* Stats Overview */}
      {tests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট টেস্ট</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{tests.length}</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">চলমান</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tests.filter(t => t.status === 'active').length}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট ভিজিটর</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {tests.reduce((sum, t) => sum + t.stats.totalVisitors, 0)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">মোট কনভার্সন</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {tests.reduce((sum, t) => sum + t.stats.totalConversions, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Tests List */}
      {tests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🧪</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            এখনো কোন A/B টেস্ট নেই
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            প্রথম টেস্ট তৈরি করে ল্যান্ডিং পেজ অপটিমাইজ করুন!
          </p>
          <Link
            to="/app/ab-tests/new"
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <Plus size={18} />
            প্রথম টেস্ট তৈরি করুন
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map(test => (
            <div
              key={test.id}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(test.status || 'paused')}
                    {test.stats.significance.significant && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        <CheckCircle size={12} />
                        {test.stats.significance.confidence}% Confident
                      </span>
                    )}
                  </div>
                  
                  <Link to={`/app/ab-tests/${test.id}`} className="hover:underline">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {test.name}
                    </h3>
                  </Link>

                  {/* Variants Summary */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {test.variants.map(v => {
                      const cr = v.visitors ? ((v.conversions || 0) / v.visitors * 100).toFixed(1) : '0';
                      const isWinner = test.stats.bestVariantId === v.id;
                      return (
                        <div
                          key={v.id}
                          className={`px-3 py-2 rounded-lg text-sm ${
                            isWinner
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                        >
                          <span className="font-medium">{v.name}</span>
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            {v.visitors || 0} visits • {cr}% CR
                          </span>
                          {isWinner && <Trophy size={14} className="inline ml-1 text-yellow-500" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
                      <Eye size={14} />
                      {test.stats.totalVisitors}
                    </div>
                    <span className="text-xs text-gray-400">ভিজিটর</span>
                  </div>
                  <div className="text-center">
                    <div className="text-green-600 dark:text-green-400 font-medium">
                      {test.stats.overallCR}%
                    </div>
                    <span className="text-xs text-gray-400">CR</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {(test.status === 'paused' || test.status === null) && ( // Fallback to paused check
                    <Form method="post">
                      <input type="hidden" name="intent" value="start" />
                      <input type="hidden" name="testId" value={test.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm hover:bg-green-200"
                      >
                        <Play size={14} /> শুরু
                      </button>
                    </Form>
                  )}
                  
                  {test.status === 'active' && (
                    <Form method="post">
                      <input type="hidden" name="intent" value="pause" />
                      <input type="hidden" name="testId" value={test.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-sm hover:bg-yellow-200"
                      >
                        <Pause size={14} /> বিরতি
                      </button>
                    </Form>
                  )}

                  {test.status === 'paused' && (
                    <Form method="post">
                      <input type="hidden" name="intent" value="start" />
                      <input type="hidden" name="testId" value={test.id} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm hover:bg-green-200"
                      >
                        <Play size={14} /> চালু
                      </button>
                    </Form>
                  )}

                  <Link
                    to={`/app/ab-tests/${test.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-sm hover:bg-indigo-200"
                  >
                    <BarChart3 size={14} /> বিস্তারিত
                  </Link>

                  <Form method="post" onSubmit={(e) => {
                    if (!confirm('এই টেস্ট ডিলিট করতে চান?')) e.preventDefault();
                  }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="testId" value={test.id} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
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

      {/* Help */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 A/B টেস্টিং কিভাবে কাজ করে?</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• ভিজিটরদের র‍্যান্ডমলি বিভিন্ন ভ্যারিয়েন্টে অ্যাসাইন করা হয়</li>
          <li>• প্রতিটি ভ্যারিয়েন্টের কনভার্সন রেট ট্র্যাক করা হয়</li>
          <li>• পর্যাপ্ত ডেটা হলে Winner নির্বাচন করুন</li>
          <li>• Winner ভ্যারিয়েন্টের ল্যান্ডিং কনফিগ লাইভ করুন</li>
        </ul>
      </div>
    </div>
  );
}
