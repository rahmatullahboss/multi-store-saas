import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  const upstreamUrl = new URL('/api/ai-orchestrator', request.url);
  upstreamUrl.searchParams.set('channel', 'super_admin');
  upstreamUrl.searchParams.set('mode', 'history');

  const upstream = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    },
  });

  return upstream;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const upstreamUrl = new URL('/api/ai-orchestrator', request.url);
  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    },
    body: JSON.stringify({ ...payload, channel: 'super_admin' }),
  });

  return upstream;
}


export default function() {}
