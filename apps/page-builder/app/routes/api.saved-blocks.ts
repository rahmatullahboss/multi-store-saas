/**
 * Saved Blocks API
 * 
 * Handles CRUD operations for reusable blocks.
 * GET - List saved blocks for store
 * POST - Save a new block
 * DELETE - Delete a block
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getAuthFromSession } from '~/services/auth.server';

// ============================================================================
// TYPES
// ============================================================================
interface SavedBlock {
  id: string;
  storeId: number;
  name: string;
  category: string;
  description: string | null;
  content: string;
  thumbnail: string | null;
  usageCount: number;
  createdAt: number;
  updatedAt: number;
}

interface SaveBlockRequest {
  name: string;
  category?: string;
  description?: string;
  content: string; // JSON string of GrapesJS component(s)
  thumbnail?: string;
}

// ============================================================================
// LOADER - List saved blocks
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const db = env.DB as D1Database;
  
  const user = await getAuthFromSession(request, env);
  if (!user?.storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  try {
    let query = `
      SELECT id, store_id as storeId, name, category, description, content, 
             thumbnail, usage_count as usageCount, created_at as createdAt, updated_at as updatedAt
      FROM saved_blocks 
      WHERE store_id = ?
    `;
    const params: any[] = [user.storeId];

    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const blocks = await db.prepare(query).bind(...params).all<SavedBlock>();

    return json({ 
      blocks: blocks.results || [],
      total: blocks.results?.length || 0
    });
  } catch (error) {
    console.error('Failed to load saved blocks:', error);
    return json({ error: 'Failed to load blocks' }, { status: 500 });
  }
}

// ============================================================================
// ACTION - Create, Update, Delete blocks
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context as any).cloudflare.env;
  const db = env.DB as D1Database;
  
  const user = await getAuthFromSession(request, env);
  if (!user?.storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const blockId = url.searchParams.get('id');

  // ========== DELETE ==========
  if (request.method === 'DELETE') {
    if (!blockId) {
      return json({ error: 'Block ID required' }, { status: 400 });
    }

    try {
      // Verify ownership
      const existing = await db.prepare(
        `SELECT id FROM saved_blocks WHERE id = ? AND store_id = ?`
      ).bind(blockId, user.storeId).first();

      if (!existing) {
        return json({ error: 'Block not found' }, { status: 404 });
      }

      await db.prepare(
        `DELETE FROM saved_blocks WHERE id = ? AND store_id = ?`
      ).bind(blockId, user.storeId).run();

      return json({ success: true, message: 'Block deleted' });
    } catch (error) {
      console.error('Failed to delete block:', error);
      return json({ error: 'Failed to delete block' }, { status: 500 });
    }
  }

  // ========== POST (Create) ==========
  if (request.method === 'POST') {
    try {
      const data = await request.json() as SaveBlockRequest;

      // Validation
      if (!data.name || !data.name.trim()) {
        return json({ error: 'Block name is required' }, { status: 400 });
      }
      if (!data.content) {
        return json({ error: 'Block content is required' }, { status: 400 });
      }

      // Generate UUID
      const id = crypto.randomUUID();
      const now = Date.now();

      await db.prepare(`
        INSERT INTO saved_blocks (id, store_id, name, category, description, content, thumbnail, usage_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        id,
        user.storeId,
        data.name.trim(),
        data.category || 'custom',
        data.description || null,
        data.content,
        data.thumbnail || null,
        now,
        now
      ).run();

      return json({ 
        success: true, 
        id,
        message: `"${data.name}" সেভ হয়েছে`
      });
    } catch (error) {
      console.error('Failed to save block:', error);
      return json({ error: 'Failed to save block' }, { status: 500 });
    }
  }

  // ========== PATCH (Update usage count) ==========
  if (request.method === 'PATCH') {
    if (!blockId) {
      return json({ error: 'Block ID required' }, { status: 400 });
    }

    try {
      // Increment usage count
      await db.prepare(`
        UPDATE saved_blocks 
        SET usage_count = usage_count + 1, updated_at = ?
        WHERE id = ? AND store_id = ?
      `).bind(Date.now(), blockId, user.storeId).run();

      return json({ success: true });
    } catch (error) {
      console.error('Failed to update block usage:', error);
      return json({ error: 'Failed to update block' }, { status: 500 });
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
