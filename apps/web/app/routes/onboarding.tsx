/**
 * Onboarding Wizard Route - 4-Step Flow with Plan Selection
 *
 * Complete onboarding flow:
 * 1. Account (email, password, name)
 * 2. Store Setup (store name, subdomain, category)
 * 3. Plan Selection (Free/Starter/Premium with bKash payment for paid plans)
 * 4. Auto-create store with landing page
 *
 * Users can customize everything later from Settings.
 */

import { useState, useEffect, useRef } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { formatPrice } from '~/lib/formatting';
import { json, redirect } from '@remix-run/cloudflare';
import { useFetcher } from '@remix-run/react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Crown,
  Zap,
  Gift,
  Smartphone,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, users } from '@db/schema';
import { bdPhoneSchema, emailSchema } from '~/lib/validations/auth';
import {
  getUserId,
  register,
  getSession,
  commitSession,
  completeGoogleOnboardingForExistingUser,
} from '~/services/auth.server';
import { seedDefaultTheme } from '~/lib/theme-seeding.server';
import { OnboardingSteps } from '~/components/onboarding/OnboardingSteps';
import { AISetupProgress } from '~/components/onboarding/AISetupProgress';
import { OnboardingLayout } from '~/components/onboarding/OnboardingLayout';
import { FeatureCarousel } from '~/components/onboarding/FeatureCarousel';
// import { LanguageSelector } from '~/components/LanguageSelector'; // Temporarily disabled - Bengali is default
import { useTranslation } from '~/contexts/LanguageContext';
import i18next from '~/services/i18n.server';

// Define handle for i18n namespace
export const handle = { i18n: 'auth' };

// ==============================================================================
// CONFIGURATION - Update these values
// ==============================================================================

// Your bKash number for receiving payments (can also be set via environment variable)
const BKASH_PAYMENT_NUMBER = '01739416661';

const PLAN_PRICING = {
  free: 0,
  starter: 500, // ৫০০ টাকা/মাস
  premium: 2000, // ২০০০ টাকা/মাস
};

// ==============================================================================
// PLAN OPTIONS
// ==============================================================================

const PLAN_OPTIONS = [
  {
    id: 'free' as const,
    name: 'Free',
    nameKey: 'planFree' as const,
    price: PLAN_PRICING.free,
    icon: Gift,
    color: 'gray',
    features: [
      'feature1Product',
      'feature50Orders',
      'featureFullStoreMode',
      'featureFbApi',
      'featureBkashNagad',
      'featureFraudDetection',
      'featureBasicSupport',
    ],
  },
  {
    id: 'starter' as const,
    name: 'Starter',
    nameKey: 'planStarter' as const,
    price: PLAN_PRICING.starter,
    icon: Zap,
    color: 'emerald',
    popular: true,
    features: [
      'feature50Products',
      'feature500Orders',
      'featureFullStoreMode',
      'featureCustomDomain',
      'featureBkashNagad',
    ],
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    nameKey: 'planPremium' as const,
    price: PLAN_PRICING.premium,
    icon: Crown,
    color: 'purple',
    features: [
      'feature200Products',
      'feature3000Orders',
      'featureFbApi',
      'featureCustomDomain',
      'featurePrioritySupport',
      'feature247Support',
    ],
  },
];

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
const CATEGORY_TEMPLATES: Record<
  string,
  {
    headline: string;
    subheadline: string;
    features: Array<{ icon: string; title: string; description: string }>;
    product: { title: string; price: number; description: string };
  }
