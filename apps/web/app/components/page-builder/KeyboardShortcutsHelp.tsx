/**
 * Keyboard Shortcuts Help Component
 *
 * Displays available keyboard shortcuts for the page builder.
 * Can be used in a tooltip, popover, or modal.
 */

import type { ShortcutInfo } from '~/hooks/useBuilderKeyboardShortcuts';
import { Keyboard } from 'lucide-react';

// Default shortcuts for when none are provided
const DEFAULT_SHORTCUTS: ShortcutInfo[] = [
  { keys: 'Ctrl+Z', description: 'আনডু' },
  { keys: 'Ctrl+Y', description: 'রিডু' },
  { keys: 'Ctrl+S', description: 'সংরক্ষণ' },
  { keys: 'Ctrl+D', description: 'ডুপ্লিকেট' },
  { keys: 'Delete', description: 'মুছে ফেলুন' },
  { keys: 'Escape', description: 'নির্বাচন বাতিল' },
  { keys: '↑↓', description: 'নেভিগেশন' },
];

interface KeyboardShortcutsHelpProps {
  shortcuts?: ShortcutInfo[];
  className?: string;
}

export function KeyboardShortcutsHelp({
  shortcuts = DEFAULT_SHORTCUTS,
  className = '',
}: KeyboardShortcutsHelpProps) {
  return (
    <div
      className={`p-3 bg-gray-900 text-white rounded-lg shadow-xl text-xs space-y-1.5 ${className}`}
    >
      <div className="flex items-center gap-2 font-bold text-gray-300 mb-2 pb-2 border-b border-gray-700">
        <Keyboard size={14} />
        <span>কীবোর্ড শর্টকাট</span>
      </div>
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-gray-400">{shortcut.description}</span>
          <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-mono text-[10px]">
            {shortcut.keys}
          </kbd>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact keyboard shortcut button with tooltip
 */
interface KeyboardShortcutsButtonProps {
  shortcuts?: ShortcutInfo[];
}

export function KeyboardShortcutsButton({ shortcuts }: KeyboardShortcutsButtonProps) {
  return (
    <div className="relative group">
      <button
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="কীবোর্ড শর্টকাট দেখুন"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard size={16} />
      </button>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <KeyboardShortcutsHelp shortcuts={shortcuts} />
        {/* Arrow */}
        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45" />
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
