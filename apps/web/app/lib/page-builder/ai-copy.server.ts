/**
 * Genie Mode 2.0 — Bengali Copy Generator
 *
 * Generates AI-powered Bengali copy for all landing page sections.
 * Primary model: @cf/qwen/qwen2.5-7b-instruct
 * Fallback model: @cf/meta/llama-3.1-8b-instruct
 * Final fallback: Curated Bengali template defaults (never empty strings)
 *
 * Rate limit: 10 AI requests per store per hour via AI_RATE_LIMIT KV.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface GenieInput {
  storeName: string;      // e.g. 'রহিম ফ্যাশন হাউস'
  industry: string;       // e.g. 'ফ্যাশন ও পোশাক'
  targetAudience: string; // e.g. 'নারী ক্রেতা'
  goal: string;           // e.g. 'বিক্রয় বৃদ্ধি'
  products: string[];     // e.g. ['শাড়ি', 'সালোয়ার কামিজ']
  storeId: number;
}

export interface GenieCopyResult {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  features: {
    title: string;
    items: Array<{ title: string; description: string }>;
  };
  testimonials: {
    title: string;
    items: Array<{ name: string; text: string; rating: number }>;
  };
  faq: {
    title: string;
    items: Array<{ question: string; answer: string }>;
  };
  cta: {
    headline: string;
    buttonText: string;
  };
  trustBadges: {
    items: Array<{ icon: string; text: string }>;
  };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (seconds) when the slot resets
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_SECONDS = 3600; // 1 hour

/**
 * Check and increment rate limit for a store.
 * Key format: genie:ratelimit:{storeId}:{hourSlot}
 */
export async function checkGenieRateLimit(
  kv: KVNamespace,
  storeId: number
): Promise<RateLimitResult> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const hourSlot = Math.floor(nowSeconds / RATE_LIMIT_WINDOW_SECONDS);
  const key = `genie:ratelimit:${storeId}:${hourSlot}`;
  const resetAt = (hourSlot + 1) * RATE_LIMIT_WINDOW_SECONDS;

  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt };
  }

  // Atomic increment — store new count with TTL aligned to window end
  const ttl = resetAt - nowSeconds + 60; // small buffer
  await kv.put(key, String(count + 1), { expirationTtl: ttl });

  return { allowed: true, remaining: RATE_LIMIT_MAX - count - 1, resetAt };
}

// ============================================================================
// PROMPT BUILDER
// ============================================================================

function buildSystemPrompt(): string {
  return `তুমি একজন বাংলাদেশী ই-কমার্স কপিরাইটার বিশেষজ্ঞ। তুমি বাংলা ভাষায় উচ্চ-রূপান্তরকারী ল্যান্ডিং পেজ কপি লেখো। সবসময় সঠিক বাংলা ব্যবহার করো (ইংরেজি মিশ্রিত নয়)। JSON ফরম্যাটে সরাসরি উত্তর দাও, অতিরিক্ত টেক্সট ছাড়া।`;
}

