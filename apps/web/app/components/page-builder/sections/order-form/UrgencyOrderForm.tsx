/**
 * Urgency Order Form Variant
 * FOMO-driven design with countdown, warnings, and scarcity indicators
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Flame, Users, Zap, TrendingUp } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';
import { MultiProductSelector, useMultiProductSelection } from './MultiProductSelector';

export function UrgencyOrderForm({
  props,
  theme,
  storeId,
  productId,
  product,
  selectedProducts = [],
  realData,
}: OrderFormComponentProps) {
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
  const effectiveProduct =
    isMultiProduct && primaryProduct
      ? {
          id: primaryProduct.id,
          title:
            multiProduct.selectedProductsData.length > 1
              ? `${multiProduct.selectedProductsData.length}টি প্রোডাক্ট`
              : primaryProduct.title,
          price: finalTotal,
          compareAtPrice: multiProduct.selectedProductsData.reduce(
            (sum, p) => sum + (p.compareAtPrice || p.price),
            0
          ),
          images: primaryProduct.imageUrl ? [primaryProduct.imageUrl] : [],
        }
      : product;

  const {
    fetcher,
    state,
    actions,
    calculations,
    props: typedProps,
  } = useOrderForm(props, effectiveProduct);

  const cartItems = isMultiProduct
    ? multiProduct.selectedProductsData.map((p) => ({ productId: p.id, quantity: state.quantity }))
    : undefined;

  const comboSummary =
    multiProduct.comboSavings > 0
      ? {
          savings: multiProduct.comboSavings,
          rate: Math.round(multiProduct.comboDiscount.rate * 100),
          discountedSubtotal: multiProduct.comboTotal,
        }
      : undefined;

  const {
    headline = '⚡ শেষ সুযোগ!',
    subheadline = 'এই অফার আর থাকবে না!',
    variantLabel = 'প্যাকেজ নির্বাচন করুন',
    quantityLabel = 'পরিমাণ',
  } = typedProps;

  const {
    actualVariants,
    actualProductImage,
    actualProductTitle,
    actualPrice,
    actualComparePrice,
    formatPrice,
  } = calculations;

  // Urgency colors
  const primaryColor = '#DC2626';
  const accentColor = '#EF4444';

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 47, seconds: 33 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Random stock count
  const stockLeft = realData?.stockCount ?? null;
  const viewingNow = realData?.recentOrderCount ?? null;

  return (
    <section
      id="order-form"
      className="relative py-16 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #1C1917 50%, #0A0A0A 100%)' }}
      data-section-type="cta"
    >
      {/* Animated warning stripes */}
      <div
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          background:
            'repeating-linear-gradient(90deg, #DC2626, #DC2626 20px, #FCD34D 20px, #FCD34D 40px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{
          background:
            'repeating-linear-gradient(90deg, #FCD34D, #FCD34D 20px, #DC2626 20px, #DC2626 40px)',
        }}
      />

      {/* Pulsing glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500 rounded-full opacity-10 blur-[150px] animate-pulse" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Urgency bar (real data only) */}
        {(viewingNow !== null || stockLeft !== null) && (
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {viewingNow !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-900/50 rounded-lg border border-red-500/50 animate-pulse">
                <Users size={18} className="text-red-400" />
                <span className="text-red-300 font-medium">{viewingNow} জন এখন দেখছে</span>
              </div>
            )}
            {stockLeft !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/50 rounded-lg border border-yellow-500/50">
                <AlertTriangle size={18} className="text-yellow-400" />
                <span className="text-yellow-300 font-medium">মাত্র {stockLeft}টি বাকি!</span>
              </div>
            )}
          </div>
        )}

        {/* Countdown Timer */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex items-center gap-4 px-8 py-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #7F1D1D, #450A0A)',
              border: '2px solid #DC2626',
              boxShadow: '0 0 30px rgba(220, 38, 38, 0.3)',
            }}
          >
            <Clock size={24} className="text-red-400 animate-pulse" />
            <span className="text-red-200 font-medium">অফার শেষ হচ্ছে:</span>
            <div className="flex gap-2">
              {[
                { value: timeLeft.hours, label: 'ঘণ্টা' },
                { value: timeLeft.minutes, label: 'মিনিট' },
                { value: timeLeft.seconds, label: 'সেকেন্ড' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-2xl md:text-3xl font-black text-white px-3 py-1 rounded"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-red-300 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 rounded-full mb-4 animate-bounce">
            <Flame size={18} className="text-white" />
            <span className="text-white font-bold">ফ্ল্যাশ সেল!</span>
            <Flame size={18} className="text-white" />
          </div>
          <h2
            className="text-4xl md:text-5xl font-black mb-3"
            style={{
              background: 'linear-gradient(135deg, #FEF08A, #FBBF24, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(251, 191, 36, 0.3)',
            }}
          >
            {headline}
          </h2>
          {subheadline && <p className="text-xl text-red-300">{subheadline}</p>}
        </div>

        {/* Main Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '2px solid rgba(220, 38, 38, 0.5)',
            boxShadow: '0 0 50px rgba(220, 38, 38, 0.2)',
          }}
        >
          {/* Warning banner */}
          <div
            className="flex items-center justify-center gap-3 py-3 px-4"
            style={{ background: 'linear-gradient(90deg, #DC2626, #B91C1C)' }}
          >
            <Zap size={18} className="text-yellow-300" />
            <span className="text-white font-bold text-sm animate-pulse">
              ⚠️ সীমিত স্টক! দ্রুত অর্ডার করুন!
            </span>
            <Zap size={18} className="text-yellow-300" />
          </div>

          <div className="grid md:grid-cols-2">
            {/* Left - Product */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-red-900/50">
              {/* Multi-Product Selector */}
              <MultiProductSelector
                selectedProducts={selectedProducts}
                primaryColor={primaryColor}
                textColor="#FFFFFF"
                mutedColor="rgba(255,255,255,0.7)"
                inputBg="rgba(255,255,255,0.1)"
                inputBorder="rgba(255,255,255,0.2)"
              />

              {/* Product Card */}
              {!isMultiProduct && (actualProductImage || actualProductTitle) && (
                <div className="mb-8 text-center relative">
                  {/* Sale badge */}
                  <div
                    className="absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full font-black text-sm animate-pulse"
                    style={{ background: '#DC2626' }}
                  >
                    <span className="text-white">
                      {actualComparePrice > actualPrice
                        ? `-${Math.round((1 - actualPrice / actualComparePrice) * 100)}%`
                        : 'সেল!'}
                    </span>
                  </div>

                  {actualProductImage && (
                    <div className="relative inline-block">
                      <img
                        src={actualProductImage}
                        alt={actualProductTitle || 'প্রোডাক্ট'}
                        className="w-40 h-40 mx-auto rounded-xl object-cover"
                        style={{
                          border: '3px solid #DC2626',
                          boxShadow: '0 0 30px rgba(220, 38, 38, 0.4)',
                        }}
                      />
                    </div>
                  )}
                  {actualProductTitle && (
                    <h3 className="text-xl font-bold text-white mt-4 mb-2">{actualProductTitle}</h3>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    {actualComparePrice > actualPrice && (
                      <span className="text-xl line-through text-gray-500">
                        {formatPrice(actualComparePrice)}
                      </span>
                    )}
                    <span className="text-4xl font-black" style={{ color: '#FBBF24' }}>
                      {formatPrice(actualPrice)}
                    </span>
                  </div>

                  {/* Savings indicator */}
                  {actualComparePrice > actualPrice && (
                    <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-900/50 rounded-full">
                      <TrendingUp size={14} className="text-green-400" />
                      <span className="text-green-400 font-medium text-sm">
                        সেভ করুন ৳{actualComparePrice - actualPrice}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Variant Selection */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase">
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
                          background:
                            state.selectedVariant?.id === variant.id
                              ? 'rgba(220, 38, 38, 0.3)'
                              : 'rgba(255,255,255,0.05)',
                          border: `2px solid ${state.selectedVariant?.id === variant.id ? '#DC2626' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{
                              borderColor:
                                state.selectedVariant?.id === variant.id
                                  ? '#DC2626'
                                  : 'rgba(255,255,255,0.3)',
                              backgroundColor:
                                state.selectedVariant?.id === variant.id
                                  ? '#DC2626'
                                  : 'transparent',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-semibold text-white">{variant.name}</span>
                        </div>
                        <span className="font-bold text-lg text-yellow-400">
                          {formatPrice(variant.price || calculations.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold mb-3 text-yellow-400 uppercase">
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
                    className="w-12 h-12 rounded-lg font-bold text-xl flex items-center justify-center text-white"
                    style={{ background: '#DC2626' }}
                  >
                    −
                  </button>
                  <span className="text-3xl font-black text-white">{state.quantity}</span>
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(state.quantity + 1)}
                    className="w-12 h-12 rounded-lg font-bold text-xl flex items-center justify-center text-white"
                    style={{ background: '#DC2626' }}
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
                inputBg="rgba(255,255,255,0.05)"
                inputBorder="rgba(255,255,255,0.15)"
                inputText="#FFFFFF"
                primaryColor={primaryColor}
                mutedColor="rgba(255,255,255,0.6)"
                textColor="#FFFFFF"
                cardBorder="rgba(255,255,255,0.1)"
                isDark={true}
                buttonBg="linear-gradient(135deg, #DC2626, #FBBF24)"
                buttonTextColor="#000000"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
