/**
 * Custom HTML Section Preview
 * 
 * Renders user-provided HTML content as a section.
 * Supports custom CSS and container classes.
 */

import type { CustomHtmlProps } from '~/lib/page-builder/schemas';

interface CustomHtmlSectionPreviewProps extends CustomHtmlProps {}

export function CustomHtmlSectionPreview({
  title,
  htmlContent,
  cssContent,
  containerClass,
}: CustomHtmlSectionPreviewProps) {
  return (
    <section className={`custom-html-section ${containerClass || ''}`}>
      {/* Inject custom CSS if provided */}
      {cssContent && (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      )}
      
      {/* Render the HTML content */}
      <div 
        className="custom-html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </section>
  );
}

export default CustomHtmlSectionPreview;
