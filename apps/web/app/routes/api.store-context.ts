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
import { parseThemeConfig, defaultThemeConfig } from '@db/types';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const storeResult = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      themeConfig: stores.themeConfig,
      fontFamily: stores.fontFamily,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const themeConfig = parseThemeConfig(store.themeConfig as string | null) || defaultThemeConfig;

  // Build context for AI
  const storeContext = {
    storeId: store.id,
    storeName: store.name,
    subdomain: store.subdomain,
    currentColors: {
      primary: themeConfig.primaryColor || '#6366f1',
      accent: themeConfig.accentColor || '#f59e0b',
      background: themeConfig.backgroundColor || '#f9fafb',
      text: themeConfig.textColor || '#111827',
    },
    currentFont: store.fontFamily || 'inter',
    sections: (themeConfig.sections || []).map((s: any) => ({
      id: s.id,
      type: s.type,
      heading: s.settings?.heading || null,
    })),
    sectionCount: (themeConfig.sections || []).length,
  };

  return json({ success: true, context: storeContext });
}


export default function() {}