> = {
  fashion: {
    headline: 'categoryFashionHeadline',
    subheadline: 'categoryFashionSubheadline',
    features: [
      { icon: '✨', title: 'featurePremiumQuality', description: 'descBestFabric' },
      { icon: '🚚', title: 'featureFastDelivery', description: 'descTwoThreeDays' },
      { icon: '💳', title: 'featureCashOnDelivery', description: 'descPayOnReceive' },
    ],
    product: { title: 'Premium Fashion Item', price: 150000, description: 'descStylishFashion' },
  },
  electronics: {
    headline: 'categoryElectronicsHeadline',
    subheadline: 'categoryElectronicsSubheadline',
    features: [
      { icon: '✅', title: 'featureOriginal', description: 'descWarranty' },
      { icon: '🚚', title: 'featureFastDelivery', description: 'descTwoThreeDays' },
      { icon: '🔧', title: 'featureAfterSales', description: 'descTechnicalSupport' },
    ],
    product: { title: 'Quality Electronics', price: 250000, description: 'descPremiumElectronics' },
  },
  beauty: {
    headline: 'categoryBeautyHeadline',
    subheadline: 'categoryBeautySubheadline',
    features: [
      { icon: '💎', title: 'featureAuthentic', description: 'descGenuine' },
      { icon: '🌿', title: 'featureNatural', description: 'descSkinFriendly' },
      { icon: '💝', title: 'featureFreeGift', description: 'descSurprise' },
    ],
    product: { title: 'Beauty Product', price: 80000, description: 'descPremiumBeauty' },
  },
  food: {
    headline: 'categoryFoodHeadline',
    subheadline: 'categoryFoodSubheadline',
    features: [
      { icon: '🍽️', title: 'featureFresh', description: 'descDaily' },
      { icon: '🚴', title: 'featureHotDelivery', description: 'descHot' },
      { icon: '😋', title: 'featureTasteGuarantee', description: 'descDelicious' },
    ],
    product: { title: 'Delicious Food Item', price: 35000, description: 'descDeliciousFood' },
  },
  home: {
    headline: 'categoryHomeHeadline',
    subheadline: 'categoryHomeSubheadline',
    features: [
      { icon: '🏡', title: 'featureQuality', description: 'descLongLasting' },
      { icon: '📦', title: 'featureSafePackaging', description: 'descCorrectCondition' },
      { icon: '🔄', title: 'featureEasyReturn', description: 'descSevenDays' },
    ],
    product: { title: 'Home & Living Product', price: 120000, description: 'descHomeDecor' },
  },
  services: {
    headline: 'categoryServicesHeadline',
    subheadline: 'categoryServicesSubheadline',
    features: [
      { icon: '👨‍💼', title: 'featureExpertTeam', description: 'descExperienced' },
      { icon: '⏱️', title: 'featureOnTime', description: 'descDeadline' },
      { icon: '💯', title: 'featureSatisfaction', description: 'descBestQuality' },
    ],
    product: {
      title: 'Professional Service',
      price: 200000,
      description: 'descProfessionalService',
    },
  },
  other: {
    headline: 'categoryOtherHeadline',
    subheadline: 'categoryOtherSubheadline',
    features: [
      { icon: '✅', title: 'featurePremiumQuality', description: 'descBestQualityItem' },
      { icon: '🚚', title: 'featureFastDelivery', description: 'descTwoThreeDays' },
      { icon: '💳', title: 'featureCashOnDelivery', description: 'descPayOnReceive' },
    ],
    product: { title: 'Quality Product', price: 100000, description: 'descPremiumProduct' },
  },
};

export const meta: MetaFunction = () => {
  return [{ title: 'Onboarding - Ozzyl' }];
};

