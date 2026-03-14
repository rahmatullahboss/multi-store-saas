/**
 * API: Send Push Notification to Store Subscribers
 * 
 * POST /api/push/send
 * Body: { title, body, url? }
 */

import { type ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { getStoreId } from '~/services/auth.server';
import { sendPushToStore } from '~/services/push.server';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';

const PushSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  url: z.string().optional(),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const result = PushSchema.safeParse(data);

    if (!result.success) {
      return json({ error: 'Invalid push data', details: result.error.flatten() }, { status: 400 });
    }

    const { title, body, url } = result.data;

    // Get store logo for icon
    const db = drizzle(context.cloudflare.env.DB);
    const store = await db.select({ logo: stores.logo }).from(stores).where(eq(stores.id, storeId)).limit(1);
    const icon = store[0]?.logo || undefined;

    await sendPushToStore(context.cloudflare.env, storeId, {
      title,
      body,
      url: url || '/',
      icon,
    });

    return json({ success: true });
  } catch (error) {
    console.error('Push send error:', error);
    return json({ error: 'Failed to send push notification' }, { status: 500 });
  }
};


export default function() {}
