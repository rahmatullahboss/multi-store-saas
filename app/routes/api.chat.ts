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
import { eq, like, or, and, sql } from 'drizzle-orm';
import { stores, products, orders } from '@db/schema';
import { getSession } from '~/services/auth.server';
import { callAIWithSystemPrompt } from '~/services/ai.server';
import { checkCredits, deductCredits, CREDIT_COSTS } from '~/utils/credit.server';

// ============================================================================
// TYPES
// ============================================================================
type ChatContext = 'merchant' | 'customer';

interface ChatRequest {
  message: string;
  storeId?: number;
}

interface StoreStats {
  todaySales: number;
  todayOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

// ============================================================================
// SECURITY: Strict Store-Scoped Product Search
// ============================================================================
async function findRelevantProducts(
  db: ReturnType<typeof drizzle>,
  query: string,
  storeId: number
): Promise<Array<{ title: string; price: number; description: string | null }>> {
  const searchTerm = `%${query}%`;

  // CRITICAL SECURITY: Always filter by storeId first
  const matchingProducts = await db
    .select({
      title: products.title,
      price: products.price,
      description: products.description,
    })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId), // ALWAYS enforce storeId
        eq(products.isPublished, true),
        or(
          like(products.title, searchTerm),
          like(products.description, searchTerm),
          like(products.category, searchTerm)
        )
      )
    )
    .limit(5);

  // If no matches, get top 5 products for this store only
  if (matchingProducts.length === 0) {
    return await db
      .select({
        title: products.title,
        price: products.price,
        description: products.description,
      })
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId), // ALWAYS enforce storeId
          eq(products.isPublished, true)
        )
      )
      .limit(5);
  }

  return matchingProducts;
}

// ============================================================================
// HELPER: Get Store Stats (Scoped to storeId)
// ============================================================================
async function getStoreStats(
  db: ReturnType<typeof drizzle>,
  storeId: number
): Promise<StoreStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  // Get today's orders - ALWAYS scoped to storeId
  const allOrders = await db
    .select({
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.storeId, storeId)); // SECURITY: Strict storeId filter

  const todayOrders = allOrders.filter(o => {
    if (!o.createdAt) return false;
    return o.createdAt >= today;
  });

  const todaySales = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = allOrders.filter(o => o.status === 'pending').length;

  // Get product count - ALWAYS scoped to storeId
  const productCount = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.storeId, storeId)); // SECURITY: Strict storeId filter

  return {
    todaySales,
    todayOrders: todayOrders.length,
    totalProducts: productCount.length,
    pendingOrders,
  };
}

// ============================================================================
// SYSTEM PROMPTS
// ============================================================================
function getMerchantSystemPrompt(stats: StoreStats, storeName: string): string {
  return `You are an intelligent AI assistant for "${storeName}" on our e-commerce platform.

## Your Role
- Help merchants understand and use the platform
- Answer questions about store data and statistics  
- Provide actionable insights and suggestions
- Be proactive about highlighting important metrics

## Current Store Stats (Real-time Data)
- Today's Sales: ৳${stats.todaySales.toLocaleString()}
- Today's Orders: ${stats.todayOrders}
- Pending Orders: ${stats.pendingOrders}
- Total Products: ${stats.totalProducts}

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

## CRITICAL FORMATTING RULES (MOST IMPORTANT!)
- NEVER use markdown formatting: NO **, NO ##, NO ###, NO -, NO *, NO __
- Use emojis for structure: ✅ ❌ 📦 💰 📊 🚀
- Use line breaks (new lines) to separate points
- Write plain readable text, NOT formatted text
- Example good format:
  ✅ প্রথম পয়েন্ট
  ✅ দ্বিতীয় পয়েন্ট
  ✅ তৃতীয় পয়েন্ট
- Example BAD format (DO NOT USE):
  **Bold text** or ## Heading or - list item`;
}

