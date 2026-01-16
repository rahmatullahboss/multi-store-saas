/**
 * Custom HTML Section Preview
 * 
 * Renders user-provided HTML content as a section.
 * Supports custom CSS and container classes.
 * Handles connected button clicks (scrolls to Order Form).
 */

import { useEffect, useRef } from 'react';
import type { CustomHtmlProps } from '~/lib/page-builder/schemas';

interface CustomHtmlSectionPreviewProps extends CustomHtmlProps {}

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
      {/* Inject custom CSS if provided */}
      {cssContent && (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      )}
      
      {/* Render the HTML content */}
      <div 
        ref={containerRef}
        className="custom-html-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </section>
  );
}

export default CustomHtmlSectionPreview;

