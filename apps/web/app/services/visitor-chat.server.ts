import type { ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { visitors, visitorMessages } from '@db/schema';
import { createAIService } from '~/services/ai.server';

/**
 * Public AI visitor chat handler.
 * Extracted to a server-only module to avoid bundling in client.
 */
export async function handleVisitorChatAction({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { env } = context.cloudflare;
    const apiKey = env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return json({ error: 'AI service not configured' }, { status: 503 });
    }

    const db = drizzle(env.DB);
    const payload = (await request.json()) as any;
    const { action = 'chat' } = payload;

    // ========================================================================
    // 1. REGISTER VISITOR (Lead Capture)
    // ========================================================================
    if (action === 'register') {
      const { name, phone } = payload;

      if (!name || !phone) {
        return json({ error: 'Name and Phone are required' }, { status: 400 });
      }

      const result = await db
        .insert(visitors)
        .values({
          name,
          phone,
        })
        .returning({ id: visitors.id });

      return json({ success: true, visitorId: result[0].id });
    }

    // ========================================================================
    // 2. CHAT REQUEST
    // ========================================================================
    if (action === 'chat') {
      const { message, visitorId, history } = payload;

      if (!visitorId) {
        return json({ error: 'Visitor ID required. Please refresh and register.' }, { status: 401 });
      }

      if (!message || typeof message !== 'string') {
        return json({ error: 'Message is required' }, { status: 400 });
      }

      // Limit message length
      if (message.length > 1000) {
        return json({ error: 'Message too long (max 1000 characters)' }, { status: 400 });
      }

      // 1. Save User Message
      await db.insert(visitorMessages).values({
        visitorId,
        role: 'user',
        content: message,
      });

      // 2. Generate AI Response
      const trimmedHistory = history?.slice(-6) || [];

      const ai = createAIService(apiKey, {
        model: env.AI_MODEL,
        baseUrl: env.AI_BASE_URL,
      });

      const responseText = await ai.chatWithVisitor(message, { history: trimmedHistory });

      // 3. Save Assistant Message
      await db.insert(visitorMessages).values({
        visitorId,
        role: 'assistant',
        content: responseText,
      });

      return json({ success: true, response: responseText });
    }

    return json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Ozzyl AI] Error:', error);
    return json({ error: 'দুঃখিত, সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।' }, { status: 500 });
  }
}
