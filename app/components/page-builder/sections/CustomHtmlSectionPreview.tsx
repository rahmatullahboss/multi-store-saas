/**
 * Custom HTML Section Preview
 * 
 * Renders user-provided HTML content as a section.
 * Supports custom CSS and container classes.
 * Handles connected button clicks (scrolls to Order Form).
 * 
 * ISOLATION: Uses CSS reset to preserve original HTML styling (dark themes, etc.)
 */

import { useEffect, useRef } from 'react';
import type { CustomHtmlProps } from '~/lib/page-builder/schemas';

interface CustomHtmlSectionPreviewProps extends CustomHtmlProps {}

// CSS Reset to isolate custom HTML from parent styles
const ISOLATION_STYLES = `
  .custom-html-isolated {
    all: revert;
    display: block;
  }
  .custom-html-isolated *,
  .custom-html-isolated *::before,
  .custom-html-isolated *::after {
    all: revert;
  }
  /* Preserve common elements */
  .custom-html-isolated img {
    max-width: 100%;
    height: auto;
  }
  .custom-html-isolated a {
    color: inherit;
    text-decoration: inherit;
  }
`;

export function CustomHtmlSectionPreview({
  title,
  htmlContent,
  cssContent,
  containerClass,
}: CustomHtmlSectionPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle connected button clicks
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const actionButton = target.closest('[data-ozzyl-action]');
      
      if (!actionButton) return;
      
      const actionType = actionButton.getAttribute('data-ozzyl-action');
      
      if (actionType === 'order' || actionType === 'cart') {
        e.preventDefault();
        // Scroll to CTA/Order form section
        const ctaSection = document.querySelector('[data-section-type="cta"]');
        if (ctaSection) {
          ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Try alternate selectors
          const orderForm = document.querySelector('.order-form, #order-form, [class*="cta"]');
          orderForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (actionType === 'whatsapp') {
        const phone = actionButton.getAttribute('data-ozzyl-phone');
        const message = actionButton.getAttribute('data-ozzyl-message') || 'হ্যালো!';
        if (phone) {
          window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
      } else if (actionType === 'call') {
        const phone = actionButton.getAttribute('data-ozzyl-phone');
        if (phone) {
          window.location.href = `tel:${phone}`;
        }
      }
    };
    
    const container = containerRef.current;
    container?.addEventListener('click', handleButtonClick);
    return () => container?.removeEventListener('click', handleButtonClick);
  }, [htmlContent]);
  
  return (
    <section 
      className={`custom-html-section ${containerClass || ''}`}
      data-section-type="custom-html"
    >
      {/* Isolation CSS to preserve user's styling */}
      <style dangerouslySetInnerHTML={{ __html: ISOLATION_STYLES }} />
      
      {/* Inject user's custom CSS if provided */}
      {cssContent && (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      )}
      
      {/* Render HTML content in isolated container */}
      <div 
        ref={containerRef}
        className="custom-html-content custom-html-isolated"
        style={{ 
          isolation: 'isolate',
          contain: 'style',
        }}
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </section>
  );
}

export default CustomHtmlSectionPreview;
