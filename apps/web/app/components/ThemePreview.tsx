/**
 * Theme Preview Component
 * 
 * Shows a HIGH-FIDELITY live preview of how the storefront will look with the selected theme.
 * Features:
 * - Renders ACTUAL store template components dynamically
 * - Device toggle (Desktop 🖥️ / Mobile 📱)
 * - Comprehensive Bangladeshi market mock data
 * - Preview mode disables API calls
 */

import { X, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { getStoreTemplate, type SerializedProduct } from '~/templates/store-registry';
import { fontOptions } from '~/lib/theme';
import type { ThemeConfig, FooterConfig, SocialLinks } from '@db/types';

// ============================================================================
// MOCK DATA - Optimized for Bangladeshi Market Context
// ============================================================================
const MOCK_PRODUCTS: SerializedProduct[] = [
  {
    id: 1,
    storeId: 1,
    name: "Preview Product", title: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with active noise cancellation.',
    price: 2999,
    compareAtPrice: 3999,
    imageUrl: null,
    category: 'Electronics',
  },
  {
    id: 2,
    storeId: 1,
    name: "Preview Product", title: 'Organic Green Tea (100g)',
    description: 'Pure organic green tea sourced from the hills of Sylhet.',
    price: 450,
    compareAtPrice: null,
    imageUrl: null,
    category: 'Food & Beverages',
  },
  {
    id: 3,
    storeId: 1,
    name: "Preview Product", title: 'Smart Watch Pro X1',
    description: 'Track your fitness, receive notifications, and more.',
    price: 4599,
    compareAtPrice: 5999,
    imageUrl: null,
    category: 'Electronics',
  },
  {
    id: 4,
    storeId: 1,
    name: "Preview Product", title: 'Handcrafted Leather Bag',
    description: 'Genuine leather bag handmade by local artisans.',
    price: 1899,
    compareAtPrice: 2499,
    imageUrl: null,
    category: 'Fashion',
  },
  {
    id: 5,
    storeId: 1,
    name: "Preview Product", title: 'Traditional Pottery Set',
    description: 'Beautiful handmade pottery from Comilla.',
    price: 899,
    compareAtPrice: null,
    imageUrl: null,
    category: 'Home & Living',
  },
  {
    id: 6,
    storeId: 1,
    name: "Preview Product", title: 'Bamboo Desk Organizer',
    description: 'Eco-friendly desk organizer made from sustainable bamboo.',
    price: 599,
    compareAtPrice: 799,
    imageUrl: null,
    category: 'Home & Living',
  },
];

const MOCK_CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Food & Beverages'];

const MOCK_STORE_INFO = {
  storeName: 'Digital Shop BD',
  storeId: 1,
  businessInfo: {
    phone: '01712345678',
    email: 'contact@digitalshopbd.com',
    address: 'Dhanmondi, Dhaka',
  },
  socialLinks: {
    facebook: 'https://facebook.com/digitalshopbd',
    instagram: 'https://instagram.com/digitalshopbd',
    whatsapp: '01712345678',
  } as SocialLinks,
  footerConfig: {
    description: 'Your trusted destination for premium products in Bangladesh. Quality guaranteed, fast delivery across Dhaka.',
    showPoweredBy: true,
  } as FooterConfig,
};

// Theme configs for each store template
const MOCK_THEME_CONFIGS: Record<string, ThemeConfig> = {
  'luxe-boutique': {
    primaryColor: '#1a1a1a',
    accentColor: '#c9a961',
    announcement: { text: '✨ Free Delivery on ৳1000+ Orders!' },
    bannerText: 'Welcome to Digital Shop BD',
  },
  'tech-modern': {
    primaryColor: '#0f172a',
    accentColor: '#3b82f6',
    announcement: { text: '⚡ Flash Sale - Up to 50% OFF!' },
    bannerText: 'Next-Gen Tech from Digital Shop BD',
  },
  'artisan-market': {
    primaryColor: '#3d2f2f',
    accentColor: '#b45309',
    announcement: { text: '🌿 Handcrafted with Love - Shop Local!' },
    bannerText: 'Artisan Goods from Digital Shop BD',
  },
};

// ============================================================================
// COMPONENT PROPS
// ============================================================================
interface ThemePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  theme: string; // The store template ID (e.g., 'luxe-boutique', 'tech-modern')
  fontFamily: string;
  storeName: string;
  logo?: string | null;
}

// ============================================================================
// THEME PREVIEW COMPONENT
// ============================================================================
export function ThemePreview({
  isOpen,
  onClose,
  theme,
  fontFamily,
  storeName,
  logo,
}: ThemePreviewProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  // Get the actual store template component
  const templateDef = getStoreTemplate(theme);
  const TemplateComponent = templateDef.component;
  const font = fontOptions.find(f => f.value === fontFamily) || fontOptions[0];
  
  // Get mock theme config for this template
  const themeConfig = MOCK_THEME_CONFIGS[theme] || MOCK_THEME_CONFIGS['luxe-boutique'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Preview Modal */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Store Template Preview</h3>
              <p className="text-sm text-gray-400">
                Previewing: <span className="font-medium text-emerald-400">{templateDef.name}</span>
                {' '}with <span className="font-medium text-blue-400">{font.label}</span> font
              </p>
            </div>
          </div>
          
          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded-md transition ${
                deviceView === 'desktop' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDeviceView('mobile')}
              className={`p-2 rounded-md transition ${
                deviceView === 'mobile' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Font Link */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={font.url} rel="stylesheet" />

        {/* Preview Content - Uses ACTUAL Store Templates */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-4">
          <div 
            className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${
              deviceView === 'mobile' 
                ? 'w-[375px]' 
                : 'w-full max-w-5xl'
            }`}
            style={deviceView === 'mobile' ? {
              // Force mobile viewport simulation
              maxWidth: '375px',
              minHeight: '667px',
            } : undefined}
          >
            <div 
              className="overflow-auto"
              style={{ 
                maxHeight: 'calc(90vh - 120px)',
                ...(deviceView === 'mobile' ? {
                  WebkitOverflowScrolling: 'touch',
                } : {})
              }}
            >
              {/* Render the ACTUAL Store Template with mock data */}
              <TemplateComponent
                storeName={storeName || MOCK_STORE_INFO.storeName}
                storeId={MOCK_STORE_INFO.storeId}
                logo={logo}
                products={MOCK_PRODUCTS}
                categories={MOCK_CATEGORIES}
                currentCategory={null}
                config={themeConfig}
                currency="BDT"
                socialLinks={MOCK_STORE_INFO.socialLinks}
                footerConfig={MOCK_STORE_INFO.footerConfig}
                businessInfo={MOCK_STORE_INFO.businessInfo}
                isPreview={true}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            👆 This shows how the <strong>{templateDef.name}</strong> template will look on your store
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
