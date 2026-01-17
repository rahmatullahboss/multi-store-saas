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
import { useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

import { getPageWithSections } from '~/lib/page-builder/actions.server';
import { requireAuth } from '~/lib/auth.server';
import { SectionRenderer } from '~/components/page-builder/SectionRenderer';
import { FloatingActionButtons } from '~/components/page-builder/FloatingActionButtons';
import { OzzylBrandingMini } from '~/components/OzzylBranding';

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
    pageSettings: {
      whatsappEnabled: page.whatsappEnabled ?? true,
      whatsappNumber: page.whatsappNumber || '',
      whatsappMessage: page.whatsappMessage || 'হ্যালো! আমি অর্ডার করতে চাই।',
      callEnabled: page.callEnabled ?? true,
      callNumber: page.callNumber || '',
    },
  });
}

// ============================================================================
// COMPONENT - Renders section content within Remix's document structure
// ============================================================================

export default function PreviewPage() {
  const loaderData = useLoaderData<typeof loader>();
  const [liveSections, setLiveSections] = useState(loaderData.sections);
  const [liveSettings, setLiveSettings] = useState(loaderData.pageSettings);
  
  // Listen for live updates from parent window (receives sections data directly)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BUILDER_UPDATE' && event.data.sections) {
        // Receive sections data directly - instant update!
        setLiveSections(event.data.sections);
      }
      if (event.data?.type === 'SETTINGS_UPDATE' && event.data.settings) {
        setLiveSettings(event.data.settings);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update from loader when navigating/refreshing
  useEffect(() => {
    setLiveSections(loaderData.sections);
  }, [loaderData.sections]);

  useEffect(() => {
    setLiveSettings(loaderData.pageSettings);
  }, [loaderData.pageSettings]);
  
  return (
    <div className="bg-white min-h-screen">
      <SectionRenderer
        sections={liveSections}
        activeSectionId={null}
        onSelectSection={() => {}}
      />
      
      {/* Powered by Ozzyl branding */}
      <OzzylBrandingMini />
      
      {/* Floating Action Buttons */}
      <FloatingActionButtons
        whatsappEnabled={liveSettings.whatsappEnabled}
        whatsappNumber={liveSettings.whatsappNumber}
        whatsappMessage={liveSettings.whatsappMessage}
        callEnabled={liveSettings.callEnabled}
        callNumber={liveSettings.callNumber}
        orderEnabled={true}
        orderText="অর্ডার করুন"
      />
    </div>
  );
}
