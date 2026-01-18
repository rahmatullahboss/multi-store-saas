/**
 * Social Proof Order Form Variant
 * Facebook/social media style with reviews, reactions, and social proof
 */

import { useState } from 'react';
import { ThumbsUp, MessageCircle, Share2, Star, Users, Heart, CheckCircle } from 'lucide-react';
import type { OrderFormComponentProps } from './types';
import { useOrderForm } from './useOrderForm';
import { OrderFormFields } from './OrderFormFields';

export function SocialProofOrderForm({ props, theme, storeId, productId, product }: OrderFormComponentProps) {
  const { fetcher, state, actions, calculations, props: typedProps } = useOrderForm(props, product);
  
  const {
    headline = 'হাজারো গ্রাহকের পছন্দ',
    subheadline = 'আপনিও যোগ দিন!',
    variantLabel = 'প্যাকেজ নির্বাচন করুন',
    quantityLabel = 'পরিমাণ',
  } = typedProps;
  
  const { actualVariants, actualProductImage, actualProductTitle, actualPrice, actualComparePrice, formatPrice } = calculations;
  
  // Social proof colors (Facebook inspired)
  const primaryColor = '#1877F2';
  const accentColor = '#42B72A';
  
  // Fake social stats
  const [likes] = useState(() => Math.floor(Math.random() * 2000) + 3000);
  const [shares] = useState(() => Math.floor(Math.random() * 500) + 200);
  
  // Fake reviews
  const reviews = [
    { name: 'রহিম আহমেদ', rating: 5, text: 'অসাধারণ প্রোডাক্ট! সবাইকে রেকমেন্ড করছি।', time: '২ ঘন্টা আগে', avatar: '👨' },
    { name: 'ফাতেমা খানম', rating: 5, text: 'দ্রুত ডেলিভারি পেয়েছি। ধন্যবাদ!', time: '৫ ঘন্টা আগে', avatar: '👩' },
    { name: 'করিম সাহেব', rating: 4, text: 'ভালো কোয়ালিটি, দাম সাশ্রয়ী।', time: '১ দিন আগে', avatar: '👴' },
  ];
  
  return (
    <section 
      id="order-form" 
      className="relative py-12 px-4"
      style={{ background: '#F0F2F5' }}
      data-section-type="cta"
    >
      <div className="max-w-4xl mx-auto">
        {/* Facebook-style post card */}
        <div 
          className="bg-white rounded-lg shadow-sm mb-4"
          style={{ border: '1px solid #DADDE1' }}
        >
          {/* Post header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: primaryColor }}
            >
              🏪
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-gray-900">অফিশিয়াল স্টোর</span>
                <CheckCircle size={16} className="text-blue-500 fill-blue-500" />
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>স্পন্সরড</span>
                <span>•</span>
                <span>🌐</span>
              </div>
            </div>
          </div>
          
          {/* Post content */}
          <div className="p-4">
            <p className="text-gray-900 mb-2">
              🔥 <strong>{headline}</strong> - {subheadline}
            </p>
            <p className="text-gray-600 text-sm">
              ✅ অরিজিনাল প্রোডাক্ট ✅ ক্যাশ অন ডেলিভারি ✅ ৭ দিনে রিটার্ন
            </p>
          </div>
          
          {/* Product image */}
          {actualProductImage && (
            <div className="relative">
              <img 
                src={actualProductImage} 
                alt={actualProductTitle || 'প্রোডাক্ট'} 
                className="w-full h-64 object-cover"
              />
              {/* Price overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {actualComparePrice > actualPrice && (
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-bold line-through"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    ৳{actualComparePrice}
                  </span>
                )}
                <span 
                  className="px-4 py-2 rounded-full text-lg font-bold"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  ৳{actualPrice}
                </span>
              </div>
            </div>
          )}
          
          {/* Reactions bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">👍</span>
                <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px]">❤️</span>
                <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">😍</span>
              </div>
              <span className="text-sm text-gray-500 ml-1">{likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>৪৫২ কমেন্ট</span>
              <span>{shares} শেয়ার</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-around py-1 border-b border-gray-200">
            {[
              { icon: ThumbsUp, label: 'Like', color: primaryColor },
              { icon: MessageCircle, label: 'Comment', color: '#65676B' },
              { icon: Share2, label: 'Share', color: '#65676B' },
            ].map((action, i) => (
              <button
                key={i}
                className="flex items-center gap-2 py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <action.icon size={20} style={{ color: action.color }} />
                <span className="font-medium text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
          
          {/* Reviews section */}
          <div className="p-4 space-y-4 bg-gray-50">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span>সাম্প্রতিক রিভিউ</span>
            </div>
            {reviews.map((review, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-lg">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div 
                    className="inline-block px-3 py-2 rounded-2xl"
                    style={{ background: '#E4E6EB' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900">{review.name}</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star key={j} size={10} className="text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{review.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 ml-3">
                    <button className="font-medium hover:underline">Like</button>
                    <button className="font-medium hover:underline">Reply</button>
                    <span>{review.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Form Card */}
        <div 
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          style={{ border: '1px solid #DADDE1' }}
        >
          {/* Social proof header */}
          <div 
            className="flex items-center justify-center gap-3 py-3 px-4"
            style={{ background: primaryColor }}
          >
            <Users size={18} className="text-white" />
            <span className="text-white font-medium text-sm">
              আজ {Math.floor(Math.random() * 50) + 30} জন অর্ডার করেছে
            </span>
          </div>
          
          <div className="grid md:grid-cols-2">
            {/* Left - Variants & Quantity */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200">
              {/* Product title */}
              {actualProductTitle && (
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {actualProductTitle}
                  <CheckCircle size={20} className="text-blue-500" />
                </h3>
              )}
              
              {/* Rating summary */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="font-bold text-gray-900">4.9</span>
                <span className="text-gray-500 text-sm">(২,৪৫৬ রিভিউ)</span>
              </div>
              
              {/* Variant Selection */}
              {actualVariants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {variantLabel}
                  </label>
                  <div className="space-y-2">
                    {actualVariants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => actions.setSelectedVariant(variant)}
                        className="w-full flex items-center justify-between p-4 rounded-lg transition-all border-2"
                        style={{
                          backgroundColor: state.selectedVariant?.id === variant.id ? '#E7F3FF' : '#fff',
                          borderColor: state.selectedVariant?.id === variant.id ? primaryColor : '#DADDE1',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                            style={{ 
                              borderColor: state.selectedVariant?.id === variant.id ? primaryColor : '#DADDE1',
                              backgroundColor: state.selectedVariant?.id === variant.id ? primaryColor : 'transparent',
                            }}
                          >
                            {state.selectedVariant?.id === variant.id && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{variant.name}</span>
                        </div>
                        <span className="font-bold" style={{ color: primaryColor }}>
                          {formatPrice(variant.price || calculations.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {quantityLabel}
                </label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => actions.setQuantity(Math.max(1, state.quantity - 1))}
                    className="w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center text-white"
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
                    className="w-10 h-10 rounded-lg font-bold text-xl flex items-center justify-center text-white"
                    style={{ background: primaryColor }}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Social proof badges */}
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-full text-xs font-medium text-green-700">
                  <Heart size={12} className="text-green-500" />
                  <span>বেস্ট সেলার</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full text-xs font-medium text-blue-700">
                  <ThumbsUp size={12} className="text-blue-500" />
                  <span>৯৮% পজিটিভ রিভিউ</span>
                </div>
              </div>
            </div>
            
            {/* Right - Form */}
            <div className="p-6">
              <OrderFormFields
                state={state}
                actions={actions}
                calculations={calculations}
                props={typedProps}
                fetcher={fetcher}
                storeId={storeId}
                productId={productId}
                inputBg="#FFFFFF"
                inputBorder="#DADDE1"
                inputText="#1C1E21"
                primaryColor={primaryColor}
                mutedColor="#65676B"
                textColor="#1C1E21"
                cardBorder="#DADDE1"
                isDark={false}
                buttonBg={`linear-gradient(135deg, ${primaryColor}, #1565C0)`}
                buttonTextColor="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
