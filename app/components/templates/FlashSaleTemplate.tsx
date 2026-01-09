/**
 * Flash Sale Template - High Urgency Sales Page
 * 
 * Features:
 * - Sticky countdown timer bar
 * - Shake/Pulse animations on CTA
 * - Stock counter with progress bar
 * - Compact layout: Hero -> Timer -> Product -> Form
 * - Theme: Red, Yellow, Black
 */

import { useFetcher } from '@remix-run/react';
import { useState, useEffect, useCallback } from 'react';
import type { LandingConfig, ManualPaymentConfig } from '@db/types';
import { OptimizedImage } from '~/components/OptimizedImage';
import { Clock, ShoppingCart, Truck, Shield, AlertTriangle, CheckCircle2, Phone, User, MapPin, Package, Flame, Star, Zap } from 'lucide-react';
import { BD_DIVISIONS, DEFAULT_SHIPPING_CONFIG, calculateShipping } from '~/utils/shipping';
import { useCartTracking } from '~/hooks/useCartTracking';
import { OrderBumpsContainer } from '~/components/landing/OrderBumpCheckbox';

// Helper to check if section should be visible
const isSectionVisible = (sectionId: string, hiddenSections?: string[]): boolean => {
  if (!hiddenSections || hiddenSections.length === 0) return true;
  return !hiddenSections.includes(sectionId);
};

// ============================================================================
// COUNTDOWN TIMER HOOK
// ============================================================================
function useCountdown(endTime: Date | null) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    // If no end time provided, show expired state (don't default to 24h)
    if (!endTime) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = endTime.getTime();
      const difference = end - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
}

// ============================================================================
// TYPES
// ============================================================================
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  inventory?: number;
}

interface FlashSaleTemplateProps {
  storeName: string;
  storeId: number;
  product: SerializedProduct;
  config: LandingConfig;
  currency: string;
  flashSaleEndTime?: string | null;
  initialStock?: number;
  isPreview?: boolean;
  manualPaymentConfig?: ManualPaymentConfig | null;
}

// ============================================================================
// COMPONENT
// ============================================================================
import { PaymentMethodSelector } from '~/components/checkout/PaymentMethodSelector';

// ... (existing imports)

