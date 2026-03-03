/**
 * Page Builder v2 — Template Gallery Route
 *
 * Phase 5: Industry-specific template starting point.
 * Merchants land here first and pick a template before entering the editor.
 *
 * Loader  → returns 6 builder templates + existing page count for the store
 * Action  → creates a page from the selected template, redirects to editor
 */

import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { requireAuth } from '~/lib/auth.server';
import { builderPages } from '@db/schema_page_builder';
import {
  getAllBuilderTemplates,
  getBuilderTemplateById,
} from '~/lib/page-builder/templates';
import { TemplateGallery } from '~/components/builder/TemplateGallery';

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = drizzle(context.cloudflare.env.DB);

  // Get existing pages count — scoped to this store (multi-tenancy)
  const [{ value: pagesCount }] = await db
    .select({ value: count() })
    .from(builderPages)
    .where(eq(builderPages.storeId, store.id));

  const templates = getAllBuilderTemplates();

  return json({
    templates,
    pagesCount: pagesCount ?? 0,
    storeId: store.id,
  });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = drizzle(context.cloudflare.env.DB);
  const rawDb = context.cloudflare.env.DB;

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // ── Start Blank ────────────────────────────────────────────────────────────
  if (intent === 'create-blank') {
    const pageId = nanoid();
    const slug = `page-${Date.now()}`;

    await db.insert(builderPages).values({
      id: pageId,
      storeId: store.id,
      slug,
      title: 'নতুন পেজ',
      status: 'draft',
      templateId: 'blank',
    });

    // FIX BUG 3: Insert default starter sections so the iframe preview shows
    // content immediately instead of EmptyPreviewState. Without this the blank
    // page redirects to the editor with zero sections and the iframe renders nothing.
    const defaultSections: Array<{ type: string; props: Record<string, unknown> }> = [
      { type: 'hero', props: {} },
      { type: 'trust-badges', props: {} },
      { type: 'cta', props: {} },
    ];
    if (defaultSections.length > 0) {
      const { getDefaultProps } = await import('~/lib/page-builder/registry');
      const statements: D1PreparedStatement[] = defaultSections.map((sec, idx) => {
        const sectionId = nanoid();
        const propsJson = JSON.stringify(getDefaultProps(sec.type));
        return rawDb
          .prepare(
            `INSERT INTO builder_sections
               (id, page_id, type, variant, enabled, sort_order, props_json, version, created_at, updated_at)
             VALUES (?, ?, ?, ?, 1, ?, ?, 1, ?, ?)`
          )
          .bind(sectionId, pageId, sec.type, null, idx, propsJson, Date.now(), Date.now());
      });
      await rawDb.batch(statements);
    }

    return redirect(`/app/new-builder/${pageId}`);
  }

  // ── Create from builder template ───────────────────────────────────────────
  if (intent === 'create-from-builder-template') {
    const templateId = formData.get('templateId') as string;

    if (!templateId) {
      return json({ error: 'টেমপ্লেট আইডি প্রয়োজন' }, { status: 400 });
    }

    const template = getBuilderTemplateById(templateId);
    if (!template) {
      return json({ error: 'টেমপ্লেট খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // Generate unique slug
    const slug = `${templateId}-${Date.now()}`;
    const pageId = nanoid();

    // Insert page — store_id always scoped (multi-tenancy safety)
    await db.insert(builderPages).values({
      id: pageId,
      storeId: store.id,
      slug,
      title: template.nameBn,
      status: 'draft',
      templateId: template.id,
    });

    // Insert default sections in one D1 batch for performance
    if (template.defaultSections.length > 0) {
      // Sort by position to ensure deterministic order
      const sorted = [...template.defaultSections].sort(
        (a, b) => a.position - b.position
      );

      const statements: D1PreparedStatement[] = sorted.map((sec, idx) => {
        const sectionId = nanoid();
        const propsJson = JSON.stringify(sec.defaultProps);
        return rawDb
          .prepare(
            `INSERT INTO builder_sections
               (id, page_id, type, variant, enabled, sort_order, props_json, version, created_at, updated_at)
             VALUES (?, ?, ?, ?, 1, ?, ?, 1, ?, ?)`
          )
          .bind(
            sectionId,
            pageId,
            sec.type,
            sec.variant || null,
            idx,
            propsJson,
            Date.now(),
            Date.now()
          );
      });

      await rawDb.batch(statements);
    }

    return redirect(`/app/new-builder/${pageId}`);
  }

  return json({ error: 'অবৈধ অনুরোধ' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BuilderTemplatesRoute() {
  const { templates, pagesCount } = useLoaderData<typeof loader>();

  return <TemplateGallery templates={templates} pagesCount={pagesCount} />;
}
