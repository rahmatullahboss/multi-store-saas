import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { pushSubscriptions, stores } from '@db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const SubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { storeId, userId } = context; 
  // Ensure storeId is available (e.g. from tenant middleware)
  if (!storeId) {
     return json({ error: 'Store context required' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  try {
    const data = await request.json();
    const result = SubscriptionSchema.safeParse(data);

    if (!result.success) {
      return json({ error: 'Invalid subscription data', details: result.error }, { status: 400 });
    }

    const { endpoint, keys } = result.data;
    const userAgent = request.headers.get('User-Agent') || 'Unknown';

    // Verify if subscription already exists
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);

    if (existing.length > 0) {
      // Update if needed, or just return success
      return json({ success: true, message: 'Already subscribed' });
    }

    // Save new subscription
    await db.insert(pushSubscriptions).values({
      storeId: Number(storeId),
      userId: userId ? Number(userId) : null,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    });

    return json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return json({ error: 'Failed to save subscription' }, { status: 500 });
  }
};


export default function() {}