function getCustomerSystemPrompt(
  storeName: string,
  storeProducts: Array<{ title: string; price: number; description: string | null }>,
  persona?: string
): string {
  const productList = storeProducts
    .map(p => `- ${p.title}: ৳${p.price} - ${p.description || 'Quality product'}`)
    .join('\n');

  const defaultPersona = 'You are a helpful sales assistant.';

  return `${persona || defaultPersona}

## Store: ${storeName}

## Available Products (Use ONLY these to recommend)
${productList || 'No specific products found. Ask what they are looking for!'}

## Store Policies
- Delivery: Dhaka 24hrs (৳60), Outside Dhaka 2-3 days (৳120)
- Payment: Cash on Delivery, bKash, Nagad
- Returns: 7-day easy return policy

## Guidelines
- Be warm, friendly and conversational
- Use Bengali if customer writes in Bengali, otherwise use English
- ONLY recommend products from the list above
- If the answer is not in the context, say you don't have that information
- Keep responses short and engaging
- Never make up product information

## STRICT KNOWLEDGE RULES (ANTI-HALLUCINATION)
- Recommend ONLY products listed in "Available Products".
- If the user asks for a product not in the list, say: "Sorry, we don't have that item currently."
- Do NOT invent products, prices, or features.
- If asked about stock/colors not listed, say "Please check the website for details."

## FORMATTING RULES (CRITICAL!)
- NEVER use markdown: NO **, NO ##, NO ###, NO -, NO *
- Use emojis for lists: ✅ 📦 🚚 💰
- Use new lines to separate points
- Write plain readable text only`;
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
export async function action({ request, context }: ActionFunctionArgs) {
  console.log('[AI Chat] Action started');
  
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);

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
  
  // Determine context: Merchant (logged in), Customer (store visitor), or Marketing (SaaS visitor)
  const context_type: ChatContext = merchantStoreId ? 'merchant' : 'customer';
  const storeId = context_type === 'merchant' ? merchantStoreId : clientStoreId;

  // MARKETING PAGE MODE: storeId = 0 or undefined = SaaS landing page visitor
  if (!storeId || storeId === 0) {
    console.log('[AI Chat] Marketing mode - no storeId');
    
    const saasSystemPrompt = `You are a helpful AI assistant for Multi-Store SaaS - an e-commerce platform for Bangladeshi sellers.

## About Multi-Store
- E-commerce platform to create online stores
- Supports bKash, Nagad, Cash on Delivery
- Free plan: 1 product, 50 orders/month
- Starter: ৳500/month - 50 products, 500 orders
- Premium: ৳1500/month - unlimited products, custom domain

## Features
- Instant subdomain (yourstore.digitalcare.site)
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

## FORMATTING RULES (CRITICAL!)
- NEVER use markdown: NO **, NO ##, NO ###, NO -, NO *, NO __
- Use emojis for lists: ✅ 📦 🚚 💰 🎯 🚀
- Use new lines to separate points
- Write plain readable text only
- Example format:
  ✅ ফ্রি প্ল্যান উপলব্ধ
  ✅ ক্যাশ অন ডেলিভারি সাপোর্ট
  ✅ ১০ মিনিটে স্টোর রেডি`;

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
    const creditCheck = await checkCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE);
    if (!creditCheck.allowed) {
      return json({
        error: `Insufficient credits. Need ${CREDIT_COSTS.AI_CHAT_MESSAGE} credits.`,
        code: 'INSUFFICIENT_CREDITS',
      }, { status: 402 });
    }

    // Step 2: Retrieve Data (RAG) - Get store stats
    const stats = await getStoreStats(db, storeId);

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

      await deductCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'Merchant Co-pilot Chat');
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
    const creditCheck = await checkCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE);
    if (!creditCheck.allowed) {
      // For customers, we fail gracefully or just say "AI Busy"
      console.log(`[AI Chat] Store ${storeId} out of credits for customer chat`);
      return json({
        error: 'AI assistant is currently unavailable.',
        code: 'STORE_LIMIT_REACHED',
      }, { status: 503 });
    }

    // Step 2: Retrieve Data (RAG) - Find relevant products (SECURITY: Strict storeId)
    const matchingProducts = await findRelevantProducts(db, message, storeId);

    // Step 3: Construct System Prompt
    const systemPrompt = getCustomerSystemPrompt(
      store.name,
      matchingProducts,
      store.aiBotPersona || undefined
    );

    // Step 4: Generate response
    try {
      const responseText = await callAIWithSystemPrompt(
        apiKey,
        systemPrompt,
        message,
        { model: env.AI_MODEL, baseUrl: env.AI_BASE_URL }
      );

      await deductCredits(db, storeId, CREDIT_COSTS.AI_CHAT_MESSAGE, 'Customer Sales Agent Chat');
      return json({ success: true, response: responseText, context: 'customer' });
    } catch (error) {
      console.error('[AI Chat] Customer error:', error);
      return json({ error: 'AI service error' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid context' }, { status: 400 });
}
