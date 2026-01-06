/**
 * Onboarding Wizard Route
 * 
 * Shopify-style 5-step onboarding:
 * 1. Account (email, password, name)
 * 2. Business (description, category)
 * 3. Plan selection
 * 4. AI generates store
 * 5. Success & redirect
 */

import { useState, useEffect } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useFetcher, Link } from '@remix-run/react';
import { Store, ArrowRight, ArrowLeft } from 'lucide-react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products, users } from '@db/schema';
import { getUserId, register, createUserSession } from '~/services/auth.server';
import { createAIService } from '~/services/ai.server';
import type { PlanType } from '~/utils/plans.server';
import { OnboardingSteps } from '~/components/onboarding/OnboardingSteps';
import { PlanSelector } from '~/components/onboarding/PlanSelector';
import { AISetupProgress } from '~/components/onboarding/AISetupProgress';
import { LanguageSelector } from '~/components/LanguageSelector';

// Business categories
const BUSINESS_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Clothing', labelBn: 'ফ্যাশন ও পোশাক' },
  { id: 'electronics', label: 'Electronics', labelBn: 'ইলেকট্রনিক্স' },
  { id: 'beauty', label: 'Beauty & Health', labelBn: 'বিউটি ও স্বাস্থ্য' },
  { id: 'food', label: 'Food & Grocery', labelBn: 'খাবার ও মুদি' },
  { id: 'home', label: 'Home & Living', labelBn: 'হোম ও লিভিং' },
  { id: 'services', label: 'Services', labelBn: 'সার্ভিস' },
  { id: 'other', label: 'Other', labelBn: 'অন্যান্য' },
];

export const meta: MetaFunction = () => {
  return [{ title: 'Create Your Store - Multi-Store SaaS' }];
};

// Redirect if already logged in
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) {
    return redirect('/app/orders');
  }
  return json({});
}