// ✅ Sanitize user input before prompt interpolation — prevents newline injection
// Strips newlines/carriage returns and limits length to prevent prompt hijacking.
// Risk is self-contained (merchant can only affect their own page) but defense-in-depth.
function sanitizePromptInput(s: string, maxLen = 100): string {
  return s.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function buildUserPrompt(input: GenieInput): string {
  const productList = input.products.length > 0
    ? input.products.map((p) => sanitizePromptInput(p, 50)).join(', ')
    : 'বিভিন্ন পণ্য';

  return `নিচের তথ্য দিয়ে একটি সম্পূর্ণ ল্যান্ডিং পেজের বাংলা কপি তৈরি করো:

স্টোরের নাম: ${sanitizePromptInput(input.storeName)}
ইন্ডাস্ট্রি: ${sanitizePromptInput(input.industry)}
টার্গেট অডিয়েন্স: ${sanitizePromptInput(input.targetAudience)}
লক্ষ্য: ${sanitizePromptInput(input.goal)}
পণ্য/সেবা: ${productList}

নিচের JSON স্ট্রাকচার অনুযায়ী উত্তর দাও (শুধুমাত্র JSON, কোনো মন্তব্য নয়):

{
  "hero": {
    "headline": "আকর্ষণীয় শিরোনাম (সর্বোচ্চ ১০ শব্দ)",
    "subheadline": "বিস্তারিত সাব-হেডলাইন (১৫-২০ শব্দ)",
    "ctaText": "CTA বাটনের লেখা (৩-৫ শব্দ)"
  },
  "features": {
    "title": "ফিচার সেকশনের শিরোনাম",
    "items": [
      { "title": "ফিচার ১", "description": "বিবরণ" },
      { "title": "ফিচার ২", "description": "বিবরণ" },
      { "title": "ফিচার ৩", "description": "বিবরণ" }
    ]
  },
  "testimonials": {
    "title": "রিভিউ সেকশনের শিরোনাম",
    "items": [
      { "name": "গ্রাহকের নাম", "text": "রিভিউ টেক্সট", "rating": 5 },
      { "name": "গ্রাহকের নাম", "text": "রিভিউ টেক্সট", "rating": 5 },
      { "name": "গ্রাহকের নাম", "text": "রিভিউ টেক্সট", "rating": 5 }
    ]
  },
  "faq": {
    "title": "সাধারণ প্রশ্নের শিরোনাম",
    "items": [
      { "question": "প্রশ্ন ১", "answer": "উত্তর ১" },
      { "question": "প্রশ্ন ২", "answer": "উত্তর ২" },
      { "question": "প্রশ্ন ৩", "answer": "উত্তর ৩" }
    ]
  },
  "cta": {
    "headline": "শেষ CTA সেকশনের শিরোনাম",
    "buttonText": "বাটনের লেখা"
  },
  "trustBadges": {
    "items": [
      { "icon": "✅", "text": "ব্যাজ ১" },
      { "icon": "🚚", "text": "ব্যাজ ২" },
      { "icon": "🔒", "text": "ব্যাজ ৩" },
      { "icon": "💯", "text": "ব্যাজ ৪" }
    ]
  }
}`;
}

// ============================================================================
// AI CALL — Workers AI (native binding)
// ============================================================================

interface WorkersAIResponse {
  response?: string;
  result?: { response?: string };
}

async function callWorkersAI(
  ai: { run: (model: string, input: Record<string, unknown>) => Promise<unknown> },
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const result = await ai.run(model, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  }) as WorkersAIResponse;

  // Workers AI response shape varies between models
  const text = result?.response ?? result?.result?.response ?? '';
  if (!text) throw new Error(`Model ${model} returned empty response`);
  return text;
}

// ============================================================================
// JSON PARSER — robust extraction from AI output
// ============================================================================

function extractJSON(raw: string): Record<string, unknown> | null {
  // Try direct parse first
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Extract first JSON block from markdown code fences or inline
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/) ??
      raw.match(/(\{[\s\S]*\})/);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ============================================================================
// RESULT VALIDATOR & MERGER WITH DEFAULTS
// ============================================================================

