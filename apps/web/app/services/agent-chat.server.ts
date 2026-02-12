import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { processMessage } from './agent.server';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

/**
 * Public AI agent chat handler.
 * Extracted to a server-only module to avoid bundling in client.
 */
export async function handleAgentChatAction({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { storeId } = context; // Assumes middleware sets this
  const env = context.cloudflare.env;
  const db = drizzle(env.DB, { schema });

  // Verify Store has AI enabled
  const store = await db.query.stores.findFirst({
    where: eq(schema.stores.id, storeId),
    columns: { isCustomerAiEnabled: true },
  });

  if (!store?.isCustomerAiEnabled) {
    return json({ error: 'AI features are not enabled for this store' }, { status: 403 });
  }

  const body = (await request.json()) as {
    message: string;
    conversationId: number;
    agentId: number;
  };

  const conversationId = Number(body.conversationId);
  const agentId = Number(body.agentId);
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message || !Number.isInteger(agentId) || agentId <= 0 || !Number.isInteger(conversationId) || conversationId <= 0) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Enforce tenant ownership: agent must belong to current store
  const agent = await db.query.agents.findFirst({
    where: (agents, { and, eq }) => and(eq(agents.id, agentId), eq(agents.storeId, storeId)),
    columns: { id: true },
  });

  if (!agent) {
    return json({ error: 'Agent not found' }, { status: 404 });
  }

  // Enforce conversation ownership under this agent
  const conversation = await db.query.conversations.findFirst({
    where: (conversations, { and, eq }) =>
      and(eq(conversations.id, conversationId), eq(conversations.agentId, agentId)),
    columns: { id: true },
  });

  if (!conversation) {
    return json({ error: 'Conversation not found' }, { status: 404 });
  }

  try {
    const response = await processMessage(
      agentId,
      message,
      conversationId,
      env
    );

    return json(response);
  } catch (error) {
    console.error('Chat API Error:', error);
    return json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
