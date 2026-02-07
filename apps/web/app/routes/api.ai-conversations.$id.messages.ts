/**
 * API endpoint to get messages for a specific conversation
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, asc } from 'drizzle-orm';
import { messages, aiConversations } from '@db/schema';
import { getSession } from '~/services/auth.server';

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;
  const session = await getSession(request, env);
  const storeId = session.get('storeId');

  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const conversationId = parseInt(params.id || '', 10);
  if (isNaN(conversationId)) {
    return json({ error: 'Invalid conversation ID' }, { status: 400 });
  }

  const db = drizzle(env.DB);

  // Verify the conversation belongs to this store
  const conversationResult = await db
    .select({ storeId: aiConversations.storeId })
    .from(aiConversations)
    .where(eq(aiConversations.id, conversationId))
    .limit(1);

  if (!conversationResult[0] || conversationResult[0].storeId !== storeId) {
    return json({ error: 'Conversation not found' }, { status: 404 });
  }

  // Get all messages for this conversation
  const conversationMessages = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  return json({ messages: conversationMessages });
}
