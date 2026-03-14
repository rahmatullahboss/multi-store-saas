/**
 * Store Template Preview Component
 * 
 * Shows a preview of store templates using the ACTUAL template components
 * with realistic dummy products and Bengali content.
 */

import { X, Monitor, Smartphone, Check } from 'lucide-react';
import { useState, Suspense } from 'react';
import { Form } from 'react-router';
import { getStoreTemplate, type StoreTemplateProps } from '~/templates/store-registry';
import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';

// ============================================================================
// MOCK DATA - Realistic dummy products with placeholder images
// ============================================================================

// Using picsum.photos for placeholder images
const MOCK_PRODUCTS: StoreTemplateProps['products'] = [
  {
    id: 1,
    storeId: 1,
    title: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
    description: 'ক্রিস্টাল ক্লিয়ার অডিও সহ ওয়্যারলেস হেডফোন। ANC, ৪০ ঘন্টা ব্যাটারি।',
    price: 4999,
    compareAtPrice: 7999,
    imageUrl: 'https://picsum.photos/seed/headphones/600/800',
    category: 'Electronics',
  },
  {
    id: 2,
    storeId: 1,
    title: 'লেদার ক্রসবডি ব্যাগ',
    description: 'প্রিমিয়াম লেদার দিয়ে তৈরি স্টাইলিশ ক্রসবডি ব্যাগ।',
    price: 2499,
    compareAtPrice: 3999,
    imageUrl: 'https://picsum.photos/seed/bag/600/800',
    category: 'Fashion',
  },
  {
    id: 3,
    storeId: 1,
    title: 'স্মার্ট ওয়াচ প্রো',
    description: 'হার্ট রেট মনিটর, স্লিপ ট্র্যাকিং সহ স্মার্ট ওয়াচ।',
    price: 3499,
    compareAtPrice: 5499,
    imageUrl: 'https://picsum.photos/seed/watch/600/800',
    category: 'Electronics',
  },
  {
    id: 4,
    storeId: 1,
    title: 'অর্গানিক ফেস সিরাম',
    description: '১০০% অর্গানিক উপাদান দিয়ে তৈরি ফেস সিরাম।',
    price: 899,
    compareAtPrice: 1299,
    imageUrl: 'https://picsum.photos/seed/serum/600/800',
    category: 'Beauty',
  },
  {
    id: 5,
    storeId: 1,
    title: 'মিনিমালিস্ট ল্যাম্প',
    description: 'মডার্ন ডিজাইনের LED টেবিল ল্যাম্প।',
    price: 1499,
    compareAtPrice: null,
    imageUrl: 'https://picsum.photos/seed/lamp/600/800',
    category: 'Home',
  },
  {
    id: 6,
    storeId: 1,
    title: 'কটন কম্ফোর্ট টি-শার্ট',
    description: '১০০% কটন দিয়ে তৈরি আরামদায়ক টি-শার্ট।',
    price: 699,
    compareAtPrice: 999,
    imageUrl: 'https://picsum.photos/seed/tshirt/600/800',
    category: 'Fashion',
  },
  {
    id: 7,
    storeId: 1,
    title: 'ব্লুটুথ স্পিকার',
    description: 'পোর্টেবল ওয়াটারপ্রুফ ব্লুটুথ স্পিকার।',
    price: 1999,
    compareAtPrice: 2999,
    imageUrl: 'https://picsum.photos/seed/speaker/600/800',
    category: 'Electronics',
  },
  {
    id: 8,
    storeId: 1,
    title: 'হ্যান্ডমেড ক্যান্ডেল',
    description: 'ন্যাচারাল সয় ওয়াক্স ক্যান্ডেল।',
    price: 399,
    compareAtPrice: null,
    imageUrl: 'https://picsum.photos/seed/candle/600/800',
    category: 'Home',
  },
];

const MOCK_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty'];

const MOCK_SOCIAL_LINKS: SocialLinks = {
  facebook: 'https://facebook.com/example',
  instagram: 'https://instagram.com/example',
  whatsapp: '+8801700000000',
};

const MOCK_BUSINESS_INFO = {
  phone: '+880 1700-000000',
  email: 'support@example.com',
  address: 'ঢাকা, বাংলাদেশ',
};

const MOCK_FOOTER_CONFIG: FooterConfig = {
  description: 'আমাদের প্রিমিয়াম কালেকশন থেকে সেরা পণ্য বেছে নিন।',
};

const MOCK_THEME_CONFIG: ThemeConfig = {
  primaryColor: '#6366f1',
  accentColor: '#f59e0b',
  announcement: {
    text: '🎉 ফ্রি ডেলিভারি ১০০০ টাকার উপরে!',
  },
  bannerText: 'আমাদের নতুন কালেকশন',
};

// ============================================================================
// COMPONENT
// ============================================================================

interface StoreTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  storeName: string;
  onApply?: () => void;
}

export function StoreTemplatePreviewModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  storeName,
  onApply,
}: StoreTemplatePreviewModalProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  if (!isOpen) return null;

  const template = getStoreTemplate(templateId);
  const TemplateComponent = template.component;

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
              <h3 className="text-lg font-semibold text-white">টেমপ্লেট প্রিভিউ</h3>
              <p className="text-sm text-gray-400">
                প্রিভিউ: <span className="font-medium text-emerald-400">{templateName}</span>
              </p>
            </div>
          </div>
          
          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setDeviceView('desktop')}
              className={`p-2 rounded-md transition ${
                deviceView === 'desktop' 
                  ? 'bg-purple-600 text-white' 
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
                  ? 'bg-purple-600 text-white' 
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

        {/* Preview Content - Uses ACTUAL Template Component */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-4">
          <div 
            className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${
              deviceView === 'mobile' 
                ? 'w-[375px]' 
                : 'w-full max-w-5xl'
            }`}
            style={deviceView === 'mobile' ? {
              maxWidth: '375px',
              minHeight: '667px',
            } : undefined}
          >
            <div 
              className="overflow-auto"
              style={{ 
                maxHeight: 'calc(90vh - 180px)',
                ...(deviceView === 'mobile' ? {
                  WebkitOverflowScrolling: 'touch',
                } : {})
              }}
            >
              {/* Render the ACTUAL Store Template with mock data - wrapped in Suspense for lazy loading */}
              <Suspense fallback={
                <div className="min-h-[400px] flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">টেমপ্লেট লোড হচ্ছে...</p>
                  </div>
                </div>
              }>
                <TemplateComponent
                  storeName={storeName || 'My Store'}
                  storeId={1}
                  logo={null}
                  theme={null}
                  fontFamily="inter"
                  products={MOCK_PRODUCTS}
                  categories={MOCK_CATEGORIES}
                  currentCategory={null}
                  config={MOCK_THEME_CONFIG}
                  currency="BDT"
                  socialLinks={MOCK_SOCIAL_LINKS}
                  footerConfig={MOCK_FOOTER_CONFIG}
                  businessInfo={MOCK_BUSINESS_INFO}
                  isPreview={true}
                />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            👆 এই <strong>{templateName}</strong> টেমপ্লেট আপনার স্টোরে কেমন দেখাবে
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
            >
              বন্ধ করুন
            </button>
            <Form method="post">
              <input type="hidden" name="intent" value="select-template" />
              <input type="hidden" name="templateId" value={templateId} />
              <button
                type="submit"
                onClick={() => {
                  onApply?.();
                  setTimeout(onClose, 100);
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                এই টেমপ্লেট ব্যবহার করুন
              </button>
            </Form>
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
