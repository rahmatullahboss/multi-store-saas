import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { processMessage } from './agent.server';
import * as schema from '../../db/schema';
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

  // AI Assistant is now available to all stores via credit system
  // No longer checking isCustomerAiEnabled

  const body = (await request.json()) as {
    message: string;
    conversationId: number;
    agentId: number;
  };

  const requestedConversationId = Number(body.conversationId);
  const agentId = Number(body.agentId);
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!message || !Number.isInteger(agentId) || agentId <= 0) {
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
  let conversationId = requestedConversationId;
  const conversation = Number.isInteger(requestedConversationId) && requestedConversationId > 0
    ? await db.query.conversations.findFirst({
        where: (conversations, { and, eq }) =>
          and(eq(conversations.id, requestedConversationId), eq(conversations.agentId, agentId)),
        columns: { id: true },
      })
    : null;

  if (!conversation) {
    const created = await db
      .insert(schema.conversations)
      .values({
        agentId,
        status: 'active',
        sessionId: `sim-${agentId}-${Date.now()}`,
        lastMessageAt: new Date(),
      })
      .returning({ id: schema.conversations.id });
    conversationId = created[0].id;
  } else {
    conversationId = conversation.id;
  }

  try {
    const response = await processMessage(
      agentId,
      message,
      conversationId,
      env
    );

    return json({ ...response, conversationId });
  } catch (error) {
    console.error('Chat API Error:', error);
    return json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
