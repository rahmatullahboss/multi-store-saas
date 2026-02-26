/**
 * Genie Mode 2.0 — AI Bengali Copy Wizard
 *
 * 4-step wizard:
 * Step 1: Store name + industry (8 industries)
 * Step 2: Target audience + main goal
 * Step 3: Top 3 products/services
 * Step 4: AI generating... (loading state with Bengali progress messages)
 *
 * On success: redirect to /app/new-builder/:pageId with generated page.
 */

import { useState, useEffect, useRef } from 'react';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigate } from '@remix-run/react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Store, Users, Target, Package, Loader2 } from 'lucide-react';
import { requireAuth } from '~/lib/auth.server';
import { createPageFromTemplate } from '~/lib/page-builder/actions.server';
import type { GenieCopyResult } from '~/lib/page-builder/ai-copy.server';

// ============================================================================
// TYPES
// ============================================================================

interface WizardData {
  storeName: string;
  industry: string;
  targetAudience: string;
  goal: string;
  products: string[];
}

interface LoaderData {
  storeName: string;
  storeId: number;
}

interface AICopyResponse {
  success: boolean;
  data?: GenieCopyResult;
  usedFallback?: boolean;
  model?: string;
  error?: string;
  rateLimitExceeded?: boolean;
}

interface CreatePageResponse {
  success: boolean;
  pageId?: string;
  redirectTo?: string;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INDUSTRIES = [
  { id: 'fashion', label: 'ফ্যাশন', emoji: '👗' },
  { id: 'food', label: 'খাবার', emoji: '🍛' },
  { id: 'tech', label: 'টেক', emoji: '💻' },
  { id: 'service', label: 'সেবা', emoji: '🛠️' },
  { id: 'beauty', label: 'সৌন্দর্য', emoji: '💄' },
  { id: 'home', label: 'গৃহসজ্জা', emoji: '🏠' },
  { id: 'education', label: 'শিক্ষা', emoji: '📚' },
  { id: 'health', label: 'স্বাস্থ্য', emoji: '💊' },
] as const;

const GOALS = [
  { id: 'sales', label: 'বিক্রয় বৃদ্ধি' },
  { id: 'leads', label: 'লিড সংগ্রহ' },
  { id: 'brand', label: 'ব্র্যান্ড পরিচিতি' },
  { id: 'whatsapp', label: 'WhatsApp অর্ডার' },
];

const AUDIENCES = [
  { id: 'women', label: 'নারী ক্রেতা' },
  { id: 'men', label: 'পুরুষ ক্রেতা' },
  { id: 'youth', label: 'তরুণ প্রজন্ম' },
  { id: 'families', label: 'পরিবার' },
  { id: 'businesses', label: 'ব্যবসায়ী' },
  { id: 'all', label: 'সকলের জন্য' },
];

const LOADING_MESSAGES = [
  'আপনার পেজ তৈরি হচ্ছে...',
  'AI কপি লেখা হচ্ছে...',
  'সেকশন সাজানো হচ্ছে...',
  'প্রায় হয়ে গেছে!',
];

// Map industry id to Bengali label
const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRIES.map((i) => [i.id, i.label])
);

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { store } = await requireAuth(request, context);
  return json<LoaderData>({ storeName: store.name, storeId: store.id });
}

