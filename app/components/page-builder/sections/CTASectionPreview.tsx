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

import { useState, useEffect, useMemo } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { ShieldCheck, Truck, ArrowRight, Package, Loader2, CheckCircle, MapPin, ChevronDown } from 'lucide-react';
import type { SectionTheme } from '~/lib/page-builder/types';
import { 
  DISTRICTS, 
  getUpazilasByDistrict, 
  getShippingZone,
  type District,
  type Upazila 
} from '~/data/bd-locations';

interface Variant {
  id: string;
  name: string;
  price?: number;
}

interface CTAProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  template?: 'minimal' | 'premium' | 'urgent' | 'singleColumn' | 'withImage';
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
  
  // BD Address System
  showDistrictField?: boolean;
  showUpazilaField?: boolean;
  districtLabel?: string;
  upazilaLabel?: string;
  addressLabel?: string;
  districtPlaceholder?: string;
  upazilaPlaceholder?: string;
  shippingZoneMode?: 'auto' | 'manual';
  
  // Trust badges
  showTrustBadges?: boolean;
  codLabel?: string;
  secureLabel?: string;
}

// Product data passed from page loader
interface ProductInfo {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description?: string | null;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

interface CTASectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
  // Required for order submission on live pages
  storeId?: number;
  productId?: number;
  product?: ProductInfo | null;
}

