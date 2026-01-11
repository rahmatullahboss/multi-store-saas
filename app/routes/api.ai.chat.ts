import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { createAIService } from '~/services/ai.server';
import { getSession } from '~/services/auth.server';
import { users, stores } from 'db/schema';
import { agents, conversations, messages } from 'db/schema_agent';
import { eq, desc, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { checkCredits, deductCredits, CREDIT_COSTS } from '~/utils/credit.server';
import { getStoreStats } from '~/services/analytics.server';
import type { PlanType, AIPlanType } from '~/utils/plans.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  const session = await getSession(request, env);
  const userId = session.get('userId');

  if (!userId) return json({ messages: [] });

  const userResult = await db.select({
      storeId: users.storeId,
      role: users.role
  }).from(users).where(eq(users.id, userId)).limit(1);
  
  const user = userResult[0];
  if (!user || (!user.storeId && user.role !== 'super_admin')) {
      return json({ messages: [] });
  }

  // Ensure storeId is present (Merchant only for now)
  if (!user.storeId) return json({ messages: [] });

  // Find Agent
  const agentResult = await db.select().from(agents).where(eq(agents.storeId, user.storeId)).limit(1);
  if (agentResult.length === 0) return json({ messages: [] });
  const agentId = agentResult[0].id;

  // Find Active Conversation
  const activeConv = await db.select()
    .from(conversations)
    .where(and(eq(conversations.agentId, agentId), eq(conversations.status, 'active')))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(1);
    
  if (activeConv.length === 0) return json({ messages: [] });
  const conversationId = activeConv[0].id;

  // Fetch Messages
  const history = await db.select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt
  })
  .from(messages)
  .where(eq(messages.conversationId, conversationId))
  .orderBy(desc(messages.createdAt))
  .limit(50);

  return json({ 
      messages: history.reverse().map(m => ({
          id: String(m.id),
          role: m.role,
          content: m.content
      })) 
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  const session = await getSession(request, env);
  const userId = session.get('userId');

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user details to determine role (using db.select for compatibility)
  const userResult = await db.select({
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
    const storeResult = await db.select()
      .from(stores)
      .where(eq(stores.id, user.storeId))
      .limit(1);
    store = storeResult[0];
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, { status: 503 });
  }

  const payload = await request.json() as { message: string, context?: any };
  const { message, context: clientContext } = payload;

  if (!message) {
    return json({ error: 'Message is required' }, { status: 400 });
  }

  const ai = createAIService(apiKey, {
    model: env.AI_MODEL,
    baseUrl: env.AI_BASE_URL,
    context: env // Pass full env to access env.AI binding
  });

  try {
    let response;

    // ========================================================================
    // CHAT HISTORY: Get or Create Agent & Conversation
    // ========================================================================
    // 1. Get or Create Agent for this store
    let agentId: number;
    if (user.storeId) {
      const agentResult = await db.select().from(agents).where(eq(agents.storeId, user.storeId)).limit(1);
      if (agentResult.length > 0) {
        agentId = agentResult[0].id;
      } else {
        const newAgent = await db.insert(agents).values({
          storeId: user.storeId,
          name: 'Store Assistant',
          type: 'ecommerce'
        }).returning();
        agentId = newAgent[0].id;
      }
    } else {
      // Super Admin "Agent" (Virtual, or linked to a system store if we had one)
      // For now, skip history for Super Admin or handle differently?
      // User requested "Everyone".
      // Let's defer Super Admin history for a moment and focus on Merchant.
      // Or just skip persistence for Super Admin for now to avoid null storeId issues.
    }

    // 2. Get or Create Conversation
    let conversationId: number | null = null;
    if (user.storeId && agentId!) { // Bang because we ensured it above if storeId exists
       const activeConv = await db.select()
         .from(conversations)
         .where(and(eq(conversations.agentId, agentId), eq(conversations.status, 'active')))
         .orderBy(desc(conversations.lastMessageAt))
         .limit(1);

       if (activeConv.length > 0) {
         conversationId = activeConv[0].id;
       } else {
         const newConv = await db.insert(conversations).values({
            agentId,
            customerName: user.name,
            status: 'active',
            lastMessageAt: new Date()
         }).returning();
         conversationId = newConv[0].id;
       }

       // 3. Save User Message
       await db.insert(messages).values({
         conversationId,
         role: 'user',
         content: message,
         createdAt: new Date()
       });
       
       // Update conversation timestamp
       await db.update(conversations)
         .set({ lastMessageAt: new Date() })
         .where(eq(conversations.id, conversationId));
    }


    // Dispatch based on role
    if (user.role === 'super_admin') {
       // Super Admin Chat - NO RATE LIMIT
       response = await ai.chatWithSuperAdmin(message, {
         userId: user.id,
         userName: user.name || 'Admin',
         ...clientContext
       });
    } else {
       // Merchant Chat - RATE LIMITED
       if (!user.storeId || !store) {
         return json({ error: 'Store context required for merchant chat' }, { status: 400 });
       }

       // Rate Limit Check
       // Credit Check
       const creditCheck = await checkCredits(db, user.storeId, CREDIT_COSTS.AI_CHAT_MESSAGE);

       if (!creditCheck.allowed) {
         return json(
           { 
             error: `Insufficient credits. This action costs ${CREDIT_COSTS.AI_CHAT_MESSAGE} credits.`,
             code: 'INSUFFICIENT_CREDITS'
           }, 
           { status: 402 }
         );
       }

       // Fetch recent history
       let history: { role: 'user' | 'assistant'; content: string }[] = [];
       if (conversationId) {
         // Get last 6 messages (to include some context + potentially current one)
         const recentMsgs = await db.select({
           role: messages.role,
           content: messages.content
         })
         .from(messages)
         .where(eq(messages.conversationId, conversationId))
         .orderBy(desc(messages.createdAt))
         .limit(6);
         
         // Reverse to chronological order
         // Filter out the TOP one if it is 'user' and matches 'message'
         const chronMsgs = recentMsgs.reverse();
         if (chronMsgs.length > 0 && chronMsgs[chronMsgs.length - 1].role === 'user' && chronMsgs[chronMsgs.length - 1].content === message) {
            chronMsgs.pop(); // Remove current message from history context
         }
         
         history = chronMsgs.map(m => ({ 
           role: m.role as 'user' | 'assistant',
           content: m.content
         }));
       }

       // Fetch Store Stats
       const analytics = await getStoreStats(db, user.storeId);

       response = await ai.chatWithMerchant(message, user.storeId, {
         storeName: store.name,
         userName: user.name || 'Merchant',
         planType: store.planType,
         history, // Pass history
         analytics, // Pass real-time stats
         ...clientContext
       });

       // Increment usage
       // Only increment KV if we are in Daily/Trial mode
       // Deduct credits
       await deductCredits(db, user.storeId, CREDIT_COSTS.AI_CHAT_MESSAGE);
    }

    // 4. Save Assistant Response
    if (conversationId && response) {
      await db.insert(messages).values({
        conversationId,
        role: 'assistant',
        content: response,
        createdAt: new Date()
      });
      
      // Update timestamp again
      await db.update(conversations)
         .set({ lastMessageAt: new Date() })
         .where(eq(conversations.id, conversationId));
    }

    return json({ success: true, response });
  } catch (error: any) {
    console.error('[AI Chat API] Error:', error);
    return json({ error: error.message || 'Failed to process chat request' }, { status: 500 });
  }
}
