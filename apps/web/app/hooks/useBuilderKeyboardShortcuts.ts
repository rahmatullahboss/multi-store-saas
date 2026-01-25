/**
 * useBuilderKeyboardShortcuts Hook
 *
 * Comprehensive keyboard shortcuts for Page Builder based on Context7 best practices.
 * Follows industry standards from Builder.io, ReactPage, and Figma.
 *
 * Shortcuts:
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Shift + Z / Ctrl/Cmd + Y: Redo
 * - Delete/Backspace: Delete selected section
 * - Ctrl/Cmd + D: Duplicate selected section
 * - Ctrl/Cmd + S: Save
 * - Escape: Deselect
 * - Arrow Up/Down: Navigate sections
 */

import { useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface KeyboardShortcutsConfig {
  // History
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;

  // Section operations
  onDeleteSection?: () => void;
  onDuplicateSection?: () => void;
  onDeselectSection?: () => void;
  onSelectPrevSection?: () => void;
  onSelectNextSection?: () => void;

  // Save
  onSave?: () => Promise<void>;

  // Selected section state
  hasSelectedSection?: boolean;
  selectedSectionName?: string;

  // Enable/disable shortcuts
  enabled?: boolean;

  // Enable/disable toast notifications
  showToasts?: boolean;
}

export interface ShortcutInfo {
  keys: string;
  description: string;
}

export function useBuilderKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const {
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onDeleteSection,
    onDuplicateSection,
    onDeselectSection,
    onSelectPrevSection,
    onSelectNextSection,
    onSave,
    hasSelectedSection = false,
    selectedSectionName,
    enabled = true,
    showToasts = true,
  } = config;

  // Track if save is in progress to prevent double saves
  const isSavingRef = useRef(false);

  // Detect Mac vs Windows/Linux
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('[contenteditable="true"]');

      // Check modifier keys
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      // === UNDO: Ctrl/Cmd + Z ===
      if (modifier && !e.shiftKey && key === 'z' && !isEditing) {
        e.preventDefault();
        if (canUndo && onUndo) {
          onUndo();
          announceToScreenReader('আনডু করা হয়েছে');
          if (showToasts) {
            toast.success('আনডু করা হয়েছে', { icon: '↩️', duration: 2000 });
          }
        }
        return;
      }

      // === REDO: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y ===
      if ((modifier && e.shiftKey && key === 'z') || (modifier && key === 'y')) {
        if (isEditing) return;
        e.preventDefault();
        if (canRedo && onRedo) {
          onRedo();
          announceToScreenReader('রিডু করা হয়েছে');
          if (showToasts) {
            toast.success('রিডু করা হয়েছে', { icon: '↪️', duration: 2000 });
          }
        }
        return;
      }

      // === SAVE: Ctrl/Cmd + S ===
      if (modifier && key === 's') {
        e.preventDefault();
        if (onSave && !isSavingRef.current) {
          isSavingRef.current = true;
          if (showToasts) {
            toast.loading('সংরক্ষণ হচ্ছে...', { id: 'save-toast' });
          }
          onSave()
            .then(() => {
              announceToScreenReader('সংরক্ষিত হয়েছে');
              if (showToasts) {
                toast.success('সংরক্ষিত হয়েছে', { id: 'save-toast', icon: '💾', duration: 2000 });
              }
            })
            .catch((err) => {
              console.error('Save error:', err);
              if (showToasts) {
                toast.error('সংরক্ষণ করতে সমস্যা হয়েছে', { id: 'save-toast' });
              }
            })
            .finally(() => {
              isSavingRef.current = false;
            });
        }
        return;
      }

      // === DUPLICATE: Ctrl/Cmd + D ===
      if (modifier && key === 'd' && !isEditing) {
        e.preventDefault();
        if (hasSelectedSection && onDuplicateSection) {
          onDuplicateSection();
          announceToScreenReader('সেকশন ডুপ্লিকেট করা হয়েছে');
          if (showToasts) {
            toast.success('সেকশন ডুপ্লিকেট করা হয়েছে', {
              description: selectedSectionName,
              icon: '📑',
              duration: 2500,
            });
          }
        }
        return;
      }

      // === DELETE: Delete or Backspace (when not editing) ===
      if ((key === 'delete' || key === 'backspace') && !isEditing) {
        if (hasSelectedSection && onDeleteSection) {
          e.preventDefault();
          onDeleteSection();
          announceToScreenReader('সেকশন মুছে ফেলা হয়েছে');
          if (showToasts) {
            toast.success('সেকশন মুছে ফেলা হয়েছে', {
              description: selectedSectionName,
              icon: '🗑️',
              duration: 2500,
            });
          }
        }
        return;
      }

      // === ESCAPE: Deselect ===
      if (key === 'escape') {
        if (onDeselectSection) {
          onDeselectSection();
          announceToScreenReader('নির্বাচন বাতিল করা হয়েছে');
        }
        return;
      }

      // === Arrow Navigation (when not editing) ===
      if (!isEditing && hasSelectedSection) {
        if (key === 'arrowup' && onSelectPrevSection) {
          e.preventDefault();
          onSelectPrevSection();
          return;
        }
        if (key === 'arrowdown' && onSelectNextSection) {
          e.preventDefault();
          onSelectNextSection();
          return;
        }
      }
    },
    [
      enabled,
      isMac,
      canUndo,
      canRedo,
      onUndo,
      onRedo,
      onSave,
      onDuplicateSection,
      onDeleteSection,
      onDeselectSection,
      onSelectPrevSection,
      onSelectNextSection,
      hasSelectedSection,
      selectedSectionName,
      showToasts,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  // Return shortcuts list for help UI
  const shortcuts: ShortcutInfo[] = [
    { keys: isMac ? '⌘Z' : 'Ctrl+Z', description: 'আনডু' },
    { keys: isMac ? '⌘⇧Z' : 'Ctrl+Y', description: 'রিডু' },
    { keys: isMac ? '⌘S' : 'Ctrl+S', description: 'সংরক্ষণ' },
    { keys: isMac ? '⌘D' : 'Ctrl+D', description: 'ডুপ্লিকেট' },
    { keys: isMac ? '⌘C' : 'Ctrl+C', description: 'কপি' },
    { keys: isMac ? '⌘V' : 'Ctrl+V', description: 'পেস্ট' },
    { keys: 'Delete', description: 'মুছে ফেলুন' },
    { keys: 'Escape', description: 'নির্বাচন বাতিল' },
    { keys: '↑↓', description: 'নেভিগেশন' },
  ];

  return { shortcuts, isMac };
}

/**
 * Screen reader announcement utility
 * Creates a live region for accessibility announcements
 */
function announceToScreenReader(message: string) {
  // Create or get the live region
  let liveRegion = document.getElementById('builder-announcer');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'builder-announcer';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(liveRegion);
  }

  // Update the message
  liveRegion.textContent = message;

  // Clear after a short delay
  setTimeout(() => {
    if (liveRegion) liveRegion.textContent = '';
  }, 1000);
}

export default useBuilderKeyboardShortcuts;
