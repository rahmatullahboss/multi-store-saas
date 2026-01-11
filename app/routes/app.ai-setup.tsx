/**
 * AI Setup Page - One-Prompt Store Setup
 * 
 * Beautiful onboarding experience where users describe their business
 * and AI generates store name, SEO keywords, and initial product.
 */

import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, products, users } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { canUseAI, type PlanType } from '~/utils/plans.server';
import { createAIService } from '~/services/ai.server';
import { Sparkles, Loader2, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { checkCredits, deductCredits, CREDIT_COSTS } from '~/utils/credit.server';

export const meta = () => [
  { title: 'AI Store Setup - Multi-Store SaaS' },
];

// Loader: Check plan access
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) {
    return redirect('/auth/login');
  }

  const db = drizzle(env.DB);
  const storeResult = await db
    .select({ planType: stores.planType, name: stores.name, aiCredits: stores.aiCredits })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return redirect('/auth/login');
  }

  const planType = (store.planType as PlanType) || 'free';
  const hasAIAccess = canUseAI(planType);

  return json({ hasAIAccess, planType, storeName: store.name, aiCredits: store.aiCredits || 0 });
}

// Action: Process AI generation
export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  const session = await getSession(request, env);
  const storeId = session.get('storeId');
  const userId = session.get('userId');

  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get store
  const storeResult = await db
    .select({ planType: stores.planType })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const planType = (store.planType as PlanType) || 'free';
  if (!canUseAI(planType)) {
    return json({ error: 'Upgrade required for AI features' }, { status: 403 });
  }

  const formData = await request.formData();
  const description = formData.get('description') as string;

  if (!description || description.trim().length < 10) {
    return json({ error: 'Please provide a more detailed description (at least 10 characters)' }, { status: 400 });
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, { status: 503 });
  }
  
  // Check User Role for Super Admin Bypass
  let userRole = 'user';
  if (userId) {
      const userResult = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
      userRole = userResult[0]?.role || 'user';
  }

  try {
    // ========================================================================
    // CHECK PRODUCT LIMIT BEFORE AI CREATION
    // ========================================================================
    const { checkUsageLimit } = await import('~/utils/plans.server');
    const limitCheck = await checkUsageLimit(env.DB, storeId, 'product');
    
    if (!limitCheck.allowed) {
      return json({ 
        error: limitCheck.error?.message || 'Product limit reached. Please upgrade your plan to add more products.' 
      }, { status: 403 });
    }

    // ========================================================================
    // CHECK CREDITS
    // ========================================================================
    const SETUP_COST = CREDIT_COSTS.SETUP_STORE;
    if (userRole !== 'super_admin') {
      const creditCheck = await checkCredits(db, storeId, SETUP_COST);
      if (!creditCheck.allowed) {
        return json({ 
          error: `Insufficient AI credits. Setup costs ${SETUP_COST} credits. You have ${creditCheck.currentBalance}.` 
        }, { status: 402 });
      }
    }

    const ai = createAIService(apiKey, {
      model: env.AI_MODEL,
      baseUrl: env.AI_BASE_URL
    });
    
    // Step 1: Generate store setup
    const storeSetup = await ai.generateStoreSetup(description);

    // Step 2: Generate landing page config in parallel with DB updates
    const [landingConfig] = await Promise.all([
      ai.generateLandingConfig(
        { 
          title: storeSetup.product.title, 
          description: storeSetup.product.description,
          price: storeSetup.product.suggestedPrice 
        },
        'Professional and trustworthy, Bangladesh market'
      ),
      // Create product while waiting for landing config
      db.insert(products).values({
        storeId,
        title: storeSetup.product.title,
        description: storeSetup.product.description,
        price: storeSetup.product.suggestedPrice,
        isPublished: true,
      })
    ]);

    // Build full landing config JSON
    const fullLandingConfig = {
      templateId: 'modern-dark',
      headline: landingConfig.hero.headline,
      subheadline: landingConfig.hero.subheadline,
      ctaText: landingConfig.hero.ctaText || 'এখনই অর্ডার করুন',
      ctaSubtext: landingConfig.hero.ctaSubtext || 'ক্যাশ অন ডেলিভারি',
      features: landingConfig.features,
      testimonials: landingConfig.testimonials,
      urgencyText: landingConfig.trust?.urgencyText,
      guaranteeText: landingConfig.trust?.guaranteeText,
    };

    // Update store with name and landing config
    await db
      .update(stores)
      .set({ 
        name: storeSetup.storeName,
        landingConfig: JSON.stringify(fullLandingConfig),
        updatedAt: new Date()
      })
      .where(eq(stores.id, storeId));

    // Deduct Credits after success
    if (userRole !== 'super_admin') {
      await deductCredits(db, storeId, SETUP_COST);
    }

    return redirect('/app?ai_setup=success');
  } catch (error) {
    console.error('[AI Setup] Error:', error);
    return json({ 
      error: 'AI generation failed. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Component
export default function AISetupPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-purple-200 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Setup
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            ✨ আপনার স্টোর সেটআপ করুন
          </h1>
          <p className="text-xl text-purple-200 max-w-xl mx-auto">
            শুধু আপনার বিজনেস সম্পর্কে বলুন, বাকিটা AI করে দেবে!
          </p>
        </div>

        {/* Main Form Card */}
        <div className="w-full max-w-2xl">
          <Form method="post">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl">
              {/* Input Area */}
              <div className="mb-8">
                <label 
                  htmlFor="description" 
                  className="block text-white font-semibold text-lg mb-3"
                >
                  আপনার বিজনেস সম্পর্কে বলুন
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder-purple-300/60 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
                  placeholder="উদাহরণ: আমি ঢাকায় হ্যান্ডমেড লেদার ব্যাগ বিক্রি করি। প্রিমিয়াম কোয়ালিটি, ইউনিক ডিজাইন, এবং সাশ্রয়ী মূল্যে..."
                  disabled={isSubmitting}
                  required
                  minLength={10}
                />
              </div>

              {/* Error Message */}
              {actionData?.error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200">{actionData.error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    AI জেনারেট করছে...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6" />
                    AI দিয়ে সেটআপ করুন
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-purple-300 text-sm">
                 খরচ: {CREDIT_COSTS.SETUP_STORE} ক্রেডিট
              </p>
            </div>
          </Form>

          {/* Feature List */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">🏪</div>
              <p className="text-purple-200 text-sm">স্টোর নাম জেনারেট</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">🔍</div>
              <p className="text-purple-200 text-sm">SEO কীওয়ার্ড</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-purple-200 text-sm">প্রোডাক্ট তৈরি</p>
            </div>
          </div>
        </div>

        {/* Skip Link */}
        <a
          href="/app"
          className="mt-8 text-purple-300 hover:text-white transition-colors text-sm"
        >
          পরে করব, এখন Dashboard এ যাই →
        </a>
      </div>
    </div>
  );
}
