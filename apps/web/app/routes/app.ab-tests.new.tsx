/**
 * Create New A/B Test Page
 * 
 * Admin UI to create a new A/B test with variants.
 * Route: /app/ab-tests/new
 */

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Form, Link, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { abTests, abTestVariants, stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Copy, Percent } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get current landing config from store
  const store = await db
    .select({ landingConfig: stores.landingConfig })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  return json({ 
    currentLandingConfig: store[0]?.landingConfig || null,
  });
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
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

  const name = formData.get('name') as string;
  // productId removed
  
  // Variants data from form
  const variantNames = formData.getAll('variantName') as string[];
  const variantWeights = formData.getAll('variantWeight') as string[];
  const variantConfigs = formData.getAll('variantConfig') as string[];

  if (!name || variantNames.length < 2) {
    return json({ success: false, error: 'নাম এবং কমপক্ষে ২টি ভ্যারিয়েন্ট প্রয়োজন' }, { status: 400 });
  }

  const testKey = slugify(name) + '-' + Date.now().toString(36);

  // Create test
  const testResult = await db.insert(abTests).values({
    storeId,
    name,
    testKey,
    status: 'paused', // Schema doesn't support 'draft'
    // We must populate variantA and variantB because they are notNull in schema
    // But we are using abTestVariants table.
    // We'll put placeholders or the first two variant names.
    variantA: variantNames[0] || 'A',
    variantB: variantNames[1] || 'B',
  }).returning({ id: abTests.id });

  const testId = testResult[0].id;

  // Create variants in batch
  const variantsToInsert = [];
  for (let i = 0; i < variantNames.length; i++) {
    if (variantNames[i]) {
      variantsToInsert.push({
        testId,
        name: variantNames[i],
        trafficWeight: Number(variantWeights[i]) || 50,
        landingConfig: variantConfigs[i] || null,
      });
    }
  }

  if (variantsToInsert.length > 0) {
    await db.insert(abTestVariants).values(variantsToInsert);
  }

  return redirect('/app/ab-tests');
}

export default function NewABTestPage() {
  const { currentLandingConfig } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [variants, setVariants] = useState([
    { name: 'Control', weight: 50, config: currentLandingConfig || '' },
    { name: 'Variant A', weight: 50, config: '' },
  ]);

  const addVariant = () => {
    const letter = String.fromCharCode(65 + variants.length - 1); // A, B, C...
    setVariants([...variants, { name: `Variant ${letter}`, weight: 0, config: '' }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    setVariants(variants.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  const copyCurrentConfig = (index: number) => {
    if (currentLandingConfig) {
      updateVariant(index, 'config', currentLandingConfig);
    }
  };

  const totalWeight = variants.reduce((sum, v) => sum + (Number(v.weight) || 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/app/ab-tests"
          className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={18} />
          ফিরে যান
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🧪 নতুন A/B টেস্ট তৈরি করুন
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          বিভিন্ন ল্যান্ডিং পেজ ভ্যারিয়েন্ট তুলনা করুন
        </p>
      </div>

      <Form method="post" className="space-y-6">
        {/* Basic Info */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">টেস্ট তথ্য</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                টেস্ট নাম *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="যেমন: হেডলাইন টেস্ট ১"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">ভ্যারিয়েন্ট</h2>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${totalWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                <Percent size={14} className="inline" /> মোট: {totalWeight}%
              </span>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200"
              >
                <Plus size={16} /> ভ্যারিয়েন্ট যোগ
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      নাম
                    </label>
                    <input
                      type="text"
                      name="variantName"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ট্রাফিক (%)
                    </label>
                    <input
                      type="number"
                      name="variantWeight"
                      min="0"
                      max="100"
                      value={variant.weight}
                      onChange={(e) => updateVariant(index, 'weight', Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyCurrentConfig(index)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-200"
                      title="বর্তমান ল্যান্ডিং কপি করুন"
                    >
                      <Copy size={16} /> লাইভ কপি
                    </button>
                  </div>

                  <div className="flex justify-end">
                    {variants.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hidden config field */}
                <input
                  type="hidden"
                  name="variantConfig"
                  value={variant.config}
                />

                {variant.config && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    ✓ ল্যান্ডিং কনফিগ সেট আছে
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || totalWeight !== 100}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition"
          >
            {isSubmitting ? 'তৈরি হচ্ছে...' : 'টেস্ট তৈরি করুন'}
          </button>
          <Link
            to="/app/ab-tests"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300"
          >
            বাতিল
          </Link>
        </div>

        {totalWeight !== 100 && (
          <p className="text-red-600 text-sm text-center">
            ⚠️ মোট ট্রাফিক ওয়েট ১০০% হতে হবে (বর্তমান: {totalWeight}%)
          </p>
        )}
      </Form>

      {/* Tips */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 টিপস</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Control = বর্তমান ল্যান্ডিং পেজ</li>
          <li>• Variant = পরিবর্তিত সংস্করণ</li>
          <li>• ট্রাফিক 50/50 ভাগ করুন শুরুতে</li>
          <li>• ল্যান্ডিং এডিটর থেকে "Clone as Variant" করতে পারবেন</li>
        </ul>
      </div>
    </div>
  );
}
