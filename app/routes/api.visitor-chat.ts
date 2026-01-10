import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { createAIService } from '~/services/ai.server';

/**
 * Public API endpoint for Ozzyl AI visitor chat
 * No authentication required - for marketing landing page visitors
 * 
 * Rate limited by Cloudflare (configure in wrangler.toml or Cloudflare dashboard)
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { env } = context.cloudflare;
  const apiKey = env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, { status: 503 });
  }

  try {
    const payload = await request.json() as { 
      message: string; 
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };
    
    const { message, history } = payload;

    if (!message || typeof message !== 'string') {
      return json({ error: 'Message is required' }, { status: 400 });
    }

    // Limit message length to prevent abuse
    if (message.length > 1000) {
      return json({ error: 'Message too long (max 1000 characters)' }, { status: 400 });
    }

    // Limit history to last 6 messages
    const trimmedHistory = history?.slice(-6) || [];

    const ai = createAIService(apiKey, {
      model: env.AI_MODEL,
      baseUrl: env.AI_BASE_URL,
    });

    const response = await ai.chatWithVisitor(message, { history: trimmedHistory });

    return json({ success: true, response });
  } catch (error: any) {
    console.error('[Ozzyl AI] Error:', error);
    return json({ error: 'দুঃখিত, সাময়িক সমস্যা হয়েছে। আবার চেষ্টা করুন।' }, { status: 500 });
  }
}
