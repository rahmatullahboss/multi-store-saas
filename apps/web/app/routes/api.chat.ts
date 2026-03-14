import { type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';

// Required for Remix single-fetch compatibility
export async function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const formData = await request.formData();
  const message = formData.get('message')?.toString() || '';
  const storeId = formData.get('storeId')?.toString();

  const upstreamUrl = new URL('/api/ai-orchestrator', request.url);
  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
      authorization: request.headers.get('authorization') || '',
    },
    body: JSON.stringify({
      channel: 'merchant',
      message,
      storeId: storeId ? Number(storeId) : undefined,
    }),
  });

  return upstream;
}


export default function() {}
