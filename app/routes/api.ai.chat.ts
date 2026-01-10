
import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { createAIService } from '~/services/ai.server';
import { getSession } from '~/services/auth.server';
import { users, stores } from 'db/schema';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { env } = context.cloudflare;
  const db = drizzle(env.DB);
  const session = await getSession(request, env);
  const userId = session.get('userId');

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user details to determine role (using db.select for compatibility)
  const userResult = await db.select({
    id: users.id,
    name: users.name,
    role: users.role,
    storeId: users.storeId,
  })
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

  const user = userResult[0];

  if (!user) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // Fetch store if user has one
  let store: any = null;
  if (user.storeId) {
    const storeResult = await db.select()
      .from(stores)
      .where(eq(stores.id, user.storeId))
      .limit(1);
    store = storeResult[0];
  }

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: 'AI service not configured' }, { status: 503 });
  }

  const payload = await request.json() as { message: string, context?: any };
  const { message, context: clientContext } = payload;

  if (!message) {
    return json({ error: 'Message is required' }, { status: 400 });
  }

  const ai = createAIService(apiKey, {
    model: env.AI_MODEL,
    baseUrl: env.AI_BASE_URL
  });

  try {
    let response;

    // Dispatch based on role
    if (user.role === 'super_admin') {
       // Super Admin Chat
       response = await ai.chatWithSuperAdmin(message, {
         userId: user.id,
         userName: user.name || 'Admin',
         ...clientContext
       });
    } else {
       // Merchant Chat (Store specific)
       if (!user.storeId || !store) {
         return json({ error: 'Store context required for merchant chat' }, { status: 400 });
       }

       response = await ai.chatWithMerchant(message, user.storeId, {
         storeName: store.name,
         userName: user.name || 'Merchant',
         planType: store.planType,
         ...clientContext
       });
    }

    return json({ success: true, response });
  } catch (error: any) {
    console.error('[AI Chat API] Error:', error);
    return json({ error: error.message || 'Failed to process chat request' }, { status: 500 });
  }
}
