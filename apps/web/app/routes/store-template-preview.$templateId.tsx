/**
 * Store Template Preview Route
 * 
 * Route: /store-template-preview/:templateId
 * 
 * This route renders the ACTUAL template components (not generic ones)
 * to give merchants a true preview of how each theme looks.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';
import { Eye, X } from 'lucide-react';
import { useState } from 'react';
import { 
  getStoreTemplate, 
  STORE_TEMPLATES, 
  STORE_TEMPLATE_THEMES,
  type StoreTemplateProps 
} from '~/templates/store-registry';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_COLLECTIONS,
  DEMO_REVIEWS,
  DEMO_SOCIAL_LINKS,
  DEMO_BUSINESS_INFO,
  DEMO_FOOTER_CONFIG,
  DEMO_THEME_CONFIG,
  DEMO_STORE_NAME,
  DEMO_PROMOTIONS,
  DEMO_TESTIMONIALS,
  getActiveFlashSale,
  getFlashSaleProducts,
  getActiveBanners,
  getActiveAnnouncement,
} from '~/utils/store-preview-data';


// ============================================================================
// META
// ============================================================================
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.templateName || 'Theme'} Preview - ${DEMO_STORE_NAME}` },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ params }: LoaderFunctionArgs) {
  const templateId = params.templateId || 'luxe-boutique';
  const template = getStoreTemplate(templateId);
  const theme = STORE_TEMPLATE_THEMES[templateId] || STORE_TEMPLATE_THEMES['luxe-boutique'];

  // Convert demo products to match SerializedProduct type (with full data)
  const products = DEMO_PRODUCTS.map(p => ({
    id: p.id,
    storeId: p.storeId,
    title: p.title,
    description: p.description,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    imageUrl: p.imageUrl,
    images: p.images,
    category: p.category,
    variants: p.variants,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    sku: p.sku,
    tags: p.tags,
  }));

  // Get active flash sale and its products
  const activeFlashSale = getActiveFlashSale();
  const flashSaleProducts = getFlashSaleProducts();

  // Get active banners and announcement
  const activeBanners = getActiveBanners();
  const activeAnnouncement = getActiveAnnouncement();

  return json({
    templateId: template.id,
    templateName: template.name,
    templateDescription: template.description,
    theme,
    products,
    categories: DEMO_CATEGORIES,
    collections: DEMO_COLLECTIONS,
    reviews: DEMO_REVIEWS,
    storeName: DEMO_STORE_NAME,
    socialLinks: DEMO_SOCIAL_LINKS,
    businessInfo: DEMO_BUSINESS_INFO,
    footerConfig: DEMO_FOOTER_CONFIG,
    themeConfig: {
      ...DEMO_THEME_CONFIG,
      // sections: DEMO_THEME_CONFIG.sections || DEFAULT_SECTIONS, // Duplicate property, handled in spread or unnecessary
    },
    // New demo data
    banners: activeBanners,
    flashSale: activeFlashSale,
    flashSaleProducts,
    promotions: DEMO_PROMOTIONS,
    announcement: activeAnnouncement,
    testimonials: DEMO_TESTIMONIALS,
    allTemplates: STORE_TEMPLATES.map(t => ({ id: t.id, name: t.name })),
  });
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading template...</p>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW INDICATOR
// ============================================================================
function PreviewIndicator({ templateName }: { templateName: string }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-full shadow-lg text-sm">
      <Eye className="w-4 h-4" />
      <span>Preview: <strong>{templateName}</strong></span>
      <button 
        onClick={() => setDismissed(true)}
        className="ml-1 p-1 hover:bg-white/20 rounded-full transition"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function StoreTemplatePreview() {
  const data = useLoaderData<typeof loader>();
  
  // Get the actual template component
  const template = getStoreTemplate(data.templateId);
  const TemplateComponent = template.component;

  // Prepare props for the template
  const templateProps: StoreTemplateProps = {
    storeName: data.storeName,
    storeId: 0, // Demo store
    logo: null,
    products: data.products,
    categories: data.categories,
    currentCategory: null,
    config: data.themeConfig,
    currency: 'BDT',
    socialLinks: data.socialLinks,
    footerConfig: data.footerConfig,
    businessInfo: data.businessInfo,
    planType: 'pro', // Show without branding limits for preview
    isPreview: true,
    // Extended demo data for rich preview
    collections: data.collections,
    reviews: data.reviews,
    banners: data.banners,
    flashSale: data.flashSale,
    flashSaleProducts: data.flashSaleProducts,
    promotions: data.promotions,
    announcement: data.announcement,
    testimonials: data.testimonials,
  };

  return (
    <>
      {/* Render the actual template component */}
      <Suspense fallback={<LoadingFallback />}>
        <TemplateComponent {...templateProps} />
      </Suspense>

      {/* Preview Indicator */}
      <PreviewIndicator templateName={data.templateName} />
    </>
  );
}
