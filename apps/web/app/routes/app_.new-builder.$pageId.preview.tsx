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
 * - Click-to-select: clicking a section sends SECTION_CLICKED to parent
 * - Hover highlight: blue outline on hover
 * - Selection highlight: indigo outline + label badge when selected
 * - Scroll-into-view: scrolls the selected section into view on SECTION_SELECTED
 */

import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { requireAuth } from '~/lib/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { builderPages, builderSections } from '@db/schema_page_builder';

// ── Section components ────────────────────────────────────────────────────────
import { SECTION_COMPONENTS } from '~/components/builder/sections/index';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PreviewSection {
  id: string;
  type: string;
  enabled: number | boolean;
  sortOrder: number;
  propsJson: string;
  variant?: string | null;
}

interface LiveSection {
  id: string;
  type: string;
  enabled: number | boolean;
  sortOrder: number;
  props?: Record<string, unknown>;
  propsJson?: string;
  variant?: string | null;
}

function resolveProps(section: LiveSection): Record<string, unknown> {
  let props: Record<string, unknown> = {};
  if (section.props && typeof section.props === 'object') {
    props = section.props;
  } else {
    try {
      props = JSON.parse((section as PreviewSection).propsJson || '{}');
    } catch {
      props = {};
    }
  }
  if (section.variant) {
    props = { ...props, _variant: section.variant };
  }
  return props;
}

// ── PreviewSectionWrapper ─────────────────────────────────────────────────────

interface PreviewSectionWrapperProps {
  sectionId: string;
  sectionType: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}

function PreviewSectionWrapper({
  sectionId,
  sectionType,
  isSelected,
  onSelect,
  children,
}: PreviewSectionWrapperProps) {
  const handleClick = useCallback(() => {
    // Notify the parent builder frame that this section was clicked
    try {
      window.parent.postMessage(
        { type: 'SECTION_CLICKED', sectionId },
        window.location.origin
      );
    } catch {
      // ignore cross-origin errors
    }
    onSelect(sectionId);
  }, [sectionId, onSelect]);

  return (
    <div
      data-section-id={sectionId}
      className="relative isolate group"
      style={
        isSelected
          ? { outline: '2px solid #6366f1', outlineOffset: '-2px' }
          : undefined
      }
    >
      {/* Section content */}
      {children}

      {/* Hover outline — visible only when not selected (selected uses inline outline) */}
      {!isSelected && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ outline: '2px solid #6366f1', outlineOffset: '-2px' }}
        />
      )}

      {/* Selection label badge */}
      {isSelected && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-20 px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-semibold uppercase tracking-wide rounded-br select-none"
        >
          {sectionType}
        </div>
      )}

      {/* Click-capture overlay — covers the entire section so clicks select instead of navigate */}
      <div
        aria-label={`Select ${sectionType} section`}
        role="button"
        tabIndex={0}
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      />
    </div>
  );
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.page?.title ? `Preview: ${data.page.title}` : 'Page Preview' },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const pageId = params.pageId!;
  const db = drizzle(context.cloudflare.env.DB);

  const [page] = await db
    .select()
    .from(builderPages)
    .where(and(eq(builderPages.id, pageId), eq(builderPages.storeId, store.id)))
    .limit(1);

  if (!page) throw new Response('Page not found', { status: 404 });

  const sections = await db
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId))
    .orderBy(asc(builderSections.sortOrder));

  return json({
    page: { id: page.id, title: page.title, slug: page.slug },
    sections: sections.map((s) => ({
      id: s.id,
      type: s.type,
      enabled: s.enabled,
      sortOrder: s.sortOrder,
      propsJson: s.propsJson ?? '{}',
      variant: s.variant,
    })),
  });
}

// ── BuilderPreviewPage ────────────────────────────────────────────────────────

export default function BuilderPreviewPage() {
  const { sections: initialSections } = useLoaderData<typeof loader>();
  const [sections, setSections] = useState<LiveSection[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (!event.data || typeof event.data !== 'object') return;

      // Live section updates from parent builder
      if (
        (event.data.type === 'PREVIEW_UPDATE' || event.data.type === 'SECTIONS_UPDATE') &&
        Array.isArray(event.data.sections)
      ) {
        setSections(event.data.sections as LiveSection[]);
      }

      // Parent tells us which section is selected → update state + scroll into view
      if (event.data.type === 'SECTION_SELECTED') {
        const incomingId: string | null = event.data.sectionId ?? null;
        setSelectedSectionId(incomingId);

        if (incomingId) {
          const el = document.querySelector<HTMLElement>(
            `[data-section-id="${incomingId}"]`
          );
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    window.addEventListener('message', handleMessage);

    // Signal to the parent builder that the iframe is ready
    try {
      window.parent.postMessage({ type: 'PREVIEW_FRAME_READY' }, window.location.origin);
    } catch {
      // ignore
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const visibleSections = sections.filter((s) => {
    const enabled = typeof s.enabled === 'boolean' ? s.enabled : s.enabled === 1;
    return enabled;
  });

  return (
    <div className="min-h-screen bg-white">
      {visibleSections.length === 0 ? (
        <EmptyPreviewState />
      ) : (
        visibleSections.map((section) => {
          const Component = SECTION_COMPONENTS[section.type];
          const props = resolveProps(section);
          const isSelected = selectedSectionId === section.id;

          if (!Component) {
            return (
              <PreviewSectionWrapper
                key={section.id}
                sectionId={section.id}
                sectionType={section.type}
                isSelected={isSelected}
                onSelect={setSelectedSectionId}
              >
                <div className="py-4 px-6 bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                  Unknown section type: <code>{section.type}</code>
                </div>
              </PreviewSectionWrapper>
            );
          }

          return (
            <PreviewSectionWrapper
              key={section.id}
              sectionId={section.id}
              sectionType={section.type}
              isSelected={isSelected}
              onSelect={setSelectedSectionId}
            >
              <Component props={props} isPreview={true} />
            </PreviewSectionWrapper>
          );
        })
      )}
    </div>
  );
}

// ── EmptyPreviewState ─────────────────────────────────────────────────────────

function EmptyPreviewState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
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
        <h2 className="text-lg font-semibold text-gray-700 mb-2">কোনো সেকশন নেই</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          বাম প্যানেল থেকে সেকশন যোগ করুন।
          <br />
          প্রিভিউ এখানে আপডেট হবে।
        </p>
      </div>
    </div>
  );
}
