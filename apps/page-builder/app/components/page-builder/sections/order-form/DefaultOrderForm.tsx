/**
 * Default Order Form Variant
 * Clean, professional design with gradient background
 */

import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';

export function DefaultOrderForm({ props, theme, storeId, productId, product }: OrderFormComponentProps) {
  const { fetcher, state, actions, calculations, props: typedProps } = useOrderForm(props, product);
  
  const {
    headline = 'এখনই অর্ডার করুন',
    subheadline = 'সীমিত সময়ের জন্য বিশেষ অফার!',
    variantLabel = 'প্যাকেজ নির্বাচন করুন',
    quantityLabel = 'পরিমাণ',
  } = typedProps;
  
  const { actualVariants, actualProductImage, actualProductTitle, actualPrice, actualComparePrice, formatPrice } = calculations;
  
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
            {/* Left Column - Product & Pricing */}
            <div 
              className="p-8 border-b md:border-b-0 md:border-r"
              style={{ borderColor: cardBorder }}
            >
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
            </div>
            
            {/* Right Column - Form */}
            <div className="p-8">
              <OrderFormFields
                state={state}
                actions={actions}
                calculations={calculations}
                props={typedProps}
                fetcher={fetcher}
                storeId={storeId}
                productId={productId}
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
