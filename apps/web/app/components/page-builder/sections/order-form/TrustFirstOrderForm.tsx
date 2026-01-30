/**
 * Trust-First Order Form Variant
 * Clean, professional with green accents, trust badges, and verification marks
 */

import { Shield, CheckCircle2, Award, BadgeCheck, Truck, Clock } from 'lucide-react';
import { formatPrice } from '~/lib/theme-engine';
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';
import { MultiProductSelector, useMultiProductSelection } from './MultiProductSelector';

export function TrustFirstOrderForm({ props, theme, storeId, productId, product, selectedProducts = [], realData }: OrderFormComponentProps) {
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
    headline = 'নিরাপদে অর্ডার করুন',
    subheadline = '১০০% সন্তুষ্টি গ্যারান্টি সহ',
    variantLabel = 'প্যাকেজ নির্বাচন করুন',
    quantityLabel = 'পরিমাণ',
  } = typedProps;
  
  const { actualVariants, actualProductImage, actualProductTitle, actualPrice, actualComparePrice, formatPrice } = calculations;
  
  // Trust-first colors
  const primaryColor = '#059669';
  const accentColor = '#10B981';
  
  return (
    <section 
      id="order-form" 
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 50%, #D1FAE5 100%)' }}
      data-section-type="cta"
    >
      {/* Subtle pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Trust badges header */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-emerald-100">
            <Shield size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">নিরাপদ পেমেন্ট</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-emerald-100">
            <BadgeCheck size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">ভেরিফাইড সেলার</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-emerald-100">
            <Award size={18} className="text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">মানি ব্যাক গ্যারান্টি</span>
          </div>
        </div>
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span className="text-emerald-700 font-semibold">বিশ্বস্ত ১০,০০০+ গ্রাহক</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-gray-600">{subheadline}</p>
          )}
        </div>
        
        {/* Main Card */}
        <div 
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(16, 185, 129, 0.1)',
          }}
        >
          {/* Verification banner */}
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4"
            style={{ background: 'linear-gradient(90deg, #059669, #10B981)' }}
          >
            <Shield size={18} className="text-white" />
            <span className="text-white font-medium text-sm">
              সম্পূর্ণ নিরাপদ অর্ডার সিস্টেম • SSL সুরক্ষিত
            </span>
            <Shield size={18} className="text-white" />
          </div>
          
          <div className="grid md:grid-cols-2">
            {/* Left - Product */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
              {/* Multi-Product Selector */}
              <MultiProductSelector
                selectedProducts={selectedProducts}
                primaryColor={primaryColor}
                textColor="#064E3B"
                mutedColor="#065F46"
                inputBg="#ECFDF5"
                inputBorder="#A7F3D0"
              />
              
              {/* Product Card with verification */}
              {!isMultiProduct && (actualProductImage || actualProductTitle) && (
                <div className="mb-8 text-center">
                  <div className="relative inline-block">
                    {actualProductImage && (
                      <img 
                        src={actualProductImage} 
                        alt={actualProductTitle || 'প্রোডাক্ট'} 
                        className="w-44 h-44 mx-auto rounded-xl object-cover shadow-lg border-2 border-emerald-100"
                      />
                    )}
                    {/* Verified badge */}
                    <div 
                      className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ background: primaryColor }}
                    >
                      <CheckCircle2 size={24} className="text-white" />
                    </div>
                  </div>
                  {actualProductTitle && (
                    <h3 className="text-xl font-bold text-gray-900 mt-4 mb-2">
                      {actualProductTitle}
                    </h3>
                  )}
                  <div className="flex items-center justify-center gap-3">
                    {actualComparePrice > actualPrice && (
                      <span className="text-lg line-through text-gray-400">
                        {formatPrice(actualComparePrice)}
                      </span>
                    )}
                    <span className="text-3xl font-bold text-emerald-600">
                      {formatPrice(actualPrice)}
                    </span>
                  </div>
                  
                  {/* Mini trust indicators */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Truck size={14} className="text-emerald-500" />
                      ফ্রি শিপিং
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-emerald-500" />
                      ২-৩ দিনে ডেলিভারি
                    </span>
                  </div>
                </div>
              )}
              
              {/* Variant Selection */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {variantLabel}
                  </label>
                  <div className="space-y-2">
                    {actualVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => actions.setSelectedVariant(variant)}
                        className="w-full flex items-center justify-between p-4 rounded-xl transition-all border-2"
                        style={{
                          backgroundColor: state.selectedVariant?.id === variant.id ? '#ECFDF5' : '#fff',
                          borderColor: state.selectedVariant?.id === variant.id ? primaryColor : '#E5E7EB',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: state.selectedVariant?.id === variant.id ? primaryColor : '#D1D5DB',
                              backgroundColor: state.selectedVariant?.id === variant.id ? primaryColor : 'transparent',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <CheckCircle2 size={12} className="text-white" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{variant.name}</span>
                        </div>
                        <span className="font-bold text-emerald-600">
                          {formatPrice(variant.price || calculations.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  {quantityLabel}
                </label>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(Math.max(1, state.quantity - 1))}
                    className="w-12 h-12 rounded-lg font-bold text-xl flex items-center justify-center transition-colors text-white"
                    style={{ background: primaryColor }}
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-900">
                    {state.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(state.quantity + 1)}
                    className="w-12 h-12 rounded-lg font-bold text-xl flex items-center justify-center transition-colors text-white"
                    style={{ background: primaryColor }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Trust list */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="space-y-2">
                  {['অরিজিনাল প্রোডাক্ট গ্যারান্টি', '৭ দিনের রিটার্ন পলিসি', '২৪/৭ কাস্টমার সাপোর্ট'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
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
                inputBg="#FFFFFF"
                inputBorder="#E5E7EB"
                inputText="#111827"
                primaryColor={primaryColor}
                mutedColor="#6B7280"
                textColor="#111827"
                cardBorder="#E5E7EB"
                isDark={false}
                buttonBg={`linear-gradient(135deg, ${primaryColor}, ${accentColor})`}
                buttonTextColor="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
