/**
 * useBuilderClipboard Hook
 *
 * Provides copy/paste functionality for page builder sections.
 * Uses localStorage for clipboard persistence across tabs.
 *
 * Features:
 * - Copy section with Ctrl+C
 * - Paste section with Ctrl+V
 * - Cross-tab clipboard support
 * - Toast notifications for feedback
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

const CLIPBOARD_KEY = 'ozzyl-builder-clipboard';

interface ClipboardData {
  type: 'section';
  section: {
    type: string;
    props: Record<string, unknown>;
  };
  copiedAt: number;
}

interface UseBuilderClipboardConfig {
  /** Currently selected section */
  selectedSection: BuilderSection | null;
  /** Callback to add a new section with specific props */
  onPasteSection?: (type: string, props: Record<string, unknown>) => void;
  /** Whether clipboard operations are enabled */
  enabled?: boolean;
}

export function useBuilderClipboard({
  selectedSection,
  onPasteSection,
  enabled = true,
}: UseBuilderClipboardConfig) {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);

  // Load clipboard from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CLIPBOARD_KEY);
      if (stored) {
        const data = JSON.parse(stored) as ClipboardData;
        // Only use if copied within last 24 hours
        if (Date.now() - data.copiedAt < 24 * 60 * 60 * 1000) {
          setClipboardData(data);
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  // Copy section to clipboard
  const copySection = useCallback(() => {
    if (!selectedSection) {
      toast.error('কোন সেকশন সিলেক্ট করা হয়নি', {
        description: 'কপি করতে প্রথমে একটি সেকশন সিলেক্ট করুন',
      });
      return false;
    }

    const data: ClipboardData = {
      type: 'section',
      section: {
        type: selectedSection.type,
        props: selectedSection.props as Record<string, unknown>,
      },
      copiedAt: Date.now(),
    };

    try {
      localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data));
      setClipboardData(data);

      const meta = getSectionMeta(selectedSection.type);
      toast.success('সেকশন কপি করা হয়েছে', {
        description: meta?.name || selectedSection.type,
        icon: '📋',
      });
      return true;
    } catch {
      toast.error('কপি করতে সমস্যা হয়েছে');
      return false;
    }
  }, [selectedSection]);

  // Paste section from clipboard
  const pasteSection = useCallback(() => {
    if (!clipboardData) {
      toast.error('ক্লিপবোর্ড খালি', {
        description: 'প্রথমে একটি সেকশন কপি করুন (Ctrl+C)',
      });
      return false;
    }

    if (!onPasteSection) {
      toast.error('পেস্ট করা যাচ্ছে না');
      return false;
    }

    try {
      onPasteSection(clipboardData.section.type, clipboardData.section.props);

      const meta = getSectionMeta(clipboardData.section.type);
      toast.success('সেকশন পেস্ট করা হয়েছে', {
        description: meta?.name || clipboardData.section.type,
        icon: '📄',
      });
      return true;
    } catch {
      toast.error('পেস্ট করতে সমস্যা হয়েছে');
      return false;
    }
  }, [clipboardData, onPasteSection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger in inputs
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (isEditing) return;

      const modifier = e.metaKey || e.ctrlKey;

      // Copy: Ctrl+C
      if (modifier && e.key.toLowerCase() === 'c' && selectedSection) {
        e.preventDefault();
        copySection();
      }

      // Paste: Ctrl+V
      if (modifier && e.key.toLowerCase() === 'v' && clipboardData) {
        e.preventDefault();
        pasteSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, selectedSection, clipboardData, copySection, pasteSection]);

  return {
    copySection,
    pasteSection,
    hasClipboardData: !!clipboardData,
    clipboardSectionType: clipboardData?.section.type || null,
  };
}

export default useBuilderClipboard;
