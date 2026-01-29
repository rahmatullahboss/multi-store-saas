/**
 * Store Template Preview - Product Detail Page
 *
 * Route: /store-template-preview/:templateId/products/:id
 *
 * This route renders template-specific product pages
 * with demo products for preview purposes.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { Suspense } from 'react';
import { ArrowLeft, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { getStoreTemplate, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_SOCIAL_LINKS,
  DEMO_BUSINESS_INFO,
  DEMO_FOOTER_CONFIG,
  DEMO_THEME_CONFIG,
  DEMO_STORE_NAME,
} from '~/utils/store-preview-data';

// ============================================================================
// META
// ============================================================================
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }, { name: 'robots', content: 'noindex, nofollow' }];
  }
  return [
    { title: `${data.product.title} - ${data.templateName} Preview` },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ params }: LoaderFunctionArgs) {
  const templateId = params.templateId || 'luxe-boutique';
  const productId = parseInt(params.id || '1', 10);

  const template = getStoreTemplate(templateId);
  const theme = STORE_TEMPLATE_THEMES[templateId] || STORE_TEMPLATE_THEMES['luxe-boutique'];

  // Find the product from demo products
  const product = DEMO_PRODUCTS.find((p) => p.id === productId) || DEMO_PRODUCTS[0];

  // Get related products (exclude current product)
  const relatedProducts = DEMO_PRODUCTS.filter((p) => p.id !== productId).slice(0, 4);

  return json({
    templateId: template.id,
    templateName: template.name,
    hasProductPage: !!template.ProductPage,
    theme,
    product: {
      id: product.id,
      storeId: product.storeId,
      title: product.title,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.imageUrl,
      category: product.category,
      sku: `DEMO-${product.id}`,
      inventory: 100,
      images: null,
      variants: (() => {
        // Dynamic variant generation based on category
        if (product.category === 'Fashion') {
          return [
            { id: 101, option1Name: 'Size', option1Value: 'M', option2Name: 'Color', option2Value: 'Red', price: product.price, available: 10 },
            { id: 102, option1Name: 'Size', option1Value: 'L', option2Name: 'Color', option2Value: 'Blue', price: product.price + 50, available: 5 },
            { id: 103, option1Name: 'Size', option1Value: 'XL', option2Name: 'Color', option2Value: 'Black', price: product.price, available: 8 },
          ];
        } 
        if (['Electronics', 'Home'].includes(product.category || '')) {
          return [
            { id: 104, option1Name: 'Color', option1Value: 'Black', price: product.price, available: 15 },
            { id: 105, option1Name: 'Color', option1Value: 'White', price: product.price, available: 12 },
          ];
        }
        return []; // No variants for other categories
      })(),
    },
    relatedProducts: relatedProducts.map((p) => ({
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

// ============================================================================
// LOADING FALLBACK
// ============================================================================
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading product...</p>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW INDICATOR
// ============================================================================
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
        Preview: <strong>{templateName}</strong> - Product Page
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

// ============================================================================
// FALLBACK PRODUCT PAGE
// ============================================================================
function FallbackProductPage({
  product,
  currency,
  theme,
}: {
  product: {
    id: number;
    title: string | null;
    description: string | null;
    price: number | null;
    compareAtPrice: number | null;
    imageUrl: string | null;
    category: string | null;
  };
  currency: string;
  theme: Record<string, string>;
}) {
  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
              {product.title}
            </h1>
            <p className="text-3xl font-bold" style={{ color: theme.primary }}>
              {currency}
              {(product.price ?? 0).toLocaleString()}
            </p>
            {product.description && <p className="text-gray-600">{product.description}</p>}
            <div className="flex gap-3 pt-4">
              <button
                className="flex-1 py-3 rounded-lg font-medium text-white"
                style={{ backgroundColor: theme.primary }}
              >
                Add to Cart
              </button>
              <button
                className="flex-1 py-3 rounded-lg font-medium text-white"
                style={{ backgroundColor: theme.accent }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PreviewProductPage() {
  const data = useLoaderData<typeof loader>();

  // Get the actual template component
  const template = getStoreTemplate(data.templateId);
  const ProductPageComponent = template.ProductPage;

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
        {/* Use template-specific ProductPage if available */}
        {ProductPageComponent ? (
          <Suspense fallback={<LoadingFallback />}>
            <ProductPageComponent
              product={data.product}
              currency={data.currency}
              relatedProducts={data.relatedProducts}
              theme={data.theme}
              isPreview={true}
            />
          </Suspense>
        ) : (
          <FallbackProductPage product={data.product} currency={data.currency} theme={data.theme} />
        )}
      </StorePageWrapper>

      {/* Preview Indicator */}
      <PreviewIndicator templateName={data.templateName} templateId={data.templateId} />
    </>
  );
}
