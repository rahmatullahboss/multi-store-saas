import { useLoaderData } from '@remix-run/react';
import type { ClientLoaderFunctionArgs } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { loader, action } from '~/lib/store-live-editor.server';
import { Loader2, Layout } from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';

export const meta: MetaFunction = () => [{ title: 'Store Live Editor - Ozzyl' }];

export { loader, action };

/**
 * Client Loader - Enables client-side only rendering for LiveEditor
 *
 * The LiveEditor component uses heavy client-side libraries (dnd-kit, etc.)
 * that cannot be server-rendered. By using clientLoader with hydrate=true,
 * Remix will:
 * 1. Render HydrateFallback on server (loading skeleton)
 * 2. Run clientLoader on client (just passes through server data)
 * 3. Then render the actual component with LiveEditor
 *
 * This prevents hydration mismatch errors.
 */
export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  // Just pass through the server data - no additional client data needed
  return await serverLoader();
}
clientLoader.hydrate = true;

/**
 * Loading Skeleton Component - Used by both HydrateFallback and Suspense
 */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Bar Skeleton */}
      <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-px bg-gray-200 hidden md:block" />
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-900">Store Live Editor</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 hidden md:block">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <main className="flex-1 bg-gray-900 flex flex-col items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-lg font-medium">Loading Live Editor...</p>
            <p className="text-gray-500 text-sm mt-2">Preparing your visual editor</p>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * HydrateFallback - Shown during SSR and initial hydration
 *
 * This provides a loading skeleton that matches the LiveEditor layout
 * to provide a smooth transition when the client takes over.
 */
export function HydrateFallback() {
  return <LoadingSkeleton />;
}

/**
 * Lazy load the LiveEditor V2 (Shopify OS 2.0 Compatible)
 * We create the lazy component inside a function to ensure it's only
 * evaluated on the client after hydration.
 */
const LazyLiveEditor = lazy(() =>
  import('~/components/store-builder/LiveEditorV2.client').then((mod) => ({
    default: mod.LiveEditorV2,
  }))
);

export default function StoreLiveEditorRoute() {
  const data = useLoaderData<typeof loader>();

  // Track if we're on the client side after hydration
  // This prevents any server-side rendering of the lazy component
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, show skeleton
  // The HydrateFallback handles SSR, but this handles the transition
  if (!isClient) {
    return <LoadingSkeleton />;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LazyLiveEditor
        store={data.store}
        themeConfig={data.themeConfig}
        templates={data.templates}
        saasDomain={data.saasDomain}
        demoProductId={data.demoProductId ? String(data.demoProductId) : null}
        themeId={data.themeId}
        availableThemes={data.availableThemes}
      />
    </Suspense>
  );
}
