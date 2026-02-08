/**
 * Page Builder Storage API
 *
 * Handles save/load operations for GrapesJS pages.
 * This runs on the page-builder worker at builder.ozzyl.com
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getAuthFromSession } from '~/services/auth.server';

// ============================================================================
// TYPES
// ============================================================================
interface LandingPage {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  projectData: string | null;
  htmlContent: string | null;
  cssContent: string | null;
  pageConfig: string | null;
  isPublished: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Sanitize slug to prevent URL issues and path traversal attacks
 * Allows: lowercase letters, numbers, Bengali characters, hyphens
 */
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF-]/g, '-') // Allow Bengali chars + alphanumeric + hyphen
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 100); // Limit length
}

// ============================================================================
// LOADER - Load project data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const env = (context as any).cloudflare.env;
    const db = env.DB as D1Database;

    const user = await getAuthFromSession(request, env);
    if (!user?.storeId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const pageId = url.searchParams.get('id');

    if (!pageId) {
      return json({ error: 'Page ID required' }, { status: 400 });
    }

    const page = await db
      .prepare(
        `SELECT id, store_id as storeId, name, slug, project_data as projectData, 
       html_content as htmlContent, css_content as cssContent, page_config as pageConfig, 
       is_published as isPublished
       FROM landing_pages WHERE id = ? AND store_id = ? LIMIT 1`
      )
      .bind(parseInt(pageId), user.storeId)
      .first<LandingPage>();

    if (!page) {
      return json({ error: 'Page not found' }, { status: 404 });
    }

    // GrapesJS expects the components and styles as a JSON object
    const projectData = page.projectData ? JSON.parse(page.projectData) : {};
    
    // Sanitize styles to prevent CssComposer errors (getFrames undefined)
    if (projectData.styles) {
      if (!Array.isArray(projectData.styles)) {
        projectData.styles = [];
      } else {
        projectData.styles = projectData.styles.filter((style: any) => {
          if (!style || typeof style !== 'object') return false;
          if (!style.selectors || !Array.isArray(style.selectors) || style.selectors.length === 0) return false;
          if (style.style !== undefined) {
            if (typeof style.style === 'string' && style.style === '') return false;
            if (typeof style.style === 'object' && style.style !== null && Object.keys(style.style).length === 0) return false;
          }
          return true;
        });
      }
    }
    
    // Remove empty CSS string
    if (typeof projectData.css === 'string' && projectData.css.trim() === '') {
      delete projectData.css;
    }
    
    return json({
      ...projectData,
      pageConfig: page.pageConfig ? JSON.parse(page.pageConfig) : null,
    });
  } catch (error) {
    const err = error as Error;
    console.error('[Loader Error]:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return json({ error: 'Loader failed', details: err.message }, { status: 500 });
  }
}

// ============================================================================
// ACTION - Save project data, HTML, and CSS
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const env = (context as any).cloudflare.env;
    const db = env.DB as D1Database;

    const user = await getAuthFromSession(request, env);
    if (!user?.storeId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const data = (await request.json()) as Record<string, unknown>;
    const pageId = new URL(request.url).searchParams.get('id');
    const publish =
      new URL(request.url).searchParams.get('publish') === 'true' ||
      data.publish === true ||
      data.isPublished === true;

    // Extract pageConfig if present
    const rawPageConfig = (data.pageConfig || {}) as Record<string, unknown>;
    const pageConfig = data.pageConfig ? JSON.stringify(data.pageConfig) : null;

    // Remove pageConfig from projectData
    const { pageConfig: _pc, ...projectDataOnly } = data;

    // Determine slug and name from config or body
    let slug = (rawPageConfig.slug || data.slug) as string | undefined;
    const name = (rawPageConfig.metaTitle || data.name || 'Untitled Page') as string;

    // Sanitize slug if provided
    if (slug && typeof slug === 'string') {
      slug = sanitizeSlug(slug);
    }

    // If updating existing page and no slug provided, fetch current slug
    if (pageId && !slug) {
      const existingPage = await db
        .prepare('SELECT slug FROM landing_pages WHERE id = ? AND store_id = ? LIMIT 1')
        .bind(parseInt(pageId), user.storeId)
        .first<{ slug: string }>();

      if (existingPage) {
        slug = existingPage.slug;
      }
    }

    // Only generate new slug for new pages
    if (!slug) {
      slug = `page-${Date.now()}`;
    }

    // ========================================================================
    // PROCESS IMAGES: Move from 'temp/' to 'uploads/' on Save
    // ========================================================================
    const r2 = env.R2 as R2Bucket | undefined;
    const r2UrlClean = (env.R2_PUBLIC_URL as string)?.replace(/\/$/, '');

    let finalHtml = (data.html || '') as string;
    const finalCss = (data.css || '') as string;
    let finalProjectDataStr = JSON.stringify(projectDataOnly);

    if (r2 && r2UrlClean) {
      const tempRegex = new RegExp(`${r2UrlClean}/temp/([^"']+)`, 'g');
      const usedTempFiles = new Set<string>();
      const addMatches = (str: string) => {
        const matches = [...str.matchAll(tempRegex)];
        matches.forEach((m) => usedTempFiles.add(m[1]));
      };
      addMatches(finalHtml);
      addMatches(finalProjectDataStr);

      if (usedTempFiles.size > 0) {
        const movePromises = Array.from(usedTempFiles).map(async (filename) => {
          const tempKey = `temp/${filename}`;
          const permKey = `uploads/${filename}`;
          try {
            const obj = await r2.get(tempKey);
            if (obj) {
              await r2.put(permKey, obj.body, {
                httpMetadata: obj.httpMetadata,
                customMetadata: obj.customMetadata,
              });
              await r2.delete(tempKey);
            }
          } catch (err) {
            console.error(`Failed to move image ${filename}:`, err);
          }
        });
        await Promise.all(movePromises);
        finalHtml = finalHtml.replaceAll(`${r2UrlClean}/temp/`, `${r2UrlClean}/uploads/`);
        finalProjectDataStr = finalProjectDataStr.replaceAll(
          `${r2UrlClean}/temp/`,
          `${r2UrlClean}/uploads/`
        );
      }
    }

    const now = new Date().toISOString();

    if (!pageId) {
      // Create new page
      const result = await db
        .prepare(
          `INSERT INTO landing_pages (store_id, name, slug, project_data, html_content, css_content, page_config, is_published, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id`
        )
        .bind(
          user.storeId,
          name,
          slug,
          finalProjectDataStr,
          finalHtml,
          finalCss,
          pageConfig,
          publish ? 1 : 0,
          now,
          now
        )
        .first<{ id: number }>();

      return json({ id: result?.id, success: true });
    } else {
      // Update existing page
      await db
        .prepare(
          `UPDATE landing_pages 
         SET name = ?, slug = ?, project_data = ?, html_content = ?, css_content = ?, 
             page_config = ?, is_published = ?, updated_at = ?
         WHERE id = ? AND store_id = ?`
        )
        .bind(
          name,
          slug,
          finalProjectDataStr,
          finalHtml,
          finalCss,
          pageConfig,
          publish ? 1 : 0,
          now,
          parseInt(pageId),
          user.storeId
        )
        .run();

      return json({ success: true });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Storage API error:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return json({ error: 'Failed to save', details: err.message }, { status: 500 });
  }
}
