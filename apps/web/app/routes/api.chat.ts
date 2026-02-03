/**
 * Unified AI Chat API
 * 
 * DUAL CHATBOT SYSTEM:
 * 1. Merchant Co-pilot - For paid merchants (SaaS help + store stats)
 * 2. Customer Sales Agent - Paid add-on (product recommendations)
 * 
 * SECURITY: Strict storeId filtering - Store A can NEVER access Store B's data
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { callAIWithSystemPrompt } from '~/services/ai.server';
import { CREDIT_COSTS } from '~/utils/credit.server';
import { requireCredits, chargeCredits } from '~/services/ai-credits.server';
import { getStoreStats as getStoreAnalytics } from '~/services/analytics.server';
import { resolveStore } from '~/lib/store.server';
import { buildInsightCardResponse, detectLanguage, isMetricsQuestion } from '~/services/ai-chat-guard.server';
import { createDb } from '~/lib/db.server';
import { PLAN_LIMITS, PLAN_PRICES } from '~/utils/plans.server';
import { handleCustomerChat } from '~/services/ai-orchestrator.server';

// ============================================================================
// TYPES
// ============================================================================
type ChatContext = 'merchant' | 'customer';

interface ChatRequest {
  message: string;
  storeId?: number;
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================
function getMerchantSystemPrompt(stats: Awaited<ReturnType<typeof getStoreAnalytics>>, storeName: string): string {
  return `You are an intelligent AI assistant for "${storeName}" on our e-commerce platform.

## Your Role
- Help merchants understand and use the platform
- Answer questions about store data and statistics  
- Provide actionable insights and suggestions
- Be proactive about highlighting important metrics

## Current Store Stats (Real-time Data)
- Today's Sales: ৳${Number(stats.todaySales || 0).toLocaleString()}
  - Today's Orders: ${Number(stats.todayOrders || 0)}
- Pending Orders: ${Number(stats.pendingOrders || 0)}
- Total Products: ${Number(stats.products || 0)}

## CRITICAL LANGUAGE RULES
**YOU MUST ALWAYS RESPOND IN THE SAME LANGUAGE THE USER WRITES IN.**
- If user writes in Bengali (বাংলা) → Reply in Bengali
- If user writes in English → Reply in English
- If user writes in Banglish (mix) → Reply in Bengali
- Translate all technical terms to the user's language

## STRUCTURED RESPONSE FORMAT
When the user asks about store performance, sales, orders, or business health, you MUST return a JSON response in this exact format:

For sales/business questions, return:
\`\`\`json
{
  "type": "mixed",
  "items": [
    {
      "type": "insight_cards",
      "data": [
        { "title": "আজকের সেলস", "value": "৳15,000", "trend": 12, "icon": "sales", "color": "green" },
        { "title": "নতুন অর্ডার", "value": "5টি", "icon": "orders", "color": "blue" }
      ]
    },
    {
      "type": "text",
      "data": "আপনার স্টোর ভালো পারফর্ম করছে! গতকালের চেয়ে 12% বেশি সেল হয়েছে।"
    },
    {
      "type": "action_chips",
      "data": [
        { "label": "পেন্ডিং অর্ডার দেখুন", "url": "/app/orders?status=pending" },
        { "label": "প্রোডাক্ট যোগ করুন", "url": "/app/products/new" }
      ]
    }
  ]
}
\`\`\`

For low stock or warnings:
\`\`\`json
{
  "type": "alert",
  "data": {
    "severity": "warning",
    "title": "স্টক কম!",
    "message": "3টি প্রোডাক্টে স্টক কম আছে। রিস্টক করুন।",
    "actionLabel": "দেখুন",
    "actionUrl": "/app/products?filter=low-stock"
  }
}
\`\`\`

For simple questions or explanations, use plain text:
\`\`\`json
{
  "type": "text",
  "content": "Your answer here in the user's language"
}
\`\`\`

## Available Response Types
- "insight_card" / "insight_cards": Show metrics with trends (sales, orders, etc.)
- "alert": Warnings, errors, or important notices
- "action_chips": Suggested quick actions with links
- "text": Plain text explanations
- "mixed": Combine multiple types

## Card Icons: sales, orders, products, customers
## Card Colors: green (positive), blue (neutral), orange (warning), red (negative)

## Guidelines
- Be professional yet friendly
- Use real data from Current Store Stats
- Proactively mention pending orders or issues
- Keep responses concise and actionable
- Return structured JSON for data queries, plain text for explanations

## STRICT KNOWLEDGE RULES (ANTI-HALLUCINATION)
- You MUST answer ONLY based on the "Current Store Stats" provided above.
- Do NOT invent scenarios, orders, or sales figures.
- If the user asks for data not shown in the stats (e.g. "last year's sales"), say "I don't have access to that data yet."
- Do NOT guess. Accuracy is more important than being helpful.

## FORMATTING:
- Response MUST be a valid JSON object as defined above.
- Do NOT return plain text outside the JSON.`;
}

// ============================================================================
// LOADER - Required for Remix single-fetch compatibility
// ============================================================================
export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}

// ============================================================================
// MAIN ACTION
// ============================================================================
export async function handleChatAction({ request, context }: ActionFunctionArgs) {
  console.log('[AI Chat] Action started');
  
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  const analyticsDb = createDb(env.DB);
  const resolved = await resolveStore(
    {
      storeId: (context as unknown as { storeId?: number }).storeId,
      store: (context as unknown as { store?: any }).store,
      cloudflare: { env },
    },
    request
  );

  // Parse request - Remix fetcher sends FormData by default
  let message: string;
  let clientStoreId: number | undefined;
  
  try {
    const formData = await request.formData();
    message = formData.get('message')?.toString() || '';
    const storeIdStr = formData.get('storeId')?.toString();
    clientStoreId = storeIdStr ? parseInt(storeIdStr) : undefined;
    console.log('[AI Chat] Parsed message:', message, 'storeId:', clientStoreId);
  } catch (err) {
    console.error('[AI Chat] FormData parse error:', err);
    return json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!message) {
    console.log('[AI Chat] No message provided');
    return json({ error: 'Message required' }, { status: 400 });
  }

  // Get API key
  const apiKey = env.OPENROUTER_API_KEY;
  console.log('[AI Chat] API Key present:', !!apiKey);
  if (!apiKey) {
    console.error('[AI Chat] OPENROUTER_API_KEY not configured');
    return json({ error: 'AI service not configured' }, { status: 503 });
  }

  // Step 1: Identify Context
  const session = await getSession(request, env);
  const merchantStoreId = session.get('storeId');
  const resolvedStoreId = resolved?.storeId;
  
  // Determine context: Merchant (logged in), Customer (store visitor), or Marketing (SaaS visitor)
  const context_type: ChatContext = merchantStoreId ? 'merchant' : 'customer';
  const isDev = ['localhost', '127.0.0.1'].includes(new URL(request.url).hostname);
  const storeId = context_type === 'merchant'
    ? merchantStoreId
    : (resolvedStoreId || (isDev ? clientStoreId : undefined));

  // MARKETING PAGE MODE: storeId = 0 or undefined = SaaS landing page visitor
  if (!storeId || storeId === 0) {
    console.log('[AI Chat] Marketing mode - no storeId');
    
    const saasSystemPrompt = `You are a helpful AI assistant for Ozzyl - an e-commerce platform for Bangladeshi sellers.

## About Ozzyl
- E-commerce platform to create online stores
- Supports bKash, Nagad, Cash on Delivery
- Free plan: ${PLAN_LIMITS.free.max_products} product, ${PLAN_LIMITS.free.max_orders} orders/month
- Starter: ৳${PLAN_PRICES.starter}/month - ${PLAN_LIMITS.starter.max_products} products, ${PLAN_LIMITS.starter.max_orders} orders
- Premium: ৳${PLAN_PRICES.premium}/month - ${PLAN_LIMITS.premium.max_products} products, ${PLAN_LIMITS.premium.max_orders} orders, custom domain

## Features
- Instant subdomain (yourstore.ozzyl.com)
- Order management dashboard
- Inventory tracking
- Courier integration (Pathao, Steadfast, RedX)
- Landing page mode for single products
- Email campaigns

## Guidelines
- Use Bengali if user writes in Bengali, English if user writes in English
- Help visitors understand our platform
- Encourage them to sign up for free

## STRICT KNOWLEDGE RULES (ANTI-HALLUCINATION)
- Answer ONLY based on the provided "About", "Features", and "Pricing" sections.
- Do NOT promise features that are not listed.
- If asked about custom development or unrelated services, say "I can only help with Ozzyl platform questions."

## STRUCTURED RESPONSE FORMAT (MANDATORY):
Return JSON object:
1. 'insight_cards' (Features): 
   \`{ "type": "insight_cards", "data": [{ "title": "Free Plan", "value": "৳0", "icon": "sales", "color": "green" }] }\`
2. 'action_chips' (Signup):
   \`{ "type": "action_chips", "data": [{ "label": "Start Free", "url": "/register" }] }\`
3. 'text' (Simple Answer):
   \`{ "type": "text", "content": "Yes, we have free plan." }\`

## FORMATTING:
- Response MUST be valid JSON. No Markdown.`;

    try {
      const responseText = await callAIWithSystemPrompt(
        apiKey,
        saasSystemPrompt,
        message,
        { model: env.AI_MODEL, baseUrl: env.AI_BASE_URL }
      );

      return json({ success: true, response: responseText, context: 'marketing' });
    } catch (error) {
      console.error('[AI Chat] Marketing error:', error);
      return json({ error: 'AI service error' }, { status: 500 });
    }
  }

  // If store resolved from hostname but client passed a different ID, reject
  if (context_type === 'customer' && resolvedStoreId && clientStoreId && resolvedStoreId !== clientStoreId) {
    return json({ error: 'Store context mismatch' }, { status: 403 });
  }

  // Get store data
  const storeResult = await db
    .select({
      name: stores.name,
      planType: stores.planType,
      isCustomerAiEnabled: stores.isCustomerAiEnabled,
      aiBotPersona: stores.aiBotPersona,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // ============================================================================
  // MERCHANT CO-PILOT
  // ============================================================================
  if (context_type === 'merchant') {
    // Check credits
    const creditGate = await requireCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'merchant');
    if (!creditGate.allowed) {
      return json({ error: creditGate.error, code: creditGate.code }, { status: creditGate.status });
    }

    // Step 2: Retrieve Data (RAG) - Get store stats
    const stats = await getStoreAnalytics(analyticsDb, storeId);

    // If question is about metrics, return DB-grounded response without AI
    if (isMetricsQuestion(message)) {
      const lang = detectLanguage(message);
      const suggestions = lang === 'bn'
        ? [
            stats.pendingOrders > 0 ? 'পেন্ডিং অর্ডার যাচাই করুন' : 'আজকের অর্ডারগুলো রিভিউ করুন',
            stats.lowStock > 0 ? 'লো স্টক আইটেম রিস্টক করুন' : 'টপ প্রোডাক্টগুলো প্রোমোট করুন',
            'নতুন ক্যাম্পেইন চালু করুন',
          ]
        : [
            stats.pendingOrders > 0 ? 'Review pending orders' : 'Review today’s orders',
            stats.lowStock > 0 ? 'Restock low inventory' : 'Promote top products',
            'Launch a new campaign',
          ];

      return json({
        success: true,
        response: buildInsightCardResponse(
          {
            totalSales: Number(stats.todaySales || 0),
            orderCount: Number(stats.todayOrders || 0),
            trend: Number(stats.salesTrend || 0),
            suggestions,
          },
          lang
        ),
        context: 'merchant',
      });
    }

    // Step 3: Construct System Prompt
    const systemPrompt = getMerchantSystemPrompt(stats, store.name);

    // Step 4: Generate response
    try {
      const responseText = await callAIWithSystemPrompt(
        apiKey,
        systemPrompt,
        message,
        { model: env.AI_MODEL, baseUrl: env.AI_BASE_URL }
      );

      await chargeCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'Merchant Co-pilot Chat');
      return json({ success: true, response: responseText, context: 'merchant' });
    } catch (error) {
      console.error('[AI Chat] Merchant error:', error);
      return json({ error: 'AI service error' }, { status: 500 });
    }
  }

  // ============================================================================
  // CUSTOMER SALES AGENT
  // ============================================================================
  if (context_type === 'customer') {
    // Check if AI is enabled for this store (paid add-on)
    if (!store.isCustomerAiEnabled) {
      return json({
        error: 'AI Sales Agent not enabled for this store',
        code: 'ADDON_REQUIRED',
      }, { status: 403 });
    }

    // Check credits (Store Owner pays)
    const creditGate = await requireCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'customer');
    if (!creditGate.allowed) {
      console.log(`[AI Chat] Store ${storeId} out of credits for customer chat`);
      return json({ error: creditGate.error, code: creditGate.code }, { status: creditGate.status });
    }

    try {
      const responseText = await handleCustomerChat({
        env,
        db,
        analyticsDb,
        message,
        storeId,
        storeName: store.name,
        persona: store.aiBotPersona || undefined,
      });

      await chargeCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'Customer Sales Agent Chat');
      return json({ success: true, response: responseText, context: 'customer' });
    } catch (error) {
      console.error('[AI Chat] Customer error:', error);
      return json({ error: 'AI service error' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid context' }, { status: 400 });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  const message = formData.get('message')?.toString() || '';
  const storeId = formData.get('storeId')?.toString();

  const upstreamUrl = new URL('/api/ai-orchestrator', request.url);
  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    },
    body: JSON.stringify({
      channel: 'merchant',
      message,
      storeId: storeId ? Number(storeId) : undefined,
    }),
  });

  return upstream;
}
