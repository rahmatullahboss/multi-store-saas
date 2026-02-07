import { drizzle } from 'drizzle-orm/d1';
import { and, count, eq, gte, lt, or, sql, like } from 'drizzle-orm';
import { orders, products, stores } from '@db/schema';
import { callAIWithSystemPrompt, createAIService } from '~/services/ai.server';
import { buildInsightCardResponse, detectLanguage, isMetricsQuestion } from './ai-chat-guard.server';
import { getStorePolicyBundle, type StorePolicyBundle } from './store-policy.server';
import type { Database } from '~/lib/db.server';

export async function getPlatformStats(db: ReturnType<typeof drizzle>) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [currentPeriod] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`.as('revenue'),
      orderCount: count().as('order_count'),
    })
    .from(orders)
    .where(and(gte(orders.createdAt, sevenDaysAgo), sql`${orders.status} != 'cancelled'`));

  const [previousPeriod] = await db
    .select({
      revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`.as('revenue'),
      orderCount: count().as('order_count'),
    })
    .from(orders)
    .where(and(gte(orders.createdAt, fourteenDaysAgo), lt(orders.createdAt, sevenDaysAgo), sql`${orders.status} != 'cancelled'`));

  const [activeStores] = await db
    .select({
      count: sql<number>`COALESCE(SUM(CASE WHEN ${stores.isActive} = 1 THEN 1 ELSE 0 END), 0)`.as('count'),
    })
    .from(stores);

  const currentRevenue = Number(currentPeriod?.revenue || 0);
  const previousRevenue = Number(previousPeriod?.revenue || 0);
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

  return {
    currentRevenue,
    currentOrders: Number(currentPeriod?.orderCount || 0),
    revenueGrowth,
    activeStores: Number(activeStores?.count || 0),
  };
}

export async function findRelevantProducts(
  db: ReturnType<typeof drizzle>,
  query: string,
  storeId: number
): Promise<Array<{ id: number; title: string; price: number; description: string | null; imageUrl: string | null }>> {
  const searchTerm = `%${query}%`;

  const matchingProducts = await db
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      description: products.description,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        or(
          like(products.title, searchTerm),
          like(products.description, searchTerm),
          like(products.category, searchTerm)
        )
      )
    )
    .limit(5);

  if (matchingProducts.length === 0) {
    return await db
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
        description: products.description,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
      .limit(5);
  }

  return matchingProducts;
}

export function buildCustomerSystemPrompt(
  storeName: string,
  storeProducts: Array<{ id: number; title: string; price: number; description: string | null; imageUrl: string | null }>,
  policy: {
    deliveryText?: string;
    paymentMethods?: string[];
    returnPolicy?: string;
    shippingPolicy?: string;
    subscriptionPolicy?: string;
    legalNotice?: string;
  },
  persona?: string
): string {
  const productList = storeProducts
    .map((p) => `- ID:${p.id} | ${p.title} | ৳${p.price} | Image:${p.imageUrl || 'none'}`)
    .join('\n');

  const defaultPersona = 'You are a helpful sales assistant.';

  return `${persona || defaultPersona}

## Store: ${storeName}

## Available Products (Use ONLY these to recommend)
${productList || 'No specific products found. Ask what they are looking for!'}

## Store Policies (Use ONLY these)
- Delivery: ${policy.deliveryText || 'Not specified'}
- Payment: ${policy.paymentMethods?.join(', ') || 'Not specified'}
- Returns: ${policy.returnPolicy || 'Not specified'}
- Shipping Policy: ${policy.shippingPolicy || 'Not specified'}
- Subscription Policy: ${policy.subscriptionPolicy || 'Not specified'}
- Legal Notice: ${policy.legalNotice || 'Not specified'}

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
- If any policy is "Not specified", say you don't have that information.

## STRUCTURED RESPONSE FORMAT (MANDATORY):
Return JSON object. For product recommendations, use "product_cards":

1. 'product_cards' (Products with image and link):
   { "type": "product_cards", "data": [{ "id": 1, "title": "Product Name", "price": 500, "imageUrl": "https://..." }] }
2. 'text' (Simple Answer):
   { "type": "text", "content": "Sure, here are some items." }
3. 'mixed' (Text + Products):
   { "type": "mixed", "items": [{ "type": "text", "data": "Recommending:" }, { "type": "product_cards", "data": [...] }] }

## FORMATTING:
- Response MUST be valid JSON. No Markdown.
- For products: ALWAYS include id, title, price, imageUrl (from product list), and slug.`;
}

