/**
 * Builder Publisher Service — Phase 7
 *
 * Static KV Publishing for the Ozzyl Landing Page Builder.
 *
 * Architecture:
 * - NO renderToString (CPU limit risk on Workers)
 * - Publishes a JSON snapshot to KV (sections + settings + meta)
 * - Storefront route reads JSON from KV and renders client-side (React hydration)
 * - Avoids CPU timeout issues entirely
 *
 * KV Key Patterns:
 *   page:{storeId}:{slug}       → JSON snapshot (sections + settings)
 *   page:{storeId}:{slug}:meta  → { title, description, publishedAt }
 *   store:{storeId}:pages       → string[] of published slugs (for sitemap)
 *
 * Multi-tenancy: ALL D1 queries are scoped by store_id.
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc } from 'drizzle-orm';
import { builderPages, builderSections } from '@db/schema_page_builder';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single published section snapshot stored in KV. */
export interface PublishedSection {
  id: string;
  type: string;
  variant: string | null;
  sortOrder: number;
  enabled: boolean;
  props: Record<string, unknown>;
}

/** Page-level settings stored alongside the sections snapshot. */
export interface PublishedPageSettings {
  title: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  templateId: string | null;
  productId: number | null;

  // Floating buttons
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
  whatsappMessage: string | null;
  callEnabled: boolean;
  callNumber: string | null;
  orderEnabled: boolean;
  orderText: string | null;
  orderBgColor: string | null;
  orderTextColor: string | null;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'bottom-center';

  // Custom HTML injection
  customHeaderHtml: string | null;
  customFooterHtml: string | null;
}

/** The full JSON snapshot stored at `page:{storeId}:{slug}` in KV. */
export interface PublishedPageSnapshot {
  version: 1;
  storeId: number;
  slug: string;
  publishedAt: string; // ISO 8601
  settings: PublishedPageSettings;
  sections: PublishedSection[];
}

/** Lightweight meta stored at `page:{storeId}:{slug}:meta` in KV. */
export interface PublishedPageMeta {
  title: string | null;
  description: string | null;
  publishedAt: string;
  slug: string;
  storeId: number;
}

/** Return value of publishPage(). */
export interface PublishResult {
  success: true;
  url: string;
  publishedAt: string;
  sectionsCount: number;
}

/** Return value of unpublishPage(). */
export interface UnpublishResult {
  success: true;
}

// ─── KV Key Helpers ──────────────────────────────────────────────────────────

/** Primary snapshot key. */
export function kvPageKey(storeId: number, slug: string): string {
  return `page:${storeId}:${slug}`;
}

/** Lightweight meta key (title, description, publishedAt). */
export function kvPageMetaKey(storeId: number, slug: string): string {
  return `page:${storeId}:${slug}:meta`;
}

/** Store-level published page index key (list of slugs for sitemap). */
export function kvStorePageIndexKey(storeId: number): string {
  return `store:${storeId}:pages`;
}

// ─── KV TTLs (seconds) ────────────────────────────────────────────────────────

const PAGE_TTL = 3600; // 1 hour — matches requirement spec
const META_TTL = 3600;
const PAGE_INDEX_TTL = 86400; // 24 hours — sitemap index

// ─── Core Helpers ────────────────────────────────────────────────────────────

/**
 * Build a JSON snapshot of the page from its sections.
 *
 * Does NOT use renderToString — instead stores structured data that the
 * storefront route renders client-side via React, avoiding CPU timeout risk.
 */
function buildPageSnapshot(
  page: typeof builderPages.$inferSelect,
  sections: Array<typeof builderSections.$inferSelect>
): PublishedPageSnapshot {
  const publishedAt = new Date().toISOString();

  const publishedSections: PublishedSection[] = sections
    .filter((s) => s.enabled === 1)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => {
      let props: Record<string, unknown> = {};
      try {
        // Use publishedPropsJson if available, else fall back to propsJson
        const src = s.publishedPropsJson || s.propsJson || '{}';
        props = JSON.parse(src) as Record<string, unknown>;
      } catch {
        props = {};
      }
      return {
        id: s.id,
        type: s.type,
        variant: s.variant,
        sortOrder: s.sortOrder,
        enabled: Boolean(s.enabled),
        props,
      };
    });

  const settings: PublishedPageSettings = {
    title: page.title,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    ogImage: page.ogImage,
    canonicalUrl: page.canonicalUrl,
    noIndex: Boolean(page.noIndex),
    templateId: page.templateId,
    productId: page.productId,

    whatsappEnabled: page.whatsappEnabled === 1,
    whatsappNumber: page.whatsappNumber,
    whatsappMessage: page.whatsappMessage,
    callEnabled: page.callEnabled === 1,
    callNumber: page.callNumber,
    orderEnabled: page.orderEnabled === 1,
    orderText: page.orderText,
    orderBgColor: page.orderBgColor,
    orderTextColor: page.orderTextColor,
    buttonPosition: (page.buttonPosition ?? 'bottom-right') as PublishedPageSettings['buttonPosition'],

    customHeaderHtml: page.customHeaderHtml,
    customFooterHtml: page.customFooterHtml,
  };

  return {
    version: 1,
    storeId: page.storeId,
    slug: page.slug,
    publishedAt,
    settings,
    sections: publishedSections,
  };
}

