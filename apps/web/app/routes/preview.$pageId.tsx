/**
 * GrapesJS Page Builder - Preview Route
 * 
 * Renders the HTML/CSS content saved by GrapesJS editor.
 * This route loads from the landing_pages table where GrapesJS stores its data.
 * 
 * This is a resource route that returns a complete HTML document,
 * bypassing the Remix root layout.
 */

import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { requireAuth } from '~/lib/auth.server';

// ============================================================================
// TYPES
// ============================================================================
interface LandingPage {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  htmlContent: string | null;
  cssContent: string | null;
  pageConfig: string | null;
  isPublished: number;
}

interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  fontHeading?: string;
  fontBody?: string;
}

// ============================================================================
// LOADER - Returns complete HTML document
// ============================================================================
export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const { pageId } = params;

  if (!pageId) {
    return new Response('Missing page ID', { status: 400 });
  }

  // Auth check - preview is only for logged-in users editing their pages
  const auth = await requireAuth(request, context);

  const db = context.cloudflare.env.DB;

  // Fetch the landing page with HTML/CSS content
  const page = await db.prepare(
    `SELECT 
      id, 
      store_id as storeId, 
      name, 
      slug, 
      html_content as htmlContent, 
      css_content as cssContent, 
      page_config as pageConfig,
      is_published as isPublished
    FROM landing_pages 
    WHERE id = ? AND store_id = ? 
    LIMIT 1`
  ).bind(parseInt(pageId), auth.store.id).first<LandingPage>();

  if (!page) {
    return new Response('Page not found', { status: 404 });
  }

  // Parse configs
  let themeConfig: ThemeConfig = {
    primaryColor: '#059669',
    secondaryColor: '#2563eb',
    fontHeading: 'Hind Siliguri',
    fontBody: 'Hind Siliguri',
  };
  
  try {
    if (page.pageConfig) {
      const parsed = JSON.parse(page.pageConfig);
      if (parsed.themeConfig) {
        themeConfig = { ...themeConfig, ...parsed.themeConfig };
      }
    }
  } catch (e) {
    console.error('Failed to parse page config:', e);
  }

  // Convert hex to RGB for opacity support
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const primaryRgb = hexToRgb(themeConfig.primaryColor || '#059669');
  const secondaryRgb = hexToRgb(themeConfig.secondaryColor || '#2563eb');

  // Generate the complete HTML document
  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(page.name || 'Preview')} - Preview</title>
  
  <!-- Google Fonts -->
  <link 
    href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap" 
    rel="stylesheet" 
  />
  
  <!-- Pre-compiled Tailwind CSS -->
  <link href="/css/canvas-tailwind.css" rel="stylesheet" />
  
  <!-- Swiper CSS for sliders -->
  <link href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" rel="stylesheet" />
  
  <!-- Animations CSS -->
  <link href="/animations.css" rel="stylesheet" />
  
  <!-- Theme Variables -->
  <style>
    :root {
      --primary-color: ${themeConfig.primaryColor};
      --secondary-color: ${themeConfig.secondaryColor};
      --primary-rgb: ${primaryRgb};
      --secondary-rgb: ${secondaryRgb};
      --font-heading: "${themeConfig.fontHeading}", sans-serif;
      --font-body: "${themeConfig.fontBody}", sans-serif;
    }
    
    /* Typography */
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
    body, p, a, div, span, button, input, textarea, select, label { font-family: var(--font-body); }
    
    /* Primary Color Utilities */
    .text-primary { color: var(--primary-color) !important; }
    .bg-primary { background-color: var(--primary-color) !important; }
    .border-primary { border-color: var(--primary-color) !important; }
    .decoration-primary { text-decoration-color: var(--primary-color) !important; }
    
    /* Primary with opacity */
    .bg-primary\\/10 { background-color: rgba(var(--primary-rgb), 0.1) !important; }
    .bg-primary\\/20 { background-color: rgba(var(--primary-rgb), 0.2) !important; }
    .bg-primary\\/30 { background-color: rgba(var(--primary-rgb), 0.3) !important; }
    .border-primary\\/30 { border-color: rgba(var(--primary-rgb), 0.3) !important; }
    
    /* Secondary Color Utilities */
    .text-secondary { color: var(--secondary-color) !important; }
    .bg-secondary { background-color: var(--secondary-color) !important; }
    .border-secondary { border-color: var(--secondary-color) !important; }
    
    /* Hover states */
    .hover\\:text-primary:hover { color: var(--primary-color) !important; }
    .hover\\:bg-primary:hover { background-color: var(--primary-color) !important; }
    .hover\\:opacity-90:hover { opacity: 0.9; }
    
    /* Focus states */
    .focus\\:ring-primary:focus { box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.3) !important; }
    .focus\\:border-primary:focus { border-color: var(--primary-color) !important; }
    
    /* Smooth scrolling */
    html { scroll-behavior: smooth; }
    
    /* Body base styles */
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      background-color: #ffffff;
    }
  </style>
  
  <!-- Page-specific CSS from GrapesJS -->
  ${page.cssContent ? `<style>${page.cssContent}</style>` : ''}
</head>
<body>
  <!-- Render HTML content from GrapesJS -->
  ${page.htmlContent || '<div class="p-10 text-center text-gray-500">No content yet. Add some blocks in the editor!</div>'}
  
  <!-- Preview Badge -->
  <div style="position: fixed; top: 16px; right: 16px; z-index: 9999; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 6px; font-family: system-ui, sans-serif;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
    PREVIEW MODE
  </div>
  
  <!-- Swiper JS for sliders -->
  <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
  
  <!-- Initialize any Swipers -->
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize all Swiper instances
      document.querySelectorAll('.swiper').forEach(function(el) {
        new Swiper(el, {
          loop: true,
          autoplay: { delay: 3000, disableOnInteraction: false },
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
      });
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}


export default function() {}
