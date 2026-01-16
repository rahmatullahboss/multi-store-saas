/**
 * Page Builder v2 - Preview Route (for iframe embedding)
 * 
 * Renders page sections in isolation for accurate mobile preview.
 * Used by the builder's iframe preview.
 */

import { json } from '@remix-run/cloudflare';
import { useLoaderData, useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

import { getPageWithSections } from '~/lib/page-builder/actions.server';
import { requireAuth } from '~/lib/auth.server';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { pageId } = params;
  
  if (!pageId) {
    throw new Response('Missing page ID', { status: 400 });
  }
  
  // Auth check (preview is only for logged-in users editing)
  const auth = await requireAuth(request, context);
  
  const db = context.cloudflare.env.DB;
  const page = await getPageWithSections(db, pageId, auth.store.id);
  
  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }
  
  return json({
    sections: page.sections.filter(s => s.enabled),
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PreviewPage() {
  const { sections } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  
  // Listen for updates from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BUILDER_UPDATE') {
        revalidate();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [revalidate]);
  
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Preview</title>
        {/* Include Tailwind and app styles */}
        <link rel="stylesheet" href="/app.css" />
      </head>
      <body className="bg-white min-h-screen">
        <SectionRenderer
          sections={sections}
          activeSectionId={null}
          onSelectSection={() => {}}
        />
      </body>
    </html>
  );
}

// No layout - render bare HTML for iframe
export const handle = { hydrate: true };
