/**
 * Enhanced Order Form Section Preview - BD Landing Page Style
 * 
 * Features:
 * - Dual column layout
 * - Inside/Outside Dhaka delivery selection
 * - Variant selection (color, size, package)
 * - Quantity selector with +/- buttons
 * - Dynamic price calculation
 * - Theme support
 * - REAL ORDER SUBMISSION to /api/create-order
 */

import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { ShieldCheck, Truck, ArrowRight, Package, Loader2, CheckCircle } from 'lucide-react';
import type { SectionTheme } from '~/lib/page-builder/types';

interface Variant {
  id: string;
  name: string;
  price?: number;
}

interface CTAProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  nameLabel?: string;
  phonePlaceholder?: string;
  addressPlaceholder?: string;
  
  // Pricing
  productPrice?: number;
  discountedPrice?: number;
  insideDhakaCharge?: number;
  outsideDhakaCharge?: number;
  
  // Variants
  variants?: Variant[];
  variantLabel?: string;
  
  // Labels
  quantityLabel?: string;
  insideDhakaLabel?: string;
  outsideDhakaLabel?: string;
  subtotalLabel?: string;
  deliveryLabel?: string;
  totalLabel?: string;
  
  // Trust badges
  showTrustBadges?: boolean;
  codLabel?: string;
  secureLabel?: string;
}

interface CTASectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
  // Required for order submission on live pages
  storeId?: number;
  productId?: number;
}

