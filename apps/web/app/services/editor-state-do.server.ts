/**
 * Editor State DO Service - Helper functions for live page builder state
 * 
 * Problem solved:
 * Refresh ──► All unsaved changes lost 💀
 * 
 * Solution:
 * Every edit ──► Saved to DO ──► Survives refresh! ✅
 * 
 * Usage:
 * ```ts
 * import { initEditor, updateSection, undo, redo } from '~/services/editor-state-do.server';
 * 
 * // Initialize editor with page data
 * await initEditor(env, pageId, { storeId, sections, title, slug });
 * 
 * // Update section
 * await updateSection(env, pageId, sectionId, { title: 'New Title' });
 * 
 * // Undo/Redo
 * await undo(env, pageId);
 * await redo(env, pageId);
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Section {
  id: string;
  type: string;
  props: Record<string, unknown>;
  order: number;
}

export interface EditorState {
  pageId: number;
  storeId: number;
  sections: Section[];
  title: string;
  slug: string;
  metadata: Record<string, unknown>;
  updatedAt: number;
  isDirty: boolean;
}

export interface EditorResponse {
  success: boolean;
  state?: EditorState;
  canUndo?: boolean;
  canRedo?: boolean;
  newSectionId?: string;
  error?: string;
  message?: string;
}

export interface InitEditorParams {
  pageId: number;
  storeId: number;
  sections?: Section[];
  title?: string;
  slug?: string;
}

interface Env {
  EDITOR_STATE_SERVICE: Fetcher;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize editor with page data
 */
export async function initEditor(
  env: Env,
  pageId: number,
  params: InitEditorParams
): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/init`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('initEditor error:', error);
    return { success: false, error: 'Failed to initialize editor' };
  }
}

/**
 * Get current editor state
 */
export async function getEditorState(
  env: Env,
  pageId: number
): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/get`,
      { method: 'GET' }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('getEditorState error:', error);
    return { success: false, error: 'Failed to get editor state' };
  }
}

/**
 * Update section props
 */
export async function updateSection(
  env: Env,
  pageId: number,
  sectionId: string,
  props: Record<string, unknown>
): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/update-section`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, props }),
      }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('updateSection error:', error);
    return { success: false, error: 'Failed to update section' };
  }
}

/**
 * Add new section
 */
export async function addSection(
  env: Env,
  pageId: number,
  type: string,
  props?: Record<string, unknown>,
  afterId?: string
): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/add-section`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, props, afterId }),
      }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('addSection error:', error);
    return { success: false, error: 'Failed to add section' };
  }
}

/**
 * Remove section
 */
export async function removeSection(
  env: Env,
  pageId: number,
  sectionId: string
): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/remove-section`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId }),
      }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('removeSection error:', error);
    return { success: false, error: 'Failed to remove section' };
  }
}

/**
 * Reorder sections
 */
export async function reorderSections(
  env: Env,
  pageId: number,
  sectionIds: string[]
): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/reorder`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds }),
      }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('reorderSections error:', error);
    return { success: false, error: 'Failed to reorder sections' };
  }
}

/**
 * Undo last action
 */
export async function undo(env: Env, pageId: number): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/undo`,
      { method: 'POST' }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('undo error:', error);
    return { success: false, error: 'Failed to undo' };
  }
}

/**
 * Redo last undone action
 */
export async function redo(env: Env, pageId: number): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/redo`,
      { method: 'POST' }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('redo error:', error);
    return { success: false, error: 'Failed to redo' };
  }
}

/**
 * Save draft to DO storage
 */
export async function saveDraft(env: Env, pageId: number): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/save`,
      { method: 'POST' }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('saveDraft error:', error);
    return { success: false, error: 'Failed to save draft' };
  }
}

/**
 * Publish to D1 database
 */
export async function publishPage(env: Env, pageId: number): Promise<EditorResponse> {
  try {
    const response = await env.EDITOR_STATE_SERVICE.fetch(
      `http://internal/do/${pageId}/publish`,
      { method: 'POST' }
    );
    return await response.json() as EditorResponse;
  } catch (error) {
    console.error('publishPage error:', error);
    return { success: false, error: 'Failed to publish page' };
  }
}
