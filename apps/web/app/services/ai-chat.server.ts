import { json } from '~/lib/rr7-compat';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { createAIService } from '~/services/ai.server';
import { getSession } from '~/services/auth.server';
import { users, stores } from '@db/schema';
import { agents, conversations, messages } from '@db/schema_agent';
import { eq, desc, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { createDb } from '~/lib/db.server';
import { CREDIT_COSTS } from '~/utils/credit.server';
import { requireCredits, chargeCredits } from '~/services/ai-credits.server';
import { getStoreStats } from '~/services/analytics.server';
import type { PlanType } from '~/utils/plans.server';
import {
  buildInsightCardResponse,
  detectLanguage,
  isMetricsQuestion,
} from '~/services/ai-chat-guard.server';
import { getPlatformStats } from '~/services/ai-orchestrator.server';

function isQuickSnapshotPrompt(message: string): boolean {
  const text = message.trim().toLowerCase();
  if (!text) return false;
  if (text.length <= 4) return true;

  const hints = [
    'ok',
    'status',
    'update',
    'snapshot',
    'summary',
    'report',
    'current',
    'latest',
    'kemon',
    'ki obostha',
    'অবস্থা',
    'আপডেট',
    'স্ন্যাপশট',
    'রিপোর্ট',
    'স্ট্যাটাস',
  ];
  return hints.some((h) => text.includes(h));
}

export async function handleAiChatLoader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const db = createDb(env.DB);
  const session = await getSession(request, env);
  const userId = session.get('userId');

  if (!userId) return json({ messages: [] });

  const userResult = await db
    .select({
      storeId: users.storeId,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userResult[0];
  if (!user || (!user.storeId && user.role !== 'super_admin')) {
    return json({ messages: [] });
  }

  // Ensure storeId is present (Merchant only for now)
  if (!user.storeId) return json({ messages: [] });

  // Find Agent
  const agentResult = await db
    .select()
    .from(agents)
    .where(eq(agents.storeId, user.storeId))
    .limit(1);
  if (agentResult.length === 0) return json({ messages: [] });
  const agentId = agentResult[0].id;

  // Find Active Conversation
  const activeConv = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.agentId, agentId), eq(conversations.status, 'active')))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(1);

  if (activeConv.length === 0) return json({ messages: [] });
  const conversationId = activeConv[0].id;

  // Fetch Messages
  const history = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(50);

  return json({
    messages: history.reverse().map((m) => ({
      id: String(m.id),
      role: m.role,
      content: m.content,
    })),
  });
}

