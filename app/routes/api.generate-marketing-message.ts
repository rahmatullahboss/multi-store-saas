/**
 * API Route: Generate AI Marketing Message
 * 
 * Generates personalized marketing messages using AI based on:
 * - Customer segment (VIP, Churn Risk, Window Shopper, New)
 * - Channel (SMS or Email)
 * - Language (English or Bengali)
 * - Optional discount code
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getStoreId } from '~/services/auth.server';
import { callAIWithSystemPrompt } from '~/services/ai.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';

// Segment-specific prompts
const SEGMENT_CONTEXTS = {
  vip: {
    en: 'This is a VIP customer who has made multiple purchases. Make them feel valued and exclusive.',
    bn: 'এটি একজন VIP গ্রাহক যিনি একাধিকবার কেনাকাটা করেছেন। তাদের বিশেষ এবং মূল্যবান মনে করান।',
  },
  churn_risk: {
    en: 'This customer has not purchased in over 60 days. Win them back with a compelling offer.',
    bn: 'এই গ্রাহক ৬০ দিনের বেশি সময় ধরে কিছু কেনেননি। আকর্ষণীয় অফার দিয়ে তাদের ফিরিয়ে আনুন।',
  },
  window_shopper: {
    en: 'This customer has added items to cart but never completed a purchase. Remove their hesitation.',
    bn: 'এই গ্রাহক কার্টে প্রোডাক্ট যোগ করেছেন কিন্তু কখনো কেনাকাটা সম্পন্ন করেননি। তাদের দ্বিধা দূর করুন।',
  },
  new: {
    en: 'This is a new lead who has never purchased. Welcome them and encourage first purchase.',
    bn: 'এটি একজন নতুন লিড যিনি এখনো কিছু কেনেননি। তাদের স্বাগত জানান এবং প্রথম কেনাকাটায় উৎসাহিত করুন।',
  },
  regular: {
    en: 'This is a regular customer. Keep them engaged with updates and offers.',
    bn: 'এটি একজন নিয়মিত গ্রাহক। আপডেট এবং অফার দিয়ে তাদের সম্পৃক্ত রাখুন।',
  },
};

interface GenerateMessageRequest {
  segment: 'vip' | 'churn_risk' | 'window_shopper' | 'new' | 'regular';
  channel: 'sms' | 'email';
  language: 'en' | 'bn';
  discountCode?: string;
  discountPercent?: number;
  customPrompt?: string;
}

export async function action({ context, request }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  
  const db = drizzle(context.cloudflare.env.DB);
  
  // Get store info for personalization
  const [store] = await db.select({
    name: stores.name,
    businessInfo: stores.businessInfo,
  })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  
  if (!store) {
    return json({ success: false, error: 'Store not found' }, { status: 404 });
  }
  
  const body = await request.json() as GenerateMessageRequest;
  const { segment, channel, language, discountCode, discountPercent, customPrompt } = body;
  
  // Validate required fields
  if (!segment || !channel || !language) {
    return json(
      { success: false, error: 'Missing required fields: segment, channel, language' },
      { status: 400 }
    );
  }
  
  const segmentContext = SEGMENT_CONTEXTS[segment]?.[language] || SEGMENT_CONTEXTS.regular[language];
  
  // Build AI prompt
  const isSMS = channel === 'sms';
  const isBengali = language === 'bn';
  
  const systemPrompt = isBengali
    ? `আপনি একজন বাংলা মার্কেটিং কপিরাইটার। আপনি "${store.name}" নামক একটি অনলাইন স্টোরের জন্য ${isSMS ? 'SMS' : 'ইমেইল'} মেসেজ লিখছেন।

নিয়ম:
${isSMS ? '- মেসেজ ১৬০ অক্ষরের মধ্যে রাখুন' : '- ইমেইল সাবজেক্ট এবং বডি আলাদা করুন'}
- বাংলায় লিখুন, ইংরেজি মিশ্রণ করবেন না
- গ্রাহকের নাম [Name] প্লেসহোল্ডার দিয়ে রাখুন
- স্টোর লিংক [Link] প্লেসহোল্ডার দিয়ে রাখুন
${discountCode ? `- ডিসকাউন্ট কোড: ${discountCode} (${discountPercent || 10}% ছাড়)` : ''}

${segmentContext}

শুধু মেসেজ লিখুন, কোনো ব্যাখ্যা দেবেন না।`
    : `You are a marketing copywriter for "${store.name}", an online store.

Rules:
${isSMS ? '- Keep message under 160 characters' : '- Include subject line and body separately'}
- Use [Name] placeholder for customer name
- Use [Link] placeholder for store link
${discountCode ? `- Discount code: ${discountCode} (${discountPercent || 10}% off)` : ''}

${segmentContext}

Write only the message, no explanations.`;

  const userPrompt = customPrompt || (isBengali
    ? `${segment === 'churn_risk' ? 'ফিরে আসার' : segment === 'vip' ? 'VIP গ্রাহকদের জন্য বিশেষ' : segment === 'window_shopper' ? 'কার্ট রিকভারি' : 'স্বাগত'} মেসেজ লিখুন।`
    : `Write a ${segment === 'churn_risk' ? 'win-back' : segment === 'vip' ? 'VIP appreciation' : segment === 'window_shopper' ? 'cart recovery' : 'welcome'} message.`);

  try {
    const apiKey = context.cloudflare.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return json(
        { success: false, error: 'AI API key not configured' },
        { status: 500 }
      );
    }

    const message = await callAIWithSystemPrompt(
      apiKey,
      systemPrompt,
      userPrompt,
      {
        model: context.cloudflare.env.AI_MODEL,
        baseUrl: context.cloudflare.env.AI_BASE_URL,
      }
    );

    return json({
      success: true,
      message: message.trim(),
      metadata: {
        segment,
        channel,
        language,
        storeName: store.name,
      },
    });
  } catch (error) {
    console.error('Error generating marketing message:', error);
    return json(
      { success: false, error: 'Failed to generate message' },
      { status: 500 }
    );
  }
}
