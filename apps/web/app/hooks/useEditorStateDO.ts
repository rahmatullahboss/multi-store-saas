/**
 * useEditorStateDO Hook
 * 
 * DO-backed editor state management for page builder.
 * 
 * Benefits over client-side only:
 * - Survives page refresh (state persisted in DO SQLite)
 * - Server-side undo/redo history
 * - Auto-save drafts every 30 seconds
 * - Publish to D1 database
 * 
 * Usage:
 * ```tsx
 * const {
 *   sections,
 *   updateSection,
 *   addSection,
 *   removeSection,
 *   reorderSections,
 *   undo,
 *   redo,
 *   canUndo,
 *   canRedo,
 *   isDirty,
 *   saveDraft,
 *   publish,
 *   isLoading,
 * } = useEditorStateDO(pageId, { initialSections, storeId });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';

// ============================================================================
// TYPES
// ============================================================================

export interface Section {
  id: string;
  type: string;
  props: Record<string, unknown>;
  order: number;
}

export interface EditorStateData {
  pageId: number;
  storeId: number;
  sections: Section[];
  title: string;
  slug: string;
  metadata: Record<string, unknown>;
  updatedAt: number;
  isDirty: boolean;
}

interface UseEditorStateDOOptions {
  storeId: number;
  initialSections?: Section[];
  title?: string;
  slug?: string;
  autoSaveInterval?: number; // ms, default 30000 (30s)
  enableAutoSave?: boolean;
}

interface EditorStateDOReturn {
  // State
  sections: Section[];
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Section operations
  updateSection: (sectionId: string, props: Record<string, unknown>) => void;
  addSection: (type: string, props?: Record<string, unknown>, afterId?: string) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (sectionIds: string[]) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Persistence
  saveDraft: () => void;
  publish: () => void;
  
  // Sync
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useEditorStateDO(
  pageId: number,
  options: UseEditorStateDOOptions
): EditorStateDOReturn {
  const {
    storeId,
    initialSections = [],
    title = '',
    slug = '',
    autoSaveInterval = 30000,
    enableAutoSave = true,
  } = options;

  // State
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isDirty, setIsDirty] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const initializedRef = useRef(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetcher for DO API calls
  const fetcher = useFetcher();

  // Response type from API
  interface EditorDOResponse {
    success: boolean;
    state?: EditorStateData;
    canUndo?: boolean;
    canRedo?: boolean;
    error?: string;
    newSectionId?: string;
    message?: string;
  }

  // ========================================================================
  // DO API CALL HELPER
  // ========================================================================
  const callEditorDO = useCallback(async (
    action: string,
    body?: Record<string, unknown>
  ): Promise<EditorDOResponse> => {
    try {
      const response = await fetch(`/api/editor-state/${pageId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json() as EditorDOResponse;
      
      if (data.success && data.state) {
        setSections(data.state.sections || []);
        setIsDirty(data.state.isDirty || false);
        setCanUndo(data.canUndo ?? false);
        setCanRedo(data.canRedo ?? false);
      }
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [pageId]);

  // ========================================================================
  // INITIALIZE
  // ========================================================================
  useEffect(() => {
    if (initializedRef.current || !pageId || pageId <= 0) return;
    initializedRef.current = true;
    
    setIsLoading(true);
    callEditorDO('init', {
      pageId,
      storeId,
      sections: initialSections,
      title,
      slug,
    }).finally(() => setIsLoading(false));
  }, [pageId, storeId, initialSections, title, slug, callEditorDO]);

  // ========================================================================
  // AUTO-SAVE
  // ========================================================================
  useEffect(() => {
    if (!enableAutoSave || !isDirty) return;
    
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set new auto-save timer
    autoSaveTimerRef.current = setTimeout(() => {
      callEditorDO('save');
    }, autoSaveInterval);
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, enableAutoSave, autoSaveInterval, callEditorDO]);

  // ========================================================================
  // SECTION OPERATIONS
  // ========================================================================
  const updateSection = useCallback((sectionId: string, props: Record<string, unknown>) => {
    // Optimistic update
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, props: { ...s.props, ...props } } : s
    ));
    setIsDirty(true);
    
    // Sync to DO
    callEditorDO('update-section', { sectionId, props });
  }, [callEditorDO]);

  const addSection = useCallback((type: string, props?: Record<string, unknown>, afterId?: string) => {
    setIsLoading(true);
    callEditorDO('add-section', { type, props, afterId })
      .finally(() => setIsLoading(false));
  }, [callEditorDO]);

  const removeSection = useCallback((sectionId: string) => {
    // Optimistic update
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setIsDirty(true);
    
    // Sync to DO
    callEditorDO('remove-section', { sectionId });
  }, [callEditorDO]);

  const reorderSections = useCallback((sectionIds: string[]) => {
    // Optimistic update
    setSections(prev => {
      const sectionMap = new Map(prev.map(s => [s.id, s]));
      return sectionIds
        .map((id, index) => {
          const section = sectionMap.get(id);
          return section ? { ...section, order: index } : null;
        })
        .filter((s): s is Section => s !== null);
    });
    setIsDirty(true);
    
    // Sync to DO
    callEditorDO('reorder', { sectionIds });
  }, [callEditorDO]);

  // ========================================================================
  // HISTORY (UNDO/REDO)
  // ========================================================================
  const undo = useCallback(() => {
    if (!canUndo) return;
    setIsLoading(true);
    callEditorDO('undo').finally(() => setIsLoading(false));
  }, [canUndo, callEditorDO]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    setIsLoading(true);
    callEditorDO('redo').finally(() => setIsLoading(false));
  }, [canRedo, callEditorDO]);

  // ========================================================================
  // PERSISTENCE
  // ========================================================================
  const saveDraft = useCallback(() => {
    setIsLoading(true);
    callEditorDO('save').finally(() => setIsLoading(false));
  }, [callEditorDO]);

  const publish = useCallback(() => {
    setIsLoading(true);
    callEditorDO('publish').finally(() => setIsLoading(false));
  }, [callEditorDO]);

  // ========================================================================
  // SYNC
  // ========================================================================
  const refresh = useCallback(() => {
    setIsLoading(true);
    callEditorDO('get').finally(() => setIsLoading(false));
  }, [callEditorDO]);

  return {
    sections,
    isDirty,
    isLoading,
    error,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    undo,
    redo,
    canUndo,
    canRedo,
    saveDraft,
    publish,
    refresh,
  };
}

export default useEditorStateDO;
