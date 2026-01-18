/**
 * Context Display Component
 * 
 * Shows the currently selected element's information
 * in the AI sidebar.
 */

import { memo } from 'react';
import { MousePointer2, Type, Image, Link, Box, Square, Heading } from 'lucide-react';
import type { SelectedComponent, ComponentType } from '~/lib/grapesjs/types';

interface ContextDisplayProps {
  selectedComponent: SelectedComponent | null;
}

// Icon map for component types
const TYPE_ICONS: Record<ComponentType, typeof Box> = {
  text: Type,
  heading: Heading,
  button: Square,
  image: Image,
  video: Box,
  link: Link,
  section: Box,
  container: Box,
  row: Box,
  column: Box,
  form: Box,
  input: Box,
  wrapper: Box,
  custom: Box,
};

// Label map (Bengali)
const TYPE_LABELS: Record<ComponentType, string> = {
  text: 'টেক্সট',
  heading: 'শিরোনাম',
  button: 'বাটন',
  image: 'ছবি',
  video: 'ভিডিও',
  link: 'লিংক',
  section: 'সেকশন',
  container: 'কন্টেইনার',
  row: 'রো',
  column: 'কলাম',
  form: 'ফর্ম',
  input: 'ইনপুট',
  wrapper: 'র‍্যাপার',
  custom: 'কাস্টম',
};

function ContextDisplayComponent({ selectedComponent }: ContextDisplayProps) {
  if (!selectedComponent) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500">
          <MousePointer2 className="w-4 h-4" />
          <span className="text-sm">একটি element সিলেক্ট করুন</span>
        </div>
      </div>
    );
  }

  const Icon = TYPE_ICONS[selectedComponent.type] || Box;
  const label = TYPE_LABELS[selectedComponent.type] || selectedComponent.type;

  return (
    <div className="p-3 bg-gradient-to-r from-violet-50 to-emerald-50 rounded-lg border border-violet-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded bg-violet-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <span className="font-medium text-violet-800">{label}</span>
        <span className="text-xs text-gray-400 ml-auto">{selectedComponent.tagName}</span>
      </div>

      {/* Content preview */}
      {selectedComponent.content && (
        <div className="text-xs text-gray-600 mb-2 truncate">
          <span className="text-gray-400">Content: </span>
          "{selectedComponent.content.slice(0, 40)}
          {selectedComponent.content.length > 40 ? '...' : ''}"
        </div>
      )}

      {/* Style preview */}
      <div className="flex flex-wrap gap-1">
        {selectedComponent.styles['background-color'] && (
          <div className="flex items-center gap-1 text-xs bg-white rounded px-1.5 py-0.5 border">
            <div 
              className="w-3 h-3 rounded border"
              style={{ backgroundColor: selectedComponent.styles['background-color'] }}
            />
            <span className="text-gray-500">BG</span>
          </div>
        )}
        {selectedComponent.styles['color'] && (
          <div className="flex items-center gap-1 text-xs bg-white rounded px-1.5 py-0.5 border">
            <div 
              className="w-3 h-3 rounded border"
              style={{ backgroundColor: selectedComponent.styles['color'] }}
            />
            <span className="text-gray-500">Color</span>
          </div>
        )}
        {selectedComponent.styles['font-size'] && (
          <div className="text-xs bg-white rounded px-1.5 py-0.5 border text-gray-600">
            {selectedComponent.styles['font-size']}
          </div>
        )}
        {selectedComponent.classes.length > 0 && (
          <div className="text-xs bg-white rounded px-1.5 py-0.5 border text-gray-600">
            .{selectedComponent.classes[0]}
            {selectedComponent.classes.length > 1 && `+${selectedComponent.classes.length - 1}`}
          </div>
        )}
      </div>
    </div>
  );
}

export const ContextDisplay = memo(ContextDisplayComponent);
