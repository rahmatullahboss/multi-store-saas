/**
 * Lazy-loaded Rich Text Editor
 * 
 * This wrapper uses React.lazy to ensure TipTap (~370KB) is only loaded
 * when the editor is actually needed. This prevents the TipTap bundle
 * from being included in routes that don't use the editor.
 * 
 * Usage:
 * import { LazyRichTextEditor } from '~/components/RichTextEditor.lazy';
 * 
 * <Suspense fallback={<EditorSkeleton />}>
 *   <LazyRichTextEditor content={content} onChange={setContent} />
 * </Suspense>
 */

import { lazy, Suspense } from 'react';

// Lazy load the actual RichTextEditor component
const RichTextEditorImpl = lazy(() => 
  import('./RichTextEditor').then(module => ({ default: module.RichTextEditor }))
);

interface LazyRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// Skeleton loader for the editor
function EditorSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm animate-pulse">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-100 bg-gray-50/50">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
      {/* Content skeleton */}
      <div className="p-4 min-h-[150px] space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
      </div>
      {/* Footer skeleton */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30">
        <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
      </div>
    </div>
  );
}

// Exported lazy-loaded component with built-in fallback
export function LazyRichTextEditor(props: LazyRichTextEditorProps) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <RichTextEditorImpl {...props} />
    </Suspense>
  );
}

// Export skeleton for external use
export { EditorSkeleton };
