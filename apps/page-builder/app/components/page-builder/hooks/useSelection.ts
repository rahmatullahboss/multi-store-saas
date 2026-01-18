/**
 * useSelection Hook
 * 
 * Tracks GrapeJS component selection and builds
 * context for AI.
 */

import { useState, useEffect, useCallback } from 'react';
import { ContextBuilder } from '~/lib/grapesjs/services';
import type { SelectedComponent, SelectionContext } from '~/lib/grapesjs/types';

interface UseSelectionReturn {
  selectedComponent: SelectedComponent | null;
  context: SelectionContext | null;
  hasSelection: boolean;
  refreshContext: () => void;
}

export function useSelection(editor: any): UseSelectionReturn {
  const [selectedComponent, setSelectedComponent] = useState<SelectedComponent | null>(null);
  const [context, setContext] = useState<SelectionContext | null>(null);

  const handleSelectionChange = useCallback(() => {
    if (!editor) return;
    
    const selected = editor.getSelected();
    
    if (!selected) {
      setSelectedComponent(null);
      setContext(null);
      return;
    }

    try {
      const contextBuilder = new ContextBuilder(editor);
      const builtContext = contextBuilder.buildContext(selected);
      setSelectedComponent(builtContext.selectedComponent);
      setContext(builtContext);
    } catch (error) {
      console.error('Error building context:', error);
      setSelectedComponent(null);
      setContext(null);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Listen to selection changes
    editor.on('component:selected', handleSelectionChange);
    editor.on('component:deselected', () => {
      setSelectedComponent(null);
      setContext(null);
    });

    // Listen to component updates for real-time context updates
    editor.on('component:update', (component: any) => {
      const selected = editor.getSelected();
      if (selected && selected.getId() === component.getId()) {
        handleSelectionChange();
      }
    });

    return () => {
      editor.off('component:selected', handleSelectionChange);
      editor.off('component:deselected');
      editor.off('component:update');
    };
  }, [editor, handleSelectionChange]);

  // Method to manually refresh context
  const refreshContext = useCallback(() => {
    handleSelectionChange();
  }, [handleSelectionChange]);

  return {
    selectedComponent,
    context,
    refreshContext,
    hasSelection: selectedComponent !== null,
  };
}
