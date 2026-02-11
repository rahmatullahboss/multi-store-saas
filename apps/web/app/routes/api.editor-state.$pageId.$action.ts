/**
 * Editor State API Route
 * 
 * Proxy to Editor State Durable Object for page builder state management.
 * 
 * Routes:
 * POST /api/editor-state/:pageId/init - Initialize editor with page data
 * POST /api/editor-state/:pageId/get - Get current state
 * POST /api/editor-state/:pageId/update-section - Update section props
 * POST /api/editor-state/:pageId/add-section - Add new section
 * POST /api/editor-state/:pageId/remove-section - Remove section
 * POST /api/editor-state/:pageId/reorder - Reorder sections
 * POST /api/editor-state/:pageId/undo - Undo last action
 * POST /api/editor-state/:pageId/redo - Redo last undone action
 * POST /api/editor-state/:pageId/save - Save draft to DO
 * POST /api/editor-state/:pageId/publish - Publish to D1
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { requireAuth } from '~/lib/auth.server';
import {
  initEditor,
  getEditorState,
  updateSection,
  addSection,
  removeSection,
  reorderSections,
  undo,
  redo,
  saveDraft,
  publishPage,
} from '~/services/editor-state-do.server';

// ============================================================================
// LOADER - Get editor state
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const { user, store } = await requireAuth(request, context);
  const pageId = parseInt(params.pageId || '0', 10);
  const action = params.action;

  if (!pageId || pageId <= 0) {
    return json({ success: false, error: 'Invalid page ID' }, { status: 400 });
  }

  const env = context.cloudflare.env;
  
  // Check if DO service is available
  if (!('EDITOR_STATE_SERVICE' in env) || !env.EDITOR_STATE_SERVICE) {
    return json({ 
      success: false, 
      error: 'Editor State service not available' 
    }, { status: 503 });
  }

  if (action === 'get') {
    const result = await getEditorState(env as any, pageId);
    return json(result);
  }

  return json({ success: false, error: 'Use POST for this action' }, { status: 405 });
}

// ============================================================================
// ACTION - Editor state mutations
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const { user, store } = await requireAuth(request, context);
  const pageId = parseInt(params.pageId || '0', 10);
  const action = params.action;

  if (!pageId || pageId <= 0) {
    return json({ success: false, error: 'Invalid page ID' }, { status: 400 });
  }

  const env = context.cloudflare.env;
  
  // Check if DO service is available
  if (!('EDITOR_STATE_SERVICE' in env) || !env.EDITOR_STATE_SERVICE) {
    return json({ 
      success: false, 
      error: 'Editor State service not available' 
    }, { status: 503 });
  }

  try {
    const body = request.headers.get('content-type')?.includes('application/json')
      ? await request.json()
      : {};

    switch (action) {
      case 'init': {
        const { storeId, sections, title, slug } = body as {
          storeId?: number;
          sections?: any[];
          title?: string;
          slug?: string;
        };
        
        const result = await initEditor(env as any, pageId, {
          pageId,
          storeId: storeId || store.id,
          sections,
          title,
          slug,
        });
        return json(result);
      }

      case 'get': {
        const result = await getEditorState(env as any, pageId);
        return json(result);
      }

      case 'update-section': {
        const { sectionId, props } = body as {
          sectionId: string;
          props: Record<string, unknown>;
        };
        
        if (!sectionId) {
          return json({ success: false, error: 'sectionId required' }, { status: 400 });
        }
        
        const result = await updateSection(env as any, pageId, sectionId, props || {});
        return json(result);
      }

      case 'add-section': {
        const { type, props, afterId } = body as {
          type: string;
          props?: Record<string, unknown>;
          afterId?: string;
        };
        
        if (!type) {
          return json({ success: false, error: 'type required' }, { status: 400 });
        }
        
        const result = await addSection(env as any, pageId, type, props, afterId);
        return json(result);
      }

      case 'remove-section': {
        const { sectionId } = body as { sectionId: string };
        
        if (!sectionId) {
          return json({ success: false, error: 'sectionId required' }, { status: 400 });
        }
        
        const result = await removeSection(env as any, pageId, sectionId);
        return json(result);
      }

      case 'reorder': {
        const { sectionIds } = body as { sectionIds: string[] };
        
        if (!sectionIds || !Array.isArray(sectionIds)) {
          return json({ success: false, error: 'sectionIds array required' }, { status: 400 });
        }
        
        const result = await reorderSections(env as any, pageId, sectionIds);
        return json(result);
      }

      case 'undo': {
        const result = await undo(env as any, pageId);
        return json(result);
      }

      case 'redo': {
        const result = await redo(env as any, pageId);
        return json(result);
      }

      case 'save': {
        const result = await saveDraft(env as any, pageId);
        return json(result);
      }

      case 'publish': {
        const result = await publishPage(env as any, pageId);
        return json(result);
      }

      default:
        return json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[Editor State API] Error:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export default function () {}
