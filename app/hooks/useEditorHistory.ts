/**
 * useEditorHistory Hook
 * 
 * Provides undo/redo functionality for editor state management.
 * Features:
 * - Generic state history tracking
 * - Configurable max history (default: 20)
 * - Debounced state snapshots to avoid flooding history
 * - canUndo/canRedo boolean flags
 * - Keyboard shortcuts support (Ctrl+Z, Ctrl+Shift+Z)
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UseEditorHistoryOptions {
  maxHistory?: number;
  debounceMs?: number;
}

interface UseEditorHistoryReturn<T> {
  /** Current state value */
  state: T;
  /** Update state (creates new history entry after debounce) */
  setState: (newState: T | ((prev: T) => T)) => void;
  /** Undo last change */
  undo: () => void;
  /** Redo previously undone change */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Reset history with new initial state */
  reset: (state: T) => void;
  /** Force save current state to history (bypasses debounce) */
  saveCheckpoint: () => void;
}

export function useEditorHistory<T>(
  initialState: T,
  options: UseEditorHistoryOptions = {}
): UseEditorHistoryReturn<T> {
  const { maxHistory = 20, debounceMs = 500 } = options;

  // Use ref to capture initial state only once (prevents reset on re-render)
  const initialStateRef = useRef<T>(initialState);
  const isInitializedRef = useRef(false);

  const [history, setHistory] = useState<HistoryState<T>>(() => ({
    past: [],
    present: initialStateRef.current,
    future: [],
  }));

  // Track pending state for debouncing
  const pendingStateRef = useRef<T | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Commit pending state to history
  const commitPendingState = useCallback(() => {
    if (pendingStateRef.current !== null) {
      const newState = pendingStateRef.current;
      pendingStateRef.current = null;

      setHistory((prev) => {
        // Don't add duplicate states
        if (JSON.stringify(prev.present) === JSON.stringify(newState)) {
          return prev;
        }

        const newPast = [...prev.past, prev.present].slice(-maxHistory);
        return {
          past: newPast,
          present: newState,
          future: [], // Clear future on new change
        };
      });
    }
  }, [maxHistory]);

  // Set state with debouncing
  const setState = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((prev) => {
        const resolvedState =
          typeof newState === 'function'
            ? (newState as (prev: T) => T)(prev.present)
            : newState;

        // Update pending state
        pendingStateRef.current = resolvedState;

        // Clear existing timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set new timer to commit state
        debounceTimerRef.current = setTimeout(() => {
          commitPendingState();
        }, debounceMs);

        // Immediately update present for responsive UI
        return {
          ...prev,
          present: resolvedState,
        };
      });
    },
    [debounceMs, commitPendingState]
  );

  // Undo
  const undo = useCallback(() => {
    // Commit any pending state first
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    commitPendingState();

    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, [commitPendingState]);

  // Redo
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Reset history
  const reset = useCallback((state: T) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    pendingStateRef.current = null;
    setHistory({
      past: [],
      present: state,
      future: [],
    });
  }, []);

  // Save checkpoint (bypass debounce)
  const saveCheckpoint = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    commitPendingState();
  }, [commitPendingState]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
    saveCheckpoint,
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
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
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