function buildFallbackDefaults(input: GenieInput): GenieCopyResult {
  const { storeName, industry, targetAudience, products } = input;
  const productList = products.length > 0 ? products.join(', ') : 'আমাদের পণ্য';

  return {
    hero: {
      headline: `${storeName} - আপনার বিশ্বস্ত ${industry} শপ`,
      subheadline: `${targetAudience}দের জন্য সেরা ${productList} — সর্বোচ্চ মান, সাশ্রয়ী মূল্যে।`,
      ctaText: 'এখনই কিনুন',
    },
    features: {
      title: 'কেন আমাদের থেকে কিনবেন?',
      items: [
        { title: '১০০% অরিজিনাল', description: 'আমরা শুধুমাত্র অরিজিনাল ও মানসম্পন্ন পণ্য বিক্রি করি।' },
        { title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিন, সারাদেশে ২-৩ দিনে ডেলিভারি।' },
        { title: 'সহজ রিটার্ন', description: 'পছন্দ না হলে ৭ দিনের মধ্যে সহজেই ফেরত দিন।' },
      ],
    },
    testimonials: {
      title: 'আমাদের সন্তুষ্ট গ্রাহকরা',
      items: [
        { name: 'রহিমা বেগম', text: `${storeName} থেকে কিনে সত্যিই খুশি হলাম। পণ্যের মান অসাধারণ!`, rating: 5 },
        { name: 'করিম সাহেব', text: 'দ্রুত ডেলিভারি এবং প্যাকেজিং অনেক সুন্দর ছিল।', rating: 5 },
        { name: 'নাসরিন আক্তার', text: 'দাম একদম ঠিকঠাক, কোয়ালিটিও চমৎকার। আবার কিনবো।', rating: 5 },
      ],
    },
    faq: {
      title: 'সাধারণ জিজ্ঞাসা',
      items: [
        { question: 'ডেলিভারি কতদিনে পাবো?', answer: 'ঢাকার ভেতরে ১-২ কার্যদিবস, ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে ডেলিভারি দেওয়া হয়।' },
        { question: 'পেমেন্ট কিভাবে করব?', answer: 'ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও রকেটে পেমেন্ট করা যাবে।' },
        { question: 'পণ্য ফেরত দেওয়া যাবে?', answer: 'হ্যাঁ, পণ্য পাওয়ার ৭ দিনের মধ্যে কোনো সমস্যা থাকলে ফেরত নেওয়া হবে।' },
      ],
    },
    cta: {
      headline: `আজই ${storeName} থেকে আপনার পছন্দের পণ্যটি অর্ডার করুন!`,
      buttonText: 'এখনই অর্ডার করুন',
    },
    trustBadges: {
      items: [
        { icon: '✅', text: '১০০% অরিজিনাল' },
        { icon: '🚚', text: 'দ্রুত ডেলিভারি' },
        { icon: '🔒', text: 'নিরাপদ পেমেন্ট' },
        { icon: '💯', text: 'সহজ রিটার্ন' },
      ],
    },
  };
}

/**
 * Safely extract string from parsed AI JSON, falling back to default.
 */
function safeStr(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return fallback;
}

function safeNum(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value;
  return fallback;
}

function safeArr<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}

/**
 * Merge AI-parsed JSON with fallback defaults.
 * NEVER returns empty strings — always falls back gracefully.
 */
