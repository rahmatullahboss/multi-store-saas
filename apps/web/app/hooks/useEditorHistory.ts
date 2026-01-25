/**
 * useEditorHistory Hook v2
 * 
 * Simple, reliable undo/redo for editor state management.
 * 
 * Key changes from v1:
 * - No debounce (immediate history tracking)
 * - Explicit pushHistory for manual control
 * - Clear separation between present state and history
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseEditorHistoryOptions {
  maxHistory?: number;
}

interface UseEditorHistoryReturn<T> {
  /** Current state value */
  state: T;
  /** Update state WITHOUT creating history entry (for live editing) */
  setState: (newState: T | ((prev: T) => T)) => void;
  /** Push current state to history (call before making important changes) */
  pushHistory: () => void;
  /** Undo last change */
  undo: () => void;
  /** Redo previously undone change */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Reset history with new state */
  reset: (state: T) => void;
}

export function useEditorHistory<T>(
  initialState: T,
  options: UseEditorHistoryOptions = {}
): UseEditorHistoryReturn<T> {
  const { maxHistory = 30 } = options;

  // Use ref to capture initial state only once
  const initialStateRef = useRef<T>(initialState);
  const hasInitializedRef = useRef(false);

  // Current state
  const [present, setPresent] = useState<T>(() => initialStateRef.current);
  
  // History stacks
  const [past, setPast] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);

  // Track if we've already pushed current state to history
  const hasPushedRef = useRef(false);

  // Sync with server data on initial load and after fetcher updates
  // but only if we haven't made any local changes yet
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      return;
    }
    
    // If there's no history, sync with new initialState from server
    // This handles newly added sections, etc.
    if (past.length === 0 && future.length === 0) {
      setPresent(initialState);
      initialStateRef.current = initialState;
    }
  }, [initialState, past.length, future.length]);

  // Push current state to history (call BEFORE making a change)
  const pushHistory = useCallback(() => {
    if (hasPushedRef.current) return; // Avoid duplicate pushes
    
    setPast(prev => {
      const newPast = [...prev, present];
      // Limit history size
      return newPast.slice(-maxHistory);
    });
    setFuture([]); // Clear redo stack on new action
    hasPushedRef.current = true;
  }, [present, maxHistory]);

  // Update state (no history entry - use pushHistory first for undo support)
  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      hasPushedRef.current = false; // Reset push flag for next change
      setPresent(prev => 
        typeof newState === 'function' 
          ? (newState as (prev: T) => T)(prev) 
          : newState
      );
    },
    []
  );

  // Undo
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);
    setFuture(prev => [present, ...prev]);
    setPresent(previous);
    hasPushedRef.current = false;
  }, [past, present]);

  // Redo
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setPast(prev => [...prev, present]);
    setFuture(newFuture);
    setPresent(next);
    hasPushedRef.current = false;
  }, [future, present]);

  // Reset
  const reset = useCallback((state: T) => {
    setPresent(state);
    setPast([]);
    setFuture([]);
    hasPushedRef.current = false;
    initialStateRef.current = state;
  }, []);

  return {
    state: present,
    setState,
    pushHistory,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    reset,
  };
}

/**
 * Hook to add keyboard shortcuts for undo/redo
 */
export function useEditorKeyboardShortcuts(
  undo: () => void,
  redo: () => void,
  canUndo: boolean,
  canRedo: boolean
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Z (undo) or Ctrl/Cmd + Shift + Z (redo)
      const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo
          if (canRedo) redo();
        } else {
          // Undo
          if (canUndo) undo();
        }
      }

      // Also support Ctrl/Cmd + Y for redo (Windows style)
      if (modifier && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);
}

export default useEditorHistory;
