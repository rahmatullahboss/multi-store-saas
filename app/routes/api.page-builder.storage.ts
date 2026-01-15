/**
 * GrapesJS Storage API
 * 
 * Handles saving and loading of custom landing pages.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { landingPages } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';

// ============================================================================
// LOADER - Load project data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const pageId = url.searchParams.get('id');

  if (!pageId) {
    return json({ error: 'Page ID required' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const result = await db
    .select()
    .from(landingPages)
    .where(
      and(
        eq(landingPages.id, parseInt(pageId)),
        eq(landingPages.storeId, storeId)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return json({ error: 'Page not found' }, { status: 404 });
  }

  const page = result[0];
  
  // GrapesJS expects the components and styles as a JSON object
  try {
    const projectData = page.projectData ? JSON.parse(page.projectData) : {};
    return json({
      ...projectData,
      pageConfig: page.pageConfig ? JSON.parse(page.pageConfig) : null
    });
  } catch (e) {
    return json({ error: 'Failed to parse project data' }, { status: 500 });
  }
}

// ============================================================================
// ACTION - Save project data, HTML, and CSS
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  try {
    const data = await request.json() as any;
    const pageId = new URL(request.url).searchParams.get('id');
    // Check both URL query and body for publish flag
    const publish = new URL(request.url).searchParams.get('publish') === 'true' || data.publish === true || data.isPublished === true;

    // Extract pageConfig if present
    const rawPageConfig = data.pageConfig || {};
    const pageConfig = data.pageConfig ? JSON.stringify(data.pageConfig) : null;
    // Don't include pageConfig in the projectData string saved to DB
    const { pageConfig: _, ...projectDataOnly } = data;

    // Determine slug and name from config or body
    // IMPORTANT: For existing pages, preserve the original slug to prevent 404s
    let slug = rawPageConfig.slug || data.slug;
    const name = rawPageConfig.metaTitle || data.name || 'Untitled Page';
    
    // If updating existing page and no slug provided, fetch current slug
    if (pageId && !slug) {
      const existingPage = await db
        .select({ slug: landingPages.slug })
        .from(landingPages)
        .where(
          and(
            eq(landingPages.id, parseInt(pageId)),
            eq(landingPages.storeId, storeId)
          )
        )
        .limit(1);
      
      if (existingPage.length > 0) {
        slug = existingPage[0].slug;
        console.log(`[Storage] Preserving existing slug: ${slug}`);
      }
    }
    
    // Only generate new slug for new pages
    if (!slug) {
      slug = `page-${Date.now()}`;
    }

    // ========================================================================
    // PROCESS IMAGES: Move from 'temp/' to 'uploads/' on Save
    // ========================================================================
    const r2 = context.cloudflare.env.R2;
    // Remove trailing slash from env URL if present for regex matching
    const r2UrlClean = context.cloudflare.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    
    let finalHtml = data['html'] || '';
    let finalCss = data['css'] || '';
    let finalProjectDataStr = JSON.stringify(projectDataOnly);

    if (r2 && r2UrlClean) {
       // ... existing image processing code ...
       const tempRegex = new RegExp(`${r2UrlClean}/temp/([^"']+)`, 'g');
       const usedTempFiles = new Set<string>();
       const addMatches = (str: string) => {
         const matches = [...str.matchAll(tempRegex)];
         matches.forEach(m => usedTempFiles.add(m[1]));
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
                     customMetadata: obj.customMetadata
                  });
                  await r2.delete(tempKey);
               }
            } catch (err) {
               console.error(`Failed to move image ${filename}:`, err);
            }
         });
         await Promise.all(movePromises);
         finalHtml = finalHtml.replaceAll(`${r2UrlClean}/temp/`, `${r2UrlClean}/uploads/`);
         finalProjectDataStr = finalProjectDataStr.replaceAll(`${r2UrlClean}/temp/`, `${r2UrlClean}/uploads/`);
       }
    }
    
    // ========================================================================

    // Extract GrapesJS data (updated)
    const projectData = finalProjectDataStr;
    const html = finalHtml;
    const css = finalCss;

    if (!pageId) {
      // Create new page
      const [newPage] = await db
        .insert(landingPages)
        .values({
          storeId,
          name,
          slug,
          projectData,
          htmlContent: html,
          cssContent: css,
          pageConfig,
          isPublished: publish,
        })
        .returning();

      return json({ id: newPage.id, success: true });
    } else {
      // Update existing page
      await db
        .update(landingPages)
        .set({
          name,
          slug,
          projectData,
          htmlContent: html,
          cssContent: css,
          pageConfig,
          isPublished: publish,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(landingPages.id, parseInt(pageId)),
            eq(landingPages.storeId, storeId)
          )
        );

      return json({ success: true });
    }
  } catch (error) {
    console.error('Storage API error:', error);
    return json({ error: 'Failed to save' }, { status: 500 });
  }
}
