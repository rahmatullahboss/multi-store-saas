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
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

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
  return `You are a helpful SaaS assistant for "${storeName}" on our e-commerce platform.

## Your Role
- Help merchants understand and use the platform
- Answer questions about store data and statistics
- Provide actionable insights and suggestions

## Current Store Stats
- Today's Sales: ৳${stats.todaySales.toLocaleString()}
- Today's Orders: ${stats.todayOrders}
- Pending Orders: ${stats.pendingOrders}
- Total Products: ${stats.totalProducts}

## Guidelines
- Be professional and helpful
- Use Bengali if the merchant writes in Bengali, otherwise use English
- Provide specific data when asked about sales, orders, etc.
- If the answer is not in the context, say you don't know
- Keep responses concise and actionable`;
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
- Never make up product information`;
}

// ============================================================================
// MAIN ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);

  // Parse request
  let payload: ChatRequest;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, { status: 400 });
  }

  const { message, storeId: clientStoreId } = payload;

  if (!message) {
    return json({ error: 'Message required' }, { status: 400 });
  }

  // Get API key
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, { status: 503 });
  }

  // Step 1: Identify Context
  const session = await getSession(request.headers.get('Cookie'));
  const merchantStoreId = session.get('storeId');
  
  // Determine context: Merchant (logged in) or Customer (public visitor)
  const context_type: ChatContext = merchantStoreId ? 'merchant' : 'customer';
  const storeId = context_type === 'merchant' ? merchantStoreId : clientStoreId;

  if (!storeId) {
    return json({ error: 'Store ID required' }, { status: 400 });
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
    // Check plan - Merchant co-pilot is for paid plans only
    if (store.planType === 'free') {
      return json({
        error: 'Upgrade to Starter or Premium to access AI Co-pilot',
        code: 'PLAN_REQUIRED',
      }, { status: 403 });
    }

    // Step 2: Retrieve Data (RAG) - Get store stats
    const stats = await getStoreStats(db, storeId);

    // Step 3: Construct System Prompt
    const systemPrompt = getMerchantSystemPrompt(stats, store.name);

    // Step 4: Generate response
    try {
      const openrouter = createOpenRouter({ apiKey });
      const result = await generateText({
        model: openrouter('google/gemini-2.0-flash-001'),
        system: systemPrompt,
        prompt: message,
      });

      return json({ success: true, response: result.text, context: 'merchant' });
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
      const openrouter = createOpenRouter({ apiKey });
      const result = await generateText({
        model: openrouter('google/gemini-2.0-flash-001'),
        system: systemPrompt,
        prompt: message,
      });

      return json({ success: true, response: result.text, context: 'customer' });
    } catch (error) {
      console.error('[AI Chat] Customer error:', error);
      return json({ error: 'AI service error' }, { status: 500 });
    }
  }

  return json({ error: 'Invalid context' }, { status: 400 });
}
