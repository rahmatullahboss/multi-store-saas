/**
 * Unit tests for Genie Mode 2.0 — Bengali Copy Generator
 * Tests: generateBengaliCopy, checkGenieRateLimit, fallback chain
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateBengaliCopy,
  checkGenieRateLimit,
  type GenieInput,
  type GenieCopyResult,
} from '~/lib/page-builder/ai-copy.server';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockInput: GenieInput = {
  storeName: 'রহিম ফ্যাশন হাউস',
  industry: 'ফ্যাশন ও পোশাক',
  targetAudience: 'নারী ক্রেতা',
  goal: 'বিক্রয় বৃদ্ধি',
  products: ['শাড়ি', 'সালোয়ার কামিজ'],
  storeId: 42,
};

const validAIResponse: GenieCopyResult = {
  hero: {
    headline: 'রহিম ফ্যাশনে আপনাকে স্বাগতম',
    subheadline: 'নারীদের জন্য সেরা শাড়ি ও সালোয়ার কামিজ সংগ্রহ',
    ctaText: 'এখনই কিনুন',
  },
  features: {
    title: 'কেন আমাদের থেকে কিনবেন?',
    items: [
      { title: '১০০% অরিজিনাল', description: 'মানসম্পন্ন পণ্য' },
      { title: 'দ্রুত ডেলিভারি', description: '১-২ দিনে ডেলিভারি' },
      { title: 'সহজ রিটার্ন', description: '৭ দিনের রিটার্ন পলিসি' },
    ],
  },
  testimonials: {
    title: 'আমাদের সন্তুষ্ট গ্রাহকরা',
    items: [
      { name: 'রহিমা বেগম', text: 'অনেক ভালো পণ্য', rating: 5 },
      { name: 'করিম সাহেব', text: 'দ্রুত ডেলিভারি পেলাম', rating: 5 },
      { name: 'নাসরিন আক্তার', text: 'দাম একদম ঠিকঠাক', rating: 5 },
    ],
  },
  faq: {
    title: 'সাধারণ জিজ্ঞাসা',
    items: [
      { question: 'ডেলিভারি কতদিনে পাবো?', answer: 'ঢাকায় ১-২ দিন' },
      { question: 'পেমেন্ট কিভাবে করব?', answer: 'বিকাশ, নগদ, COD' },
      { question: 'পণ্য ফেরত দেওয়া যাবে?', answer: 'হ্যাঁ, ৭ দিনে' },
    ],
  },
  cta: {
    headline: 'আজই অর্ডার করুন',
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

// ─── Mock AI ─────────────────────────────────────────────────────────────────

function createMockAI(responseOverride?: unknown) {
  return {
    run: vi.fn().mockResolvedValue({
      response: JSON.stringify(responseOverride ?? validAIResponse),
    }),
  };
}

// ─── Mock KV ─────────────────────────────────────────────────────────────────

function createMockKV(currentCount = 0) {
  return {
    get: vi.fn().mockResolvedValue(currentCount > 0 ? String(currentCount) : null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ keys: [] }),
    getWithMetadata: vi.fn().mockResolvedValue({ value: null, metadata: null }),
  } as unknown as KVNamespace;
}

// ─── generateBengaliCopy ─────────────────────────────────────────────────────

describe('generateBengaliCopy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Bengali copy from primary model (qwen2.5) on success', async () => {
    const mockAI = createMockAI();

    const { result, usedFallback, model } = await generateBengaliCopy(mockInput, mockAI);

    expect(usedFallback).toBe(false);
    expect(model).toBe('@cf/qwen/qwen2.5-7b-instruct');
    expect(result.hero.headline).toBeTruthy();
    expect(result.hero.ctaText).toBeTruthy();
    expect(result.features.items).toHaveLength(3);
    expect(result.faq.items).toHaveLength(3);
    expect(result.trustBadges.items.length).toBeGreaterThan(0);
  });

  it('calls primary model first (qwen2.5-7b-instruct)', async () => {
    const mockAI = createMockAI();

    await generateBengaliCopy(mockInput, mockAI);

    expect(mockAI.run).toHaveBeenCalledWith(
      '@cf/qwen/qwen2.5-7b-instruct',
      expect.objectContaining({ messages: expect.any(Array) })
    );
  });

  it('falls back to llama-3.1-8b when qwen fails', async () => {
    const mockAI = {
      run: vi
        .fn()
        .mockRejectedValueOnce(new Error('qwen unavailable'))
        .mockResolvedValueOnce({ response: JSON.stringify(validAIResponse) }),
    };

    const { model } = await generateBengaliCopy(mockInput, mockAI);

    expect(mockAI.run).toHaveBeenCalledTimes(2);
    expect(mockAI.run).toHaveBeenNthCalledWith(
      2,
      '@cf/meta/llama-3.1-8b-instruct',
      expect.any(Object)
    );
    expect(model).toBe('@cf/meta/llama-3.1-8b-instruct');
  });

  it('returns curated Bengali defaults when BOTH AI models fail', async () => {
    const mockAI = {
      run: vi
        .fn()
        .mockRejectedValueOnce(new Error('qwen failed'))
        .mockRejectedValueOnce(new Error('llama failed')),
    };

    const { result, usedFallback, model } = await generateBengaliCopy(mockInput, mockAI);

    expect(usedFallback).toBe(true);
    expect(model).toBe('template-defaults');
    // Fallback includes storeName in headline
    expect(result.hero.headline).toContain('রহিম ফ্যাশন হাউস');
    // Fallback NEVER returns empty strings
    expect(result.hero.headline.length).toBeGreaterThan(0);
    expect(result.hero.ctaText.length).toBeGreaterThan(0);
    expect(result.features.items.length).toBeGreaterThan(0);
    expect(result.faq.items.length).toBeGreaterThan(0);
  });

  it('returns curated defaults when AI returns invalid JSON', async () => {
    const mockAI = {
      run: vi
        .fn()
        .mockResolvedValueOnce({ response: 'This is not JSON at all!' })
        .mockResolvedValueOnce({ response: '{ broken json' }),
    };

    const { result, usedFallback } = await generateBengaliCopy(mockInput, mockAI);

    expect(usedFallback).toBe(true);
    expect(result.hero.headline.length).toBeGreaterThan(0);
  });

  it('extracts JSON from markdown code fences', async () => {
    const fencedJson = `Here is your copy:\n\`\`\`json\n${JSON.stringify(validAIResponse)}\n\`\`\``;
    const mockAI = {
      run: vi.fn().mockResolvedValue({ response: fencedJson }),
    };

    const { result, usedFallback } = await generateBengaliCopy(mockInput, mockAI);

    expect(usedFallback).toBe(false);
    expect(result.hero.headline).toBe(validAIResponse.hero.headline);
  });

  it('merges partial AI response with defaults (fills missing fields)', async () => {
    // AI returns only hero, missing features/testimonials/faq/cta/trustBadges
    const partial = { hero: validAIResponse.hero };
    const mockAI = createMockAI(partial);

    const { result } = await generateBengaliCopy(mockInput, mockAI);

    // Hero from AI
    expect(result.hero.headline).toBe(validAIResponse.hero.headline);
    // Missing fields filled from Bengali defaults (not empty)
    expect(result.features.items.length).toBeGreaterThan(0);
    expect(result.faq.items.length).toBeGreaterThan(0);
    expect(result.trustBadges.items.length).toBeGreaterThan(0);
  });

  it('never returns empty strings in any field', async () => {
    const mockAI = {
      run: vi
        .fn()
        .mockRejectedValue(new Error('all models down')),
    };

    const { result } = await generateBengaliCopy(mockInput, mockAI);

    // Check all string fields are non-empty
    expect(result.hero.headline.trim()).not.toBe('');
    expect(result.hero.subheadline.trim()).not.toBe('');
    expect(result.hero.ctaText.trim()).not.toBe('');
    expect(result.cta.headline.trim()).not.toBe('');
    expect(result.cta.buttonText.trim()).not.toBe('');
    result.features.items.forEach((item) => {
      expect(item.title.trim()).not.toBe('');
    });
    result.faq.items.forEach((item) => {
      expect(item.question.trim()).not.toBe('');
      expect(item.answer.trim()).not.toBe('');
    });
    result.trustBadges.items.forEach((item) => {
      expect(item.text.trim()).not.toBe('');
    });
  });

  it('uses products list in fallback defaults', async () => {
    const mockAI = {
      run: vi.fn().mockRejectedValue(new Error('fail')),
    };

    const { result } = await generateBengaliCopy(mockInput, mockAI);

    // Fallback should include product names somewhere
    expect(result.hero.subheadline).toContain('শাড়ি');
  });

  it('handles empty products array gracefully', async () => {
    const inputNoProducts = { ...mockInput, products: [] };
    const mockAI = {
      run: vi.fn().mockRejectedValue(new Error('fail')),
    };

    const { result } = await generateBengaliCopy(inputNoProducts, mockAI);

    expect(result.hero.headline.trim()).not.toBe('');
    expect(result.hero.subheadline.trim()).not.toBe('');
  });
});

// ─── checkGenieRateLimit ─────────────────────────────────────────────────────

describe('checkGenieRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows request when under limit (count = 0)', async () => {
    const kv = createMockKV(0);

    const result = await checkGenieRateLimit(kv, 42);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9); // 10 max - 0 current - 1 this request
  });

  it('allows request when at 9 (one slot left)', async () => {
    const kv = createMockKV(9);

    const result = await checkGenieRateLimit(kv, 42);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('blocks request when at limit (count = 10)', async () => {
    const kv = createMockKV(10);

    const result = await checkGenieRateLimit(kv, 42);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('increments count in KV on allowed request', async () => {
    const kv = createMockKV(3);

    await checkGenieRateLimit(kv, 42);

    expect(kv.put).toHaveBeenCalledWith(
      expect.stringContaining('genie:ratelimit:42:'),
      '4',
      expect.objectContaining({ expirationTtl: expect.any(Number) })
    );
  });

  it('does NOT increment KV when rate limit is hit', async () => {
    const kv = createMockKV(10);

    await checkGenieRateLimit(kv, 42);

    expect(kv.put).not.toHaveBeenCalled();
  });

  it('uses correct KV key format: genie:ratelimit:{storeId}:{hourSlot}', async () => {
    const kv = createMockKV(0);

    await checkGenieRateLimit(kv, 99);

    expect(kv.get).toHaveBeenCalledWith(
      expect.stringMatching(/^genie:ratelimit:99:\d+$/)
    );
  });

  it('returns a future resetAt timestamp', async () => {
    const kv = createMockKV(0);
    const before = Math.floor(Date.now() / 1000);

    const result = await checkGenieRateLimit(kv, 42);

    expect(result.resetAt).toBeGreaterThan(before);
  });

  it('isolates rate limits per storeId', async () => {
    const kv42 = createMockKV(10); // store 42 at limit
    const kv99 = createMockKV(0);  // store 99 has capacity

    const result42 = await checkGenieRateLimit(kv42, 42);
    const result99 = await checkGenieRateLimit(kv99, 99);

    expect(result42.allowed).toBe(false);
    expect(result99.allowed).toBe(true);
  });
});
