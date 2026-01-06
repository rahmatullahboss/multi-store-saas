/**
 * Onboarding Wizard Route - Simplified 3-Step Flow
 * 
 * Quick onboarding for fast store creation:
 * 1. Account (email, password, name)
 * 2. Store Setup (store name, subdomain, category)
 * 3. Auto-create with category-based landing page
 * 
 * Users can customize everything later from Settings.
 */

import { useState, useEffect, useRef } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useFetcher, Link } from '@remix-run/react';
import { Store, ArrowRight, ArrowLeft } from 'lucide-react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, products, users } from '@db/schema';
import { getUserId, register, createUserSession } from '~/services/auth.server';
import { OnboardingSteps } from '~/components/onboarding/OnboardingSteps';
import { AISetupProgress } from '~/components/onboarding/AISetupProgress';
import { LanguageSelector } from '~/components/LanguageSelector';
import { useTranslation } from '~/contexts/LanguageContext';

// Business categories with translation keys and emojis
const BUSINESS_CATEGORIES = [
  { id: 'fashion', key: 'categoryFashion' as const, emoji: '👗' },
  { id: 'electronics', key: 'categoryElectronics' as const, emoji: '📱' },
  { id: 'beauty', key: 'categoryBeauty' as const, emoji: '💄' },
  { id: 'food', key: 'categoryFood' as const, emoji: '🍔' },
  { id: 'home', key: 'categoryHome' as const, emoji: '🏠' },
  { id: 'services', key: 'categoryServices' as const, emoji: '🛠️' },
  { id: 'other', key: 'categoryOther' as const, emoji: '📦' },
];

