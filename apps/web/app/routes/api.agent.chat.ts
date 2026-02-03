import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { processMessage } from '../services/agent.server';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

export async function handleAgentChatAction({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { storeId } = context; // Assumes middleware sets this
  const env = context.cloudflare.env;
  const db = drizzle(env.DB, { schema });
  
  // Verify Store has AI enabled
  // Note: context.store might be available if using middleware, otherwise query it
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, storeId),
    columns: { isCustomerAiEnabled: true }
  });

  if (!store?.isCustomerAiEnabled) {
    return json({ error: 'AI features are not enabled for this store' }, { status: 403 });
  }

  const body = await request.json() as { message: string, conversationId: number, agentId: number };
  
  if (!body.message || !body.agentId) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const response = await processMessage(
      body.agentId,
      body.message,
      body.conversationId,
      env
    );

    return json(response);
  } catch (error) {
    console.error('Chat API Error:', error);
    return json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
