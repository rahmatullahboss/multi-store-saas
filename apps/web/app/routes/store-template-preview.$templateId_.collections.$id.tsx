/**
 * Store Template Preview - Collection/Category Page
 *
 * Route: /store-template-preview/:templateId/collections/:id
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { Suspense, useState } from 'react';
import { ArrowLeft, Eye, X } from 'lucide-react';
import { getStoreTemplate, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  DEMO_CATEGORIES,
  DEMO_COLLECTIONS,
  DEMO_SOCIAL_LINKS,
  DEMO_BUSINESS_INFO,
  DEMO_FOOTER_CONFIG,
  DEMO_THEME_CONFIG,
  DEMO_STORE_NAME,
  getDemoProductsByCollection,
  getDemoProductsByCategory,
} from '~/utils/store-preview-data';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.title || 'Collection'} - ${data?.templateName} Preview` },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const templateId = params.templateId || 'luxe-boutique';
  const collectionId = params.id || '';

  // Handle "category" url param if needed, but here we assume path param works for both
  const url = new URL(request.url);
  const isCategory = url.searchParams.get('type') === 'category';

  const template = getStoreTemplate(templateId);
  const theme = STORE_TEMPLATE_THEMES[templateId] || STORE_TEMPLATE_THEMES['luxe-boutique'];

  let products = [];
  let title = '';
  let description = '';

  // Check if it matches a demo collection ID
  const collection = DEMO_COLLECTIONS.find((c) => c.id === collectionId);

  // Handle "all-products" special case
  if (collectionId === 'all-products') {
    title = 'All Products';
    description = 'Browse our complete collection';
    products = getDemoProductsByCollection('featured'); // Get all demo products
  } else if (collection) {
    title = collection.nameBn || collection.name;
    description = collection.description;
    products = getDemoProductsByCollection(collectionId);
  } else {
    // Treat as category name
    title = decodeURIComponent(collectionId);
    products = getDemoProductsByCategory(title);
  }

  // Fallback products if empty for preview
  if (products.length === 0) {
    // Just grab first 8 products for visualization if empty
    products = getDemoProductsByCollection('featured');
  }

  return json({
    templateId: template.id,
    templateName: template.name,
    theme,
    title,
    description,
    products: products.map((p) => ({
      id: p.id,
      storeId: p.storeId,
      title: p.title,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: p.imageUrl,
      category: p.category,
    })),
    categories: DEMO_CATEGORIES,
    storeName: DEMO_STORE_NAME,
    socialLinks: DEMO_SOCIAL_LINKS,
    businessInfo: DEMO_BUSINESS_INFO,
    footerConfig: DEMO_FOOTER_CONFIG,
    themeConfig: DEMO_THEME_CONFIG,
    currency: 'BDT',
  });
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading collection...</p>
      </div>
    </div>
  );
}

function PreviewIndicator({
  templateName,
  templateId,
}: {
  templateName: string;
  templateId: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm text-white rounded-full shadow-lg text-sm">
      <Eye className="w-4 h-4" />
      <span>
        Preview: <strong>{templateName}</strong> - Collection Page
      </span>
      <Link
        to={`/store-template-preview/${templateId}`}
        className="ml-2 px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition flex items-center gap-1"
      >
        <ArrowLeft className="w-3 h-3" />
        Home
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="ml-1 p-1 hover:bg-white/20 rounded-full transition"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Reuse the fallback ProductPage style for consistency or import a shared one
// Ideally layouts handle the rendering, but previews might not have full router context
function DefaultCollectionLayout({
  title,
  description,
  products,
  theme,
  currency,
  templateId,
}: any) {
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.text }}>
            {title}
          </h1>
          {description && (
            <p className="text-lg" style={{ color: theme.muted }}>
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              to={`/store-template-preview/${templateId}/products/${product.id}`}
              className="group block"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="font-medium mb-1 line-clamp-1" style={{ color: theme.text }}>
                {product.title}
              </h3>
              <p className="font-bold" style={{ color: theme.accent }}>
                {currency}
                {product.price}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PreviewCollectionPage() {
  const data = useLoaderData<typeof loader>();

  // Note: Most templates handle collections via their main layout or dedicated pages
  // But if the template component is only the HOME page (which is common for these single-page-like templates),
  // we need a generic collection view wrapped in the template layout.

  return (
    <>
      <StorePageWrapper
        storeName={data.storeName}
        storeId={0}
        logo={null}
        templateId={data.templateId}
        theme={data.theme}
        currency={data.currency}
        socialLinks={data.socialLinks}
        businessInfo={data.businessInfo}
        categories={data.categories}
        config={data.themeConfig}
        footerConfig={data.footerConfig}
        planType="pro"
        customer={null}
        isPreview={true}
      >
        <DefaultCollectionLayout
          title={data.title}
          description={data.description}
          products={data.products}
          theme={data.theme}
          currency={data.currency}
          templateId={data.templateId}
        />
      </StorePageWrapper>

      {/* Preview Indicator */}
      <PreviewIndicator templateName={data.templateName} templateId={data.templateId} />
    </>
  );
}
