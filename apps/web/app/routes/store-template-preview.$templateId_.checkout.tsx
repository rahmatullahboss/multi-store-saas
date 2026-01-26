/**
 * Store Template Preview - Checkout Page
 *
 * Route: /store-template-preview/:templateId/checkout
 */

import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Link } from '@remix-run/react';
import { Suspense, useState } from 'react';
import { ArrowLeft, Eye, X, Lock } from 'lucide-react';
import { getStoreTemplate, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import {
  DEMO_CATEGORIES,
  DEMO_SOCIAL_LINKS,
  DEMO_BUSINESS_INFO,
  DEMO_FOOTER_CONFIG,
  DEMO_THEME_CONFIG,
  DEMO_STORE_NAME,
} from '~/utils/store-preview-data';

export async function loader({ params }: LoaderFunctionArgs) {
  const templateId = params.templateId || 'luxe-boutique';
  const template = getStoreTemplate(templateId);
  const theme = STORE_TEMPLATE_THEMES[templateId] || STORE_TEMPLATE_THEMES['luxe-boutique'];

  return json({
    templateId: template.id,
    templateName: template.name,
    theme,
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
        <p className="text-gray-600">Loading checkout...</p>
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
        Preview: <strong>{templateName}</strong> - Checkout Page
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

function FallbackCheckoutPage({ theme }: { theme: any }) {
  return (
    <div
      className="min-h-[60vh] flex items-center justify-center"
      style={{ backgroundColor: theme.background }}
    >
      <div className="text-center max-w-md px-4">
        <Lock className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: theme.muted }} />
        <h2 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>
          Checkout Not Available in Preview
        </h2>
        <p className="mb-6" style={{ color: theme.muted }}>
          This template doesn't have a checkout page preview configured yet.
        </p>
        <Link
          to=".."
          className="px-8 py-3 rounded-lg text-white font-medium inline-block"
          style={{ backgroundColor: theme.primary }}
        >
          Return to Store
        </Link>
      </div>
    </div>
  );
}

export default function PreviewCheckoutPage() {
  const data = useLoaderData<typeof loader>();

  // Get the actual template component
  const template = getStoreTemplate(data.templateId);
  const CheckoutPageComponent = template.CheckoutPage;

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
        {/* Use template-specific CheckoutPage if available */}
        {CheckoutPageComponent ? (
          <Suspense fallback={<LoadingFallback />}>
            <CheckoutPageComponent theme={data.theme} isPreview={true} />
          </Suspense>
        ) : (
          <FallbackCheckoutPage theme={data.theme} />
        )}
      </StorePageWrapper>

      {/* Preview Indicator */}
      <PreviewIndicator templateName={data.templateName} templateId={data.templateId} />
    </>
  );
}
