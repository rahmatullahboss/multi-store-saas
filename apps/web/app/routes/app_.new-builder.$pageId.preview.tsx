/**
 * New Builder Preview Route
 *
 * Route: /app/new-builder/:pageId/preview
 *
 * Loaded inside an <iframe> in BuilderLayout.tsx.
 * Renders the page's React section components using builder_pages + builder_sections tables.
 *
 * Features:
 * - Loads sections from the new builder_pages / builder_sections schema
 * - Verifies page ownership via requireAuth (store_id scoping)
 * - Listens to postMessage { type: 'PREVIEW_UPDATE', sections } for live updates
 * - Signals readiness to parent via postMessage { type: 'PREVIEW_FRAME_READY' }
 * - Shows an empty state when no sections are visible
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { requireAuth } from '~/lib/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { builderPages, builderSections } from '@db/schema_page_builder';

// ── Section components ────────────────────────────────────────────────────────
// Import from the builder sections directory.
// SECTION_COMPONENTS maps section.type → React component.
import { SECTION_COMPONENTS } from '~/components/builder/sections/index';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Shape of a section row as returned from DB / postMessage updates. */
interface PreviewSection {
  id: string;
  type: string;
  enabled: number | boolean;
  sortOrder: number;
  propsJson: string;
  variant?: string | null;
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.page?.title ? `Preview: ${data.page.title}` : 'Page Preview' },
    // Prevent indexing of preview URLs
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  // Auth — ensures the page belongs to the authenticated store
  const { store } = await requireAuth(request, context);
  const pageId = params.pageId!;

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch page — scoped by store_id (multi-tenancy critical)
  const [page] = await db
    .select()
    .from(builderPages)
    .where(and(eq(builderPages.id, pageId), eq(builderPages.storeId, store.id)))
    .limit(1);

  if (!page) {
    throw new Response('Page not found', { status: 404 });
  }

  // Fetch sections ordered deterministically by sort_order
  const sections = await db
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId))
    .orderBy(asc(builderSections.sortOrder));

  return json({
    page: {
      id: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
    },
    sections,
    storeId: store.id,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewBuilderPreview() {
  const { sections: initialSections } = useLoaderData<typeof loader>();

  // Sections state — updated via postMessage for live preview
  const [sections, setSections] = useState<PreviewSection[]>(initialSections);

  // Listen for live update messages from the parent builder frame
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // ✅ Security: reject messages from other origins
      if (event.origin !== window.location.origin) return;
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'PREVIEW_UPDATE' && Array.isArray(event.data.sections)) {
        setSections(event.data.sections as PreviewSection[]);
      }

      // Also handle the older SECTIONS_UPDATE message type sent by BuilderLayout
      if (event.data.type === 'SECTIONS_UPDATE' && Array.isArray(event.data.sections)) {
        // Convert BuilderSection (enabled: boolean) → PreviewSection (enabled: number | boolean)
        setSections(event.data.sections as PreviewSection[]);
      }
    }

    window.addEventListener('message', handleMessage);

    // Notify the parent that the preview frame is ready to receive messages
    // Use window.location.origin instead of '*' for security (same-origin only)
    try {
      window.parent.postMessage({ type: 'PREVIEW_FRAME_READY' }, window.location.origin);
    } catch {
      // Ignore cross-origin errors (shouldn't happen for same-origin iframes)
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Only render visible sections
  const visibleSections = sections.filter((s) => {
    const enabled = typeof s.enabled === 'boolean' ? s.enabled : s.enabled === 1;
    return enabled;
  });

  return (
    // Full-page white background — matches the customer-facing landing page style
    <div className="min-h-screen bg-white">
      {visibleSections.length === 0 ? (
        <EmptyPreviewState />
      ) : (
        visibleSections.map((section) => {
          const Component = SECTION_COMPONENTS[section.type];
          if (!Component) {
            // Gracefully skip unknown section types instead of crashing
            return (
              <div
                key={section.id}
                className="py-4 px-6 bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400"
              >
                Unknown section type: <code>{section.type}</code>
              </div>
            );
          }

          // Parse props — fall back to empty object on malformed JSON
          let props: Record<string, unknown> = {};
          try {
            props = JSON.parse(section.propsJson || '{}');
          } catch {
            props = {};
          }

          return (
            <Component
              key={section.id}
              props={props}
              isPreview={true}
            />
          );
        })
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyPreviewState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        {/* Dashed placeholder box */}
        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          কোনো সেকশন নেই
        </h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          বাম প্যানেল থেকে সেকশন যোগ করুন।
          <br />
          প্রিভিউ এখানে আপডেট হবে।
        </p>
      </div>
    </div>
  );
}
