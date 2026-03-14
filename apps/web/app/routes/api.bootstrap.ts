import type { LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { products, stores } from '@db/schema';
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
      name: stores.name,
      subdomain: stores.subdomain,
      fontFamily: stores.fontFamily,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env });

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

  const storeProducts = await db
    .select({
      id: products.id,
      title: products.title,
      imageUrl: products.imageUrl,
      price: products.price,
      isPublished: products.isPublished,
    })
    .from(products)
    .where(eq(products.storeId, storeId))
    .limit(100);

  return json({ success: true, context: storeContext, products: storeProducts });
}

export default function () {}