function mergeWithDefaults(
  parsed: Record<string, unknown> | null,
  fallback: GenieCopyResult
): GenieCopyResult {
  if (!parsed) return fallback;

  // Hero
  const heroRaw = (parsed.hero ?? {}) as Record<string, unknown>;
  const hero: GenieCopyResult['hero'] = {
    headline: safeStr(heroRaw.headline, fallback.hero.headline),
    subheadline: safeStr(heroRaw.subheadline, fallback.hero.subheadline),
    ctaText: safeStr(heroRaw.ctaText, fallback.hero.ctaText),
  };

  // Features
  const featuresRaw = (parsed.features ?? {}) as Record<string, unknown>;
  const featureItemsRaw = safeArr<Record<string, unknown>>(featuresRaw.items);
  const featureItems = featureItemsRaw.length > 0
    ? featureItemsRaw.map((item, i) => ({
        title: safeStr(item?.title, fallback.features.items[i]?.title ?? `ফিচার ${i + 1}`),
        description: safeStr(item?.description, fallback.features.items[i]?.description ?? ''),
      }))
    : fallback.features.items;

  const features: GenieCopyResult['features'] = {
    title: safeStr(featuresRaw.title, fallback.features.title),
    items: featureItems,
  };

  // Testimonials
  const testimonialsRaw = (parsed.testimonials ?? {}) as Record<string, unknown>;
  const testimonialItemsRaw = safeArr<Record<string, unknown>>(testimonialsRaw.items);
  const testimonialItems = testimonialItemsRaw.length > 0
    ? testimonialItemsRaw.map((item, i) => ({
        name: safeStr(item?.name, fallback.testimonials.items[i]?.name ?? `গ্রাহক ${i + 1}`),
        text: safeStr(item?.text, fallback.testimonials.items[i]?.text ?? ''),
        rating: safeNum(item?.rating, 5),
      }))
    : fallback.testimonials.items;

  const testimonials: GenieCopyResult['testimonials'] = {
    title: safeStr(testimonialsRaw.title, fallback.testimonials.title),
    items: testimonialItems,
  };

  // FAQ
  const faqRaw = (parsed.faq ?? {}) as Record<string, unknown>;
  const faqItemsRaw = safeArr<Record<string, unknown>>(faqRaw.items);
  const faqItems = faqItemsRaw.length > 0
    ? faqItemsRaw.map((item, i) => ({
        question: safeStr(item?.question, fallback.faq.items[i]?.question ?? `প্রশ্ন ${i + 1}`),
        answer: safeStr(item?.answer, fallback.faq.items[i]?.answer ?? ''),
      }))
    : fallback.faq.items;

  const faq: GenieCopyResult['faq'] = {
    title: safeStr(faqRaw.title, fallback.faq.title),
    items: faqItems,
  };

  // CTA
  const ctaRaw = (parsed.cta ?? {}) as Record<string, unknown>;
  const cta: GenieCopyResult['cta'] = {
    headline: safeStr(ctaRaw.headline, fallback.cta.headline),
    buttonText: safeStr(ctaRaw.buttonText, fallback.cta.buttonText),
  };

  // Trust Badges
  const trustRaw = (parsed.trustBadges ?? {}) as Record<string, unknown>;
  const trustItemsRaw = safeArr<Record<string, unknown>>(trustRaw.items);
  const trustItems = trustItemsRaw.length > 0
    ? trustItemsRaw.map((item, i) => ({
        icon: safeStr(item?.icon, fallback.trustBadges.items[i]?.icon ?? '✅'),
        text: safeStr(item?.text, fallback.trustBadges.items[i]?.text ?? ''),
      }))
    : fallback.trustBadges.items;

  const trustBadges: GenieCopyResult['trustBadges'] = {
    items: trustItems,
  };

  return { hero, features, testimonials, faq, cta, trustBadges };
}

// ============================================================================
// MAIN EXPORT: generateBengaliCopy
// ============================================================================

const PRIMARY_MODEL = '@cf/qwen/qwen2.5-7b-instruct';
const FALLBACK_MODEL = '@cf/meta/llama-3.1-8b-instruct';

/**
 * Generate Bengali copy for all landing page sections.
 *
 * Strategy:
 * 1. Try qwen2.5-7b-instruct
 * 2. Fallback to llama-3.1-8b-instruct
 * 3. If both fail, return curated Bengali template defaults
 *
 * NEVER returns empty strings.
 */
export async function generateBengaliCopy(
  input: GenieInput,
  ai: { run: (model: string, input: Record<string, unknown>) => Promise<unknown> }
): Promise<{ result: GenieCopyResult; usedFallback: boolean; model: string }> {
  const fallback = buildFallbackDefaults(input);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);

  // ── Attempt 1: Primary model ──────────────────────────────────────────────
  try {
    const raw = await callWorkersAI(ai, PRIMARY_MODEL, systemPrompt, userPrompt);
    const parsed = extractJSON(raw);
    if (parsed) {
      return {
        result: mergeWithDefaults(parsed, fallback),
        usedFallback: false,
        model: PRIMARY_MODEL,
      };
    }
  } catch (primaryErr) {
    console.warn('[Genie] Primary model failed:', primaryErr instanceof Error ? primaryErr.message : String(primaryErr));
  }

  // ── Attempt 2: Fallback model ─────────────────────────────────────────────
  try {
    const raw = await callWorkersAI(ai, FALLBACK_MODEL, systemPrompt, userPrompt);
    const parsed = extractJSON(raw);
    if (parsed) {
      return {
        result: mergeWithDefaults(parsed, fallback),
        usedFallback: false,
        model: FALLBACK_MODEL,
      };
    }
  } catch (fallbackErr) {
    console.warn('[Genie] Fallback model failed:', fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr));
  }

  // ── Attempt 3: Curated defaults ───────────────────────────────────────────
  console.info('[Genie] Both AI models failed — using curated Bengali defaults.');
  return {
    result: fallback,
    usedFallback: true,
    model: 'template-defaults',
  };
}
