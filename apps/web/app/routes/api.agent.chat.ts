import { ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { handleAgentChatAction } from '~/services/agent-chat.server';

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
    body: JSON.stringify({ ...payload, channel: 'omnichannel' }),
  });

  return upstream;
}
