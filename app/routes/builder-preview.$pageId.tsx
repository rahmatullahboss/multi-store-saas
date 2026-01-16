/**
 * Page Builder v2 - Preview Route (for iframe embedding)
 * 
 * Renders page sections in isolation for accurate mobile preview.
 * Used by the builder's iframe preview.
 * 
 * NOTE: This route renders its own HTML document to bypass the app layout.
 */

import { json } from '@remix-run/cloudflare';
import { useLoaderData, useRevalidator, Links, Meta, Scripts } from '@remix-run/react';
import { useEffect } from 'react';
import type { LoaderFunctionArgs, LinksFunction } from '@remix-run/cloudflare';

import { getPageWithSections } from '~/lib/page-builder/actions.server';
import { requireAuth } from '~/lib/auth.server';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';

// Import app styles
import appStylesHref from '~/styles/app.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: appStylesHref },
];

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
// COMPONENT - Renders standalone document without app layout
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
    <html lang="bn">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>Preview</title>
      </head>
      <body className="bg-white min-h-screen">
        <SectionRenderer
          sections={sections}
          activeSectionId={null}
          onSelectSection={() => {}}
        />
        <Scripts />
      </body>
    </html>
  );
}

// Bypass the root layout - this is crucial for iframe embedding
export const handle = { hydrate: true };
