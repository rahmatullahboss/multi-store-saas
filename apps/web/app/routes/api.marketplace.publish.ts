/**
 * Theme Marketplace Publish API
 * 
 * Handles publishing store themes to the marketplace.
 */

import type { ActionFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { marketplaceThemes, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { eq } from 'drizzle-orm';

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const db = drizzle(context.cloudflare.env.DB, { schema: { stores, marketplaceThemes } });
  
  try {
    const data = await request.json() as any;
    const { name, description, thumbnail, config } = data;

    if (!name || !config) {
      return json({ error: 'Name and Config are required' }, { status: 400 });
    }

    // Get store name as author name if not provided
    const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
    const authorName = store[0]?.name || 'Unknown Merchant';

    const [newTheme] = await db
      .insert(marketplaceThemes)
      .values({
        name,
        description: description || null,
        thumbnail: thumbnail || null,
        config: typeof config === 'string' ? config : JSON.stringify(config),
        createdBy: storeId,
        authorName,
        isPublic: true,
      })
      .returning();

    return json({ id: newTheme.id, success: true });
  } catch (error) {
    console.error('Marketplace Publish API error:', error);
    return json({ error: 'Failed to publish theme' }, { status: 500 });
  }
}


export default function() {}
