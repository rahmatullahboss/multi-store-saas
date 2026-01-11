/**
 * Theme Marketplace Apply API
 * 
 * Handles applying marketplace themes to a store.
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { marketplaceThemes, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { eq, and } from 'drizzle-orm';

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
    const { themeId } = data;

    if (!themeId) {
      return json({ error: 'Theme ID is required' }, { status: 400 });
    }

    // Fetch theme from marketplace
    const theme = await db
      .select()
      .from(marketplaceThemes)
      .where(eq(marketplaceThemes.id, parseInt(themeId)))
      .limit(1);

    if (theme.length === 0) {
      return json({ error: 'Theme not found' }, { status: 404 });
    }

    const themeConfig = theme[0].config;

    // Apply theme to store
    await db
      .update(stores)
      .set({
        themeConfig,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Theme applied successfully' });
  } catch (error) {
    console.error('Marketplace Apply API error:', error);
    return json({ error: 'Failed to apply theme' }, { status: 500 });
  }
}
