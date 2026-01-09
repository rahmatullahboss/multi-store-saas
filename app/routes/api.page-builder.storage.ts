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

    // Extract GrapesJS data
    const projectData = JSON.stringify(data);
    const html = data['html'] || '';
    const css = data['css'] || '';

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