/**
 * Update the store-level page index in KV.
 * Adds the slug to the list so sitemaps can enumerate published pages.
 * Fire-and-forget safe — errors are logged but not propagated.
 */
async function addSlugToPageIndex(
  kv: KVNamespace,
  storeId: number,
  slug: string
): Promise<void> {
  try {
    const indexKey = kvStorePageIndexKey(storeId);
    const existing = await kv.get<string[]>(indexKey, 'json');
    const slugs = existing ?? [];
    if (!slugs.includes(slug)) {
      slugs.push(slug);
    }
    await kv.put(indexKey, JSON.stringify(slugs), { expirationTtl: PAGE_INDEX_TTL });
  } catch (err) {
    console.error('[builder-publisher] Failed to update page index in KV:', err);
  }
}

/**
 * Remove a slug from the store-level page index in KV.
 * Fire-and-forget safe.
 */
async function removeSlugFromPageIndex(
  kv: KVNamespace,
  storeId: number,
  slug: string
): Promise<void> {
  try {
    const indexKey = kvStorePageIndexKey(storeId);
    const existing = await kv.get<string[]>(indexKey, 'json');
    if (!existing) return;
    const filtered = existing.filter((s) => s !== slug);
    await kv.put(indexKey, JSON.stringify(filtered), { expirationTtl: PAGE_INDEX_TTL });
  } catch (err) {
    console.error('[builder-publisher] Failed to update page index in KV (remove):', err);
  }
}

// ─── publishPage ─────────────────────────────────────────────────────────────

/**
 * Publish a page for a given store.
 *
 * Steps:
 * 1. Verify the page belongs to this store (multi-tenancy guard).
 * 2. Copy propsJson → publishedPropsJson for every section (draft → live).
 * 3. Build a JSON snapshot (no renderToString).
 * 4. DELETE old KV entry before PUT to bust stale cache immediately.
 * 5. Write snapshot + meta to KV with TTL = 3600.
 * 6. Update builder_pages.status = 'published', published_at = NOW().
 * 7. Return { success, url, publishedAt, sectionsCount }.
 *
 * All D1 queries are scoped by store_id.
 */
export async function publishPage(
  db: D1Database,
  kv: KVNamespace,
  pageId: string,
  storeId: number,
  saasDomain: string
): Promise<PublishResult> {
  const drizzleDb = drizzle(db);
  const now = new Date();

  // ── 1. Fetch & guard the page (scoped by store_id) ──────────────────────
  const [page] = await drizzleDb
    .select()
    .from(builderPages)
    .where(
      and(
        eq(builderPages.id, pageId),
        eq(builderPages.storeId, storeId)
      )
    )
    .limit(1);

  if (!page) {
    throw new Error('Page not found or access denied');
  }

  // ── 2. Fetch all sections for this page ──────────────────────────────────
  const sections = await drizzleDb
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId))
    .orderBy(asc(builderSections.sortOrder));

  // ── 3. Copy draft props → published props for each section ───────────────
  //       Done in sequence to respect D1 limits; batching is possible but
  //       section counts are typically small (< 20).
  for (const section of sections) {
    await drizzleDb
      .update(builderSections)
      .set({
        publishedPropsJson: section.propsJson,
        publishedAt: now,
        updatedAt: now,
      })
      .where(
        and(
          eq(builderSections.id, section.id),
          eq(builderSections.pageId, pageId)
        )
      );
  }

  // ── 4. Build JSON snapshot (no renderToString) ───────────────────────────
  //       Re-fetch sections after props copy so publishedPropsJson is fresh
  const freshSections = await drizzleDb
    .select()
    .from(builderSections)
    .where(eq(builderSections.pageId, pageId))
    .orderBy(asc(builderSections.sortOrder));

  const snapshot = buildPageSnapshot({ ...page }, freshSections);
  const snapshotJson = JSON.stringify(snapshot);

  const meta: PublishedPageMeta = {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription,
    publishedAt: snapshot.publishedAt,
    slug: page.slug,
    storeId,
  };

  // ── 5. Write to KV — DELETE first to bust stale cache ───────────────────
  const pageKey = kvPageKey(storeId, page.slug);
  const metaKey = kvPageMetaKey(storeId, page.slug);

  // Delete old entries synchronously before writing new ones
  await Promise.all([
    kv.delete(pageKey),
    kv.delete(metaKey),
  ]);

  // Write new snapshot + meta
  await Promise.all([
    kv.put(pageKey, snapshotJson, { expirationTtl: PAGE_TTL }),
    kv.put(metaKey, JSON.stringify(meta), { expirationTtl: META_TTL }),
  ]);

  // ── 6. Update page index (fire-and-forget) ────────────────────────────────
  addSlugToPageIndex(kv, storeId, page.slug).catch(() => {});

  // ── 7. Update D1: status = published, published_at = now ─────────────────
  await drizzleDb
    .update(builderPages)
    .set({
      status: 'published',
      publishedAt: now,
      lastPublishedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(builderPages.id, pageId),
        eq(builderPages.storeId, storeId)
      )
    );

  // Build the canonical published URL
  const publishedUrl = `https://${saasDomain}/p/${page.slug}`;

  // ✅ FIX: Structured logging — no raw console.log in production
  console.info(JSON.stringify({
    level: 'info',
    event: 'page_published',
    slug: page.slug,
    storeId,
    sectionCount: freshSections.length,
    kvKey: pageKey,
    timestamp: new Date().toISOString(),
  }));

  return {
    success: true,
    url: publishedUrl,
    publishedAt: snapshot.publishedAt,
    sectionsCount: freshSections.filter((s) => s.enabled === 1).length,
  };
}