// Redirect if already logged in AND onboarding is completed
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const url = new URL(request.url);
  const isGoogleMode = url.searchParams.get('mode') === 'google';

  const userId = await getUserId(request, env);

  if (userId) {
    try {
      const db = drizzle(env.DB);

      const userResult = await db
        .select({
          storeId: users.storeId,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      // If in google mode and user has no storeId, allow them to continue onboarding
      if (isGoogleMode && !userResult[0]?.storeId) {
        return json({
          isGoogleMode: true,
          userEmail: userResult[0]?.email || '',
          userName: userResult[0]?.name || '',
        });
      }

      if (userResult[0]?.storeId) {
        const storeResult = await db
          .select({ onboardingStatus: stores.onboardingStatus, isActive: stores.isActive, deletedAt: stores.deletedAt })
          .from(stores)
          .where(eq(stores.id, userResult[0].storeId))
          .limit(1);

        const storeRow = storeResult[0];
        const isDeletedOrInactive = !storeRow || !storeRow.isActive || storeRow.deletedAt != null;

        if (isDeletedOrInactive) {
          console.error(`[onboarding] User ${userId} has deleted/inactive store, clearing session storeId and allowing re-onboarding`);
          // Clear the stale storeId from session to prevent redirect loops
          const session = await getSession(request, env);
          session.unset('storeId');
          const cookie = await commitSession(session, env);
          return json(
            { isGoogleMode, userEmail: userResult[0]?.email || '', userName: userResult[0]?.name || '' },
            { headers: { 'Set-Cookie': cookie } }
          );
        }

        const onboardingStatus = storeRow?.onboardingStatus || 'pending';
        if (onboardingStatus === 'completed') {
          const session = await getSession(request, env);
          if (!session.get('storeId')) {
            session.set('storeId', userResult[0].storeId);
            return redirect('/app/orders', {
              headers: {
                'Set-Cookie': await commitSession(session, env),
              },
            });
          }

          return redirect('/app/orders');
        }
      }
    } catch (error) {
      console.error('[onboarding.loader] Error:', error);
    }
  }

  return json({ isGoogleMode: false, userEmail: '', userName: '' });
}

// Action to handle each step
export async function action({ request, context }: ActionFunctionArgs) {
  const t = await i18next.getFixedT(request, 'auth');
  const { env } = context.cloudflare;
  const formData = await request.formData();
  const step = formData.get('step') as string;
  const isGoogleMode = formData.get('isGoogleMode') === 'true';

  // Check if email already exists
  if (step === 'check_email') {
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    // Validate email with Zod
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      return json({ error: t('validEmailRequired'), field: 'email' }, { status: 400 });
    }

    // Validate phone with Zod
    const phoneResult = bdPhoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      return json({ error: t('validMobileRequired'), field: 'phone' }, { status: 400 });
    }

    const db = drizzle(env.DB);

    // In google mode, we skip email check since user already exists
    if (!isGoogleMode) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return json(
          {
            error: t('emailAlreadyRegistered'),
            field: 'email',
            emailExists: true,
          },
          { status: 400 }
        );
      }
    }

    // Check if phone already exists
    const existingPhone = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (existingPhone.length > 0) {
      return json(
        {
          error: t('phoneAlreadyRegistered'),
          field: 'phone',
          phoneExists: true,
        },
        { status: 400 }
      );
    }

    return json({ success: true, emailAvailable: true });
  }

  // Check if subdomain is available (Step 2 -> Step 3 transition)
  if (step === 'check_subdomain') {
    const subdomain = formData.get('subdomain') as string;

    if (!subdomain || subdomain.length < 3) {
      return json({ error: t('subdomainMinChars'), field: 'subdomain' }, { status: 400 });
    }

    const db = drizzle(env.DB);
    const existingStore = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.subdomain, subdomain.toLowerCase()))
      .limit(1);

    if (existingStore.length > 0) {
      console.warn('[Onboarding] Subdomain not available:', subdomain);
      return json(
        {
          error: t('subdomainTaken', { subdomain }),
          field: 'subdomain',
          subdomainTaken: true,
        },
        { status: 400 }
      );
    }

    return json({ success: true, subdomainAvailable: true });
  }

  // Create store with category-based template and plan selection
  if (step === 'create_store') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const phone = (formData.get('phone') as string) || ''; // Merchant phone
    const storeName = formData.get('storeName') as string;
    const subdomain = formData.get('subdomain') as string;
    const category = (formData.get('category') as string) || 'other';
    const selectedPlan = (formData.get('selectedPlan') as 'free' | 'starter' | 'premium') || 'free';
    const transactionId = (formData.get('transactionId') as string) || '';
    const paymentPhone = (formData.get('paymentPhone') as string) || '';
    const deliveryCharge = Number(formData.get('deliveryCharge') || 60);
    const deliveryChargeOutside = Number(formData.get('deliveryChargeOutside') || 120);
    const enableFreeDelivery = String(formData.get('enableFreeDelivery')) === 'true';
    const freeDeliveryAbove = Number(formData.get('freeDeliveryAbove') || 0);
    const shippingConfig = {
      insideDhaka: deliveryCharge,
      outsideDhaka: deliveryChargeOutside,
      freeShippingAbove: enableFreeDelivery ? freeDeliveryAbove : 0,
      enabled: true,
    };

    // console.log('[Onboarding] Creating store:', { storeName, subdomain, category, selectedPlan, phone });

    try {
      let storeId: number;
      let userId: number;

      // =========================================================================
      // GOOGLE MODE: User already exists, just create store and link
      // =========================================================================
      if (isGoogleMode) {
        const userIdFromSession = await getUserId(request, env);
        if (!userIdFromSession) {
          return json({ error: 'Session expired. Please sign up again.' }, { status: 400 });
        }

        // Validate phone for google mode
        const phoneResult = bdPhoneSchema.safeParse(phone);
        if (!phoneResult.success) {
          return json({ error: t('validMobileRequired'), field: 'phone' }, { status: 400 });
        }

        // Validate store name
        if (!storeName || storeName.trim().length < 2) {
          return json({ error: t('storeNameRequired'), field: 'storeName' }, { status: 400 });
        }

        // Validate subdomain
        if (!subdomain || subdomain.length < 3) {
          return json({ error: t('subdomainMinChars'), field: 'subdomain' }, { status: 400 });
        }

        // Complete Google onboarding
        const result = await completeGoogleOnboardingForExistingUser({
          userId: userIdFromSession,
          phone,
          storeName,
          subdomain,
          db: env.DB,
        });

        if (!result.success) {
          if (result.error === 'subdomain_taken') {
            return json(
              { error: t('subdomainTaken', { subdomain }), field: 'subdomain' },
              { status: 400 }
            );
          }
          if (result.error === 'phone_taken') {
            return json({ error: t('phoneAlreadyRegistered'), field: 'phone' }, { status: 400 });
          }
          console.warn('[Onboarding] Google onboarding failed:', result.error);
          return json({ error: result.error || t('failedToCreateStore') }, { status: 400 });
        }

        storeId = result.storeId!;
        userId = userIdFromSession;
      }
      // =========================================================================
      // EMAIL MODE: Create new user and store
      // =========================================================================
      else {
        // 1. Register user and create store
        const result = await register({
          email,
          password,
          name,
          phone, // Pass phone to register
          storeName: storeName || 'My Store',
          subdomain: subdomain || `store-${Date.now()}`,
          db: env.DB,
        });

        if (result.error) {
          console.warn('[Onboarding] Registration failed:', result.error);
          return json({ error: result.error }, { status: 400 });
        }

        storeId = result.storeId!;
        userId = result.user!.id;
      }

      const db = drizzle(env.DB);

      // 2. Get category-based template
      const template = CATEGORY_TEMPLATES[category] || CATEGORY_TEMPLATES.other;

      // 3. Create landing config from category template
      const landingConfig = {
        templateId: 'modern-dark',
        headline: t(template.headline),
        subheadline: t(template.subheadline),
        ctaText: t('orderNow') || 'এখনই অর্ডার করুন',
        ctaSubtext: t('cashOnDelivery') || 'ক্যাশ অন ডেলিভারি',
        features: template.features.map((f) => ({
          ...f,
          title: t(f.title),
          description: t(f.description),
        })),
        testimonials: [
          {
            name: t('satisfiedCustomer') || 'সন্তুষ্ট ক্রেতা',
            text: t('satisfiedCustomerText') || 'অনেক ভালো প্রোডাক্ট, দ্রুত ডেলিভারি!',
          },
        ],
        urgencyText: t('limitedTimeOffer') || '🔥 সীমিত সময়ের অফার!',
        guaranteeText: t('satisfactionGuarantee') || '১০০% সন্তুষ্টির গ্যারান্টি',
      };

      // 4. Determine payment status based on plan
      let paymentStatus: 'none' | 'pending_verification' = 'none';
      let paymentAmount: number | undefined;

      if (selectedPlan !== 'free' && transactionId) {
        paymentStatus = 'pending_verification';
        paymentAmount = PLAN_PRICING[selectedPlan];
      }

      // 5. Update store with landing config and payment info
      await db
        .update(stores)
        .set({
          name: storeName,
          planType: selectedPlan,
          landingConfig: JSON.stringify(landingConfig),
          onboardingStatus: 'completed',
          setupStep: 4,
          shippingConfig: JSON.stringify(shippingConfig),
          // Payment tracking
          paymentTransactionId: transactionId || null,
          paymentStatus,
          paymentSubmittedAt: transactionId ? new Date() : null,
          paymentAmount: paymentAmount || null,
          paymentPhone: paymentPhone || null,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      // 6. Seed default theme (NEW)
      // This ensures the store has a theme and templates ready immediately
      try {
        // console.log('[Onboarding] Seeding default theme for store:', storeId);
        await seedDefaultTheme(env.DB, storeId);
      } catch (themeError) {
        console.error('[Onboarding] Failed to seed theme:', themeError);
        // Don't block store creation, can be fixed later or on first dashboard visit
      }

      // NOTE: Demo product creation removed - merchants should add their own products

      // console.log('[Onboarding] Store created successfully:', storeName, '| Plan:', selectedPlan, '| TRX:', transactionId || 'N/A');

      // 7. Create session and return JSON for client-side hard redirect
      // We use a hard redirect (window.location) to prevent White Screen/Hydration issues
      // that can occur with soft navigation after heavy onboarding operations.
      // NOTE: We create a fresh session to ensure clean state
      const session = await getSession(new Request('http://localhost'), env);
      session.set('userId', userId);
      session.set('storeId', storeId);

      return json(
        {
          success: true,
          redirectUrl: '/app/orders?onboarding=success',
        },
        {
          headers: {
            'Set-Cookie': await commitSession(session, env),
          },
        }
      );
    } catch (error) {
      console.error('[Onboarding] Error:', error);
      return json(
        {
          error: t('failedToCreateStore'),
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }

  return json({ error: t('invalidStep') }, { status: 400 });
}

export default function OnboardingPage() {
  const { isGoogleMode: initialGoogleMode, userEmail, userName } = useLoaderData<typeof loader>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [animationDone, setAnimationDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGoogleMode] = useState(initialGoogleMode);

  // Form state including plan and payment
  const [formData, setFormData] = useState({
    email: userEmail || '',
    password: '',
    name: userName || '',
    phone: '', // Merchant mobile number
    storeName: '',
    subdomain: '',
    category: 'fashion',
    selectedPlan: 'free' as 'free' | 'starter' | 'premium',
    transactionId: '',
    paymentPhone: '',
    deliveryCharge: 60,
    deliveryChargeOutside: 120,
    enableFreeDelivery: false,
    freeDeliveryAbove: 1000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [storeCreationFailed, setStoreCreationFailed] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const fetcher = useFetcher<{
    success?: boolean;
    error?: string;
    errorEn?: string;
    step?: number;
    emailExists?: boolean;
    phoneExists?: boolean;
    emailAvailable?: boolean;
    subdomainAvailable?: boolean;
    subdomainTaken?: boolean;
    redirectUrl?: string;
  }>();

  const { t } = useTranslation();

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Handle fetcher response
  const lastFetcherData = useRef(fetcher.data);
  useEffect(() => {
    if (fetcher.data === lastFetcherData.current) return;
    lastFetcherData.current = fetcher.data;

    // FIX: Force hard redirect on success to prevent White Screen/Hydration issues
    if (fetcher.data?.redirectUrl) {
      setPendingRedirect(fetcher.data.redirectUrl);
    }

    if (fetcher.data?.emailAvailable) {
      setIsCheckingEmail(false);
      setCurrentStep(2);
    }
    if (fetcher.data?.subdomainAvailable) {
      setIsCheckingSubdomain(false);
      setCurrentStep(3);
    }
    if (fetcher.data?.error) {
      setIsCheckingEmail(false);
      setIsCheckingSubdomain(false);
      if (fetcher.data.emailExists) {
        setErrors({ email: fetcher.data.error });
      } else if (fetcher.data.phoneExists) {
        setErrors({ phone: fetcher.data.error });
      } else if (fetcher.data.subdomainTaken) {
        setErrors({ subdomain: fetcher.data.error });
      } else {
        setErrors({ form: fetcher.data.error });
        if (fetcher.data.error.includes('store') || fetcher.data.error.includes('Store')) {
          setStoreCreationFailed(true);
          setIsGenerating(false);
        }
      }
    }
  }, [fetcher.data]);

  // Execute redirect when both server is ready and animation is done
  useEffect(() => {
    if (pendingRedirect && animationDone) {
      window.location.href = pendingRedirect;
    }
  }, [pendingRedirect, animationDone]);

  // Track if subdomain was manually edited
  const [subdomainManuallyEdited, setSubdomainManuallyEdited] = useState(false);

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate subdomain from storeName
      if (field === 'storeName' && !subdomainManuallyEdited && typeof value === 'string') {
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

  const copyBkashNumber = () => {
    navigator.clipboard.writeText(BKASH_PAYMENT_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    // Step 1: Validate account info
    if (currentStep === 1) {
      const newErrors: Record<string, string> = {};
      if (!formData.email || !formData.email.includes('@')) {
        newErrors.email = t('auth:validEmailRequired');
      }
      // Skip password validation in google mode
      if (!isGoogleMode && (!formData.password || formData.password.length < 6)) {
        newErrors.password = t('auth:passwordMinChars');
      }
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = t('auth:nameRequired');
      }
      // Phone validation: must start with 01 and be 11 digits
      if (!formData.phone || formData.phone.length !== 11 || !formData.phone.startsWith('01')) {
        newErrors.phone = t('auth:validMobileRequired');
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Check if email and phone exist
      setIsCheckingEmail(true);
      setErrors({});
      const checkData = new FormData();
      checkData.append('step', 'check_email');
      checkData.append('email', formData.email);
      checkData.append('phone', formData.phone);
      checkData.append('isGoogleMode', String(isGoogleMode));
      fetcher.submit(checkData, { method: 'POST' });
      return;
    }

    // Step 2: Validate store info and check subdomain availability
    if (currentStep === 2) {
      const newErrors: Record<string, string> = {};
      if (!formData.storeName || formData.storeName.length < 2) {
        newErrors.storeName = t('auth:storeNameRequired');
      }
      if (!formData.subdomain || formData.subdomain.length < 3) {
        newErrors.subdomain = t('auth:subdomainMinChars');
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Check subdomain availability before proceeding
      setIsCheckingSubdomain(true);
      setErrors({});
      const checkData = new FormData();
      checkData.append('step', 'check_subdomain');
      checkData.append('subdomain', formData.subdomain);
      fetcher.submit(checkData, { method: 'POST' });
      return;
    }

    // Step 3: Validate plan selection and payment (if paid plan)
    if (currentStep === 3) {
      // For paid plans, validate TRX ID
      if (formData.selectedPlan !== 'free' && !formData.transactionId) {
        setErrors({ transactionId: t('auth:trxIdRequired') });
        return;
      }

      // Go to step 4 (create store)
      setErrors({});
      setCurrentStep(4);
      setIsGenerating(true);

      // Submit to create store
      const submitData = new FormData();
      submitData.append('step', 'create_store');
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone); // Merchant phone
      submitData.append('storeName', formData.storeName);
      submitData.append('subdomain', formData.subdomain);
      submitData.append('category', formData.category);
      submitData.append('selectedPlan', formData.selectedPlan);
      submitData.append('transactionId', formData.transactionId);
      submitData.append('paymentPhone', formData.paymentPhone);
      submitData.append('deliveryCharge', String(formData.deliveryCharge));
      submitData.append('deliveryChargeOutside', String(formData.deliveryChargeOutside));
      submitData.append('enableFreeDelivery', String(formData.enableFreeDelivery));
      submitData.append('freeDeliveryAbove', String(formData.freeDeliveryAbove));
      submitData.append('isGoogleMode', String(isGoogleMode));

      fetcher.submit(submitData, { method: 'POST' });
      return;
    }
  };

  const handleContinueWithFree = () => {
    setFormData((prev) => ({ ...prev, selectedPlan: 'free', transactionId: '', paymentPhone: '' }));

    // Create store with free plan immediately
    setCurrentStep(4);
    setIsGenerating(true);

    const submitData = new FormData();
    submitData.append('step', 'create_store');
    submitData.append('email', formData.email);
    submitData.append('password', formData.password);
    submitData.append('name', formData.name);
    submitData.append('phone', formData.phone); // Merchant phone
    submitData.append('storeName', formData.storeName);
    submitData.append('subdomain', formData.subdomain);
    submitData.append('category', formData.category);
    submitData.append('selectedPlan', 'free');
    submitData.append('transactionId', '');
    submitData.append('paymentPhone', '');
    submitData.append('deliveryCharge', String(formData.deliveryCharge));
    submitData.append('deliveryChargeOutside', String(formData.deliveryChargeOutside));
    submitData.append('enableFreeDelivery', String(formData.enableFreeDelivery));
    submitData.append('freeDeliveryAbove', String(formData.freeDeliveryAbove));
    submitData.append('isGoogleMode', String(isGoogleMode));

    fetcher.submit(submitData, { method: 'POST' });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const isSubmitting = fetcher.state === 'submitting' || fetcher.state === 'loading';

  const selectedPlanData = PLAN_OPTIONS.find((p) => p.id === formData.selectedPlan);

  return (
    <OnboardingLayout featureComponent={<FeatureCarousel />}>
      {/* Progress Steps */}
      {currentStep < 5 && <OnboardingSteps currentStep={currentStep} totalSteps={4} />}

      {/* Step Content */}
      <div className="w-full">
        {/* Step 1: Account */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{t('auth:createAccount')}</h1>
              <p className="text-gray-500 mt-2">{t('auth:createStoreIn2Min')}</p>
            </div>

            {/* Google Sign Up Button - Only show for non-google mode */}
            {!isGoogleMode && (
              <div className="mb-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-emerald-50 hover:border-emerald-200 transition"
                  onClick={() => {
                    window.location.href = '/auth/google?intent=signup';
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t('auth:signUpWithGoogle') || 'Sign up with Google'}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {t('auth:orContinueWith') || 'or continue with email'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Google Mode Notice */}
            {isGoogleMode && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-700">
                  {t('auth:googleModeDescription') ||
                    'You signed up with Google. Please complete your store setup below.'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:yourName')}
              </label>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={t('auth:placeholderName')}
                readOnly={isGoogleMode}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth:email')}</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={t('auth:placeholderEmail')}
                readOnly={isGoogleMode}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password - Hide in Google mode */}
            {!isGoogleMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth:password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:mobileNumber')} *
              </label>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => {
                  // Only allow numbers and max 11 digits
                  const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                  updateField('phone', cleaned);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="01XXXXXXXXX"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              <p className="text-xs text-gray-500 mt-1">{t('auth:bdMobileHint')}</p>
            </div>
          </div>
        )}

        {/* Step 2: Quick Store Setup */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{t('auth:setupYourStore')}</h1>
              <p className="text-gray-500 mt-2">{t('auth:canChangeLater')}</p>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:storeName')} *
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => updateField('storeName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={t('auth:placeholderStoreName')}
              />
              {errors.storeName && (
                <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>
              )}
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:storeLink')} *
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '')
                      .slice(0, 20);
                    updateField('subdomain', cleaned);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder={t('auth:placeholderSubdomain')}
                />
                <span className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-xl text-gray-500 text-sm">
                  .ozzyl.com
                </span>
              </div>
              {errors.subdomain && (
                <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
              )}
            </div>

            {/* Category - Visual Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('auth:whatDoYouSellLabel')}
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
                    <span className="text-sm font-medium text-gray-700">{t(`auth:${cat.key}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Settings */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('auth:deliverySettings')}</h3>

              {/* Delivery Charge */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth:deliveryChargeInside')}
                </label>
                <input
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={(e) => updateField('deliveryCharge', parseInt(e.target.value) || 60)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="60"
                  min="0"
                  step="10"
                />
                <p className="text-gray-500 text-sm mt-1">
                  {t('auth:deliveryChargeInsideHint')}
                </p>
              </div>

              {/* Delivery Charge (Outside Dhaka) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth:deliveryChargeOutside')}
                </label>
                <input
                  type="number"
                  value={formData.deliveryChargeOutside}
                  onChange={(e) =>
                    updateField('deliveryChargeOutside', parseInt(e.target.value) || 120)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="120"
                  min="0"
                  step="10"
                />
                <p className="text-gray-500 text-sm mt-1">
                  {t('auth:deliveryChargeOutsideHint')}
                </p>
              </div>

              {/* Free Delivery Toggle */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enableFreeDelivery}
                    onChange={(e) => updateField('enableFreeDelivery', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {t('auth:enableFreeDelivery')}
                  </span>
                </label>
              </div>

              {/* Free Delivery Threshold */}
              {formData.enableFreeDelivery && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth:freeDeliveryAboveAmount')}
                  </label>
                  <input
                    type="number"
                    value={formData.freeDeliveryAbove}
                    onChange={(e) =>
                      updateField('freeDeliveryAbove', parseInt(e.target.value) || 1000)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="1000"
                    min="100"
                    step="100"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {t('auth:freeDeliveryAboveHint')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Plan Selection with bKash Payment */}
        {currentStep === 3 && (
          <div className="plan-step space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{t('auth:choosePlan')}</h1>
              <p className="text-gray-500 mt-2">{t('auth:selectPlanBasedNeeds')}</p>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLAN_OPTIONS.map((plan) => {
                const Icon = plan.icon;
                const isSelected = formData.selectedPlan === plan.id;
                const features = plan.features;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => updateField('selectedPlan', plan.id)}
                    className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? plan.color === 'gray'
                          ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
                          : plan.color === 'emerald'
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                            : 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                        {t('auth:mostPopular')}
                      </span>
                    )}

                    {/* Icon + Name + Price */}
                    <div className="flex items-start gap-2 mb-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          plan.color === 'gray'
                            ? 'bg-gray-100'
                            : plan.color === 'emerald'
                              ? 'bg-emerald-100'
                              : 'bg-purple-100'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            plan.color === 'gray'
                              ? 'text-gray-600'
                              : plan.color === 'emerald'
                                ? 'text-emerald-600'
                                : 'text-purple-600'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{t(`auth:${plan.nameKey}`)}</h3>
                        <p className="text-base font-bold leading-tight">
                          {plan.price === 0 ? t('auth:freeText') : formatPrice(plan.price)}
                          {plan.price > 0 && (
                            <span className="text-xs font-normal text-gray-500">
                              {t('auth:perMonth')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-1.5">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{t(`auth:${feature}`)}</span>
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            plan.color === 'gray'
                              ? 'bg-gray-500'
                              : plan.color === 'emerald'
                                ? 'bg-emerald-500'
                                : 'bg-purple-500'
                          }`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* bKash Payment Section (for paid plans) */}
            {formData.selectedPlan !== 'free' && (
              <div className="mt-8 p-6 bg-pink-50 border-2 border-pink-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{t('auth:bkashPayment')}</h3>
                    <p className="text-sm text-gray-600">{t('auth:sendMoneyTo')}</p>
                  </div>
                </div>

                {/* bKash Number with Copy */}
                <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{t('auth:bkashNumber')}</p>
                    <p className="text-2xl font-bold text-pink-600">{BKASH_PAYMENT_NUMBER}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyBkashNumber}
                    className="p-3 bg-pink-100 hover:bg-pink-200 rounded-xl transition-colors"
                  >
                    <Copy className={`w-5 h-5 ${copied ? 'text-green-600' : 'text-pink-600'}`} />
                  </button>
                </div>
                {copied && <p className="text-sm text-green-600 mb-4">{t('auth:copied')}</p>}

                {/* Amount */}
                <div className="bg-white rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-500">{t('auth:amount')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(selectedPlanData?.price || 0)}
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-amber-800">⚠️ {t('auth:afterSendMoney')}</p>
                </div>

                {/* TRX ID Input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth:enterTrxId')} *
                    </label>
                    <input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) => updateField('transactionId', e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase"
                      placeholder={t('auth:trxIdPlaceholder')}
                    />
                    {errors.transactionId && (
                      <p className="text-red-500 text-sm mt-1">{errors.transactionId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('auth:paymentPhoneUsed')}
                    </label>
                    <input
                      type="tel"
                      value={formData.paymentPhone}
                      onChange={(e) => updateField('paymentPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>

                {/* Or Continue Free */}
                <div className="mt-6 pt-4 border-t border-pink-200 text-center">
                  <button
                    type="button"
                    onClick={handleContinueWithFree}
                    className="text-gray-600 hover:text-gray-900 text-sm underline"
                  >
                    {t('auth:orContinueFree')}
                  </button>
                </div>
              </div>
            )}

            {/* Tip for Free Plan */}
            {formData.selectedPlan === 'free' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-700">✨ {t('auth:startFreeUpgradeLater')}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Store Creation Progress */}
        {currentStep === 4 && (
          <div>
            <AISetupProgress
              isGenerating={isGenerating || isSubmitting}
              hasError={storeCreationFailed}
              errorMessage={errors.form}
              onComplete={() => setAnimationDone(true)}
            />

            {/* Payment Pending Notice (for paid plans) */}
            {!storeCreationFailed &&
              formData.selectedPlan !== 'free' &&
              formData.transactionId && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-800">⏳ {t('auth:paymentPending')}</p>
                  <p className="text-sm text-amber-600 mt-1">{t('auth:paymentVerificationNotice')}</p>
                </div>
              )}

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
                    submitData.append('phone', formData.phone);
                    submitData.append('storeName', formData.storeName);
                    submitData.append('subdomain', formData.subdomain);
                    submitData.append('category', formData.category);
                    submitData.append('selectedPlan', formData.selectedPlan);
                    submitData.append('transactionId', formData.transactionId);
                    submitData.append('paymentPhone', formData.paymentPhone);
                    submitData.append('deliveryCharge', String(formData.deliveryCharge));
                    submitData.append(
                      'deliveryChargeOutside',
                      String(formData.deliveryChargeOutside)
                    );
                    submitData.append('enableFreeDelivery', String(formData.enableFreeDelivery));
                    submitData.append('freeDeliveryAbove', String(formData.freeDeliveryAbove));
                    submitData.append('isGoogleMode', String(isGoogleMode));
                    fetcher.submit(submitData, { method: 'POST' });
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  🔄 {t('auth:retry')}
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
                  {t('auth:startOver')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {errors.form && currentStep !== 4 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {errors.form}
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth:back')}
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isCheckingEmail || isCheckingSubdomain || isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCheckingEmail || isCheckingSubdomain
                ? t('auth:loading')
                : currentStep === 3
                  ? formData.selectedPlan === 'free'
                    ? `🚀 ${t('auth:createMyStore')}`
                    : `💳 ${t('auth:proceedWithPayment')}`
                  : t('auth:continueBtn')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-gray-500 mt-6 lg:hidden">{t('auth:termsAgree')}</p>
    </OnboardingLayout>
  );
}
