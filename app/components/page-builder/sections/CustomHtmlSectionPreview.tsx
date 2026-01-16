/**
 * Custom HTML Section Preview
 * 
 * Renders user-provided HTML content in a Shadow DOM.
 * This provides COMPLETE CSS isolation - user's dark theme, fonts, colors
 * will render exactly as designed without any parent CSS interference.
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
  const shadowRef = useRef<ShadowRoot | null>(null);
  
  // Create Shadow DOM and render HTML
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create shadow root if not exists
    if (!shadowRef.current) {
      shadowRef.current = containerRef.current.attachShadow({ mode: 'open' });
    }
    
    const shadow = shadowRef.current;
    
    // Build full HTML with styles
    let fullHtml = '';
    
    // Add user's CSS
    if (cssContent) {
      fullHtml += `<style>${cssContent}</style>`;
    }
    
    // Add the HTML content
    fullHtml += htmlContent;
    
    // Render into shadow DOM
    shadow.innerHTML = fullHtml;
    
    // Handle connected button clicks
    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const actionButton = target.closest('[data-ozzyl-action]');
      
      if (!actionButton) return;
      
      const actionType = actionButton.getAttribute('data-ozzyl-action');
      
      if (actionType === 'order' || actionType === 'cart') {
        e.preventDefault();
        // Scroll to CTA/Order form section (outside shadow DOM)
        const ctaSection = document.querySelector('[data-section-type="cta"]');
        if (ctaSection) {
          ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
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
    
    shadow.addEventListener('click', handleButtonClick);
    
    return () => {
      shadow.removeEventListener('click', handleButtonClick);
    };
  }, [htmlContent, cssContent]);
  
  return (
    <section 
      className={`custom-html-section ${containerClass || ''}`}
      data-section-type="custom-html"
    >
      {/* Shadow DOM container - CSS is completely isolated */}
      <div 
        ref={containerRef}
        className="custom-html-shadow-host"
        style={{ 
          display: 'block',
          width: '100%',
        }}
      />
    </section>
  );
}

export default CustomHtmlSectionPreview;

