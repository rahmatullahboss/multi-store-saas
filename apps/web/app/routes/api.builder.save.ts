/**
 * POST /api/builder/save
 *
 * Debounced auto-save endpoint for the page builder.
 * Upserts draft section props to D1, scoped by store_id for multi-tenant safety.
 */

import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { requireAuth } from '~/lib/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { builderPages, builderSections } from '@db/schema_page_builder';
import { z } from 'zod';

// ── Request schema ────────────────────────────────────────────────────────────

const SaveRequestSchema = z.object({
  pageId: z.string().min(1, 'pageId is required'),
  sections: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      props: z.record(z.unknown()),
      sortOrder: z.number().int(),
      enabled: z.boolean(),
    })
  ),
});

// ── Handler ───────────────────────────────────────────────────────────────────

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { store } = await requireAuth(request, context);
    const db = drizzle(context.cloudflare.env.DB);

    // Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = SaveRequestSchema.safeParse(body);
    if (!parsed.success) {
      return json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { pageId, sections } = parsed.data;

    // Verify page belongs to this store (multi-tenancy critical)
    const [page] = await db
      .select({ id: builderPages.id, storeId: builderPages.storeId })
      .from(builderPages)
      .where(and(eq(builderPages.id, pageId), eq(builderPages.storeId, store.id)))
      .limit(1);

    if (!page) {
      return json({ success: false, error: 'Page not found or access denied' }, { status: 404 });
    }

    // Upsert each section — INSERT OR REPLACE via Drizzle onConflictDoUpdate
    // We do this in a batch for performance
    const now = new Date();

    for (const section of sections) {
      await db
        .update(builderSections)
        .set({
          propsJson: JSON.stringify(section.props),
          sortOrder: section.sortOrder,
          enabled: section.enabled ? 1 : 0,
          updatedAt: now,
        })
        .where(
          and(
            eq(builderSections.id, section.id),
            eq(builderSections.pageId, pageId)
          )
        );
    }

    // Touch page updatedAt
    await db
      .update(builderPages)
      .set({ updatedAt: now })
      .where(eq(builderPages.id, pageId));

    return json({
      success: true,
      savedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('[api.builder.save] error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// GET not supported
export async function loader() {
  return json({ error: 'Use POST' }, { status: 405 });
}
