/**
 * Neubrutalist Order Form Variant
 * Bold borders, offset shadows, raw aesthetic with bright colors
 */

import { Zap, Star } from 'lucide-react';
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';
import { MultiProductSelector, useMultiProductSelection } from './MultiProductSelector';

export function NeubrutalistOrderForm({ props, theme, storeId, productId, product, selectedProducts = [], realData }: OrderFormComponentProps) {
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
  
  // Neubrutalist colors
  const primaryColor = '#FF6B6B';
  const accentColor = '#4ECDC4';
  const bgColor = '#FEF08A';
  
  return (
    <section 
      id="order-form" 
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: bgColor }}
      data-section-type="cta"
    >
      {/* Decorative shapes */}
      <div 
        className="absolute top-10 right-10 w-24 h-24 rounded-full"
        style={{ background: primaryColor, border: '4px solid #000' }}
      />
      <div 
        className="absolute bottom-10 left-10 w-20 h-20 rotate-45"
        style={{ background: accentColor, border: '4px solid #000' }}
      />
      <div 
        className="absolute top-1/3 left-5 w-16 h-16 rounded-full"
        style={{ background: '#A855F7', border: '4px solid #000' }}
      />
      <div 
        className="absolute bottom-1/3 right-5 w-12 h-12"
        style={{ background: '#3B82F6', border: '4px solid #000' }}
      />
      
      {/* Zigzag pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
        <svg viewBox="0 0 1200 40" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,40 L30,0 L60,40 L90,0 L120,40 L150,0 L180,40 L210,0 L240,40 L270,0 L300,40 L330,0 L360,40 L390,0 L420,40 L450,0 L480,40 L510,0 L540,40 L570,0 L600,40 L630,0 L660,40 L690,0 L720,40 L750,0 L780,40 L810,0 L840,40 L870,0 L900,40 L930,0 L960,40 L990,0 L1020,40 L1050,0 L1080,40 L1110,0 L1140,40 L1170,0 L1200,40" fill="none" stroke="#000" strokeWidth="3"/>
        </svg>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header with brutal style */}
        <div className="text-center mb-10">
          {/* Sticker label */}
          <div 
            className="inline-block px-6 py-2 mb-6 text-lg font-black uppercase -rotate-2"
            style={{ 
              background: accentColor, 
              border: '4px solid #000',
              boxShadow: '6px 6px 0 #000',
            }}
          >
            <Zap className="inline mr-2" size={20} />
            সেরা ডিল!
          </div>
          
          <h2 
            className="text-4xl md:text-6xl font-black uppercase mb-4"
            style={{ 
              color: '#000', 
              textShadow: '5px 5px 0 #FF6B6B, 10px 10px 0 rgba(0,0,0,0.1)',
            }}
          >
            {headline}
          </h2>
          {subheadline && (
            <p 
              className="text-xl font-bold"
              style={{ color: '#1a1a1a' }}
            >
              {subheadline}
            </p>
          )}
        </div>
        
        {/* Main Card - Brutal style */}
        <div 
          className="relative"
          style={{
            background: '#fff',
            border: '6px solid #000',
            boxShadow: '12px 12px 0 #000',
          }}
        >
          {/* Corner sticker */}
          <div 
            className="absolute -top-4 -right-4 px-4 py-2 text-sm font-black uppercase rotate-12 z-20"
            style={{ background: primaryColor, border: '3px solid #000' }}
          >
            <Star className="inline mr-1" size={14} />
            অর্ডার! 📦
          </div>
          
          <div className="grid md:grid-cols-2">
            {/* Left - Product */}
            <div 
              className="p-8 border-b md:border-b-0 md:border-r"
              style={{ borderColor: '#000', borderWidth: '3px' }}
            >
              {/* Multi-Product Selector */}
              <MultiProductSelector
                selectedProducts={selectedProducts}
                primaryColor={primaryColor}
                textColor="#000000"
                mutedColor="#666666"
                inputBg="#FFFFFF"
                inputBorder="#000000"
              />
              
              {/* Product Card */}
              {!isMultiProduct && (actualProductImage || actualProductTitle) && (
                <div 
                  className="mb-8 p-4 text-center -rotate-1"
                  style={{
                    background: bgColor,
                    border: '4px solid #000',
                    boxShadow: '8px 8px 0 #000',
                  }}
                >
                  {actualProductImage && (
                    <img 
                      src={actualProductImage} 
                      alt={actualProductTitle || 'প্রোডাক্ট'} 
                      className="w-36 h-36 mx-auto object-cover mb-4"
                      style={{ border: '4px solid #000' }}
                    />
                  )}
                  {actualProductTitle && (
                    <h3 className="text-xl font-black uppercase mb-2">
                      {actualProductTitle}
                    </h3>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    {actualComparePrice > actualPrice && (
                      <span 
                        className="text-lg line-through font-bold"
                        style={{ color: '#666' }}
                      >
                        ৳{actualComparePrice}
                      </span>
                    )}
                    <span 
                      className="text-3xl font-black px-3 py-1"
                      style={{ 
                        background: primaryColor,
                        border: '3px solid #000',
                      }}
                    >
                      ৳{actualPrice}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Variant Selection - Brutal style */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label 
                    className="block text-sm font-black mb-3 uppercase"
                    style={{ 
                      background: '#000', 
                      color: '#fff',
                      padding: '4px 8px',
                      display: 'inline-block',
                    }}
                  >
                    {variantLabel}
                  </label>
                  <div className="space-y-3">
                    {actualVariants.map((variant, index) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => actions.setSelectedVariant(variant)}
                        className="w-full flex items-center justify-between p-4 transition-all font-bold uppercase"
                        style={{
                          background: state.selectedVariant?.id === variant.id ? accentColor : '#fff',
                          border: '4px solid #000',
                          boxShadow: state.selectedVariant?.id === variant.id ? '6px 6px 0 #000' : '4px 4px 0 #000',
                          transform: state.selectedVariant?.id === variant.id ? 'translate(-2px, -2px)' : 'none',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 border-4 border-black flex items-center justify-center"
                            style={{ 
                              background: state.selectedVariant?.id === variant.id ? '#000' : '#fff',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <div className="w-2 h-2 bg-white" />
                            )}
                          </div>
                          <span>{variant.name}</span>
                        </div>
                        <span 
                          className="px-2 py-1"
                          style={{ 
                            background: primaryColor,
                            border: '2px solid #000',
                          }}
                        >
                          {formatPrice(variant.price || calculations.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity - Brutal style */}
              <div>
                <label 
                  className="block text-sm font-black mb-3 uppercase"
                  style={{ 
                    background: '#000', 
                    color: '#fff',
                    padding: '4px 8px',
                    display: 'inline-block',
                  }}
                >
                  {quantityLabel}
                </label>
                <div 
                  className="flex items-center justify-between p-4"
                  style={{ 
                    background: '#fff',
                    border: '4px solid #000',
                    boxShadow: '4px 4px 0 #000',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(Math.max(1, state.quantity - 1))}
                    className="w-14 h-14 font-black text-2xl flex items-center justify-center transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    style={{ 
                      background: accentColor,
                      border: '4px solid #000',
                      boxShadow: '4px 4px 0 #000',
                    }}
                  >
                    −
                  </button>
                  <span 
                    className="text-4xl font-black px-6 py-2"
                    style={{ 
                      background: bgColor,
                      border: '3px solid #000',
                    }}
                  >
                    {state.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(state.quantity + 1)}
                    className="w-14 h-14 font-black text-2xl flex items-center justify-center transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
                    style={{ 
                      background: primaryColor,
                      border: '4px solid #000',
                      boxShadow: '4px 4px 0 #000',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Right - Form */}
            <div className="p-8">
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
                inputBg="#fff"
                inputBorder="#000"
                inputText="#000"
                primaryColor={primaryColor}
                mutedColor="#666"
                textColor="#000"
                cardBorder="#000"
                isDark={false}
                buttonBg={`linear-gradient(135deg, ${primaryColor}, #FF8E8E)`}
                buttonTextColor="#000"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
