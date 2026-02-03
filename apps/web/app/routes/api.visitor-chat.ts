import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { handleVisitorChatAction } from '~/services/visitor-chat.server';

/**
 * Public API endpoint for Ozzyl AI visitor chat
 * No authentication required - for marketing landing page visitors
 * 
 * Actions:
 * - 'register': Create a new visitor (Lead Capture)
 * - 'chat': Send message and get AI response (History Persistence)
 * 
 * Rate limited by Cloudflare
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const payload = await request.json().catch(() => ({}));
  const upstreamUrl = new URL('/api/ai-orchestrator', request.url);
  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    },
    body: JSON.stringify({ ...payload, channel: 'visitor' }),
  });

  return upstream;
}
