/**
 * Social Proof Hero - Facebook/WhatsApp Style
 * 
 * UNIQUE STRUCTURE:
 * - Facebook post-like product card
 * - WhatsApp chat bubble testimonials
 * - Reaction counts (likes, comments, shares)
 * - Social media familiar UI
 * - Comment section preview
 */

import { ThumbsUp, MessageCircle, Share2, Heart, Send, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function SocialProofHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
}: SectionProps) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  // Sample comments
  const sampleComments = [
    { name: 'Rahim Ahmed', text: 'আমি অর্ডার করেছি, খুবই ভালো প্রোডাক্ট! 👍', time: '2 ঘন্টা আগে', verified: true },
    { name: 'Fatema Begum', text: 'এটা কি সত্যিই কাজ করে?', time: '1 ঘন্টা আগে', verified: false },
    { name: 'Seller', text: '@Fatema Begum জি আপা, ১০০% গ্যারান্টি সহ। অর্ডার করুন। ❤️', time: '45 মিনিট আগে', verified: true, isReply: true },
  ];

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero Section"
      data={{ headline: config.headline, subheadline: config.subheadline }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      {/* Facebook-like gray background */}
      <section className="bg-[#F0F2F5] min-h-screen py-8 md:py-16">
        <div className="max-w-lg mx-auto px-4">
          
          {/* Facebook Post Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900">Seller Official</span>
                    <CheckCircle2 size={14} className="text-blue-500 fill-blue-500" />
                  </div>
                  <p className="text-gray-500 text-xs">Sponsored · 🌐</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Post Text */}
            <div className="px-4 pb-3">
              <p className="text-gray-900 text-base leading-relaxed">
                🔥 <span className="font-bold">{config.headline}</span>
              </p>
              <p className="text-gray-700 mt-2">
                {config.subheadline}
              </p>
              {discount > 0 && (
                <p className="text-red-600 font-bold mt-2">
                  ⚡ {discount}% ছাড়! সীমিত সময়ের জন্য! ⚡
                </p>
              )}
              <p className="text-blue-600 text-sm mt-1">#বাংলাদেশ #অনলাইনশপ #বেস্টডিল</p>
            </div>

            {/* Product Image */}
            <div className="relative">
              {product.imageUrl ? (
                <OptimizedImage
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200" />
              )}
              
              {/* Price overlay - Like FB Marketplace */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{config.heroPriceLabel || 'মূল্য মাত্র'}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
                      {product.compareAtPrice && (
                        <span className="text-lg text-white/60 line-through">{formatPrice(product.compareAtPrice)}</span>
                      )}
                    </div>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    In Stock
                  </span>
                </div>
              </div>
            </div>

            {/* Reactions Bar */}
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <ThumbsUp size={10} className="text-white fill-white" />
                  </div>
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <Heart size={10} className="text-white fill-white" />
                  </div>
                </div>
                <span className="text-gray-500 text-sm ml-1">2.4K</span>
              </div>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span>347 মন্তব্য</span>
                <span>89 শেয়ার</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-2 flex justify-around border-b border-gray-100">
              <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                <ThumbsUp size={20} />
                <span className="font-medium">Like</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                <MessageCircle size={20} />
                <span className="font-medium">Comment</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
                <Share2 size={20} />
                <span className="font-medium">Share</span>
              </button>
            </div>

            {/* Comments Section */}
            <div className="p-4 space-y-4">
              {sampleComments.map((comment, i) => (
                <div key={i} className={`flex gap-2 ${comment.isReply ? 'ml-8' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                    comment.name === 'Seller' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-400'
                  }`}>
                    {comment.name[0]}
                  </div>
                  <div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-gray-900">{comment.name}</span>
                        {comment.verified && <CheckCircle2 size={12} className="text-blue-500 fill-blue-500" />}
                      </div>
                      <p className="text-gray-800 text-sm">{comment.text}</p>
                    </div>
                    <div className="flex gap-4 mt-1 ml-2 text-xs text-gray-500">
                      <span>{comment.time}</span>
                      <button className="font-bold hover:underline">Like</button>
                      <button className="font-bold hover:underline">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order CTA - Styled like comment input */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <a
                href="#order-form"
                className="flex items-center justify-center gap-3 w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-4 rounded-xl font-bold text-lg transition-colors"
              >
                <Send size={20} />
                {config.heroCtaText || 'এখনই অর্ডার করুন'}
              </a>
              <p className="text-center text-gray-500 text-xs mt-2">
                ক্যাশ অন ডেলিভারি • ফ্রি শিপিং • ১০০% অরিজিনাল
              </p>
            </div>
          </div>

          {/* WhatsApp Chat Bubble - Side testimonial */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center">
                <MessageCircle size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">WhatsApp Messages</span>
            </div>
            
            {/* Chat bubbles */}
            <div className="space-y-2">
              <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                <p className="text-gray-800 text-sm">ভাইয়া প্রোডাক্ট পেয়েছি। অসাধারণ! 🔥</p>
                <p className="text-[10px] text-gray-500 text-right">10:30 AM ✓✓</p>
              </div>
              <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                <p className="text-gray-800 text-sm">আমার বন্ধুদেরও বলবো অর্ডার করতে 👍</p>
                <p className="text-[10px] text-gray-500 text-right">10:32 AM ✓✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