export async function handleSuperAdminMetrics(message: string, db: ReturnType<typeof drizzle>) {
  const platformStats = await getPlatformStats(db);
  if (!isMetricsQuestion(message)) return null;

  const lang = detectLanguage(message);
  const suggestions = lang === 'bn'
    ? [
        platformStats.activeStores > 0 ? 'অ্যাকটিভ স্টোরগুলো পর্যবেক্ষণ করুন' : 'নতুন স্টোর অনবোর্ড করুন',
        'চর্ন কমাতে সাপোর্ট টিমকে অ্যালার্ট দিন',
        'টপ স্টোরগুলো হাইলাইট করুন',
      ]
    : [
        platformStats.activeStores > 0 ? 'Monitor active stores' : 'Onboard new stores',
        'Alert support to reduce churn',
        'Highlight top stores',
      ];

  return buildInsightCardResponse(
    {
      totalSales: platformStats.currentRevenue,
      orderCount: platformStats.currentOrders,
      trend: platformStats.revenueGrowth,
      suggestions,
    },
    lang
  );
}

export async function handleCustomerChat(args: {
  env: { OPENROUTER_API_KEY: string; AI_MODEL: string; AI_BASE_URL: string };
  db: ReturnType<typeof drizzle>;
  analyticsDb: Database;
  message: string;
  storeId: number;
  storeName: string;
  persona?: string;
}) {
  const { env, db, analyticsDb, message, storeId, storeName, persona } = args;
  
  try {
    if (isMetricsQuestion(message)) {
      const lang = detectLanguage(message);
      return JSON.stringify({
        type: 'text',
        content:
          lang === 'bn'
            ? 'দুঃখিত, এই তথ্যটি আমি শেয়ার করতে পারি না। প্রোডাক্ট বা অর্ডার সম্পর্কিত প্রশ্ন করুন।'
            : "Sorry, I can't share that information. Please ask about products or orders.",
      });
    }

    console.log('[CustomerChat] Finding products for storeId:', storeId);
    const matchingProducts = await findRelevantProducts(db, message, storeId);
    console.log('[CustomerChat] Found products:', matchingProducts?.length || 0);

    console.log('[CustomerChat] Getting policy bundle');
    const policyBundle = await getStorePolicyBundle(analyticsDb, storeId);
    console.log('[CustomerChat] Policy bundle:', policyBundle ? 'found' : 'null');

    // Provide default empty policy if store has no policies
    const policies: Partial<StorePolicyBundle> = policyBundle ?? {};

    console.log('[CustomerChat] Building system prompt');
    const systemPrompt = buildCustomerSystemPrompt(
      storeName,
      matchingProducts || [],
      {
        deliveryText: policies.deliveryText,
        paymentMethods: policies.paymentMethods,
        returnPolicy: policies.returnPolicy,
        shippingPolicy: policies.shippingPolicy,
        subscriptionPolicy: policies.subscriptionPolicy,
        legalNotice: policies.legalNotice,
      },
      persona
    );

    console.log('[CustomerChat] Calling AI');
    return callAIWithSystemPrompt(env.OPENROUTER_API_KEY, systemPrompt, message, {
      model: env.AI_MODEL,
      baseUrl: env.AI_BASE_URL,
    });
  } catch (error) {
    console.error('[CustomerChat] Error details:', error);
    console.error('[CustomerChat] Error stack:', (error as Error)?.stack);
    throw error;
  }
}
