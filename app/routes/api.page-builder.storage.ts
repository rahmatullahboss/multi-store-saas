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
    return json(projectData);
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
    const publish = new URL(request.url).searchParams.get('publish') === 'true';

    // ========================================================================
    // PROCESS IMAGES: Move from 'temp/' to 'uploads/' on Save
    // ========================================================================
    const r2 = context.cloudflare.env.R2;
    // Remove trailing slash from env URL if present for regex matching
    const r2UrlClean = context.cloudflare.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    
    let finalHtml = data['html'] || '';
    let finalCss = data['css'] || '';
    let finalProjectDataStr = JSON.stringify(data);

    if (r2 && r2UrlClean) {
       // Regex to find all temp images:  .../temp/filename.ext
       // We match strictly on the specific R2 URL prefix + /temp/
       const tempRegex = new RegExp(`${r2UrlClean}/temp/([^"']+)`, 'g');
       
       // Collect all unique temp files used in the content
       const usedTempFiles = new Set<string>();
       
       const addMatches = (str: string) => {
         const matches = [...str.matchAll(tempRegex)];
         matches.forEach(m => usedTempFiles.add(m[1]));
       };
       
       addMatches(finalHtml);
       addMatches(finalProjectDataStr);
       
       if (usedTempFiles.size > 0) {
         console.log(`Processing ${usedTempFiles.size} temp images for permanent storage...`);
         
         const movePromises = Array.from(usedTempFiles).map(async (filename) => {
            const tempKey = `temp/${filename}`;
            const permKey = `uploads/${filename}`;
            
            try {
               // 1. Get Temp Object
               const obj = await r2.get(tempKey);
               if (obj) {
                  // 2. Copy to Permanent (Put with body from Get)
                  await r2.put(permKey, obj.body, {
                     httpMetadata: obj.httpMetadata,
                     customMetadata: obj.customMetadata
                  });
                  // 3. Delete Temp
                  // Note: In production, you might delay deletion or rely on lifecycle, 
                  // but user explicitly asked to "delete if not saved". 
                  // Here we delete "if saved and moved". 
                  // Unsaved ones remain in temp for Lifecycle cleanup.
                  await r2.delete(tempKey);
               }
            } catch (err) {
               console.error(`Failed to move image ${filename}:`, err);
            }
         });
         
         // Wait for all moves
         await Promise.all(movePromises);
         
         // Replace URLs in content
         finalHtml = finalHtml.replaceAll(`${r2UrlClean}/temp/`, `${r2UrlClean}/uploads/`);
         finalProjectDataStr = finalProjectDataStr.replaceAll(`${r2UrlClean}/temp/`, `${r2UrlClean}/uploads/`);
         
         // Update data object with new URLs for re-parsing
         const updatedData = JSON.parse(finalProjectDataStr);
         finalProjectDataStr = JSON.stringify(updatedData); // Ensure consistency
       }
    }
    
    // ========================================================================

    // Extract GrapesJS data (updated)
    const projectData = finalProjectDataStr;
    const html = finalHtml;
    const css = finalCss;

    if (!pageId) {
      // Create new page
      const name = data.name || 'Untitled Page';
      const slug = data.slug || `page-${Date.now()}`;

      const [newPage] = await db
        .insert(landingPages)
        .values({
          storeId,
          name,
          slug,
          projectData,
          htmlContent: html,
          cssContent: css,
          isPublished: publish,
        })
        .returning();

      return json({ id: newPage.id, success: true });
    } else {
      // Update existing page
      await db
        .update(landingPages)
        .set({
          projectData,
          htmlContent: html,
          cssContent: css,
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
