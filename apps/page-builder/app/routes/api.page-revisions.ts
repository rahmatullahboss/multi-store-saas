/**
 * Page Revisions API
 * 
 * GET  /api/page-revisions?pageId=...  -> list revisions
 * POST /api/page-revisions            -> create revision
 * POST /api/page-revisions/restore?id=... -> restore revision
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getAuthFromSession } from '~/services/auth.server';

interface CreateRevisionRequest {
  pageId: string;
  content: string; // JSON string
  revisionType?: 'auto' | 'manual' | 'publish';
  description?: string;
}

// ============================================================================
// LOADER - List revisions
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
    const pageId = url.searchParams.get('pageId');

    if (!pageId) {
      return json({ error: 'pageId is required' }, { status: 400 });
    }

    const revisions = await db.prepare(`
      SELECT id, page_id as pageId, store_id as storeId, content,
             revision_type as revisionType, description, created_by as createdBy,
             created_at as createdAt
      FROM page_revisions
      WHERE page_id = ? AND store_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(pageId, user.storeId).all();

    return json({ revisions: revisions.results || [] });
  } catch (error) {
    const err = error as Error;
    console.error('[page-revisions loader error]:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return json({ error: 'Failed to load revisions', details: err.message }, { status: 500 });
  }
}

// ============================================================================
// ACTION - Create revision or restore
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  try {
    // IMPORTANT: Clone request before reading body - Cloudflare Workers can only read body once
    const clonedRequest = request.clone();
    
    const env = (context as any).cloudflare.env;
    const db = env.DB as D1Database;
    
    const user = await getAuthFromSession(request, env);
    if (!user?.storeId) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const actionParam = url.searchParams.get('action');
    const revisionId = url.searchParams.get('id');

    // ========== RESTORE REVISION ==========
    if (actionParam === 'restore' && revisionId) {
      const revision = await db.prepare(`
        SELECT * FROM page_revisions WHERE id = ? AND store_id = ?
      `).bind(revisionId, user.storeId).first();

      if (!revision) {
        return json({ error: 'Revision not found' }, { status: 404 });
      }

      await db.prepare(`
        UPDATE builder_pages
        SET content = ?, updated_at = ?
        WHERE id = ? AND store_id = ?
      `).bind(revision.content, Date.now(), revision.page_id, user.storeId).run();

      return json({ success: true, message: 'Revision restored' });
    }

    // ========== CREATE REVISION ==========
    if (request.method === 'POST') {
      const data = await clonedRequest.json() as CreateRevisionRequest;

      if (!data.pageId || !data.content) {
        return json({ error: 'pageId and content are required' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const now = Date.now();

      await db.prepare(`
        INSERT INTO page_revisions (id, page_id, store_id, content, revision_type, description, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        data.pageId,
        user.storeId,
        data.content,
        data.revisionType || 'auto',
        data.description || null,
        user.id || null,
        now
      ).run();

      // Keep only last 50 revisions
      await db.prepare(`
        DELETE FROM page_revisions
        WHERE page_id = ? AND store_id = ?
          AND id NOT IN (
            SELECT id FROM page_revisions
            WHERE page_id = ? AND store_id = ?
            ORDER BY created_at DESC
            LIMIT 50
          )
      `).bind(data.pageId, user.storeId, data.pageId, user.storeId).run();

      return json({ success: true, id });
    }

    return json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    const err = error as Error;
    console.error('[page-revisions action error]:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return json({ error: 'Action failed', details: err.message }, { status: 500 });
  }
}