// Category-based landing page templates
const CATEGORY_TEMPLATES: Record<string, {
  headline: string;
  subheadline: string;
  features: Array<{ icon: string; title: string; description: string }>;
  product: { title: string; price: number; description: string };
}> = {
  fashion: {
    headline: 'প্রিমিয়াম ফ্যাশন কালেকশন',
    subheadline: 'ট্রেন্ডি ও স্টাইলিশ পোশাক',
    features: [
      { icon: '✨', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের ফেব্রিক' },
      { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ দিনে ডেলিভারি' },
      { icon: '💳', title: 'ক্যাশ অন ডেলিভারি', description: 'পণ্য হাতে পেয়ে টাকা দিন' },
    ],
    product: { title: 'Premium Fashion Item', price: 1500, description: 'স্টাইলিশ ও ট্রেন্ডি ফ্যাশন আইটেম' },
  },
  electronics: {
    headline: 'সেরা ইলেকট্রনিক্স প্রোডাক্ট',
    subheadline: 'অরিজিনাল গ্যাজেট ও এক্সেসরিজ',
    features: [
      { icon: '✅', title: '১০০% অরিজিনাল', description: 'ওয়ারেন্টি সহ' },
      { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ দিনে ডেলিভারি' },
      { icon: '🔧', title: 'আফটার সেলস সার্ভিস', description: 'ফ্রি টেকনিক্যাল সাপোর্ট' },
    ],
    product: { title: 'Quality Electronics', price: 2500, description: 'প্রিমিয়াম ইলেকট্রনিক্স আইটেম' },
  },
  beauty: {
    headline: 'বিউটি ও স্কিনকেয়ার সলিউশন',
    subheadline: 'গ্লো করুন নিজেকে',
    features: [
      { icon: '💎', title: 'অথেনটিক প্রোডাক্ট', description: '১০০% জেনুইন' },
      { icon: '🌿', title: 'ন্যাচারাল ইনগ্রিডিয়েন্ট', description: 'স্কিন ফ্রেন্ডলি' },
      { icon: '💝', title: 'ফ্রি গিফট', description: 'প্রতি অর্ডারে সারপ্রাইজ' },
    ],
    product: { title: 'Beauty Product', price: 800, description: 'প্রিমিয়াম বিউটি প্রোডাক্ট' },
  },
  food: {
    headline: 'সুস্বাদু খাবার ও স্ন্যাক্স',
    subheadline: 'ফ্রেশ ও হাইজিনিক',
    features: [
      { icon: '🍽️', title: 'ফ্রেশ প্রোডাক্ট', description: 'প্রতিদিন তৈরি' },
      { icon: '🚴', title: 'হট ডেলিভারি', description: 'গরম গরম পৌঁছে যাবে' },
      { icon: '😋', title: 'টেস্ট গ্যারান্টি', description: 'মুখে লেগে যাবে' },
    ],
    product: { title: 'Delicious Food Item', price: 350, description: 'সুস্বাদু খাবার' },
  },
  home: {
    headline: 'হোম ও লাইফস্টাইল প্রোডাক্ট',
    subheadline: 'আপনার ঘরকে সাজান',
    features: [
      { icon: '🏡', title: 'কোয়ালিটি প্রোডাক্ট', description: 'লং লাস্টিং' },
      { icon: '📦', title: 'সেফ প্যাকেজিং', description: 'সঠিক কন্ডিশনে ডেলিভারি' },
      { icon: '🔄', title: 'ইজি রিটার্ন', description: '৭ দিনে রিটার্ন' },
    ],
    product: { title: 'Home & Living Product', price: 1200, description: 'হোম ডেকোর আইটেম' },
  },
  services: {
    headline: 'প্রফেশনাল সার্ভিস',
    subheadline: 'এক্সপার্ট সলিউশন',
    features: [
      { icon: '👨‍💼', title: 'এক্সপার্ট টিম', description: 'অভিজ্ঞ প্রফেশনাল' },
      { icon: '⏱️', title: 'সময়মত ডেলিভারি', description: 'ডেডলাইন মেইনটেইন' },
      { icon: '💯', title: 'সন্তুষ্টির গ্যারান্টি', description: 'বেস্ট কোয়ালিটি সার্ভিস' },
    ],
    product: { title: 'Professional Service', price: 2000, description: 'প্রফেশনাল সার্ভিস প্যাকেজ' },
  },
  other: {
    headline: 'কোয়ালিটি প্রোডাক্ট',
    subheadline: 'বেস্ট সিলেকশন',
    features: [
      { icon: '✅', title: 'প্রিমিয়াম কোয়ালিটি', description: 'সেরা মানের পণ্য' },
      { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ দিনে ডেলিভারি' },
      { icon: '💳', title: 'ক্যাশ অন ডেলিভারি', description: 'পণ্য হাতে পেয়ে টাকা দিন' },
    ],
    product: { title: 'Quality Product', price: 1000, description: 'প্রিমিয়াম প্রোডাক্ট' },
  },
};

export const meta: MetaFunction = () => {
  return [{ title: 'Create Your Store - Multi-Store SaaS' }];
};

// Redirect if already logged in AND onboarding is completed
export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  
  if (userId) {
    try {
      const { env } = context.cloudflare;
      const db = drizzle(env.DB);
      
      const userResult = await db
        .select({ storeId: users.storeId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (userResult[0]?.storeId) {
        const storeResult = await db
          .select({ onboardingStatus: stores.onboardingStatus })
          .from(stores)
          .where(eq(stores.id, userResult[0].storeId))
          .limit(1);
        
        const onboardingStatus = storeResult[0]?.onboardingStatus || 'pending';
        if (onboardingStatus === 'completed') {
          return redirect('/app/orders');
        }
      }
    } catch (error) {
      console.error('[onboarding.loader] Error:', error);
    }
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

  // Create store with category-based template
  if (step === 'create_store') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const storeName = formData.get('storeName') as string;
    const subdomain = formData.get('subdomain') as string;
    const category = formData.get('category') as string || 'other';

    console.log('[Onboarding] Creating store:', { storeName, subdomain, category });

    try {
      // 1. Register user and create store
      const result = await register({
        email,
        password,
        name,
        storeName: storeName || 'My Store',
        subdomain: subdomain || `store-${Date.now()}`,
        db: env.DB,
      });

      if (result.error) {
        return json({ error: result.error }, { status: 400 });
      }

      const db = drizzle(env.DB);
      const storeId = result.storeId!;

      // 2. Get category-based template
      const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.other;
      
      // 3. Create landing config from category template
      const landingConfig = {
        templateId: 'modern-dark',
        headline: template.headline,
        subheadline: template.subheadline,
        ctaText: 'এখনই অর্ডার করুন',
        ctaSubtext: 'ক্যাশ অন ডেলিভারি',
        features: template.features,
        testimonials: [
          { name: 'সন্তুষ্ট ক্রেতা', text: 'অনেক ভালো প্রোডাক্ট, দ্রুত ডেলিভারি!' },
        ],
        urgencyText: '🔥 সীমিত সময়ের অফার!',
        guaranteeText: '১০০% সন্তুষ্টির গ্যারান্টি',
      };

      // 4. Update store with landing config
      await db
        .update(stores)
        .set({
          name: storeName,
          planType: 'free', // Default to free plan
          landingConfig: JSON.stringify(landingConfig),
          onboardingStatus: 'completed',
          setupStep: 3,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      // 5. Create sample product based on category
      await db.insert(products).values({
        storeId,
        title: template.product.title,
        description: template.product.description,
        price: template.product.price,
        isPublished: true,
      });

      console.log('[Onboarding] Store created successfully:', storeName);

      // 6. Create session and redirect
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
  
  // Simplified form state - no description, plan, or theme needed
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    storeName: '',
    subdomain: '',
    category: 'fashion',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storeCreationFailed, setStoreCreationFailed] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const fetcher = useFetcher<{ success?: boolean; error?: string; errorEn?: string; step?: number; emailExists?: boolean; emailAvailable?: boolean }>();
  
  const { t } = useTranslation();

  // Handle fetcher response
  const lastFetcherData = useRef(fetcher.data);
  useEffect(() => {
    if (fetcher.data === lastFetcherData.current) return;
    lastFetcherData.current = fetcher.data;
    
    if (fetcher.data?.emailAvailable) {
      setIsCheckingEmail(false);
      setCurrentStep(2);
    }
    if (fetcher.data?.error) {
      setIsCheckingEmail(false);
      if (fetcher.data.emailExists) {
        setErrors({ email: fetcher.data.error });
      } else {
        setErrors({ form: fetcher.data.error });
        if (fetcher.data.error.includes('store') || fetcher.data.error.includes('Store')) {
          setStoreCreationFailed(true);
          setIsGenerating(false);
        }
      }
    }
  }, [fetcher.data]);

  // Track if subdomain was manually edited
  const [subdomainManuallyEdited, setSubdomainManuallyEdited] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate subdomain from storeName
      if (field === 'storeName' && !subdomainManuallyEdited) {
        const autoSubdomain = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 20);
        updated.subdomain = autoSubdomain;
      }
      
      if (field === 'subdomain') {
        setSubdomainManuallyEdited(true);
      }
      
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleNext = () => {
    // Step 1: Validate account info
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
      
      // Check if email exists
      setIsCheckingEmail(true);
      setErrors({});
      const checkData = new FormData();
      checkData.append('step', 'check_email');
      checkData.append('email', formData.email);
      fetcher.submit(checkData, { method: 'POST' });
      return;
    }
    
    // Step 2: Validate store info and create store
    if (currentStep === 2) {
      const newErrors: Record<string, string> = {};
      if (!formData.storeName || formData.storeName.length < 2) {
        newErrors.storeName = 'Store name is required';
      }
      if (!formData.subdomain || formData.subdomain.length < 3) {
        newErrors.subdomain = 'Subdomain must be at least 3 characters';
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // Go to step 3 (create store)
      setErrors({});
      setCurrentStep(3);
      setIsGenerating(true);
      
      // Submit to create store
      const submitData = new FormData();
      submitData.append('step', 'create_store');
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('name', formData.name);
      submitData.append('storeName', formData.storeName);
      submitData.append('subdomain', formData.subdomain);
      submitData.append('category', formData.category);
      
      fetcher.submit(submitData, { method: 'POST' });
      return;
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Multi-Store</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelector variant="toggle" size="sm" />
            <a 
              href="/auth/logout?redirect=/auth/login" 
              className="text-sm text-gray-600 hover:text-emerald-600"
            >
              {t('alreadyHaveAccount')}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps - 3 steps now */}
        {currentStep < 4 && <OnboardingSteps currentStep={currentStep} totalSteps={3} />}

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 lg:p-12">
          {/* Step 1: Account */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t('createAccount')}</h1>
                <p className="text-gray-500 mt-2">মাত্র ২ মিনিটে স্টোর তৈরি করুন</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('yourName')}
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
                  {t('email')}
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
                  {t('password')}
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

          {/* Step 2: Quick Store Setup */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">আপনার স্টোর সেটআপ করুন</h1>
                <p className="text-gray-500 mt-2">পরে সব চেঞ্জ করতে পারবেন</p>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('storeName')} *
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => updateField('storeName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Fashion House BD"
                />
                {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
              </div>

              {/* Subdomain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  স্টোর লিংক *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => {
                      const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 20);
                      updateField('subdomain', cleaned);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="my-store"
                  />
                  <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-xl text-gray-500 text-sm">
                    .digitalcare.site
                  </span>
                </div>
                {errors.subdomain && <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>}
              </div>

              {/* Category - Visual Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  আপনি কী বিক্রি করেন?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateField('category', cat.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.category === cat.id
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-2">{cat.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{t(cat.key)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick tip */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-700">
                  ✨ আপনার category অনুযায়ী automatically একটা সুন্দর landing page তৈরি হবে। পরে সব customize করতে পারবেন!
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Store Creation Progress */}
          {currentStep === 3 && (
            <div>
              <AISetupProgress 
                isGenerating={isGenerating || isSubmitting}
                hasError={storeCreationFailed}
                errorMessage={errors.form}
                onComplete={() => {}}
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
                      
                      // Retry submission
                      const submitData = new FormData();
                      submitData.append('step', 'create_store');
                      submitData.append('email', formData.email);
                      submitData.append('password', formData.password);
                      submitData.append('name', formData.name);
                      submitData.append('storeName', formData.storeName);
                      submitData.append('subdomain', formData.subdomain);
                      submitData.append('category', formData.category);
                      fetcher.submit(submitData, { method: 'POST' });
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    🔄 {t('retry')}
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
                    {t('startOver')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {errors.form && currentStep !== 3 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {errors.form}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('back')}
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isCheckingEmail || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isCheckingEmail ? t('loading') : currentStep === 2 ? `🚀 ${t('createMyStore')}` : t('continueBtn')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('termsAgree')}
        </p>
      </main>
    </div>
  );
}
