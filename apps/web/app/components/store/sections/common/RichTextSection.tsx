/**
 * Rich Text Section
 * 
 * Generic rich text content section.
 */

import type { RenderContext } from '~/lib/template-resolver.server';
import { sanitizeHtml } from "~/utils/sanitize";

interface RichTextSectionProps {
  sectionId: string;
  props: {
    heading?: string;
    text?: string;
    alignment?: 'left' | 'center' | 'right';
  };
  context: RenderContext;
}

export default function RichTextSection({ sectionId, props, context }: RichTextSectionProps) {
  const {
    heading = '',
    text = '',
    alignment = 'center',
  } = props;

  const themeColors = context.theme;

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto',
  };

  if (!heading && !text) return null;

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className={`max-w-3xl ${alignmentClasses[alignment]}`}>
        {heading && (
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ 
              color: themeColors.textColor,
              fontFamily: themeColors.headingFont,
            }}
          >
            {heading}
          </h2>
        )}
        
        {text && (
          <div 
            className="prose max-w-none"
            style={{ color: themeColors.textColor }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
          />
        )}
      </div>
    </section>
  );
}
