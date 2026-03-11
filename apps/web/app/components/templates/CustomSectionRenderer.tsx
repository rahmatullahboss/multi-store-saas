/**
 * Custom Section Renderer
 * 
 * Renders custom HTML sections at specified positions.
 * Used by templates to display user-defined HTML/CSS content.
 */

import { memo } from 'react';
import { sanitizeHtml } from "~/utils/sanitize";

export interface CustomSection {
  id: string;
  name: string;
  html: string;
  css?: string;
  position?: string;
}

interface CustomSectionRendererProps {
  customSections: CustomSection[];
  position: string;
}

/**
 * Renders all custom sections that match the specified position
 */
export function CustomSectionRenderer({ customSections, position }: CustomSectionRendererProps) {
  const matchingSections = customSections?.filter(
    (section) => section.position === position && section.html
  ) || [];

  if (matchingSections.length === 0) return null;

  return (
    <>
      {matchingSections.map((section) => (
        <div 
          key={section.id}
          className="custom-html-section"
          style={{
            display: 'block',
            isolation: 'isolate',
          }}
        >
          {/* Render CSS in style tag */}
          {section.css && (
            <style dangerouslySetInnerHTML={{ __html: section.css }} />
          )}
          {/* Render HTML content */}
          <div 
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.html) }}
          />
        </div>
      ))}
    </>
  );
}

// Memoized version for performance
export const MemoizedCustomSectionRenderer = memo(CustomSectionRenderer);

/**
 * Get custom sections for a specific position
 */
export function getCustomSectionsForPosition(
  customSections: CustomSection[] | undefined,
  position: string
): CustomSection[] {
  return customSections?.filter(
    (section) => section.position === position && section.html
  ) || [];
}
