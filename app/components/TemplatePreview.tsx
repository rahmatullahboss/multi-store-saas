/**
 * Template Preview Component
 * 
 * Shows a preview of landing page templates using the ACTUAL LandingPageTemplate component.
 * This ensures consistency between preview and actual storefront.
 */

import { X, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { getTemplateComponent } from '~/templates/registry';
import type { LandingConfig } from '@db/types';

// Mock product for preview
const MOCK_PRODUCT = {
  id: 1,
  storeId: 1,
  title: 'Premium Wireless Headphones Pro',
  description: 'Experience crystal-clear audio with our flagship wireless headphones. Features active noise cancellation, 40-hour battery life, and premium comfort. Perfect for music lovers, gamers, and professionals alike. Transform your listening experience today!',
  price: 4999,
  compareAtPrice: 7999,
  inventory: 25,
  sku: 'HP-001',
  imageUrl: null,
  images: null,
  category: 'Electronics',
  tags: 'headphones,wireless,audio',
  isPublished: true,
};

// Mock testimonials
const MOCK_TESTIMONIALS = [
  { name: 'রহিম আহমেদ', text: 'অসাধারণ প্রোডাক্ট! সময়মতো ডেলিভারি পেয়েছি। সাউন্ড কোয়ালিটি দারুণ।', rating: 5 },
  { name: 'করিম হোসেন', text: 'খুবই সন্তুষ্ট। পণ্যের মান অত্যন্ত ভালো। আবার অর্ডার করব।', rating: 5 },
  { name: 'সাদিয়া খান', text: 'দ্রুত ডেলিভারি এবং পাকেজিং চমৎকার ছিল। ধন্যবাদ!', rating: 5 },
];

// Template-specific landing configs (using existing LandingConfig type)
const TEMPLATE_CONFIGS: Record<string, Partial<LandingConfig>> = {
  'premium-bd': {
    templateId: 'premium-bd',
    headline: 'প্রিমিয়াম ওয়্যারলেস হেডফোন',
    subheadline: 'বাংলাদেশের সেরা অডিও এক্সপেরিয়েন্স',
    urgencyText: '🎧 আজই অর্ডার করলে ৫০% ছাড়! সীমিত স্টক!',
    ctaText: '🛒 এখনই অর্ডার করুন',
    ctaSubtext: '৭ দিনের মানি ব্যাক গ্যারান্টি',
    videoUrl: '',
  },
  'flash-sale': {
    templateId: 'flash-sale',
    headline: '⚡ ফ্ল্যাশ সেল - Premium Headphones Pro',
    subheadline: 'মাত্র ২৪ ঘন্টার জন্য!',
    urgencyText: '🔥 শুধুমাত্র ১৫টি বাকি! দ্রুত অর্ডার করুন! 🔥',
    ctaText: '⚡ এখনই কিনুন - ৫০% OFF',
    ctaSubtext: 'অফার শেষ হতে বাকি সময়',
    videoUrl: '',
  },
  'mobile-first': {
    templateId: 'mobile-first',
    headline: 'Premium Wireless Headphones',
    subheadline: 'সহজে অর্ডার করুন মোবাইল থেকে',
    urgencyText: '✅ ফ্রি ডেলিভারি ঢাকায়',
    ctaText: 'এখনই অর্ডার করুন',
    ctaSubtext: 'ক্যাশ অন ডেলিভারি',
    videoUrl: '',
  },
  'luxury': {
    templateId: 'luxury',
    headline: 'Premium Wireless Headphones Pro',
    subheadline: 'Luxury Audio Experience',
    urgencyText: '✨ Exclusive Collection - Limited Edition',
    ctaText: 'Order Now',
    ctaSubtext: 'Premium Packaging Included',
    videoUrl: '',
  },
  'organic': {
    templateId: 'organic',
    headline: 'Eco-Friendly Premium Headphones',
    subheadline: 'Sustainable & Premium Quality',
    urgencyText: '🌿 Made with Recycled Materials',
    ctaText: 'Shop Sustainably',
    ctaSubtext: 'Carbon Neutral Delivery',
    videoUrl: '',
  },
  'modern-dark': {
    templateId: 'modern-dark',
    headline: 'Premium Wireless Headphones Pro',
    subheadline: 'Crystal-clear audio with active noise cancellation',
    urgencyText: '🔥 ৫০% ছাড় - সীমিত সময়ের অফার! 🔥',
    ctaText: '🛒 এখনই অর্ডার করুন',
    ctaSubtext: '৭ দিনের মানি ব্যাক গ্যারান্টি',
    videoUrl: '',
  },
  'minimal-light': {
    templateId: 'minimal-light',
    headline: 'Premium Wireless Headphones Pro',
    subheadline: 'Elegant design meets premium sound',
    urgencyText: '✨ Free Shipping on All Orders',
    ctaText: 'Add to Cart',
    ctaSubtext: 'Free returns within 30 days',
    videoUrl: '',
  },
  'video-focus': {
    templateId: 'video-focus',
    headline: 'Premium Wireless Headphones Pro',
    subheadline: 'Watch our demo video',
    urgencyText: '🎬 Watch Demo Video - Limited Offer!',
    ctaText: 'Buy Now - 50% OFF',
    ctaSubtext: 'Limited time only',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
};

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName: string;
  storeName: string;
  currency?: string;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  templateId,
  templateName,
  storeName,
  currency = 'BDT',
}: TemplatePreviewModalProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  
  if (!isOpen) return null;

  // Create a complete landing config for the template
  const templateConfig = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS['modern-dark'];
  
  const landingConfig: LandingConfig = {
    templateId: templateConfig.templateId || 'modern-dark',
    headline: templateConfig.headline || 'Premium Product',
    subheadline: templateConfig.subheadline || 'Best quality guaranteed',
    urgencyText: templateConfig.urgencyText || '',
    ctaText: templateConfig.ctaText || 'Order Now',
    ctaSubtext: templateConfig.ctaSubtext || '',
    videoUrl: templateConfig.videoUrl || '',
    testimonials: MOCK_TESTIMONIALS,
  };

  const TemplateComponent = getTemplateComponent(templateId);

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
              <h3 className="text-lg font-semibold text-white">Template Preview</h3>
              <p className="text-sm text-gray-400">
                Previewing: <span className="font-medium text-emerald-400">{templateName}</span>
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

        {/* Preview Content - Uses ACTUAL LandingPageTemplate */}
        <div className="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-4">
          <div 
            className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300 ${
              deviceView === 'mobile' 
                ? 'w-[375px] min-h-[667px]' 
                : 'w-full max-w-5xl'
            }`}
          >
            <div className="overflow-auto max-h-[calc(90vh-120px)]">
              {/* Render the ACTUAL LandingPageTemplate with mock data */}
              <TemplateComponent
                storeName={storeName}
                storeId={1} 
                product={MOCK_PRODUCT}
                config={landingConfig}
                currency={currency}
                isPreview={true}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            👆 This shows how the <strong>{templateName}</strong> landing page template will look on your store
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