// Action to handle each step
export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const formData = await request.formData();
  const step = formData.get('step') as string;

  // Check if email already exists
  if (step === 'check_email') {
    const email = formData.get('email') as string;
    
    if (!email || !email.includes('@')) {
      return json({ error: 'Valid email required', field: 'email' }, { status: 400 });
    }
    
    const db = drizzle(env.DB);
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (existingUser.length > 0) {
      return json({ 
        error: 'এই ইমেইল আগেই রেজিস্টার করা হয়েছে। অনুগ্রহ করে লগইন করুন।', 
        errorEn: 'Email already registered. Please login instead.',
        field: 'email',
        emailExists: true 
      }, { status: 400 });
    }
    
    return json({ success: true, emailAvailable: true });
  }

  // Step 1: Create account (validation only, no DB insert yet)
  if (step === 'create_account') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    // Validation
    if (!email || !email.includes('@')) {
      return json({ error: 'Valid email required', field: 'email' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return json({ error: 'Password must be at least 6 characters', field: 'password' }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return json({ error: 'Name required', field: 'name' }, { status: 400 });
    }

    // Return data to client to proceed to next step
    return json({ success: true, step: 2, data: { email, name } });
  }

  // Step 4: Create store with AI
  if (step === 'create_store') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const plan = (formData.get('plan') as PlanType) || 'free';

    // Generate subdomain from description or fallback
    const subdomain = description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20) + '-store';

    try {
      // 1. Register user and create store
      const result = await register({
        email,
        password,
        name,
        storeName: 'My Store', // Temporary, will be updated by AI
        subdomain,
        db: env.DB,
      });

      if (result.error) {
        return json({ error: result.error }, { status: 400 });
      }

      const db = drizzle(env.DB);
      const storeId = result.storeId!;

      // 2. Update plan type and onboarding status
      await db
        .update(stores)
        .set({ 
          planType: plan,
          onboardingStatus: 'pending_info',
          setupStep: 1,
        })
        .where(eq(stores.id, storeId));

      // 3. Generate AI content if API key available
      const apiKey = env.MIMO_API_KEY;
      if (apiKey) {
        try {
          const ai = createAIService(apiKey);
          
          // Generate store setup
          const storeSetup = await ai.generateStoreSetup(
            `${description}. Category: ${category}. Target: Bangladesh market.`
          );

          // Generate landing config
          const landingConfig = await ai.generateLandingConfig(
            {
              title: storeSetup.product.title,
              description: storeSetup.product.description,
              price: storeSetup.product.suggestedPrice,
            },
            'Professional, trustworthy, Bangladesh market'
          );

          // Build full landing config
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

          // Update store with AI-generated content and mark onboarding as completed
          await db
            .update(stores)
            .set({
              name: storeSetup.storeName,
              landingConfig: JSON.stringify(fullLandingConfig),
              onboardingStatus: 'completed',
              setupStep: 4,
              updatedAt: new Date(),
            })
            .where(eq(stores.id, storeId));

          // Create AI-generated product
          await db.insert(products).values({
            storeId,
            title: storeSetup.product.title,
            description: storeSetup.product.description,
            price: storeSetup.product.suggestedPrice,
            isPublished: true,
          });
        } catch (aiError) {
          console.error('[Onboarding] AI generation failed:', aiError);
          // Continue without AI content - store is still created
        }
      }

      // 4. Create session and return success
      return await createUserSession(
        result.user!.id,
        storeId,
        '/app/orders?onboarding=success'
      );
    } catch (error) {
      console.error('[Onboarding] Error:', error);
      return json({ 
        error: 'Failed to create store. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

  return json({ error: 'Invalid step' }, { status: 400 });
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    description: '',
    category: 'fashion',
    plan: 'free' as PlanType,
    theme: 'minimal' as 'minimal' | 'vibrant',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storeCreationFailed, setStoreCreationFailed] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const fetcher = useFetcher<{ success?: boolean; error?: string; errorEn?: string; step?: number; emailExists?: boolean; emailAvailable?: boolean }>();

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.step) {
      setCurrentStep(fetcher.data.step);
      setIsCheckingEmail(false);
    }
    if (fetcher.data?.emailAvailable) {
      // Email is available, proceed to next step
      setIsCheckingEmail(false);
      setCurrentStep(2);
    }
    if (fetcher.data?.error) {
      setIsCheckingEmail(false);
      if (fetcher.data.emailExists) {
        // Email already registered - show in Step 1
        setErrors({ email: fetcher.data.error });
      } else if (currentStep === 5) {
        // Error during store creation
        setStoreCreationFailed(true);
        setErrors({ form: fetcher.data.error });
        setIsGenerating(false);
      } else {
        setErrors({ form: fetcher.data.error });
      }
    }
  }, [fetcher.data, currentStep]);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      const newErrors: Record<string, string> = {};
      if (!formData.email || !formData.email.includes('@')) {
        newErrors.email = 'Valid email required';
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = 'Name required';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Check if email already exists before proceeding
      setIsCheckingEmail(true);
      setErrors({});
      const checkData = new FormData();
      checkData.append('step', 'check_email');
      checkData.append('email', formData.email);
      fetcher.submit(checkData, { method: 'POST' });
      return; // Don't proceed yet, wait for server response
    }
    if (currentStep === 2) {
      if (!formData.description || formData.description.length < 10) {
        setErrors({ description: 'Please describe your business (at least 10 characters)' });
        return;
      }
    }
    
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    setIsGenerating(true);
    
    // Submit to server
    const submitData = new FormData();
    submitData.append('step', 'create_store');
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('category', formData.category);
    submitData.append('plan', formData.plan);
    
    fetcher.submit(submitData, { method: 'POST' });
  };

  const isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Multi-Store</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="toggle" size="sm" />
            <Link 
              to="/auth/login" 
              className="text-sm text-gray-600 hover:text-emerald-600"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        {currentStep < 6 && <OnboardingSteps currentStep={currentStep} totalSteps={5} />}

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Step 1: Account */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
                <p className="text-gray-600 mt-2">আপনার একাউন্ট তৈরি করুন</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Rahim Uddin"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Business Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Tell Us About Your Business</h1>
                <p className="text-gray-600 mt-2">আপনার বিজনেস সম্পর্কে বলুন</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you sell? Describe your business
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Example: I sell handmade leather bags for women. Made with premium quality leather, targeting young professionals in Dhaka."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                <p className="text-sm text-gray-500 mt-2">
                  💡 The more details you provide, the better AI can set up your store!
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({cat.labelBn})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
                <p className="text-gray-600 mt-2">আপনার প্ল্যান সিলেক্ট করুন</p>
              </div>

              <PlanSelector 
                selectedPlan={formData.plan} 
                onSelectPlan={(plan) => updateField('plan', plan)} 
              />

              <p className="text-center text-sm text-gray-500 mt-4">
                You can upgrade anytime from your dashboard
              </p>
            </div>
          )}

          {/* Step 4: Theme Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Choose Your Style</h1>
                <p className="text-gray-600 mt-2">আপনার স্টাইল সিলেক্ট করুন</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateField('theme', 'minimal')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.theme === 'minimal'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🌿</div>
                  <h3 className="font-bold text-lg text-gray-900">Minimal</h3>
                  <p className="text-sm text-gray-500 mt-1">Clean, simple, elegant</p>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('theme', 'vibrant')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.theme === 'vibrant'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🎨</div>
                  <h3 className="font-bold text-lg text-gray-900">Vibrant</h3>
                  <p className="text-sm text-gray-500 mt-1">Bold, colorful, eye-catching</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: AI Generation */}
          {currentStep === 5 && (
            <div>
              <AISetupProgress 
                isGenerating={isGenerating || isSubmitting}
                hasError={storeCreationFailed}
                errorMessage={errors.form}
                onComplete={() => {
                  // Submission handled by fetcher
                }}
              />
              
              {/* Error Actions */}
              {storeCreationFailed && (
                <div className="flex flex-col items-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setStoreCreationFailed(false);
                      setErrors({});
                      setIsGenerating(true);
                      handleSubmit();
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    🔄 আবার চেষ্টা করুন (Retry)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setStoreCreationFailed(false);
                      setErrors({});
                      setIsGenerating(false);
                    }}
                    className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    শুরু থেকে শুরু করুন (Start Over)
                  </button>
                  <Link
                    to="/auth/login"
                    className="text-emerald-600 hover:text-emerald-700 text-sm underline"
                  >
                    ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Success (handled by redirect) */}

          {/* Error Display */}
          {errors.form && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {errors.form}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isCheckingEmail}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isCheckingEmail ? 'Checking...' : 'Continue'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(5);
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : '🚀 Create My Store'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </main>
    </div>
  );
}