// ============================================================================
// ACTION — create page with generated copy
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const {
    wizardData,
    copyResult,
  } = body as { wizardData: WizardData; copyResult: GenieCopyResult };

  if (!wizardData || !copyResult) {
    return json({ success: false, error: 'Missing wizardData or copyResult' }, { status: 400 });
  }

  // Build slug from store name + timestamp
  const baseSlug = wizardData.storeName
    .toLowerCase()
    .replace(/[^\u0980-\u09FFa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 25)
    .replace(/-+$/, '');
  const slug = `${baseSlug || 'genie'}-${Date.now()}`;
  const title = `${wizardData.storeName} — ${INDUSTRY_LABEL[wizardData.industry] ?? wizardData.industry}`;

  // Build defaultContent from copyResult to inject into sections
  const defaultContent = {
    headline: copyResult.hero.headline,
    subheadline: copyResult.hero.subheadline,
    ctaText: copyResult.hero.ctaText,
    trustBadges: copyResult.trustBadges.items.map((b) => ({
      icon: b.icon,
      text: b.text,
    })),
    benefits: copyResult.features.items.map((f) => ({
      icon: '✨',
      title: f.title,
      description: f.description,
    })),
    faq: copyResult.faq.items,
  };

  try {
    const result = await createPageFromTemplate(
      db,
      store.id,
      'quick-start', // use default template
      slug,
      title,
      {
        optimizedSections: ['hero', 'trust-badges', 'features', 'testimonials', 'faq', 'cta'],
        defaultContent,
        linkedProductId: null,
      }
    );

    if ('error' in result) {
      return json({ success: false, error: result.error }, { status: 400 });
    }

    return json<CreatePageResponse>({
      success: true,
      pageId: result.pageId,
      redirectTo: `/app/new-builder/${result.pageId}`,
    });
  } catch (err) {
    console.error('[Genie] createPageFromTemplate error:', err);
    return json({ success: false, error: 'পেজ তৈরিতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

// ============================================================================
// STEP INDICATOR
// ============================================================================

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i + 1 < current
                ? 'bg-green-500 text-white'
                : i + 1 === current
                ? 'bg-purple-600 text-white ring-4 ring-purple-100'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {i + 1 < current ? <CheckCircle size={16} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-8 transition-all ${
                i + 1 < current ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// STEP 1: Store name + Industry
// ============================================================================

function Step1({
  data,
  onChange,
  onNext,
}: {
  data: Pick<WizardData, 'storeName' | 'industry'>;
  onChange: (field: keyof WizardData, value: string) => void;
  onNext: () => void;
}) {
  const canNext = data.storeName.trim().length > 0 && data.industry !== '';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Store className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">আপনার স্টোর সম্পর্কে বলুন</h2>
        <p className="text-gray-500 text-sm mt-1">আমরা আপনার জন্য পার্ফেক্ট কপি তৈরি করবো</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          স্টোরের নাম <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.storeName}
          onChange={(e) => onChange('storeName', e.target.value)}
          placeholder="যেমন: রহিম ফ্যাশন হাউস"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
          maxLength={100}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          ইন্ডাস্ট্রি নির্বাচন করুন <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => onChange('industry', ind.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                data.industry === ind.id
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{ind.emoji}</span>
              <span className="text-xs font-medium">{ind.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canNext}
        className="w-full py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        পরবর্তী ধাপ
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ============================================================================
// STEP 2: Target audience + Goal
// ============================================================================

function Step2({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Pick<WizardData, 'targetAudience' | 'goal'>;
  onChange: (field: keyof WizardData, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canNext = data.targetAudience !== '' && data.goal !== '';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">আপনার গ্রাহক ও লক্ষ্য</h2>
        <p className="text-gray-500 text-sm mt-1">কার কাছে বিক্রি করতে চান?</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          টার্গেট অডিয়েন্স <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {AUDIENCES.map((aud) => (
            <button
              key={aud.id}
              type="button"
              onClick={() => onChange('targetAudience', aud.label)}
              className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                data.targetAudience === aud.label
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {aud.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          মূল লক্ষ্য কী? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => onChange('goal', goal.label)}
              className={`py-3 px-4 rounded-xl border-2 font-medium text-sm flex items-center gap-2 transition-all ${
                data.goal === goal.label
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Target size={15} />
              {goal.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
          পেছনে
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          পরবর্তী
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 3: Top products/services
// ============================================================================

function Step3({
  data,
  onChange,
  onNext,
  onBack,
}: {
  data: Pick<WizardData, 'products'>;
  onChange: (field: keyof WizardData, value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const addProduct = () => {
    const trimmed = inputValue.trim();
    if (trimmed && data.products.length < 3) {
      onChange('products', [...data.products, trimmed]);
      setInputValue('');
    }
  };

  const removeProduct = (index: number) => {
    onChange('products', data.products.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addProduct();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">আপনার পণ্য/সেবা</h2>
        <p className="text-gray-500 text-sm mt-1">সর্বোচ্চ ৩টি প্রধান পণ্য বা সেবার নাম দিন</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          পণ্য/সেবার নাম
          <span className="text-gray-400 font-normal ml-2">({data.products.length}/3)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="যেমন: সুতির শাড়ি"
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
            disabled={data.products.length >= 3}
            maxLength={100}
          />
          <button
            type="button"
            onClick={addProduct}
            disabled={!inputValue.trim() || data.products.length >= 3}
            className="px-5 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            যোগ করুন
          </button>
        </div>

        {data.products.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.products.map((product, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-sm font-medium"
              >
                {product}
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="w-4 h-4 flex items-center justify-center text-purple-400 hover:text-purple-700 transition-colors"
                  aria-label={`${product} সরিয়ে দিন`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {data.products.length === 0 && (
          <p className="text-xs text-gray-400 mt-2">
            কমপক্ষে ১টি পণ্য যোগ করুন অথবা ছেড়ে দিন, AI নিজেই সিদ্ধান্ত নেবে।
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
          পেছনে
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Sparkles size={18} />
          AI দিয়ে তৈরি করুন
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// STEP 4: Loading / Generating
// ============================================================================

function Step4Loading({ messageIndex }: { messageIndex: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-purple-500" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-gray-900">
          {LOADING_MESSAGES[messageIndex] ?? LOADING_MESSAGES[0]}
        </h2>
        <p className="text-gray-500 text-sm">একটু অপেক্ষা করুন, AI কাজ করছে...</p>
      </div>

      <div className="flex gap-2">
        {LOADING_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= messageIndex ? 'w-8 bg-purple-600' : 'w-3 bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GenieWizard() {
  const { storeName } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [messageIndex, setMessageIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [wizardData, setWizardData] = useState<WizardData>({
    storeName,
    industry: '',
    targetAudience: '',
    goal: '',
    products: [],
  });

  // Fetcher for AI copy generation
  const copyFetcher = useFetcher<AICopyResponse>();
  // Fetcher for page creation
  const pageFetcher = useFetcher<CreatePageResponse>();

  const isGenerating =
    copyFetcher.state === 'submitting' || copyFetcher.state === 'loading' ||
    pageFetcher.state === 'submitting' || pageFetcher.state === 'loading';

  // Loading message rotation
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 4 && isGenerating) {
      intervalRef.current = setInterval(() => {
        setMessageIndex((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
      }, 1800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setMessageIndex(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step, isGenerating]);

  // When AI copy is done → create the page
  useEffect(() => {
    if (copyFetcher.state === 'idle' && copyFetcher.data) {
      const res = copyFetcher.data;
      if (!res.success || !res.data) {
        setErrorMsg(res.error ?? 'AI কপি তৈরিতে সমস্যা হয়েছে।');
        setStep(3);
        return;
      }
      // Create page with the copy
      pageFetcher.submit(
        JSON.stringify({ wizardData, copyResult: res.data }),
        {
          method: 'POST',
          action: '/app/new-builder/genie',
          encType: 'application/json',
        }
      );
    }
  }, [copyFetcher.state, copyFetcher.data]);

  // When page is created → redirect
  useEffect(() => {
    if (pageFetcher.state === 'idle' && pageFetcher.data) {
      const res = pageFetcher.data;
      if (res.success && res.redirectTo) {
        window.location.href = res.redirectTo;
      } else if (!res.success) {
        setErrorMsg(res.error ?? 'পেজ তৈরিতে সমস্যা হয়েছে।');
        setStep(3);
      }
    }
  }, [pageFetcher.state, pageFetcher.data]);

  const handleChange = (field: keyof WizardData, value: string | string[]) => {
    setWizardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    setErrorMsg(null);
    setStep(4);

    const industryLabel = INDUSTRY_LABEL[wizardData.industry] ?? wizardData.industry;

    copyFetcher.submit(
      JSON.stringify({
        storeName: wizardData.storeName,
        industry: industryLabel,
        targetAudience: wizardData.targetAudience,
        goal: wizardData.goal,
        products: wizardData.products,
      }),
      {
        method: 'POST',
        action: '/api/builder/ai-copy',
        encType: 'application/json',
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            <Sparkles size={16} />
            ✨ Genie Mode 2.0
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI দিয়ে পেজ তৈরি করুন
          </h1>
          <p className="text-gray-500">
            মাত্র ৪টি ধাপে আপনার হাই-কনভার্টিং বাংলা ল্যান্ডিং পেজ
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {step < 4 && <StepIndicator current={step} total={3} />}

          {/* Error message */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              ⚠️ {errorMsg}
            </div>
          )}

          {step === 1 && (
            <Step1
              data={{ storeName: wizardData.storeName, industry: wizardData.industry }}
              onChange={handleChange as (field: keyof WizardData, value: string) => void}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <Step2
              data={{ targetAudience: wizardData.targetAudience, goal: wizardData.goal }}
              onChange={handleChange as (field: keyof WizardData, value: string) => void}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3
              data={{ products: wizardData.products }}
              onChange={handleChange as (field: keyof WizardData, value: string[]) => void}
              onNext={handleGenerate}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && <Step4Loading messageIndex={messageIndex} />}
        </div>

        {/* Back to builder link */}
        {step < 4 && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/app/new-builder')}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← পেজ বিল্ডারে ফিরে যান
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