export function FlashSaleTemplate({
  storeName,
  storeId,
  product,
  config,
  currency,
  flashSaleEndTime = null, // deprecated, use config.countdownEndTime
  initialStock = 15,
  isPreview = false,
  manualPaymentConfig,
}: FlashSaleTemplateProps) {
  const fetcher = useFetcher<{ success: boolean; orderNumber?: string; error?: string }>();
  
  // Use countdownEndTime from config, fallback to flashSaleEndTime prop for backwards compatibility
  const endTimeStr = config.countdownEndTime || flashSaleEndTime;
  const countdown = useCountdown(endTimeStr ? new Date(endTimeStr) : null);
  
  // Cart tracking for abandoned cart recovery
  const { trackCart } = useCartTracking(storeId || product.storeId, product.id);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    division: 'dhaka',
    quantity: 1,
    paymentMethod: 'cod',
    transactionId: '',
    senderNumber: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Track cart when form data changes (for abandoned cart recovery)
  useEffect(() => {
    if (formData.phone || formData.name) {
      trackCart({
        customer_name: formData.name,
        customer_phone: formData.phone,
        quantity: formData.quantity,
      });
    }
  }, [formData.name, formData.phone, formData.quantity, trackCart]);
  
  const isSubmitting = fetcher.state === 'submitting';
  const isSuccess = fetcher.data?.success;
  const hasError = fetcher.data?.error;
  
  // Selected order bump IDs
  const [selectedBumpIds, setSelectedBumpIds] = useState<number[]>([]);

  // Calculate price
  const price = product.price;
  const comparePrice = product.compareAtPrice || price * 1.5;
  const discount = Math.round(((comparePrice - price) / comparePrice) * 100);

  // Calculate shipping based on division
  const subtotal = price * formData.quantity;
  const shippingInfo = calculateShipping(DEFAULT_SHIPPING_CONFIG, formData.division, subtotal);
  
  // Calculate bump products total
  const orderBumps = (config as any).orderBumps || [];
  const bumpTotal = selectedBumpIds.reduce((total, bumpId) => {
    const bump = orderBumps.find((b: any) => b.id === bumpId);
    if (!bump) return total;
    const originalPrice = bump.bumpProduct.price;
    const discountedPrice = bump.discount > 0 
      ? originalPrice * (1 - bump.discount / 100) 
      : originalPrice;
    return total + discountedPrice;
  }, 0);
  
  const grandTotal = subtotal + bumpTotal + shippingInfo.cost;

  // Form validation
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2) {
      errors.name = 'নাম দিন';
    }
    if (!formData.phone || !/^01[3-9]\d{8}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'সঠিক মোবাইল নম্বর দিন';
    }
    if (!formData.address || formData.address.length < 10) {
      errors.address = 'সম্পূর্ণ ঠিকানা দিন';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle submit
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || countdown.expired) return;
    if (!validateForm()) return;

    const submitData: Record<string, string> = {
      store_id: String(storeId || product.storeId),
      product_id: String(product.id),
      customer_name: formData.name,
      phone: formData.phone,
      address: formData.address,
      division: formData.division,
      quantity: String(formData.quantity),
      payment_method: formData.paymentMethod,
      transaction_id: formData.transactionId,
      manual_payment_details: JSON.stringify({
        senderNumber: formData.senderNumber,
        method: formData.paymentMethod,
      }),
    };
    
    if (selectedBumpIds.length > 0) {
      submitData.bump_ids = JSON.stringify(selectedBumpIds);
    }

    fetcher.submit(submitData, { method: 'POST', action: '/api/create-order', encType: 'application/json' });
  }, [isPreview, countdown.expired, formData, selectedBumpIds, validateForm, fetcher, storeId, product]);

  // Handle input change
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ================================================================
          STICKY COUNTDOWN TIMER BAR
          ================================================================ */}
      <div className={`${isPreview ? 'sticky' : 'fixed'} top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 py-2 shadow-lg`}>
        <div className="max-w-4xl mx-auto px-4">
          {countdown.expired ? (
            <div className="flex items-center justify-center gap-2 text-white font-bold text-lg">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              অফার শেষ হয়ে গেছে!
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="font-bold text-sm md:text-base">⚡ অফার শেষ হবে:</span>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="bg-black/30 px-2 py-1 rounded text-center min-w-[40px]">
                  <span className="font-mono font-bold text-lg md:text-xl">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="text-xs block -mt-1">ঘণ্টা</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-black/30 px-2 py-1 rounded text-center min-w-[40px]">
                  <span className="font-mono font-bold text-lg md:text-xl">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="text-xs block -mt-1">মিনিট</span>
                </div>
                <span className="text-xl font-bold">:</span>
                <div className="bg-black/30 px-2 py-1 rounded text-center min-w-[40px]">
                  <span className="font-mono font-bold text-lg md:text-xl animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="text-xs block -mt-1">সেকেন্ড</span>
                </div>
              </div>
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Spacer for fixed offer banner - matches banner height */}
      {!isPreview && <div className="h-11 md:h-[50px]" />}

      {/* ================================================================
          HERO SECTION - COMPACT
          ================================================================ */}
      <section className="bg-gradient-to-b from-red-900 to-black py-6 md:py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Flash Sale Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-black font-bold px-4 py-2 rounded-full mb-4 animate-bounce">
            <Flame className="w-5 h-5" />
            ⚡ ফ্ল্যাশ সেল - {discount}% ছাড়!
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-2 px-2 leading-tight">
            {config.headline || product.title}
          </h1>
          <p className="text-yellow-400 text-base sm:text-lg md:text-xl font-semibold px-2">
            {config.subheadline || 'সীমিত সময়ের জন্য বিশেষ অফার!'}
          </p>
        </div>
      </section>

      {/* ================================================================
          PRODUCT IMAGE + PRICE
          ================================================================ */}
      <section className="bg-gray-900 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative">
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 z-10 bg-red-600 text-white font-bold px-3 py-2 rounded-lg text-xl animate-pulse">
              -{discount}%
            </div>
            
            {/* Product Image */}
            <div className="rounded-2xl overflow-hidden border-4 border-red-600 shadow-2xl shadow-red-600/30">
              {product.imageUrl ? (
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full aspect-square object-cover"
                  width={600}
                  height={600}
                />
              ) : (
                <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Price Display */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-500 line-through text-2xl">৳{comparePrice.toLocaleString()}</span>
              <span className="text-4xl md:text-5xl font-extrabold text-yellow-400">৳{price.toLocaleString()}</span>
            </div>
            <p className="text-green-400 font-semibold mt-2">
              ✅ আপনি বাঁচাবেন ৳{(comparePrice - price).toLocaleString()}!
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          URGENCY MESSAGE - STOCK LIMITED
          ================================================================ */}
      <section className="bg-black py-4 border-y border-red-600">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-red-900/50 to-yellow-900/50 rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className="text-xl font-bold text-yellow-400">
                ⚠️ স্টক সীমিত! এখনই অর্ডার করুন!
              </span>
              <AlertTriangle className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BADGES SECTION - Flash Sale Style */}
      {isSectionVisible('trust', config.hiddenSections) && (
        <section className="bg-gray-950 py-8 border-y border-gray-800">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors">
                <div className="text-2xl mb-2">🚚</div>
                <h4 className="text-white font-bold text-sm">ফ্রি ডেলিভারি</h4>
                <p className="text-gray-500 text-xs mt-1">ঢাকার ভেতরে</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors">
                <div className="text-2xl mb-2">💯</div>
                <h4 className="text-white font-bold text-sm">অরিজিনাল পণ্য</h4>
                <p className="text-gray-500 text-xs mt-1">১০০% গ্যারান্টি</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors">
                <div className="text-2xl mb-2">💵</div>
                <h4 className="text-white font-bold text-sm">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-gray-500 text-xs mt-1">হাতে পেয়ে পেমেন্ট</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors">
                <div className="text-2xl mb-2">🔄</div>
                <h4 className="text-white font-bold text-sm">সহজ রিটার্ন</h4>
                <p className="text-gray-500 text-xs mt-1">৭ দিনের পলিসি</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURES SECTION - Flash Sale Style */}
      {isSectionVisible('features', config.hiddenSections) && config.features && config.features.length > 0 && (
        <section className="bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              <span className="text-yellow-400">⚡</span> পণ্যের বৈশিষ্ট্য <span className="text-yellow-400">⚡</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.features.map((feature, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-start gap-3 hover:border-yellow-500/30 transition-colors">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h4 className="font-bold text-white">{feature.title}</h4>
                    {feature.description && (
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VIDEO SECTION - Flash Sale Style */}
      {isSectionVisible('video', config.hiddenSections) && config.videoUrl && (
        <section className="bg-black py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              🎬 ভিডিওতে দেখুন
            </h3>
            <div className="aspect-video rounded-xl overflow-hidden border-2 border-yellow-500/30 shadow-lg shadow-yellow-500/10">
              {config.videoUrl.includes('youtube.com') || config.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={config.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title="Product Video"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={config.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY SECTION - Flash Sale Style */}
      {isSectionVisible('delivery', config.hiddenSections) && (
        <section className="bg-gray-950 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              🚚 ডেলিভারি তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-green-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏙️</span>
                  <div>
                    <h4 className="font-bold text-white">ঢাকার ভেতরে</h4>
                    <p className="text-green-400 text-sm font-medium">২৪-৪৮ ঘণ্টা</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>✓ ডেলিভারি চার্জ: ৳৬০</li>
                  <li>✓ সেম-ডে ডেলিভারি সম্ভব</li>
                  <li>✓ ক্যাশ অন ডেলিভারি</li>
                </ul>
              </div>
              <div className="bg-gray-800 border border-blue-500/30 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h4 className="font-bold text-white">ঢাকার বাইরে</h4>
                    <p className="text-blue-400 text-sm font-medium">২-৩ দিন</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>✓ ডেলিভারি চার্জ: ৳১২০</li>
                  <li>✓ সারাদেশে ডেলিভারি</li>
                  <li>✓ কুরিয়ার সার্ভিস</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY SECTION - Flash Sale Style */}
      {isSectionVisible('gallery', config.hiddenSections) && config.galleryImages && config.galleryImages.length > 0 && (
        <section className="bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              <span className="text-yellow-400">📸</span> পণ্যের ছবি <span className="text-yellow-400">📸</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {config.galleryImages.slice(0, 8).map((url, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden border-2 border-yellow-500/30">
                  <OptimizedImage 
                    src={url} 
                    alt={`Photo ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BENEFITS SECTION - Flash Sale Style */}
      {isSectionVisible('benefits', config.hiddenSections) && config.benefits && config.benefits.length > 0 && (
        <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              <span className="text-green-400">✓</span> কেন কিনবেন? <span className="text-green-400">✓</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.benefits.map((benefit, idx) => (
                <div key={idx} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-2xl">{benefit.icon}</span>
                  <div>
                    <h4 className="font-bold text-white">{benefit.title}</h4>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMPARISON SECTION - Flash Sale Style */}
      {isSectionVisible('comparison', config.hiddenSections) && config.comparison && (config.comparison.beforeImage || config.comparison.afterImage) && (
        <section className="bg-gradient-to-b from-gray-950 to-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-xl font-bold text-white text-center mb-2">
              <span className="text-red-500">🔄</span> দেখুন পার্থক্য <span className="text-red-500">🔄</span>
            </h3>
            {config.comparison.description && (
              <p className="text-gray-400 text-center mb-6 text-sm">{config.comparison.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4">
              {config.comparison.beforeImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-red-500/50 mb-3">
                    <img 
                      src={config.comparison.beforeImage} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="inline-block px-3 py-1 bg-red-600 text-white font-bold text-sm rounded-full">
                    ❌ {config.comparison.beforeLabel || 'আগে'}
                  </span>
                </div>
              )}
              {config.comparison.afterImage && (
                <div className="text-center">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-green-500/50 mb-3">
                    <img 
                      src={config.comparison.afterImage} 
                      alt="After" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-600 text-white font-bold text-sm rounded-full">
                    ✅ {config.comparison.afterLabel || 'পরে'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF SECTION - Flash Sale Style */}
      {isSectionVisible('social', config.hiddenSections) && config.socialProof && (config.socialProof.count > 0 || config.socialProof.text) && (
        <section className="bg-gradient-to-r from-red-600 to-orange-500 py-4">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 text-white">
              <span className="text-3xl md:text-4xl font-bold">{config.socialProof.count}+</span>
              <span className="text-lg md:text-xl">{config.socialProof.text}</span>
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS - Screenshot Gallery Flash Sale Style */}
      {isSectionVisible('testimonials', config.hiddenSections) && config.testimonials && config.testimonials.length > 0 && (
        <section className="bg-gray-950 py-8 px-4">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            <span className="text-yellow-400">⭐</span> সন্তুষ্ট গ্রাহকদের রিভিউ <span className="text-yellow-400">⭐</span>
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide md:justify-center">
            {config.testimonials.slice(0, 3).map((testimonial, idx) => (
              <div key={idx} className="flex-shrink-0 w-40 md:w-48 snap-center">
                {(testimonial.imageUrl || testimonial.avatar) && (
                  <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <img 
                      src={testimonial.imageUrl || testimonial.avatar} 
                      alt={`Review ${idx + 1}`} 
                      className="w-full aspect-[2/3] object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ - Flash Sale Style */}
      {isSectionVisible('faq', config.hiddenSections) && config.faq && config.faq.length > 0 && (
        <section className="bg-black py-8 px-4">
          <h3 className="text-xl font-bold text-white text-center mb-6">❓ সচরাচর জিজ্ঞাসা</h3>
          <div className="max-w-md mx-auto space-y-3">
            {config.faq.map((item, idx) => (
              <details key={idx} className="group bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                <summary className="p-4 cursor-pointer flex items-center justify-between text-white text-sm font-medium">
                  <span className="pr-4">{item.question}</span>
                  <span className="text-yellow-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* GUARANTEE - Urgency Style */}
      {isSectionVisible('guarantee', config.hiddenSections) && config.guaranteeText && (
        <section className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 py-6 px-4 text-center border-y border-green-500/30">
          <div className="flex items-center justify-center gap-2 text-green-400 font-bold mb-2">
            <Shield size={20} />
            <span>১০০% গ্যারান্টি</span>
          </div>
          <p className="text-green-300 text-sm">{config.guaranteeText}</p>
        </section>
      )}
      {/* ================================================================
          ORDER FORM - FULL WIDTH 2-COLUMN
          ================================================================ */}
      <section id="order-form" className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8">
            🛒 এখনই অর্ডার করুন
          </h2>

          {isSuccess ? (
            <div className="max-w-lg mx-auto bg-green-900/50 border-2 border-green-500 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">অর্ডার সফল হয়েছে! 🎉</h3>
              <p className="text-gray-300">
                অর্ডার নম্বর: <span className="font-bold text-white">{fetcher.data?.orderNumber}</span>
              </p>
              <p className="text-sm text-gray-400 mt-2">শীঘ্রই কল করে কনফার্ম করা হবে।</p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-2xl p-6 md:p-10 border border-gray-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column - Product Info */}
                <div className="space-y-6">
                  {/* Product Summary */}
                  <div className="bg-gradient-to-br from-red-900/30 to-yellow-900/30 rounded-2xl p-6 border border-red-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-24 h-24 bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                        {product.imageUrl && (
                          <OptimizedImage
                            src={product.imageUrl}
                            alt={product.title}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-xl">{product.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-yellow-400 font-black text-3xl">৳{product.price?.toLocaleString()}</span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-gray-500 line-through text-lg">৳{product.compareAtPrice?.toLocaleString()}</span>
                          )}
                        </div>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="inline-block mt-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Urgency Notice */}
                  <div className="bg-red-900/50 border-2 border-red-500 rounded-xl p-4 text-center animate-pulse">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-yellow-400 font-bold">⚠️ স্টক সীমিত! মাত্র {product.inventory || 10}টি বাকি</p>
                  </div>

                  {/* Trust Badges - Sale Style */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700/50 rounded-xl p-4 flex items-center gap-3 border border-gray-600">
                      <span className="text-2xl">🔥</span>
                      <div>
                        <p className="font-bold text-white text-sm">ফ্ল্যাশ সেল</p>
                        <p className="text-xs text-gray-400">সীমিত সময়</p>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 flex items-center gap-3 border border-gray-600">
                      <span className="text-2xl">🚚</span>
                      <div>
                        <p className="font-bold text-white text-sm">দ্রুত ডেলিভারি</p>
                        <p className="text-xs text-gray-400">২৪-৪৮ ঘণ্টা</p>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 flex items-center gap-3 border border-gray-600">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="font-bold text-white text-sm">ক্যাশ অন ডেলিভারি</p>
                        <p className="text-xs text-gray-400">হাতে পেয়ে পেমেন্ট</p>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 rounded-xl p-4 flex items-center gap-3 border border-gray-600">
                      <span className="text-2xl">✅</span>
                      <div>
                        <p className="font-bold text-white text-sm">ওয়ারেন্টি</p>
                        <p className="text-xs text-gray-400">১০০% অরিজিনাল</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Form */}
                <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <User className="w-4 h-4" /> আপনার নাম
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base ${
                    formErrors.name ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <Phone className="w-4 h-4" /> মোবাইল নম্বর
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <MapPin className="w-4 h-4" /> সম্পূর্ণ ঠিকানা
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="বাসা/হোল্ডিং, রোড, এলাকা, থানা, জেলা"
                  rows={2}
                  className={`w-full px-4 py-3 bg-gray-800 border-2 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none text-base ${
                    formErrors.address ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {formErrors.address && <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>}
              </div>

              {/* Division */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <Truck className="w-4 h-4" /> ডেলিভারি এলাকা
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => handleInputChange('division', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {BD_DIVISIONS.map((div) => (
                    <option key={div.value} value={div.value}>
                      {div.label}
                    </option>
                  ))}
                </select>
                {/* Show shipping cost */}
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-400">ডেলিভারি চার্জ ({shippingInfo.label}):</span>
                  <span className={shippingInfo.isFree ? 'text-green-400' : 'text-yellow-400'}>
                    {shippingInfo.isFree ? 'ফ্রি!' : `৳${shippingInfo.cost}`}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm mb-1">
                  <Package className="w-4 h-4" /> পরিমাণ
                </label>
                <div className="flex items-center gap-4 bg-gray-800 border-2 border-gray-700 rounded-xl p-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('quantity', Math.max(1, formData.quantity - 1))}
                    className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-700 rounded-lg text-white font-bold text-xl sm:text-base hover:bg-gray-600 active:scale-95 transition"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white flex-1 text-center">{formData.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('quantity', Math.min(5, formData.quantity + 1))}
                    className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-700 rounded-lg text-white font-bold text-xl sm:text-base hover:bg-gray-600 active:scale-95 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 
               * TODO: bKash/Nagad Payment - Next Phase
               * Uncomment when ready to release manual payment feature
               */}
              {/* {manualPaymentConfig && (
                <div className="pt-2">
                  <PaymentMethodSelector
                    config={manualPaymentConfig}
                    selectedMethod={formData.paymentMethod}
                    onMethodChange={(method) => handleInputChange('paymentMethod', method)}
                    onTransactionIdChange={(id) => handleInputChange('transactionId', id)}
                    onSenderNumberChange={(num) => handleInputChange('senderNumber', num)}
                  />
                </div>
              )} */}

              {/* Error Message */}
              {hasError && (
                <div className="bg-red-900/50 border border-red-500 rounded-xl p-3 text-red-400 text-sm">
                  ❌ {fetcher.data?.error}
                </div>
              )}

              {/* Submit Button - SHAKE ANIMATION */}
              <button
                type="submit"
                disabled={isSubmitting || countdown.expired || isPreview}
                className={`
                  w-full py-5 rounded-2xl text-xl font-extrabold
                  bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500
                  text-black shadow-lg shadow-yellow-500/30
                  hover:from-yellow-300 hover:via-yellow-400 hover:to-orange-400
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform transition-all
                  ${!isSubmitting && !countdown.expired ? 'animate-[shake_2s_ease-in-out_infinite]' : ''}
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    প্রসেসিং...
                  </span>
                ) : countdown.expired ? (
                  'অফার শেষ হয়ে গেছে'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    এখনই অর্ডার করুন - ৳{grandTotal.toLocaleString()}
                  </span>
                )}
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 pt-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-green-400" /> ফ্রি ডেলিভারি
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-400" /> নিরাপদ পেমেন্ট
                </span>
              </div>
            </form>
            </div>
            </div>
            </div>
          )}
        </div>
      </section>


      {/* ================================================================
          FOOTER - MINIMAL
          ================================================================ */}
      <footer className="bg-black py-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Sticky Footer - Hidden in preview mode */}
      {!isPreview && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black border-t border-gray-800 p-3 shadow-2xl safe-area-pb">
          <a
            href="#order-form"
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse"
          >
            <Zap size={20} /> অর্ডার করুন — ৳{grandTotal.toLocaleString()}
          </a>
        </div>
      )}

      {/* Footer Spacer for Mobile */}
      <div className="md:hidden h-20" />

      {/* WhatsApp Floating Button */}
      {config.whatsappEnabled && config.whatsappNumber && !isPreview && (
        <a
          href={`https://wa.me/${config.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(config.whatsappMessage || `Hi, I'm interested in this flash sale product!`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 md:bottom-8 right-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      )}

      {/* Call Floating Button */}
      {config.callEnabled && config.callNumber && !isPreview && (
        <a
          href={`tel:${config.callNumber}`}
          className="fixed bottom-24 md:bottom-8 left-4 z-40 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 animate-bounce"
          title="কল করুন"
        >
          <Phone className="w-7 h-7 text-white" />
        </a>
      )}

      {/* ================================================================
          CSS KEYFRAMES FOR SHAKE ANIMATION
          ================================================================ */}
      <style>{`
        @keyframes shake {
          0%, 50%, 100% { transform: translateX(0); }
          5%, 15%, 25%, 35%, 45% { transform: translateX(-2px); }
          10%, 20%, 30%, 40% { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}

export default FlashSaleTemplate;
