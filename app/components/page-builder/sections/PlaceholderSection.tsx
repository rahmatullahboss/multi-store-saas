/**
 * Placeholder Section Preview
 * 
 * Used for section types that don't have a preview component yet.
 */

import { Box } from 'lucide-react';
import { getSectionMeta } from '~/lib/page-builder/registry';

interface PlaceholderSectionProps {
  type: string;
}

export function PlaceholderSection({ type }: PlaceholderSectionProps) {
  const meta = getSectionMeta(type);
  
  return (
    <section className="py-12 px-6 bg-gray-100 border-2 border-dashed border-gray-300">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-3">
          <Box size={24} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          {meta?.name || type}
        </h3>
        <p className="text-sm text-gray-500">
          {meta?.description || 'Section preview coming soon...'}
        </p>
      </div>
    </section>
  );
}
