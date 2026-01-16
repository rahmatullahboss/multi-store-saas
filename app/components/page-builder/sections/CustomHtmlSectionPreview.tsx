/**
 * Custom HTML Section Preview
 * 
 * Renders user-provided HTML content in a Shadow DOM.
 * This provides COMPLETE CSS isolation - user's dark theme, fonts, colors
 * will render exactly as designed without any parent CSS interference.
 * 
 * FIXES: Handles full HTML documents (<!doctype>, <html>, <body>) by:
 * - Extracting <body> content and <style> tags
 * - Re-scoping CSS selectors (html, body, :root) to work inside Shadow DOM
 */

import { useEffect, useRef } from 'react';
import type { CustomHtmlProps } from '~/lib/page-builder/schemas';

interface CustomHtmlSectionPreviewProps extends CustomHtmlProps {}

/**
 * Process HTML to work inside Shadow DOM:
 * - Extract body content from full documents
 * - Re-scope CSS selectors for Shadow DOM
 */
function processHtmlForShadow(html: string): { styles: string; content: string } {
  // Check if it's a full HTML document
  const isFullDocument = html.includes('<body') || html.includes('<html') || html.includes('<!doctype');
  
  if (!isFullDocument) {
    // Simple HTML fragment - just wrap it
    return { styles: '', content: html };
  }
  
  // Parse the full document
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract all styles
  let styles = '';
  doc.querySelectorAll('style').forEach(style => {
    styles += style.textContent || '';
  });
  
  // Also get any inline styles from head
  doc.querySelectorAll('head link[rel="stylesheet"]').forEach(link => {
    // We'll keep external stylesheet links for later
    const href = link.getAttribute('href');
    if (href) {
      styles += `@import url("${href}");\n`;
    }
  });
  
  // Re-scope CSS selectors for Shadow DOM
  // html, body, :root -> .shadow-root-wrapper
  styles = styles
    .replace(/html\s*,\s*body/gi, '.shadow-root-wrapper')
    .replace(/html\s*{/gi, '.shadow-root-wrapper {')
    .replace(/body\s*{/gi, '.shadow-root-wrapper {')
    .replace(/:root\s*{/gi, '.shadow-root-wrapper {');
  
  // Get body content
  const bodyContent = doc.body ? doc.body.innerHTML : html;
  
  // Get body attributes (class, style, etc.)
  let bodyAttrs = '';
  if (doc.body) {
    if (doc.body.className) bodyAttrs += ` class="${doc.body.className}"`;
    if (doc.body.getAttribute('style')) bodyAttrs += ` style="${doc.body.getAttribute('style')}"`;
  }
  
  // Wrap content in a div that will receive html/body styles
  const wrappedContent = `<div class="shadow-root-wrapper"${bodyAttrs}>${bodyContent}</div>`;
  
  return { styles, content: wrappedContent };
}

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
    
    // Process HTML for Shadow DOM compatibility
    const { styles: extractedStyles, content } = processHtmlForShadow(htmlContent);
    
    // Build final HTML
    let finalHtml = '';
    
    // Add extracted styles (from full HTML document)
    if (extractedStyles) {
      finalHtml += `<style>${extractedStyles}</style>`;
    }
    
    // Add user's additional CSS
    if (cssContent) {
      finalHtml += `<style>${cssContent}</style>`;
    }
    
    // Add base reset for the wrapper
    finalHtml += `<style>
      .shadow-root-wrapper {
        display: block;
        min-height: 100%;
        width: 100%;
      }
    </style>`;
    
    // Add content
    finalHtml += content;
    
    // Render into shadow DOM
    shadow.innerHTML = finalHtml;
    
    // Handle connected button clicks
    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const actionButton = target.closest('[data-ozzyl-action]');
      
      if (!actionButton) return;
      
      const actionType = actionButton.getAttribute('data-ozzyl-action');
      
      if (actionType === 'order' || actionType === 'cart') {
        e.preventDefault();
        const ctaSection = document.querySelector('[data-section-type="cta"]');
        if (ctaSection) {
          ctaSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const orderForm = document.querySelector('.order-form, #order-form, [class*="cta"]');
          orderForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (actionType === 'whatsapp') {
        e.preventDefault(); // Prevent original href from opening
        const phone = actionButton.getAttribute('data-ozzyl-phone');
        const message = actionButton.getAttribute('data-ozzyl-message') || 'হ্যালো!';
        if (phone) {
          window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
      } else if (actionType === 'call') {
        e.preventDefault(); // Prevent original href from opening
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


