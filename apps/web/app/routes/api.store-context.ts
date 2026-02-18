/**
 * Store Context API
 *
 * Returns current store state for AI context injection
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);

  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const storeResult = await db
    .select({
      id: stores.id,
      subdomain: stores.subdomain,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env });

  // Build context for AI
  const storeContext = {
    storeId: store.id,
    storeName: unifiedSettings.branding.storeName,
    subdomain: store.subdomain,
    currentColors: {
      primary: unifiedSettings.theme.primary,
      accent: unifiedSettings.theme.accent,
      background: unifiedSettings.theme.background,
      text: unifiedSettings.theme.text,
    },
    currentFont: unifiedSettings.typography.fontFamily,
    sections: [],
    sectionCount: 0,
  };

  return json({ success: true, context: storeContext });
}

export default function () {}
