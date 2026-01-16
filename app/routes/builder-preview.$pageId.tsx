/**
 * Page Builder v2 - Preview Route (for iframe embedding)
 * 
 * Renders page sections in isolation for accurate mobile preview.
 * Used by the builder's iframe preview.
 * 
 * This route renders ONLY the section content (no <html> wrapper)
 * because Remix's root.tsx Layout already provides the document structure.
 * 
 * For iframe isolation, the parent should use sandbox attributes
 * or consider a dedicated preview domain in production.
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
// COMPONENT - Renders section content within Remix's document structure
// ============================================================================

export default function PreviewPage() {
  const { sections } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  
  // Listen for updates from parent window (for iframe communication)
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
    <div className="bg-white min-h-screen">
      <SectionRenderer
        sections={sections}
        activeSectionId={null}
        onSelectSection={() => {}}
      />
    </div>
  );
}