export function CTASectionPreview({ props, theme, storeId, productId }: CTASectionPreviewProps) {
  const fetcher = useFetcher<{ success: boolean; orderId?: number; orderNumber?: string; error?: string }>();
  const navigate = useNavigate();
  
  const {
    headline = 'এখনই অর্ডার করুন',
    subheadline = 'সীমিত সময়ের জন্য বিশেষ অফার!',
    buttonText = 'অর্ডার কনফার্ম করুন',
    phonePlaceholder = 'আপনার মোবাইল নম্বর',
    addressPlaceholder = 'পূর্ণ ডেলিভারি ঠিকানা লিখুন',
    
    // Pricing
    productPrice = 1990,
    discountedPrice = 1490,
    insideDhakaCharge = 60,
    outsideDhakaCharge = 120,
    
    // Variants - demo data
    variants = [
      { id: '1', name: '১ পিস', price: 1490 },
      { id: '2', name: '২ পিস (সেভ ৳২০০)', price: 2780 },
      { id: '3', name: '৩ পিস (সেভ ৳৫০০)', price: 3970 },
    ],
    variantLabel = 'প্যাকেজ নির্বাচন করুন',
    
    // Labels
    quantityLabel = 'পরিমাণ',
    insideDhakaLabel = 'ঢাকার ভিতরে',
    outsideDhakaLabel = 'ঢাকার বাইরে',
    subtotalLabel = 'সাবটোটাল',
    deliveryLabel = 'ডেলিভারি চার্জ',
    totalLabel = 'সর্বমোট',
    
    // Trust badges
    showTrustBadges = true,
    codLabel = 'ক্যাশ অন ডেলিভারি',
    secureLabel = '১০০% সিকিউর অর্ডার',
  } = props as CTAProps;
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isInsideDhaka, setIsInsideDhaka] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Reset selectedVariant when variants prop changes
  useEffect(() => {
    setSelectedVariant(variants[0] || null);
  }, [variants]);
  
  // Handle successful order - redirect to thank-you page
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.orderId) {
      setOrderSuccess(true);
      // Redirect to thank-you page after a brief success message
      const orderId = fetcher.data.orderId;
      setTimeout(() => {
        navigate(`/thank-you/${orderId}`);
      }, 1500);
    }
  }, [fetcher.data, navigate]);
  
  // Calculate prices
  const basePrice = selectedVariant?.price || discountedPrice;
  const subtotal = basePrice * quantity;
  const deliveryCharge = isInsideDhaka ? insideDhakaCharge : outsideDhakaCharge;
  const total = subtotal + deliveryCharge;
  
  // Format price in Bengali
  const formatPrice = (price: number) => `৳${price.toLocaleString('bn-BD')}`;
  
  // Theme-based styling
  const isDark = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const getBgStyle = () => {
    if (theme?.style === 'urgent') {
      return { background: 'linear-gradient(135deg, #7F1D1D, #450A0A)' };
    }
    if (isDark) {
      return { background: 'linear-gradient(135deg, #18181B, #0A0A0B)' };
    }
    if (theme?.style === 'nature') {
      return { background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' };
    }
    return { background: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)' };
  };
  
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : (theme?.mutedTextColor || '#6B7280');
  const labelColor = isDark ? 'rgba(255,255,255,0.8)' : '#374151';
  const inputBg = isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB';
  const inputText = isDark ? '#FFFFFF' : '#111827';
  const primaryColor = theme?.primaryColor || '#6366F1';
  const accentColor = theme?.accentColor || '#8B5CF6';
  const buttonBg = theme?.buttonBg || `linear-gradient(to right, ${primaryColor}, ${accentColor})`;
  const buttonTextColor = theme?.buttonText || '#FFFFFF';
  
  return (
    <section 
      id="order-form" 
      className="py-16 px-4" 
      style={getBgStyle()}
      data-section-type="cta"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: textColor }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p style={{ color: mutedColor }} className="text-lg">{subheadline}</p>
          )}
        </div>
        
        {/* Main Order Card */}
        <div 
          className="rounded-3xl overflow-hidden"
          style={{ 
            backgroundColor: cardBg, 
            border: `2px solid ${primaryColor}40`,
            boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.15)',
          }}
        >
          <div className="grid md:grid-cols-2">
            {/* Left Column - Product & Pricing Info */}
            <div 
              className="p-8 border-b md:border-b-0 md:border-r"
              style={{ borderColor: cardBorder }}
            >
              {/* Variant Selection */}
              {variants.length > 0 && (
                <div className="mb-6">
                  <label 
                    className="block text-sm font-bold mb-3 uppercase tracking-wide"
                    style={{ color: mutedColor }}
                  >
                    {variantLabel}
                  </label>
                  <div className="space-y-2">
                    {variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: selectedVariant?.id === variant.id 
                            ? `${primaryColor}15` 
                            : inputBg,
                          border: `2px solid ${selectedVariant?.id === variant.id ? primaryColor : inputBorder}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: selectedVariant?.id === variant.id ? primaryColor : inputBorder,
                              backgroundColor: selectedVariant?.id === variant.id ? primaryColor : 'transparent',
                            }}
                          >
                            {selectedVariant?.id === variant.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-semibold" style={{ color: textColor }}>
                            {variant.name}
                          </span>
                        </div>
                        <span 
                          className="font-bold text-lg"
                          style={{ color: primaryColor }}
                        >
                          {formatPrice(variant.price || basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity Selector */}
              <div className="mb-6">
                <label 
                  className="block text-sm font-bold mb-3 uppercase tracking-wide"
                  style={{ color: mutedColor }}
                >
                  {quantityLabel}
                </label>
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: inputBg, border: `1px solid ${inputBorder}` }}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center transition-colors"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: '#FFFFFF',
                    }}
                  >
                    −
                  </button>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: textColor }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center transition-colors"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: '#FFFFFF',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Price Breakdown */}
              <div 
                className="p-5 rounded-xl space-y-3"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }}
              >
                <div className="flex justify-between">
                  <span style={{ color: mutedColor }}>{subtotalLabel}</span>
                  <span className="font-semibold" style={{ color: textColor }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: mutedColor }}>{deliveryLabel}</span>
                  <span className="font-semibold" style={{ color: textColor }}>{formatPrice(deliveryCharge)}</span>
                </div>
                <div 
                  className="flex justify-between pt-3 border-t"
                  style={{ borderColor: cardBorder }}
                >
                  <span className="font-bold text-lg" style={{ color: textColor }}>{totalLabel}</span>
                  <span 
                    className="font-bold text-2xl"
                    style={{ color: primaryColor }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              
              {/* Trust Badges */}
              {showTrustBadges && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <div 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#D1FAE5',
                      color: '#059669',
                    }}
                  >
                    <ShieldCheck size={14} />
                    {secureLabel}
                  </div>
                  <div 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#DBEAFE',
                      color: '#2563EB',
                    }}
                  >
                    <Truck size={14} />
                    {codLabel}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column - Order Form */}
            <div className="p-8">
              {/* Success Message */}
              {orderSuccess && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={64} className="text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    অর্ডার সফল হয়েছে! 🎉
                  </h3>
                  <p className="text-gray-600">আপনাকে ধন্যবাদ পেজে নিয়ে যাওয়া হচ্ছে...</p>
                </div>
              )}
              
              {/* Error Message */}
              {fetcher.data?.error && !orderSuccess && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {fetcher.data.error}
                </div>
              )}
              
              {/* Order Form - hide when success */}
              {!orderSuccess && (
                <fetcher.Form 
                  method="post" 
                  action="/api/create-order"
                  className="space-y-4"
                >
                  {/* Hidden inputs for API */}
                  <input type="hidden" name="store_id" value={storeId || ''} />
                  <input type="hidden" name="product_id" value={productId || ''} />
                  <input type="hidden" name="quantity" value={quantity} />
                  <input type="hidden" name="division" value={isInsideDhaka ? 'dhaka' : 'outside_dhaka'} />
                  {selectedVariant?.id && (
                    <input type="hidden" name="variant_id" value={selectedVariant.id} />
                  )}
                  
                  {/* Name Input */}
                  <div>
                    <input
                      type="text"
                      name="customer_name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="আপনার নাম"
                      className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400"
                      style={{ 
                        backgroundColor: inputBg, 
                        border: `2px solid ${inputBorder}`,
                        color: inputText,
                      }}
                      required
                      disabled={fetcher.state !== 'idle'}
                    />
                  </div>
                  
                  {/* Phone Input */}
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={phonePlaceholder}
                      className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400"
                      style={{ 
                        backgroundColor: inputBg, 
                        border: `2px solid ${inputBorder}`,
                        color: inputText,
                      }}
                      required
                      disabled={fetcher.state !== 'idle'}
                    />
                  </div>
                  
                  {/* Delivery Location - Dual Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsInsideDhaka(true)}
                      className="py-3 sm:py-4 px-3 rounded-xl font-bold transition-all flex items-center justify-between sm:justify-center gap-2"
                      style={{
                        backgroundColor: isInsideDhaka ? primaryColor : inputBg,
                        color: isInsideDhaka ? '#FFFFFF' : textColor,
                        border: `2px solid ${isInsideDhaka ? primaryColor : inputBorder}`,
                      }}
                      disabled={fetcher.state !== 'idle'}
                    >
                      <div className="flex items-center gap-2">
                        <Package size={16} className="flex-shrink-0" />
                        <span className="text-sm sm:text-base">{insideDhakaLabel}</span>
                      </div>
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0"
                        style={{ 
                          backgroundColor: isInsideDhaka ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`,
                          color: isInsideDhaka ? '#FFFFFF' : primaryColor,
                        }}
                      >
                        ৳{insideDhakaCharge}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInsideDhaka(false)}
                      className="py-3 sm:py-4 px-3 rounded-xl font-bold transition-all flex items-center justify-between sm:justify-center gap-2"
                      style={{
                        backgroundColor: !isInsideDhaka ? primaryColor : inputBg,
                        color: !isInsideDhaka ? '#FFFFFF' : textColor,
                        border: `2px solid ${!isInsideDhaka ? primaryColor : inputBorder}`,
                      }}
                      disabled={fetcher.state !== 'idle'}
                    >
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="flex-shrink-0" />
                        <span className="text-sm sm:text-base">{outsideDhakaLabel}</span>
                      </div>
                      <span 
                        className="text-xs px-2 py-1 rounded-full font-bold flex-shrink-0"
                        style={{ 
                          backgroundColor: !isInsideDhaka ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`,
                          color: !isInsideDhaka ? '#FFFFFF' : primaryColor,
                        }}
                      >
                        ৳{outsideDhakaCharge}
                      </span>
                    </button>
                  </div>
                  
                  {/* Address Input */}
                  <div>
                    <textarea
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={addressPlaceholder}
                      rows={3}
                      className="w-full px-5 py-4 rounded-xl font-medium outline-none resize-none transition-all focus:ring-2 focus:ring-purple-400"
                      style={{ 
                        backgroundColor: inputBg, 
                        border: `2px solid ${inputBorder}`,
                        color: inputText,
                      }}
                      required
                      disabled={fetcher.state !== 'idle'}
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={fetcher.state !== 'idle' || !storeId || !productId}
                    className="w-full py-5 font-bold text-xl rounded-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ 
                      background: buttonBg,
                      color: buttonTextColor,
                    }}
                  >
                    {fetcher.state !== 'idle' ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        <span>অর্ডার প্রক্রিয়াকরণ হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        {buttonText}
                        <ArrowRight size={22} className="animate-pulse" />
                      </>
                    )}
                  </button>
                  
                  {/* Security Note */}
                  <p 
                    className="text-center text-xs"
                    style={{ color: mutedColor }}
                  >
                    🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ থাকবে
                  </p>
                </fetcher.Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
