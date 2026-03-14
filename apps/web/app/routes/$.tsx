/**
 * 404 Not Found Page
 *
 * Custom error page with theme support
 * Route: Catches all unmatched routes
 */

import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData } from 'react-router';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { stores, type Store } from '@db/schema';
import { eq } from 'drizzle-orm';
import { getStoreTemplateTheme } from '~/templates/store-registry';
import type { ThemeConfig as EngineThemeConfig } from '~/lib/theme-engine-types';
import { Home, Search } from 'lucide-react';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

interface NotFoundData {
  store: {
    id: number;
    name: string;
    currency: string;
    logo: string | null;
    themeConfig: EngineThemeConfig | null;
  } | null;
  storeName: string;
  currency: string;
  theme: {
    config?: {
      colors?: {
        primary?: string;
        accent?: string;
        background?: string;
        text?: string;
        textMuted?: string;
      };
    };
  } | null;
  hasTheme: boolean;
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Page Not Found - 404' },
    { name: 'description', content: 'The page you are looking for does not exist.' },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Resolve store
  const storeContext = await resolveStore(context, request);

  if (!storeContext) {
    // Return basic 404 without theme if store not found
    return json<NotFoundData>({
      store: null,
      storeName: 'Store',
      currency: '৳',
      theme: null,
      hasTheme: false,
    });
  }

  const { storeId } = storeContext;
  const db = createDb(context.cloudflare.env.DB);

  // Fetch store data
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const storeData = storeResult[0] as Store | undefined;

  if (!storeData) {
    return json<NotFoundData>({
      store: null,
      storeName: 'Store',
      currency: '৳',
      theme: null,
      hasTheme: false,
    });
  }

  // Get unified settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Get theme from unified settings only (no legacy fallback)
  const storeTemplateId = unifiedSettings.theme.templateId || 'starter-store';
  const baseTheme = getStoreTemplateTheme(storeTemplateId);
  const theme = {
    config: {
      colors: {
        primary: unifiedSettings.theme.primary || baseTheme.primary,
        accent: unifiedSettings.theme.accent || baseTheme.accent,
        background: unifiedSettings.theme.background || baseTheme.background,
        text: unifiedSettings.theme.text || baseTheme.text,
        textMuted: unifiedSettings.theme.muted || baseTheme.muted,
      },
    },
  };

  // Build themeConfig for the store object
  const themeConfig = {
    colors: {
      primary: unifiedSettings.theme.primary,
      accent: unifiedSettings.theme.accent,
      background: unifiedSettings.theme.background,
      text: unifiedSettings.theme.text,
      textMuted: unifiedSettings.theme.muted,
    },
  };

  return json<NotFoundData>({
    store: {
      id: storeId,
      name: unifiedSettings.branding.storeName || storeData.name,
      currency: storeData.currency || '৳',
      logo: unifiedSettings.branding.logo || storeData.logo || null,
      themeConfig: themeConfig as unknown as EngineThemeConfig,
    },
    storeName: unifiedSettings.branding.storeName || storeData.name,
    currency: storeData.currency || '৳',
    theme,
    hasTheme: true,
  });
}

export default function NotFoundPage() {
  const { store, storeName, theme, hasTheme } = useLoaderData<NotFoundData>();

  // Get theme colors or use defaults
  const colors = theme?.config?.colors || {
    primary: '#111827',
    accent: '#3b82f6',
    background: '#f9fafb',
    text: '#1f2937',
    textMuted: '#6b7280',
  };

  // If no theme, show basic 404
  if (!hasTheme || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
          <p className="text-gray-500 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      {/* Simple Header */}
      <header
        className="border-b px-4 py-4"
        style={{
          backgroundColor: '#ffffff',
          borderColor: (colors.textMuted || '#6b7280') + '20',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            {store.logo ? (
              <img src={store.logo} alt={storeName} className="h-10 object-contain" />
            ) : (
              <span className="text-xl font-bold" style={{ color: colors.primary }}>
                {storeName}
              </span>
            )}
          </a>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          {/* 404 Number */}
          <div
            className="text-9xl font-bold mb-4"
            style={{
              color: colors.accent,
              opacity: 0.3,
            }}
          >
            404
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.primary }}>
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl mb-8" style={{ color: colors.textMuted }}>
            Sorry, the page you are looking for does not exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: colors.accent }}
            >
              <Home className="w-5 h-5" />
              Back to Home
            </a>

            <a
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border font-medium transition-all hover:bg-gray-50"
              style={{
                borderColor: (colors.textMuted || '#6b7280') + '40',
                color: colors.text,
              }}
            >
              <Search className="w-5 h-5" />
              Browse Products
            </a>
          </div>

          {/* Additional Help */}
          <div
            className="mt-12 pt-8 border-t"
            style={{ borderColor: (colors.textMuted || '#6b7280') + '20' }}
          >
            <p style={{ color: colors.textMuted }}>
              Need help?{' '}
              <a
                href="/pages/contact"
                className="underline hover:no-underline"
                style={{ color: colors.accent }}
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer
        className="border-t px-4 py-6"
        style={{
          backgroundColor: '#ffffff',
          borderColor: (colors.textMuted || '#6b7280') + '20',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p style={{ color: colors.textMuted }}>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
