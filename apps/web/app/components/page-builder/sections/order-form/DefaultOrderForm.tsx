/**
 * Default Order Form Variant
 * Clean, professional design with gradient background
 */

import { useState } from 'react';
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';
import { useMultiProductSelection } from './MultiProductSelector';

export function DefaultOrderForm({ props, theme, storeId, productId, product, selectedProducts = [], realData }: OrderFormComponentProps) {
  const typedProps = props as Record<string, unknown>;
  const enableComboDiscount = (typedProps.enableComboDiscount as boolean) ?? true;
  const comboDiscount2Products = (typedProps.comboDiscount2Products as number) ?? 10;
  const comboDiscount3Products = (typedProps.comboDiscount3Products as number) ?? 15;

  const multiProduct = useMultiProductSelection(selectedProducts, {
    enableComboDiscount,
    comboDiscount2Products,
    comboDiscount3Products,
  });
  const {
    selectedIds,
    isMultiProduct,
    toggleProductSelection,
    selectedProductsData,
    regularTotal,
    comboDiscount,
    comboSavings,
    comboTotal,
    finalTotal: multiProductTotal,
    primaryProduct,
  } = multiProduct;

  // For multi-product: use combo total
  // For single product: use that product's price
  const basePrice = isMultiProduct ? multiProductTotal : (primaryProduct?.price || product?.price || 1490);
  
  // Create a product object compatible with useOrderForm
  // NOTE: Don't pass variants here - useOrderForm will use product.variants from DB/settings
  // This ensures variant pricing (1 pis, 2 pis, 3 pis) syncs with settings page
  const effectiveProduct = primaryProduct ? {
    id: primaryProduct.id,
    title: selectedProductsData.length > 1 
      ? `${selectedProductsData.length}টি প্রোডাক্ট` 
      : primaryProduct.title,
    price: basePrice,
    compareAtPrice: selectedProductsData.reduce((sum, p) => sum + (p.compareAtPrice || p.price), 0),
    images: primaryProduct.imageUrl ? [primaryProduct.imageUrl] : [],
    // variants intentionally not set - will use default from settings
  } : product;
  
  const { fetcher, state, actions, calculations, props: orderProps } = useOrderForm(props, effectiveProduct);

  const cartItems = isMultiProduct
    ? selectedProductsData.map((p) => ({ productId: p.id, quantity: state.quantity }))
    : undefined;

  const comboSummary = comboSavings > 0
    ? { savings: comboSavings, rate: Math.round(comboDiscount.rate * 100), discountedSubtotal: comboTotal }
    : undefined;
  
  const {
    headline = 'এখনই অর্ডার করুন',
    subheadline = 'সীমিত সময়ের জন্য বিশেষ অফার!',
    variantLabel = 'প্যাকেজ নির্বাচন করুন',
    quantityLabel = 'পরিমাণ',
    // Urgency/Scarcity - OFF by default, seller must enable and set real data
    showUrgencyBanner = false,
    urgencyText = '',
    // Social Proof - OFF by default, seller must enable and set real data
    showSocialProof = false,
    socialProofText = '',
    // Auto-use real data option
    useRealStockCount = false, // If true, auto-generate from realData.stockCount
    useRealOrderCount = false, // If true, auto-generate from realData.recentOrderCount
    // Free Shipping Progress
    showFreeShippingProgress = true,
    freeShippingThreshold = 2000,
    // Delivery Estimate
    showDeliveryEstimate = true,
    deliveryEstimateDhaka = '১-২ দিন',
    deliveryEstimateOutside = '৩-৫ দিন',
  } = orderProps;
  
  const { actualVariants, actualProductImage, actualProductTitle, actualPrice, actualComparePrice, formatPrice } = calculations;
  
  // ============================================================================
  // AUTO-GENERATE URGENCY/SOCIAL PROOF FROM REAL DATA (if enabled)
  // ============================================================================
  // Determine final urgency text - prefer manual text, fallback to auto-generated
  const finalUrgencyText = urgencyText 
    ? urgencyText 
    : (useRealStockCount && realData?.stockCount !== null && realData.stockCount <= 50)
      ? `সীমিত স্টক! মাত্র ${realData.stockCount}টি বাকি আছে`
      : '';
      
  // Determine final social proof text - prefer manual text, fallback to auto-generated
  const finalSocialProofText = socialProofText
    ? socialProofText
    : (useRealOrderCount && realData?.recentOrderCount && realData.recentOrderCount > 0)
      ? `গত ২৪ ঘণ্টায় ${realData.recentOrderCount} জন অর্ডার করেছেন`
      : '';
  
  // Theme-based styling
  const isDark = theme?.style === 'dark' || theme?.style === 'urgent' || theme?.style === 'premium';
  const primaryColor = theme?.primaryColor || '#6366F1';
  const accentColor = theme?.accentColor || '#8B5CF6';
  
  const getBgStyle = () => {
    if (isDark) return { background: 'linear-gradient(135deg, #18181B, #0A0A0B)' };
    if (theme?.style === 'nature') return { background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' };
    return { background: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)' };
  };
  
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : (theme?.cardBorder || '#E5E7EB');
  const textColor = isDark ? '#FFFFFF' : (theme?.textColor || '#111827');
  const mutedColor = isDark ? 'rgba(255,255,255,0.6)' : (theme?.mutedTextColor || '#6B7280');
  const inputBg = isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF';
  const inputBorder = isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB';
  const inputText = isDark ? '#FFFFFF' : '#111827';
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
        {/* Header with Optional Urgency */}
        <div className="text-center mb-10">
          {/* Urgency Banner - Shows if enabled AND has text (manual or auto-generated from real stock) */}
          {showUrgencyBanner && finalUrgencyText && (
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-pulse"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
            >
              <span>🔥</span>
              <span>{finalUrgencyText}</span>
            </div>
          )}
          
          <h2 
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ color: textColor }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p style={{ color: mutedColor }} className="text-lg">{subheadline}</p>
          )}
          
          {/* Social Proof - Shows if enabled AND has text (manual or auto-generated from real orders) */}
          {showSocialProof && finalSocialProofText && (
            <div 
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: `${primaryColor}10`, color: textColor }}
            >
              <span className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">👤</span>
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">👤</span>
                <span className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">👤</span>
              </span>
              <span>{finalSocialProofText}</span>
            </div>
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
            {/* Left Column - Product & Pricing */}
            <div 
              className="p-8 border-b md:border-b-0 md:border-r"
              style={{ borderColor: cardBorder }}
            >
              {/* Product Selection Cards for Multi-Product Pages */}
              {isMultiProduct && (
                <div className="mb-6">
                  <label 
                    className="block text-sm font-semibold mb-3"
                    style={{ color: textColor }}
                  >
                    প্রোডাক্ট নির্বাচন করুন 
                    <span className="font-normal text-xs ml-2" style={{ color: mutedColor }}>
                      (একাধিক নির্বাচন করতে পারবেন)
                    </span>
                  </label>
                  <div className="space-y-3">
                    {selectedProducts.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProductSelection(p.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                          style={{
                            backgroundColor: isSelected ? `${primaryColor}15` : inputBg,
                            border: `2px solid ${isSelected ? primaryColor : inputBorder}`,
                          }}
                        >
                          {/* Checkbox indicator */}
                          <div 
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              backgroundColor: isSelected ? primaryColor : 'transparent',
                              border: `2px solid ${isSelected ? primaryColor : inputBorder}`,
                            }}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          
                          {/* Product image */}
                          {p.imageUrl ? (
                            <img 
                              src={p.imageUrl} 
                              alt={p.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: inputBorder }}
                            >
                              <span className="text-lg">📦</span>
                            </div>
                          )}
                          
                          {/* Product info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate" style={{ color: textColor }}>
                              {p.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="font-bold" style={{ color: primaryColor }}>
                                ৳{p.price.toLocaleString()}
                              </span>
                              {p.compareAtPrice && p.compareAtPrice > p.price && (
                                <span className="text-sm line-through" style={{ color: mutedColor }}>
                                  ৳{p.compareAtPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Selected summary with combo discount */}
                  {selectedIds.length > 1 && (
                    <div 
                      className="mt-3 p-4 rounded-xl"
                      style={{ 
                        backgroundColor: `${primaryColor}10`,
                        border: `2px dashed ${primaryColor}40`,
                      }}
                    >
                      {/* Combo badge */}
                      {comboDiscount.rate > 0 && (
                        <div className="flex justify-center mb-2">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: '#EF4444' }}
                          >
                            🎁 {comboDiscount.label}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center space-y-1">
                        <p style={{ color: textColor }}>
                          <span className="font-bold">{selectedIds.length}টি প্রোডাক্ট</span> নির্বাচিত
                        </p>
                        
                        {/* Show regular price strikethrough and combo price */}
                        {comboSavings > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="line-through text-sm" style={{ color: mutedColor }}>
                              ৳{regularTotal.toLocaleString()}
                            </span>
                            <span className="text-xl font-bold" style={{ color: primaryColor }}>
                              ৳{comboTotal.toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold" style={{ color: primaryColor }}>
                            ৳{regularTotal.toLocaleString()}
                          </span>
                        )}
                        
                        {/* Savings message */}
                        {comboSavings > 0 && (
                          <p className="text-sm font-semibold" style={{ color: '#16A34A' }}>
                            ✨ কম্বোতে সেভ করছেন ৳{comboSavings.toLocaleString()}!
                          </p>
                        )}
                        
                        {/* Upsell message for 2 products */}
                        {selectedIds.length === 2 && selectedProducts.length > 2 && enableComboDiscount && (
                          <p className="text-xs mt-2" style={{ color: mutedColor }}>
                            💡 ৩টি নিলে আরও {Math.max(0, comboDiscount3Products - comboDiscount2Products)}% বেশি ছাড়!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Product Image & Title */}
              {(actualProductImage || actualProductTitle) && (
                <div className="mb-6 text-center">
                  {actualProductImage && (
                    <img 
                      src={actualProductImage} 
                      alt={actualProductTitle || 'প্রোডাক্ট'} 
                      className="w-full max-w-[200px] mx-auto rounded-xl shadow-lg mb-4 object-cover aspect-square"
                    />
                  )}
                  {actualProductTitle && (
                    <h3 className="text-lg font-bold" style={{ color: textColor }}>
                      {actualProductTitle}
                    </h3>
                  )}
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
              
              {/* Variant Selection */}
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
                        onClick={() => actions.setSelectedVariant(variant)}
                        className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                        style={{
                          backgroundColor: state.selectedVariant?.id === variant.id 
                            ? `${primaryColor}15` 
                            : inputBg,
                          border: `2px solid ${state.selectedVariant?.id === variant.id ? primaryColor : inputBorder}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: state.selectedVariant?.id === variant.id ? primaryColor : inputBorder,
                              backgroundColor: state.selectedVariant?.id === variant.id ? primaryColor : 'transparent',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-semibold" style={{ color: textColor }}>
                            {variant.name}
                          </span>
                        </div>
                        <span className="font-bold text-lg" style={{ color: primaryColor }}>
                          {formatPrice(variant.price || calculations.basePrice)}
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
                    onClick={() => actions.setQuantity(Math.max(1, state.quantity - 1))}
                    className="w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold" style={{ color: textColor }}>
                    {state.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(state.quantity + 1)}
                    className="w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Free Shipping Progress - Configurable threshold */}
              {showFreeShippingProgress && freeShippingThreshold > 0 && calculations.subtotal < freeShippingThreshold && (
                <div 
                  className="mb-6 p-3 rounded-xl"
                  style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span>🚚</span>
                    <span style={{ color: '#92400E' }}>
                      আরও <strong>৳{(freeShippingThreshold - calculations.subtotal).toLocaleString()}</strong> যোগ করলে ফ্রি ডেলিভারি!
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-amber-200 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (calculations.subtotal / freeShippingThreshold) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Free Shipping Achieved */}
              {showFreeShippingProgress && freeShippingThreshold > 0 && calculations.subtotal >= freeShippingThreshold && (
                <div 
                  className="mb-6 p-3 rounded-xl flex items-center gap-2"
                  style={{ backgroundColor: '#D1FAE5', border: '1px solid #10B981' }}
                >
                  <span className="text-lg">🎉</span>
                  <span className="text-sm font-semibold" style={{ color: '#065F46' }}>
                    অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!
                  </span>
                </div>
              )}
              
              {/* Delivery Estimate - Configurable days */}
              {showDeliveryEstimate && (
                <div 
                  className="mb-6 p-4 rounded-xl"
                  style={{ backgroundColor: `${primaryColor}05`, border: `1px solid ${primaryColor}20` }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <span className="text-lg">📦</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textColor }}>
                        আনুমানিক ডেলিভারি
                      </p>
                      <p className="text-xs" style={{ color: mutedColor }}>
                        ঢাকায় {deliveryEstimateDhaka} • ঢাকার বাইরে {deliveryEstimateOutside}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: inputBg }}
                >
                  <span className="text-xl">💵</span>
                  <p className="text-xs mt-1 font-medium" style={{ color: textColor }}>
                    ক্যাশ অন ডেলিভারি
                  </p>
                </div>
                <div 
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: inputBg }}
                >
                  <span className="text-xl">🔄</span>
                  <p className="text-xs mt-1 font-medium" style={{ color: textColor }}>
                    ৭ দিনে রিটার্ন
                  </p>
                </div>
                <div 
                  className="text-center p-3 rounded-lg"
                  style={{ backgroundColor: inputBg }}
                >
                  <span className="text-xl">🛡️</span>
                  <p className="text-xs mt-1 font-medium" style={{ color: textColor }}>
                    নিরাপদ পেমেন্ট
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Form */}
            <div className="p-8">
              <OrderFormFields
                state={state}
                actions={actions}
                calculations={calculations}
                props={orderProps}
                fetcher={fetcher}
                storeId={storeId}
                productId={isMultiProduct ? selectedIds[0] : productId}
                cartItems={cartItems}
                comboSummary={comboSummary}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputText={inputText}
                primaryColor={primaryColor}
                mutedColor={mutedColor}
                textColor={textColor}
                cardBorder={cardBorder}
                isDark={isDark}
                buttonBg={buttonBg}
                buttonTextColor={buttonTextColor}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