// ─── unpublishPage ────────────────────────────────────────────────────────────

/**
 * Unpublish a page for a given store.
 *
 * Steps:
 * 1. Verify the page belongs to this store (multi-tenancy guard).
 * 2. Delete KV entries: snapshot + meta.
 * 3. Remove from store page index.
 * 4. Update builder_pages.status = 'draft' in D1.
 *
 * All D1 queries are scoped by store_id.
 */
export async function unpublishPage(
  db: D1Database,
  kv: KVNamespace,
  pageId: string,
  storeId: number
): Promise<UnpublishResult> {
  const drizzleDb = drizzle(db);

  // ── 1. Fetch & guard the page ─────────────────────────────────────────────
  const [page] = await drizzleDb
    .select({
      id: builderPages.id,
      slug: builderPages.slug,
      storeId: builderPages.storeId,
    })
    .from(builderPages)
    .where(
      and(
        eq(builderPages.id, pageId),
        eq(builderPages.storeId, storeId)
      )
    )
    .limit(1);

  if (!page) {
    throw new Error('Page not found or access denied');
  }

  // ── 2. Delete KV entries ──────────────────────────────────────────────────
  await Promise.all([
    kv.delete(kvPageKey(storeId, page.slug)),
    kv.delete(kvPageMetaKey(storeId, page.slug)),
  ]);

  // ── 3. Remove from page index (fire-and-forget) ───────────────────────────
  removeSlugFromPageIndex(kv, storeId, page.slug).catch(() => {});

  // ── 4. Update D1: status = draft ─────────────────────────────────────────
  await drizzleDb
    .update(builderPages)
    .set({
      status: 'draft',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(builderPages.id, pageId),
        eq(builderPages.storeId, storeId)
      )
    );

  // ✅ FIX: Structured logging
  console.info(JSON.stringify({
    level: 'info',
    event: 'page_unpublished',
    slug: page.slug,
    storeId,
    timestamp: new Date().toISOString(),
  }));

  return { success: true };
}

// ─── getPublishStatus ─────────────────────────────────────────────────────────

/** Minimal status shape returned by the status endpoint. */
export interface PublishStatus {
  pageId: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  lastPublishedAt: string | null;
  kvHit: boolean; // Whether a live KV entry exists for this page
}

/**
 * Get the current publish status of a page.
 *
 * Checks both D1 (source of truth for status) and KV (live entry check).
 * All queries scoped by store_id.
 */
export async function getPublishStatus(
  db: D1Database,
  kv: KVNamespace,
  pageId: string,
  storeId: number
): Promise<PublishStatus> {
  const drizzleDb = drizzle(db);

  const [page] = await drizzleDb
    .select({
      id: builderPages.id,
      slug: builderPages.slug,
      status: builderPages.status,
      publishedAt: builderPages.publishedAt,
      lastPublishedAt: builderPages.lastPublishedAt,
    })
    .from(builderPages)
    .where(
      and(
        eq(builderPages.id, pageId),
        eq(builderPages.storeId, storeId)
      )
    )
    .limit(1);

  if (!page) {
    throw new Error('Page not found or access denied');
  }

  // Check whether a live KV entry exists (without fetching the full snapshot)
  const kvMeta = await kv.get(kvPageMetaKey(storeId, page.slug));
  const kvHit = kvMeta !== null;

  return {
    pageId: page.id,
    slug: page.slug,
    status: (page.status ?? 'draft') as 'draft' | 'published',
    publishedAt: page.publishedAt ? page.publishedAt.toISOString() : null,
    lastPublishedAt: page.lastPublishedAt ? page.lastPublishedAt.toISOString() : null,
    kvHit,
  };
}

// ─── readPublishedPage (used by storefront route) ────────────────────────────

/**
 * Read a published page snapshot from KV.
 * Returns null on KV miss (triggers 404 on storefront).
 *
 * @param kv        - STORE_CACHE KV namespace
 * @param storeId   - Tenant store ID
 * @param slug      - Page slug
 */
export async function readPublishedPage(
  kv: KVNamespace,
  storeId: number,
  slug: string
): Promise<PublishedPageSnapshot | null> {
  try {
    const snapshot = await kv.get<PublishedPageSnapshot>(kvPageKey(storeId, slug), 'json');
    return snapshot;
  } catch (err) {
    console.error('[builder-publisher] KV read error:', err);
    return null;
  }
}
