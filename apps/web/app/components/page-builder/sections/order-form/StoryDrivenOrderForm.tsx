/**
 * Story-Driven Order Form Variant
 * Warm, emotional design with amber tones, serif fonts, and storytelling elements
 */

import { useState, useEffect } from 'react';
import { Heart, Quote, Sparkles, Gift, Star } from 'lucide-react';

function ClientSideHearts({ count }: { count: number }) {
  const [hearts, setHearts] = useState<Array<{
    size: number;
    left: string;
    top: string;
    duration: string;
    delay: string;
  }>>([]);

  useEffect(() => {
    setHearts([...Array(count)].map(() => ({
      size: 20 + Math.random() * 20,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: `${5 + Math.random() * 5}s`,
      delay: `${Math.random() * 3}s`,
    })));
  }, [count]);

  return (
    <>
      {hearts.map((h, i) => (
        <Heart
          key={i}
          size={h.size}
          className="absolute text-amber-300 opacity-20"
          style={{
            left: h.left,
            top: h.top,
            animation: `floatHeart ${h.duration} ease-in-out infinite`,
            animationDelay: h.delay,
          }}
        />
      ))}
    </>
  );
}
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';
import { MultiProductSelector, useMultiProductSelection } from './MultiProductSelector';

export function StoryDrivenOrderForm({ props, theme, storeId, productId, product, selectedProducts = [], realData }: OrderFormComponentProps) {
  // Multi-product support with configurable combo discount
  const {
    enableComboDiscount = true,
    comboDiscount2Products = 10,
    comboDiscount3Products = 15,
  } = props as Record<string, unknown>;
  
  const multiProduct = useMultiProductSelection(selectedProducts, {
    enableComboDiscount: enableComboDiscount as boolean,
    comboDiscount2Products: comboDiscount2Products as number,
    comboDiscount3Products: comboDiscount3Products as number,
  });
  const { isMultiProduct, primaryProduct, finalTotal, selectedIds } = multiProduct;
  
  // Create effective product for useOrderForm
  // NOTE: Don't pass variants here - useOrderForm will use product.variants from DB/settings
  const effectiveProduct = isMultiProduct && primaryProduct ? {
    id: primaryProduct.id,
    title: multiProduct.selectedProductsData.length > 1 
      ? `${multiProduct.selectedProductsData.length}টি প্রোডাক্ট` 
      : primaryProduct.title,
    price: finalTotal,
    compareAtPrice: multiProduct.selectedProductsData.reduce((sum, p) => sum + (p.compareAtPrice || p.price), 0),
    images: primaryProduct.imageUrl ? [primaryProduct.imageUrl] : [],
  } : product;
  
  const { fetcher, state, actions, calculations, props: typedProps } = useOrderForm(props, effectiveProduct);

  const cartItems = isMultiProduct
    ? multiProduct.selectedProductsData.map((p) => ({ productId: p.id, quantity: state.quantity }))
    : undefined;

  const comboSummary = multiProduct.comboSavings > 0
    ? { savings: multiProduct.comboSavings, rate: Math.round(multiProduct.comboDiscount.rate * 100), discountedSubtotal: multiProduct.comboTotal }
    : undefined;
  
  const {
    headline = 'আপনার জন্যই তৈরি',
    subheadline = 'প্রতিটি পণ্যের পেছনে আছে একটি গল্প',
    variantLabel = 'আপনার পছন্দ',
    quantityLabel = 'পরিমাণ',
  } = typedProps;
  
  const { actualVariants, actualProductImage, actualProductTitle, actualPrice, actualComparePrice, formatPrice } = calculations;
  
  // Story-driven colors
  const primaryColor = '#D97706';
  const accentColor = '#F59E0B';
  
  return (
    <section 
      id="order-form" 
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)' }}
      data-section-type="cta"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path fill="#D97706" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C87,14.5,81.4,29,73.1,42.3C64.8,55.6,53.8,67.7,40.3,75.2C26.8,82.7,10.8,85.5,-4.3,91.7C-19.4,97.9,-38.8,107.4,-54.4,101.4C-70,95.4,-81.9,73.8,-87.5,51.5C-93.1,29.2,-92.4,6.2,-87.5,-14.4C-82.6,-35,-73.5,-53.2,-59.7,-60.6C-45.9,-68,-27.3,-64.6,-10.7,-63.8C5.9,-63,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-80 h-80 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path fill="#F59E0B" d="M39.5,-65.8C52.9,-60.5,66.4,-53.1,74.5,-41.6C82.6,-30.1,85.4,-14.5,83.6,-0.1C81.8,14.3,75.4,27.6,67.3,39.7C59.2,51.8,49.4,62.7,37.1,69.3C24.8,75.9,10,78.2,-4.6,85.2C-19.2,92.2,-33.6,103.9,-45.4,99.8C-57.2,95.7,-66.4,75.8,-72.3,56.6C-78.2,37.4,-80.8,18.9,-79.5,0.8C-78.2,-17.3,-73,-35.6,-63.3,-49.2C-53.6,-62.8,-39.4,-71.7,-24.8,-76.1C-10.2,-80.5,4.8,-80.4,18.7,-76.1C32.6,-71.8,45.4,-63.3,39.5,-65.8Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      {/* Floating hearts - Client side only to avoid hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ClientSideHearts count={8} />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Storytelling header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6 border border-amber-200">
            <Sparkles size={16} className="text-amber-600" />
            <span className="text-amber-700 font-medium" style={{ fontFamily: 'serif' }}>
              বিশেষ সংগ্রহ
            </span>
          </div>
          
          <h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ 
              color: '#78350F',
              fontFamily: 'serif',
            }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p 
              className="text-xl text-amber-700 max-w-xl mx-auto"
              style={{ fontFamily: 'serif' }}
            >
              {subheadline}
            </p>
          )}
        </div>
        
        {/* Quote */}
        <div className="max-w-lg mx-auto mb-10 text-center">
          <Quote size={32} className="text-amber-300 mx-auto mb-3" />
          <p 
            className="text-lg text-amber-800 italic"
            style={{ fontFamily: 'serif' }}
          >
            "প্রতিটি পণ্যের মধ্যে লুকিয়ে আছে কারিগরের ভালোবাসা, আপনার জন্য তৈরি প্রতিটি বিস্তারিত।"
          </p>
        </div>
        
        {/* Main Card */}
        <div 
          className="bg-white rounded-3xl overflow-hidden"
          style={{
            boxShadow: '0 20px 60px rgba(217, 119, 6, 0.15)',
            border: '1px solid rgba(217, 119, 6, 0.2)',
          }}
        >
          {/* Decorative border top */}
          <div 
            className="h-1"
            style={{ background: 'linear-gradient(90deg, #D97706, #F59E0B, #FBBF24, #F59E0B, #D97706)' }}
          />
          
          <div className="grid md:grid-cols-2">
            {/* Left - Product Story */}
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-amber-100">
              {/* Multi-Product Selector */}
              <MultiProductSelector
                selectedProducts={selectedProducts}
                primaryColor={primaryColor}
                textColor="#78350F"
                mutedColor="#92400E"
                inputBg="#FFFBEB"
                inputBorder="#FDE68A"
              />
              
              {/* Product showcase */}
              {!isMultiProduct && (actualProductImage || actualProductTitle) && (
                <div className="mb-8 text-center">
                  {actualProductImage && (
                    <div className="relative inline-block mb-4">
                      <div 
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(245, 158, 11, 0.1))',
                          transform: 'rotate(-3deg)',
                        }}
                      />
                      <img 
                        src={actualProductImage} 
                        alt={actualProductTitle || 'প্রোডাক্ট'} 
                        className="relative w-48 h-48 rounded-2xl object-cover shadow-lg"
                        style={{ border: '3px solid #FDE68A' }}
                      />
                      {/* Gift tag */}
                      <div 
                        className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)' }}
                      >
                        <Gift size={20} className="text-white" />
                      </div>
                    </div>
                  )}
                  {actualProductTitle && (
                    <h3 
                      className="text-2xl font-bold text-amber-900 mb-2"
                      style={{ fontFamily: 'serif' }}
                    >
                      {actualProductTitle}
                    </h3>
                  )}
                  
                  {/* Price with story */}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-3">
                      {actualComparePrice > actualPrice && (
                        <span className="text-lg line-through text-amber-400">
                          ৳{actualComparePrice}
                        </span>
                      )}
                      <span 
                        className="text-3xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        ৳{actualPrice}
                      </span>
                    </div>
                    <p className="text-sm text-amber-600 mt-1" style={{ fontFamily: 'serif' }}>
                      আপনার জন্য বিশেষ মূল্য
                    </p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-amber-700">৫০০+ সন্তুষ্ট গ্রাহক</span>
                  </div>
                </div>
              )}
              
              {/* Variant Selection - Elegant style */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label 
                    className="block text-sm font-semibold text-amber-800 mb-3"
                    style={{ fontFamily: 'serif' }}
                  >
                    {variantLabel}
                  </label>
                  <div className="space-y-3">
                    {actualVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => actions.setSelectedVariant(variant)}
                        className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                        style={{
                          background: state.selectedVariant?.id === variant.id 
                            ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' 
                            : '#FFFBEB',
                          border: `2px solid ${state.selectedVariant?.id === variant.id ? primaryColor : '#FDE68A'}`,
                          boxShadow: state.selectedVariant?.id === variant.id 
                            ? '0 4px 15px rgba(217, 119, 6, 0.15)' 
                            : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: state.selectedVariant?.id === variant.id ? primaryColor : '#FBBF24',
                              backgroundColor: state.selectedVariant?.id === variant.id ? primaryColor : 'transparent',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <Heart size={10} className="text-white fill-white" />
                            )}
                          </div>
                          <span 
                            className="font-medium text-amber-900"
                            style={{ fontFamily: 'serif' }}
                          >
                            {variant.name}
                          </span>
                        </div>
                        <span className="font-bold" style={{ color: primaryColor }}>
                          {formatPrice(variant.price || calculations.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity - Elegant */}
              <div>
                <label 
                  className="block text-sm font-semibold text-amber-800 mb-3"
                  style={{ fontFamily: 'serif' }}
                >
                  {quantityLabel}
                </label>
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
                >
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(Math.max(1, state.quantity - 1))}
                    className="w-12 h-12 rounded-full font-bold text-xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                  >
                    −
                  </button>
                  <span 
                    className="text-3xl font-bold text-amber-900"
                    style={{ fontFamily: 'serif' }}
                  >
                    {state.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(state.quantity + 1)}
                    className="w-12 h-12 rounded-full font-bold text-xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right - Form */}
            <div className="p-8 md:p-10 bg-gradient-to-b from-white to-amber-50/30">
              <OrderFormFields
                state={state}
                actions={actions}
                calculations={calculations}
                props={typedProps}
                fetcher={fetcher}
                storeId={storeId}
                productId={isMultiProduct ? selectedIds[0] : productId}
                cartItems={cartItems}
                comboSummary={comboSummary}
                inputBg="#FFFBEB"
                inputBorder="#FDE68A"
                inputText="#78350F"
                primaryColor={primaryColor}
                mutedColor="#92400E"
                textColor="#78350F"
                cardBorder="#FDE68A"
                isDark={false}
                buttonBg={`linear-gradient(135deg, ${primaryColor}, ${accentColor})`}
                buttonTextColor="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for floating hearts */}
      <style>{`
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </section>
  );
}
