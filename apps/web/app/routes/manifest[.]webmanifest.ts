import { json } from '~/lib/rr7-compat';
import type { LoaderFunctionArgs } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const storeResolution = await resolveStore(context as Parameters<typeof resolveStore>[0], request);
  const store = storeResolution?.store;

  let unifiedSettings = null;
  if (store) {
    const { drizzle } = await import('drizzle-orm/d1');
    const db = drizzle(context.cloudflare.env.DB);
    unifiedSettings = await getUnifiedStorefrontSettings(db, store.id, { env: context.cloudflare.env });
  }

  const name = unifiedSettings?.branding.storeName || store?.name || 'Ozzyl Store';
  const shortName =
    unifiedSettings?.branding.storeName?.slice(0, 12) || store?.name?.slice(0, 12) || 'Shop';
  const logo = unifiedSettings?.branding.logo || store?.logo || '/icons/icon-512x512.png';
  const themeColor = unifiedSettings?.theme.primary || '#4f46e5';
  const startUrl = '/?source=pwa';

  return json(
    {
      short_name: shortName,
      name: `${name} Store`,
      icons: [
        {
          src: logo,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: logo,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
      start_url: startUrl,
      scope: '/',
      display: 'standalone',
      theme_color: themeColor,
      background_color: '#ffffff',
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': 'application/manifest+json',
      },
    }
  );
};

export default function () {}
