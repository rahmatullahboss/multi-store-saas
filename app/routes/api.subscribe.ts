import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { pushSubscriptions, users } from '@db/schema';
import { getSession } from '~/services/auth.server';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });

  const env = context.cloudflare.env;
  const db = drizzle(env.DB);
  const session = await getSession(request, env);
  
  // 1. Try to get storeId from session
  let storeId = session.get('storeId');
  const userId = session.get('userId');

  // 2. If no storeId but we have userId, fetch from DB
  if (!storeId && userId) {
    const user = await db.select({ storeId: users.storeId }).from(users).where(eq(users.id, userId)).limit(1);
    if (user.length > 0) {
      storeId = user[0].storeId;
    }
  }

  // 3. Validation: Must have storeId (Merchants/Admins)
  if (!storeId) {
    return json({ error: 'Unauthorized: No Store Linked' }, { status: 401 });
  }

  try {
    const data = await request.json() as any;
    const subscription = data.subscription;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
       return json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // 4. Save to DB
    await db.insert(pushSubscriptions)
      .values({
        storeId,
        userId: userId || null,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: request.headers.get('user-agent'),
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: { 
          storeId, // Ensure it points to current store
          userId: userId || null,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        }
      });
    
    return json({ success: true });
  } catch (e) {
    console.error('Push Subscription Error:', e);
    return json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