export async function handleAiChatAction({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { env } = context.cloudflare;
  const db = createDb(env.DB);
  const session = await getSession(request, env);
  const userId = session.get('userId');

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user details to determine role (using db.select for compatibility)
  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
      storeId: users.storeId,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userResult[0];

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch store if user has one
  let store: any = null;
  if (user.storeId) {
    const storeResult = await db
      .select()
      .from(stores)
      .where(eq(stores.id, user.storeId))
      .limit(1);
    store = storeResult[0];
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, { status: 503 });
  }

  const payload = (await request.json()) as { message: string; context?: any };
  const { message, context: clientContext } = payload;

  if (!message) {
    return json({ error: 'Message is required' }, { status: 400 });
  }

  const ai = createAIService(apiKey, {
    model: env.AI_MODEL,
    baseUrl: env.AI_BASE_URL,
    context: env, // Pass full env to access env.AI binding
  });

  try {
    let response;

    // ========================================================================
    // CHAT HISTORY: Get or Create Agent & Conversation
    // ========================================================================
    // 1. Get or Create Agent for this store
    let agentId: number;
    if (user.storeId) {
      const agentResult = await db
        .select()
        .from(agents)
        .where(eq(agents.storeId, user.storeId))
        .limit(1);
      if (agentResult.length > 0) {
        agentId = agentResult[0].id;
      } else {
        const newAgent = await db
          .insert(agents)
          .values({
            storeId: user.storeId,
            name: 'Store Assistant',
            type: 'ecommerce',
          })
          .returning();
        agentId = newAgent[0].id;
      }
    }

    // 2. Get or Create Conversation
    let conversationId: number | null = null;
    if (user.storeId && agentId!) {
      const activeConv = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.agentId, agentId), eq(conversations.status, 'active')))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(1);

      if (activeConv.length > 0) {
        conversationId = activeConv[0].id;
      } else {
        const newConv = await db
          .insert(conversations)
          .values({
            agentId,
            customerName: user.name,
            status: 'active',
            lastMessageAt: new Date(),
          })
          .returning();
        conversationId = newConv[0].id;
      }

      // Prevent duplicate responses for accidental double-submit/retry
      const recent = await db
        .select({
          role: messages.role,
          content: messages.content,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(2);

      if (recent.length >= 2) {
        const [latest, previous] = recent;
        const latestAt = new Date(latest.createdAt as unknown as string).getTime();
        const withinWindow = Number.isFinite(latestAt) && Date.now() - latestAt < 15_000;

        if (
          withinWindow &&
          latest.role === 'assistant' &&
          previous.role === 'user' &&
          previous.content.trim() === message.trim()
        ) {
          return json({ success: true, response: latest.content });
        }
      }

      // 3. Save User Message
      await db.insert(messages).values({
        conversationId,
        role: 'user',
        content: message,
        createdAt: new Date(),
      });

      // Update conversation timestamp
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));
    }

    // Dispatch based on role
    if (user.role === 'super_admin') {
      // Super Admin Chat - NO RATE LIMIT
      const platformStats = await getPlatformStats(drizzle(env.DB));
      const shouldReturnCard = isMetricsQuestion(message) || isQuickSnapshotPrompt(message);

      if (shouldReturnCard) {
        const lang = detectLanguage(message);
        const suggestions =
          lang === 'bn'
            ? ['অ্যাকটিভ স্টোর মনিটর করুন', 'রাজস্ব ট্রেন্ড রিভিউ করুন', 'সাপোর্ট অ্যালার্ট চেক করুন']
            : ['Monitor active stores', 'Review revenue trend', 'Check support alerts'];
        response = buildInsightCardResponse({
          totalSales: platformStats.currentRevenue,
          orderCount: platformStats.currentOrders,
          trend: platformStats.revenueGrowth,
          suggestions,
        });
      } else {
        response = await ai.chatWithSuperAdmin(message, {
          role: user.role,
          userName: user.name || 'Admin',
          platformStats,
          storeStats: null,
          clientContext,
        });
      }
    } else {
      // Merchant Chat - Rate limited & credits checked
      const requiredCredits = CREDIT_COSTS.AI_CHAT_MESSAGE;

      if (!user.storeId) {
        return json({ error: 'Merchant store not found' }, { status: 400 });
      }

      const creditCheck = await requireCredits(db, user.storeId, requiredCredits, 'merchant');

      if (!creditCheck.allowed) {
        return json(
          {
            error: creditCheck.error,
            code: creditCheck.code,
          },
          { status: creditCheck.status }
        );
      }

      const storeStats = await getStoreStats(db, user.storeId);

      if (isMetricsQuestion(message)) {
        const lang = detectLanguage(message);
        const suggestions =
          lang === 'bn'
            ? ['পেন্ডিং অর্ডার ফলোআপ করুন', 'লো-স্টক আইটেম রিস্টক করুন', 'টপ পণ্যে অফার চালু করুন']
            : ['Follow up pending orders', 'Restock low-stock items', 'Run offers on top products'];
        response = buildInsightCardResponse({
          totalSales: Number(storeStats?.todaySales || 0),
          orderCount: Number(storeStats?.todayOrders || 0),
          trend: Number(storeStats?.salesTrend || 0),
          suggestions,
        });
      } else {
        response = await ai.chatWithMerchant(message, user.storeId, {
          role: user.role,
          userName: user.name || 'Merchant',
          platformStats: null,
          storeStats,
          clientContext,
        });
      }

      // Deduct credits
      const deductResult = await chargeCredits(db, user.storeId, requiredCredits, 'AI chat message', {
        feature: 'AI_CHAT_MESSAGE',
      });
      if (!deductResult.success) {
        return json(
          {
            error: deductResult.error || 'Failed to deduct credits',
            code: 'CREDIT_DEDUCTION_FAILED',
          },
          { status: 402 }
        );
      }
    }

    // 4. Save Assistant Response
    if (conversationId && response) {
      await db.insert(messages).values({
        conversationId,
        role: 'assistant',
        content: response,
        createdAt: new Date(),
      });

      // Update timestamp again
      await db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId));
    }

    return json({ success: true, response });
  } catch (error: any) {
    console.error('[AI Chat API] Error:', error);
    return json({ error: error.message || 'Failed to process chat request' }, { status: 500 });
  }
}
