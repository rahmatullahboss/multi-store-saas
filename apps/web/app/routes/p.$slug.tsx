/**
 * Published Page Route
 * 
 * Routes: /p/:slug
 * 
 * Renders custom HTML/CSS pages from `landingPages` table.
 * These are static pages like About, Contact, etc.
 */

import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { useLoaderData } from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { landingPages } from '@db/schema';
import { useTrackVisit } from '~/hooks/use-track-visit';
import { OzzylBranding } from '~/components/OzzylBranding';
import { sanitizeHtml } from '~/utils/sanitize';

interface PageData {
  page: typeof landingPages.$inferSelect;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const loaderData = data as PageData | undefined;
  if (!loaderData) {
    return [{ title: 'Page Not Found' }];
  }
  return [{ title: loaderData.page.name || 'Page' }];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { slug } = params;
  const storeId = context.storeId;

  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  if (!slug) {
    throw new Response('Slug required', { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Look up custom page by slug
  const customPage = await db
    .select()
    .from(landingPages)
    .where(
      and(
        eq(landingPages.slug, slug),
        eq(landingPages.storeId, storeId as number),
        eq(landingPages.isPublished, true)
      )
    )
    .limit(1)
    .get();

  if (!customPage) {
    throw new Response('Page not found', { status: 404 });
  }

  return json<PageData>({ page: customPage });
}

export default function PublishedPageRoute() {
  const data = useLoaderData<typeof loader>() as PageData;
  const page = data.page;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useTrackVisit(page.storeId);

  // Parse theme config for CSS variables
  let themeConfig = {
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
  } catch {
    // Use defaults
  }

  // Convert hex to RGB for opacity support
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  const primaryRgb = hexToRgb(themeConfig.primaryColor);
  const secondaryRgb = hexToRgb(themeConfig.secondaryColor);

  return (
    <>
      {/* Pre-compiled Tailwind CSS - No CDN dependency */}
      <link href="/css/canvas-tailwind.css" rel="stylesheet" />
      
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Swiper CSS */}
      <link href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" rel="stylesheet" />
      
      {/* Animations CSS */}
      <link href="/animations.css" rel="stylesheet" />
      
      {/* Theme Variables & Primary/Secondary Colors */}
      <style dangerouslySetInnerHTML={{ __html: `
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
        
        /* Primary with opacity */
        .bg-primary\\/10 { background-color: rgba(var(--primary-rgb), 0.1) !important; }
        .bg-primary\\/20 { background-color: rgba(var(--primary-rgb), 0.2) !important; }
        .bg-primary\\/30 { background-color: rgba(var(--primary-rgb), 0.3) !important; }
        
        /* Secondary Color Utilities */
        .text-secondary { color: var(--secondary-color) !important; }
        .bg-secondary { background-color: var(--secondary-color) !important; }
        .border-secondary { border-color: var(--secondary-color) !important; }
        
        /* Hover states */
        .hover\\:text-primary:hover { color: var(--primary-color) !important; }
        .hover\\:bg-primary:hover { background-color: var(--primary-color) !important; }
        .hover\\:opacity-90:hover { opacity: 0.9; }
        
        /* Smooth scrolling */
        html { scroll-behavior: smooth; }
        
        /* Body base */
        body { margin: 0; padding: 0; min-height: 100vh; background-color: #ffffff; }
      `}} />
      
      {/* Page-specific CSS from GrapesJS */}
      <style dangerouslySetInnerHTML={{ __html: page.cssContent || '' }} />
      
      {/* Page HTML Content */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.htmlContent || '') }} />

      {/* Lucide Icons */}
      <script src="https://unpkg.com/lucide@latest"></script>
      
      {/* Swiper JS */}
      <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
      
      {/* Runtime Scripts */}
      <script dangerouslySetInnerHTML={{
        __html: `
        (function() {
          var config = { storeId: ${page.storeId} };
          
          function initHandlers() {
            // Button action handlers
            document.querySelectorAll('[data-ozzyl-action]').forEach(btn => {
              btn.addEventListener('click', e => {
                e.preventDefault();
                const action = btn.getAttribute('data-ozzyl-action');
                if(action === 'whatsapp') {
                   const phone = (btn.getAttribute('data-ozzyl-phone') || '').replace(/[^0-9]/g, '');
                   if(phone) window.open('https://wa.me/' + phone, '_blank');
                }
              });
            });
            
            // Initialize Swiper sliders
            document.querySelectorAll('.swiper').forEach(function(el) {
              new Swiper(el, {
                loop: true,
                autoplay: { delay: 3000, disableOnInteraction: false },
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
              });
            });
            
            // Initialize Lucide icons
            if(window.lucide) lucide.createIcons();
          }
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initHandlers);
          } else {
            initHandlers();
          }
        })();
      `}} />
    </>
  );
}