export function CTASectionPreview({ props, theme, storeId, productId, product }: CTASectionPreviewProps) {
  const fetcher = useFetcher<{ success: boolean; orderId?: number; orderNumber?: string; error?: string }>();
  const navigate = useNavigate();
  
  const {
    headline = 'এখনই অর্ডার করুন',
    subheadline = 'সীমিত সময়ের জন্য বিশেষ অফার!',
    buttonText = 'অর্ডার কনফার্ম করুন',
    template = 'minimal' as 'minimal' | 'premium' | 'urgent' | 'singleColumn' | 'withImage',
    phonePlaceholder = 'আপনার মোবাইল নম্বর',
    addressPlaceholder = 'বাসা নম্বর, রোড, এলাকা',
    
    // Pricing (fallbacks when no product selected)
    productPrice = 1990,
    discountedPrice = 1490,
    insideDhakaCharge = 60,
    outsideDhakaCharge = 120,
    
    // Variants - demo data (used when no product has variants)
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
    
    // BD Address System
    showDistrictField = true,
    showUpazilaField = true,
    districtLabel = 'জেলা',
    upazilaLabel = 'উপজেলা/থানা',
    addressLabel = 'বিস্তারিত ঠিকানা',
    districtPlaceholder = 'জেলা নির্বাচন করুন',
    upazilaPlaceholder = 'উপজেলা নির্বাচন করুন',
    shippingZoneMode = 'auto' as 'auto' | 'manual',
    
    // Trust badges
    showTrustBadges = true,
    codLabel = 'ক্যাশ অন ডেলিভারি',
    secureLabel = '১০০% সিকিউর অর্ডার',
  } = props as CTAProps;
  
  // Use product data if available, otherwise use prop defaults
  const actualPrice = product?.price ?? discountedPrice;
  const actualComparePrice = product?.compareAtPrice ?? productPrice;
  const actualVariants = (product?.variants && product.variants.length > 0) 
    ? product.variants.map(v => ({ id: String(v.id), name: v.name, price: v.price }))
    : variants;
  const productImage = product?.images?.[0] || null;
  const productTitle = product?.title || null;
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [address, setAddress] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(actualVariants[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isInsideDhaka, setIsInsideDhaka] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  // Honeypot for spam protection (hidden field)
  const [honeypot, setHoneypot] = useState('');
  
  // BD Phone validation
  const validateBDPhone = (value: string): boolean => {
    const cleaned = value.replace(/[\s-]/g, '');
    // BD phone: 01XXXXXXXXX (11 digits starting with 01)
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    return bdPhoneRegex.test(cleaned);
  };
  
  const handlePhoneChange = (value: string) => {
    // Only allow numbers and common separators
    const cleanedValue = value.replace(/[^0-9\s-]/g, '');
    setPhone(cleanedValue);
    
    // Validate only if user has entered something
    if (cleanedValue.length > 0) {
      const cleaned = cleanedValue.replace(/[\s-]/g, '');
      if (cleaned.length >= 11) {
        if (!validateBDPhone(cleanedValue)) {
          setPhoneError('সঠিক নম্বর দিন (01XXXXXXXXX)');
        } else {
          setPhoneError('');
        }
      } else if (cleaned.length > 3 && !cleaned.startsWith('01')) {
        setPhoneError('নম্বর 01 দিয়ে শুরু করুন');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };
  
  // BD Address state
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState('');
  
  // Get upazilas for selected district
  const availableUpazilas = useMemo(() => {
    if (!selectedDistrictId) return [];
    return getUpazilasByDistrict(selectedDistrictId);
  }, [selectedDistrictId]);
  
  // Reset upazila when district changes
  useEffect(() => {
    setSelectedUpazilaId('');
  }, [selectedDistrictId]);
  
  // Calculate shipping zone from district (auto mode)
  const calculatedShippingZone = useMemo(() => {
    if (shippingZoneMode === 'manual') {
      return isInsideDhaka ? 'dhaka' : 'outside';
    }
    // Auto mode: calculate from district
    if (!selectedDistrictId) return 'dhaka'; // Default to dhaka if not selected
    return getShippingZone(selectedDistrictId);
  }, [shippingZoneMode, selectedDistrictId, isInsideDhaka]);
  
  // Get selected district name for display
  const selectedDistrict = useMemo(() => {
    return DISTRICTS.find(d => d.id === selectedDistrictId);
  }, [selectedDistrictId]);
  
  // Reset selectedVariant when variants change (including product change)
  useEffect(() => {
    setSelectedVariant(actualVariants[0] || null);
  }, [product?.id, actualVariants.length]);
  
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
  
  // Calculate prices using actual product price or selected variant
  const basePrice = selectedVariant?.price || actualPrice;
  const subtotal = basePrice * quantity;
  // Use calculated shipping zone for delivery charge
  const deliveryCharge = calculatedShippingZone === 'dhaka' ? insideDhakaCharge : outsideDhakaCharge;
  const total = subtotal + deliveryCharge;
  
  // Format price in Bengali
  const formatPrice = (price: number) => `৳${price.toLocaleString('bn-BD')}`;
  
  // Theme-based styling with template variations
  const isUrgentTemplate = template === 'urgent';
  const isPremiumTemplate = template === 'premium';
  const isDark = isUrgentTemplate || isPremiumTemplate || theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark';
  
  const getBgStyle = () => {
    // Template-specific backgrounds
    if (isUrgentTemplate) {
      return { background: 'linear-gradient(135deg, #DC2626, #7F1D1D)' };
    }
    if (isPremiumTemplate) {
      return { background: 'linear-gradient(135deg, #1E1B4B, #312E81)' };
    }
    // Theme-based fallbacks
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
  
  // Template-specific button styles
  const primaryColor = isUrgentTemplate ? '#DC2626' : (isPremiumTemplate ? '#6366F1' : (theme?.primaryColor || '#6366F1'));
  const accentColor = isUrgentTemplate ? '#EF4444' : (isPremiumTemplate ? '#8B5CF6' : (theme?.accentColor || '#8B5CF6'));
  const buttonBg = isUrgentTemplate 
    ? 'linear-gradient(to right, #DC2626, #EF4444)'
    : (isPremiumTemplate ? 'linear-gradient(to right, #6366F1, #A855F7)' : (theme?.buttonBg || `linear-gradient(to right, ${primaryColor}, ${accentColor})`));
  const buttonTextColor = theme?.buttonText || '#FFFFFF';
  
  // Template-specific layout
  const isSingleColumn = template === 'singleColumn';
  const showProductImage = template === 'withImage' && productImage;
  
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
          <div className={`grid ${isSingleColumn ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            {/* Left Column - Product & Pricing Info */}
            <div 
              className="p-8 border-b md:border-b-0 md:border-r"
              style={{ borderColor: cardBorder }}
            >
              {/* Product Image & Title */}
              {productImage && (
                <div className="mb-6 text-center">
                  <img 
                    src={productImage} 
                    alt={productTitle || 'প্রোডাক্ট'} 
                    className="w-full max-w-[200px] mx-auto rounded-xl shadow-lg mb-4 object-cover aspect-square"
                  />
                  {productTitle && (
                    <h3 
                      className="text-lg font-bold"
                      style={{ color: textColor }}
                    >
                      {productTitle}
                    </h3>
                  )}
                  {/* Show price with compare price */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {actualComparePrice > actualPrice && (
                      <span className="text-lg line-through opacity-60" style={{ color: mutedColor }}>
                        ৳{actualComparePrice}
                      </span>
                    )}
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                      ৳{actualPrice}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Variant Selection - use actualVariants */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label 
                    className="block text-sm font-bold mb-3 uppercase tracking-wide"
                    style={{ color: mutedColor }}
                  >
                    {variantLabel}
                  </label>
                  <div className="space-y-2">
                    {actualVariants.map((variant) => (
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
              
              {/* Price Breakdown moved to right column */}
              {/* Trust Badges moved to right column */}
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
                  <input type="hidden" name="division" value={calculatedShippingZone === 'dhaka' ? 'dhaka' : 'outside_dhaka'} />
                  <input type="hidden" name="district" value={selectedDistrictId} />
                  <input type="hidden" name="upazila" value={selectedUpazilaId} />
                  {selectedVariant?.id && (
                    <input type="hidden" name="variant_id" value={selectedVariant.id} />
                  )}
                  {/* Honeypot field - hidden from real users, bots will fill it */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  
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
                  
                  {/* Phone Input with BD Validation */}
                  <div>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={phonePlaceholder}
                        maxLength={14}
                        className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400"
                        style={{ 
                          backgroundColor: inputBg, 
                          border: `2px solid ${phoneError ? '#EF4444' : (phone && validateBDPhone(phone) ? '#10B981' : inputBorder)}`,
                          color: inputText,
                        }}
                        required
                        disabled={fetcher.state !== 'idle'}
                      />
                      {/* Phone validation indicator */}
                      {phone && (
                        <span 
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium"
                          style={{ color: validateBDPhone(phone) ? '#10B981' : '#9CA3AF' }}
                        >
                          {validateBDPhone(phone) ? '✓' : `${phone.replace(/[\s-]/g, '').length}/11`}
                        </span>
                      )}
                    </div>
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                    )}
                  </div>
                  
                  {/* Address Section - BD Style */}
                  {shippingZoneMode === 'auto' && showDistrictField ? (
                    <>
                      {/* District Dropdown */}
                      <div>
                        <label 
                          className="block text-sm font-medium mb-1.5"
                          style={{ color: mutedColor }}
                        >
                          {districtLabel} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="district_select"
                            value={selectedDistrictId}
                            onChange={(e) => setSelectedDistrictId(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
                            style={{ 
                              backgroundColor: inputBg, 
                              border: `2px solid ${selectedDistrictId ? primaryColor : inputBorder}`,
                              color: inputText,
                            }}
                            required
                            disabled={fetcher.state !== 'idle'}
                          >
                            <option value="">{districtPlaceholder}</option>
                            {DISTRICTS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.nameEn})
                              </option>
                            ))}
                          </select>
                          <ChevronDown 
                            size={20} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: mutedColor }}
                          />
                        </div>
                        {/* Show shipping zone indicator */}
                        {selectedDistrictId && (
                          <div 
                            className="mt-1.5 flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: calculatedShippingZone === 'dhaka' ? '#10B981' : '#F59E0B' }}
                          >
                            <Truck size={12} />
                            <span>
                              {calculatedShippingZone === 'dhaka' 
                                ? `${insideDhakaLabel}: ৳${insideDhakaCharge}` 
                                : `${outsideDhakaLabel}: ৳${outsideDhakaCharge}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Upazila Dropdown */}
                      {showUpazilaField && selectedDistrictId && availableUpazilas.length > 0 && (
                        <div>
                          <label 
                            className="block text-sm font-medium mb-1.5"
                            style={{ color: mutedColor }}
                          >
                            {upazilaLabel}
                          </label>
                          <div className="relative">
                            <select
                              name="upazila_select"
                              value={selectedUpazilaId}
                              onChange={(e) => setSelectedUpazilaId(e.target.value)}
                              className="w-full px-5 py-4 rounded-xl font-medium outline-none transition-all focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
                              style={{ 
                                backgroundColor: inputBg, 
                                border: `2px solid ${selectedUpazilaId ? primaryColor : inputBorder}`,
                                color: inputText,
                              }}
                              disabled={fetcher.state !== 'idle'}
                            >
                              <option value="">{upazilaPlaceholder}</option>
                              {availableUpazilas.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.nameEn})
                                </option>
                              ))}
                            </select>
                            <ChevronDown 
                              size={20} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: mutedColor }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Manual Mode - Dhaka/Outside Toggle Buttons */
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
                  )}
                  
                  {/* Detailed Address Input */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: mutedColor }}
                    >
                      {addressLabel} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={addressPlaceholder}
                      rows={2}
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
                  {/* Warning if no product linked */}
                  {!productId && storeId && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-2">
                      ⚠️ এই পেজে কোনো প্রোডাক্ট সেট করা হয়নি। Page Builder থেকে প্রোডাক্ট সিলেক্ট করুন।
                    </div>
                  )}
                  
                  {/* Price Breakdown - Right Side */}
                  <div 
                    className="p-4 rounded-xl space-y-2"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB' }}
                  >
                    <div className="flex justify-between text-sm">
                      <span style={{ color: mutedColor }}>{subtotalLabel}</span>
                      <span className="font-semibold" style={{ color: textColor }}>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: mutedColor }}>{deliveryLabel}</span>
                      <span className="font-semibold" style={{ color: textColor }}>{formatPrice(deliveryCharge)}</span>
                    </div>
                    <div 
                      className="flex justify-between pt-2 border-t"
                      style={{ borderColor: cardBorder }}
                    >
                      <span className="font-bold" style={{ color: textColor }}>{totalLabel}</span>
                      <span 
                        className="font-bold text-xl"
                        style={{ color: primaryColor }}
                      >
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={fetcher.state !== 'idle' || !storeId}
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
                  
                  {/* Trust Badges */}
                  {showTrustBadges && (
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
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
                </fetcher.Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
