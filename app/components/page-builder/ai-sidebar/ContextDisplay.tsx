/**
 * Context Display Component
 * 
 * Shows information about the currently selected element
 * in a compact, easy-to-read format.
 */

import { type ComponentType, type SelectedComponent } from '~/lib/grapesjs/types';

interface ContextDisplayProps {
  selectedComponent: SelectedComponent | null;
  className?: string;
}

const TYPE_ICONS: Record<ComponentType, string> = {
  button: '🔘',
  text: '📝',
  heading: '🔤',
  image: '🖼️',
  video: '🎬',
  link: '🔗',
  section: '📦',
  container: '📦',
  row: '➡️',
  column: '⬇️',
  form: '📋',
  input: '✏️',
  wrapper: '📄',
  custom: '⚙️',
};

const TYPE_LABELS: Record<ComponentType, string> = {
  button: 'Button',
  text: 'Text',
  heading: 'Heading',
  image: 'Image',
  video: 'Video',
  link: 'Link',
  section: 'Section',
  container: 'Container',
  row: 'Row',
  column: 'Column',
  form: 'Form',
  input: 'Input',
  wrapper: 'Wrapper',
  custom: 'Custom',
};

const EDITABLE_HINTS: Record<ComponentType, string> = {
  button: 'Text, Color, Size, Border',
  text: 'Content, Font, Color, Size',
  heading: 'Content, Font, Color, Size',
  image: 'Source, Size, Border, Shadow',
  video: 'Source, Size, Border',
  link: 'Text, URL, Color',
  section: 'Background, Padding, Margin',
  container: 'Background, Padding, Layout',
  row: 'Layout, Gap, Alignment',
  column: 'Background, Padding',
  form: 'Layout, Styling',
  input: 'Placeholder, Border, Style',
  wrapper: 'Background, Padding',
  custom: 'Styles, Content',
};

export default function ContextDisplay({ selectedComponent, className = '' }: ContextDisplayProps) {
  if (!selectedComponent) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="w-6 h-6 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs">
            ?
          </span>
          <span>কিছু সিলেক্ট করা হয়নি</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Canvas থেকে একটি element সিলেক্ট করুন
        </p>
      </div>
    );
  }

  const icon = TYPE_ICONS[selectedComponent.type] || '📦';
  const label = TYPE_LABELS[selectedComponent.type] || selectedComponent.type;
  const hint = EDITABLE_HINTS[selectedComponent.type] || 'Styles, Content';

  return (
    <div className={`p-4 ${className}`}>
      {/* Selected Element Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Selected:</span>
        <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
          <span>{icon}</span>
          <span>{label}</span>
        </div>
      </div>

      {/* Element Preview */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
        {/* Content Preview */}
        {selectedComponent.content && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 text-[10px] shrink-0 font-medium">Content:</span>
            <span className="text-gray-700 text-xs truncate font-medium">
              "{selectedComponent.content.slice(0, 40)}
              {selectedComponent.content.length > 40 ? '...' : ''}"
            </span>
          </div>
        )}

        {/* Key Styles */}
        <div className="flex flex-wrap gap-1.5">
          {selectedComponent.styles['background-color'] && (
            <StyleBadge 
              label="BG" 
              value={selectedComponent.styles['background-color']} 
              isColor 
            />
          )}
          {selectedComponent.styles['color'] && (
            <StyleBadge 
              label="Color" 
              value={selectedComponent.styles['color']} 
              isColor 
            />
          )}
          {selectedComponent.styles['font-size'] && (
            <StyleBadge 
              label="Size" 
              value={selectedComponent.styles['font-size']} 
            />
          )}
          {selectedComponent.styles['padding'] && (
            <StyleBadge 
              label="Pad" 
              value={selectedComponent.styles['padding']} 
            />
          )}
        </div>

        {/* Element ID */}
        <div className="text-[9px] text-gray-400 font-mono truncate">
          ID: {selectedComponent.id}
        </div>
      </div>

      {/* Editable Hint */}
      <div className="mt-3 text-[11px] text-gray-500">
        ✏️ Edit: <span className="text-gray-600 font-medium">{hint}</span>
      </div>
    </div>
  );
}

function StyleBadge({ label, value, isColor }: { label: string; value: string; isColor?: boolean }) {
  return (
    <div className="flex items-center gap-1 bg-white rounded px-2 py-0.5 border border-gray-200">
      <span className="text-gray-400 text-[9px] font-medium">{label}:</span>
      {isColor ? (
        <div 
          className="w-3 h-3 rounded-sm border border-gray-300"
          style={{ backgroundColor: value }}
          title={value}
        />
      ) : (
        <span className="text-gray-600 text-[9px] font-medium">{value}</span>
      )}
    </div>
  );
}
