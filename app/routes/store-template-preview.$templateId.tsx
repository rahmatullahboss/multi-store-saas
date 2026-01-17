/**
 * Store Template Full-Page Preview Route
 * 
 * Route: /store-template-preview/:templateId
 * 
 * Opens a full-page preview of any store template with:
 * - Demo products and data
 * - Device toggle (desktop/mobile)
 * - Navigation to product detail and cart pages
 * - Apply template functionality
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { Link, useLoaderData, useSearchParams, useNavigate, Form } from '@remix-run/react';
import { useState } from 'react';
import { 
  ArrowLeft, Monitor, Smartphone, Check, X, Eye, 
  ShoppingCart, Home, Package, ExternalLink 
} from 'lucide-react';
import { getStoreTemplate, STORE_TEMPLATES } from '~/templates/store-registry';
import { 
  DEMO_PRODUCTS, 
  DEMO_CATEGORIES, 
  DEMO_SOCIAL_LINKS, 
  DEMO_BUSINESS_INFO, 
  DEMO_FOOTER_CONFIG, 
  DEMO_THEME_CONFIG,
  DEMO_STORE_NAME,
  DEMO_CART_ITEMS,
  getDemoProductById,
} from '~/utils/store-preview-data';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `প্রিভিউ: ${data?.templateName || 'টেমপ্লেট'}` }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ params }: LoaderFunctionArgs) {
  const templateId = params.templateId || 'luxe-boutique';
  const template = getStoreTemplate(templateId);
  
  return json({
    templateId: template.id,
    templateName: template.name,
    templateDescription: template.description,
    templates: STORE_TEMPLATES.map(t => ({ id: t.id, name: t.name })),
  });
}

// ============================================================================
// DEMO PRODUCT DETAIL COMPONENT
// ============================================================================
function DemoProductDetail({ 
  productId, 
  onBack,
  templateId,
}: { 
  productId: number; 
  onBack: () => void;
  templateId: string;
}) {
  const product = getDemoProductById(productId);
  const template = getStoreTemplate(templateId);
  const theme = template.theme;
  
  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">প্রোডাক্ট পাওয়া যায়নি</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString('bn-BD')}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-4 py-3 shadow-sm"
        style={{ backgroundColor: theme.headerBg }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} />
          </button>
          <span className="font-medium" style={{ color: theme.text }}>
            প্রোডাক্ট বিবরণ
          </span>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
            <img 
              src={product.imageUrl || 'https://picsum.photos/seed/default/600/600'} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
              >
                {product.category}
              </span>
            </div>

            <h1 
              className="text-2xl md:text-3xl font-bold"
              style={{ color: theme.text }}
            >
              {product.title}
            </h1>

            <p style={{ color: theme.muted }}>
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span 
                className="text-3xl font-bold"
                style={{ color: theme.primary }}
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-lg line-through" style={{ color: theme.muted }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span style={{ color: theme.text }}>পরিমাণ:</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button className="px-4 py-2 hover:bg-gray-100">-</button>
                <span className="px-4 py-2 border-x">1</span>
                <button className="px-4 py-2 hover:bg-gray-100">+</button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition hover:opacity-90"
                style={{ backgroundColor: theme.primary }}
              >
                কার্টে যোগ করুন
              </button>
              <button 
                className="flex-1 py-3 px-6 rounded-lg font-medium transition hover:opacity-90"
                style={{ 
                  backgroundColor: theme.accent, 
                  color: '#fff' 
                }}
              >
                এখনই কিনুন
              </button>
            </div>

            {/* Info */}
            <div 
              className="p-4 rounded-lg space-y-2"
              style={{ backgroundColor: theme.cardBg }}
            >
              <p className="flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
                <Check className="w-4 h-4" style={{ color: theme.accent }} />
                ১০০% অরিজিনাল প্রোডাক্ট
              </p>
              <p className="flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
                <Check className="w-4 h-4" style={{ color: theme.accent }} />
                ক্যাশ অন ডেলিভারি সুবিধা
              </p>
              <p className="flex items-center gap-2 text-sm" style={{ color: theme.muted }}>
                <Check className="w-4 h-4" style={{ color: theme.accent }} />
                ৭ দিনের রিটার্ন পলিসি
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DEMO CART PAGE COMPONENT
// ============================================================================
function DemoCartPage({ 
  onBack,
  templateId,
}: { 
  onBack: () => void;
  templateId: string;
}) {
  const template = getStoreTemplate(templateId);
  const theme = template.theme;
  
  const formatPrice = (price: number) => `৳${price.toLocaleString('bn-BD')}`;
  
  const subtotal = DEMO_CART_ITEMS.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  const shipping = 60;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-4 py-3 shadow-sm"
        style={{ backgroundColor: theme.headerBg }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} />
          </button>
          <span className="font-medium" style={{ color: theme.text }}>
            <ShoppingCart className="w-5 h-5 inline-block mr-2" />
            কার্ট ({DEMO_CART_ITEMS.length} আইটেম)
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {DEMO_CART_ITEMS.map((item) => (
              <div 
                key={item.id}
                className="flex gap-4 p-4 rounded-xl"
                style={{ backgroundColor: theme.cardBg }}
              >
                <img 
                  src={item.imageUrl || ''} 
                  alt={item.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium" style={{ color: theme.text }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    {item.category}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold" style={{ color: theme.primary }}>
                      {formatPrice(item.price)}
                    </span>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                      <button className="px-3 py-1 hover:bg-gray-100 text-sm">-</button>
                      <span className="px-3 py-1 border-x text-sm">{item.quantity}</span>
                      <button className="px-3 py-1 hover:bg-gray-100 text-sm">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div 
            className="p-6 rounded-xl h-fit sticky top-24"
            style={{ backgroundColor: theme.cardBg }}
          >
            <h3 className="font-semibold mb-4" style={{ color: theme.text }}>
              অর্ডার সামারি
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between" style={{ color: theme.muted }}>
                <span>সাবটোটাল</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ color: theme.muted }}>
                <span>ডেলিভারি চার্জ</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold" style={{ color: theme.text }}>
                <span>মোট</span>
                <span style={{ color: theme.primary }}>{formatPrice(total)}</span>
              </div>
            </div>

            <button 
              className="w-full mt-6 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: theme.primary }}
            >
              চেকআউট করুন
            </button>

            <p className="text-xs text-center mt-3" style={{ color: theme.muted }}>
              ক্যাশ অন ডেলিভারি সুবিধা রয়েছে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function StoreTemplatePreview() {
  const { templateId, templateName, templates } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  // Page state from URL params
  const currentPage = searchParams.get('page') || 'home';
  const productId = searchParams.get('productId');
  
  const template = getStoreTemplate(templateId);
  const TemplateComponent = template.component;

  // Navigation handlers
  const goToHome = () => setSearchParams({});
  const goToProduct = (id: number) => setSearchParams({ page: 'product', productId: String(id) });
  const goToCart = () => setSearchParams({ page: 'cart' });

  // Render content based on current page
  const renderContent = () => {
    if (currentPage === 'product' && productId) {
      return (
        <DemoProductDetail 
          productId={Number(productId)} 
          onBack={goToHome}
          templateId={templateId}
        />
      );
    }
    
    if (currentPage === 'cart') {
      return (
        <DemoCartPage 
          onBack={goToHome}
          templateId={templateId}
        />
      );
    }
    
    // Home - Main template with product click handlers
    return (
      <div onClick={(e) => {
        // Intercept product card clicks
        const target = e.target as HTMLElement;
        const productCard = target.closest('[data-product-id]');
        if (productCard) {
          e.preventDefault();
          const id = productCard.getAttribute('data-product-id');
          if (id) goToProduct(Number(id));
        }
      }}>
        <TemplateComponent
          storeName={DEMO_STORE_NAME}
          storeId={1}
          logo={null}
          theme={null}
          fontFamily="inter"
          products={DEMO_PRODUCTS}
          categories={DEMO_CATEGORIES}
          currentCategory={null}
          config={DEMO_THEME_CONFIG}
          currency="BDT"
          socialLinks={DEMO_SOCIAL_LINKS}
          footerConfig={DEMO_FOOTER_CONFIG}
          businessInfo={DEMO_BUSINESS_INFO}
          isPreview={true}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Floating Control Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-2xl border border-gray-700">
        {/* Back */}
        <Link
          to="/app/store-design"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          title="স্টোর ডিজাইনে ফিরে যান"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* Template Name */}
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">{templateName}</span>
        </div>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToHome}
            className={`p-2 rounded-lg transition ${
              currentPage === 'home' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="হোম পেজ"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => goToProduct(1)}
            className={`p-2 rounded-lg transition ${
              currentPage === 'product' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="প্রোডাক্ট পেজ"
          >
            <Package className="w-4 h-4" />
          </button>
          <button
            onClick={goToCart}
            className={`p-2 rounded-lg transition ${
              currentPage === 'cart' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title="কার্ট পেজ"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* Device Toggle */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-md transition ${
              deviceView === 'desktop' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="ডেস্কটপ ভিউ"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-md transition ${
              deviceView === 'mobile' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            title="মোবাইল ভিউ"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-700" />
        
        {/* Apply Button */}
        <Form method="post" action="/app/theme-store">
          <input type="hidden" name="themeId" value={templateId} />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition"
          >
            <Check className="w-4 h-4" />
            <span className="hidden sm:inline">ব্যবহার করুন</span>
          </button>
        </Form>
      </div>

      {/* Preview Container */}
      <div className="flex items-start justify-center pt-20 pb-8 px-4 min-h-screen">
        <div 
          className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${
            deviceView === 'mobile' 
              ? 'w-[375px]' 
              : 'w-full max-w-7xl'
          }`}
          style={deviceView === 'mobile' ? {
            maxWidth: '375px',
            minHeight: '667px',
          } : undefined}
        >
          <div 
            className="overflow-auto"
            style={{ 
              maxHeight: 'calc(100vh - 120px)',
              ...(deviceView === 'mobile' ? {
                WebkitOverflowScrolling: 'touch',
              } : {})
            }}
          >
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Template Switcher (Bottom) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-2xl border border-gray-700">
        <div className="flex items-center gap-2 overflow-x-auto max-w-[90vw]">
          <span className="text-xs text-gray-400 whitespace-nowrap">অন্য টেমপ্লেট:</span>
          {templates.filter(t => t.id !== templateId).slice(0, 4).map((t) => (
            <Link
              key={t.id}
              to={`/store-template-preview/${t.id}`}
              className="px-3 py-1 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition whitespace-nowrap"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
