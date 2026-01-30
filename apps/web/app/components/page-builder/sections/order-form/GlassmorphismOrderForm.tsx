/**
 * Glassmorphism Order Form Variant
 * Frosted glass effect with blur, gradients, and floating orbs
 */

import { Sparkles } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';
import { MultiProductSelector, useMultiProductSelection } from './MultiProductSelector';

export function GlassmorphismOrderForm({ props, theme, storeId, productId, product, selectedProducts = [], realData }: OrderFormComponentProps) {
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
  const { isMultiProduct, primaryProduct, finalTotal, selectedIds, comboDiscount, comboSavings, comboTotal, selectedProductsData } = multiProduct;
  
  // Create effective product for useOrderForm
  // NOTE: Don't pass variants here - useOrderForm will use product.variants from DB/settings
  // This ensures variant pricing (1 pis, 2 pis, 3 pis) syncs with settings page
  const effectiveProduct = isMultiProduct && primaryProduct ? {
    id: primaryProduct.id,
    title: multiProduct.selectedProductsData.length > 1 
      ? `${multiProduct.selectedProductsData.length}টি প্রোডাক্ট` 
      : primaryProduct.title,
    price: finalTotal,
    compareAtPrice: multiProduct.selectedProductsData.reduce((sum, p) => sum + (p.compareAtPrice || p.price), 0),
    images: primaryProduct.imageUrl ? [primaryProduct.imageUrl] : [],
    // variants intentionally not set - will use default from settings
  } : product;
  
  const { fetcher, state, actions, calculations, props: typedProps } = useOrderForm(props, effectiveProduct);

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
  } = typedProps;
  
  const { actualVariants, actualProductImage, actualProductTitle, actualPrice, actualComparePrice, formatPrice } = calculations;
  
  // Glassmorphism specific colors
  const primaryColor = '#A855F7';
  const accentColor = '#6366F1';
  
  return (
    <section 
      id="order-form" 
      className="relative py-20 px-4 overflow-hidden"
      data-section-type="cta"
    >
      {/* Background */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(135deg, #0F0F23 0%, #1a1a3e 50%, #2d1b4e 100%)' }} 
      />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header with gradient text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 backdrop-blur-sm"
            style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.3)' }}
          >
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">বিশেষ অফার</span>
          </div>
          <h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 50%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-gray-300 opacity-80">{subheadline}</p>
          )}
        </div>
        
        {/* Glass Card */}
        <div 
          className="backdrop-blur-xl rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="grid md:grid-cols-2">
            {/* Left - Product Info */}
            <div 
              className="p-8 md:p-10 border-b md:border-b-0 md:border-r"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {/* Multi-Product Selector */}
              <MultiProductSelector
                selectedProducts={selectedProducts}
                primaryColor={primaryColor}
                textColor="#FFFFFF"
                mutedColor="rgba(255,255,255,0.6)"
                inputBg="rgba(255,255,255,0.05)"
                inputBorder="rgba(255,255,255,0.1)"
              />
              
              {/* Product Card */}
              {!isMultiProduct && (actualProductImage || actualProductTitle) && (
                <div 
                  className="mb-8 p-6 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {actualProductImage && (
                    <div className="relative inline-block mb-4">
                      <img 
                        src={actualProductImage} 
                        alt={actualProductTitle || 'প্রোডাক্ট'} 
                        className="w-40 h-40 mx-auto rounded-2xl object-cover"
                        style={{ boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
                      />
                      {/* Glow effect */}
                      <div className="absolute -inset-4 bg-purple-500 rounded-3xl opacity-20 blur-2xl -z-10" />
                    </div>
                  )}
                  {actualProductTitle && (
                    <h3 className="text-xl font-bold text-white mb-2">
                      {actualProductTitle}
                    </h3>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    {actualComparePrice > actualPrice && (
                      <span className="text-lg line-through text-gray-500">
                        {formatPrice(actualComparePrice)}
                      </span>
                    )}
                    <span 
                      className="text-3xl font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {formatPrice(actualPrice)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Variant Selection - Glass style */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3 uppercase tracking-wide text-purple-300">
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
                            ? 'rgba(168, 85, 247, 0.2)' 
                            : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${state.selectedVariant?.id === variant.id ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: state.selectedVariant?.id === variant.id ? '0 0 20px rgba(168, 85, 247, 0.2)' : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: state.selectedVariant?.id === variant.id ? primaryColor : 'rgba(255,255,255,0.3)',
                              backgroundColor: state.selectedVariant?.id === variant.id ? primaryColor : 'transparent',
                              boxShadow: state.selectedVariant?.id === variant.id ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-semibold text-white">{variant.name}</span>
                        </div>
                        <span 
                          className="font-bold text-lg"
                          style={{ color: primaryColor }}
                        >
                          {formatPrice(variant.price || calculations.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity - Glass style */}
              <div>
                <label className="block text-sm font-bold mb-3 uppercase tracking-wide text-purple-300">
                  {quantityLabel}
                </label>
                <div 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(Math.max(1, state.quantity - 1))}
                    className="w-12 h-12 rounded-xl font-bold text-xl flex items-center justify-center transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-white">
                    {state.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(state.quantity + 1)}
                    className="w-12 h-12 rounded-xl font-bold text-xl flex items-center justify-center transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #A855F7, #6366F1)',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right - Form */}
            <div className="p-8 md:p-10">
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
                inputBg="rgba(255,255,255,0.05)"
                inputBorder="rgba(255,255,255,0.15)"
                inputText="#FFFFFF"
                primaryColor={primaryColor}
                mutedColor="rgba(255,255,255,0.6)"
                textColor="#FFFFFF"
                cardBorder="rgba(255,255,255,0.1)"
                isDark={true}
                buttonBg="linear-gradient(135deg, #A855F7, #6366F1)"
                buttonTextColor="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-20px); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}
