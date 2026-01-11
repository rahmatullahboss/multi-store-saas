/**
 * Hero Section Component
 * 
 * The main hero section with headline, product image, and urgency badge
 */

import { motion } from 'framer-motion';
import { Star, ShoppingBag, ChevronRight } from 'lucide-react';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { BaseSectionProps } from './types';

interface HeroSectionProps extends BaseSectionProps {
  discount?: number;
}

export function HeroSection({ config, product, discount = 0 }: HeroSectionProps) {
  return (
    <section className="relative pt-6 pb-12 overflow-hidden bg-white rounded-b-[3rem] shadow-sm md:pt-12">
      <div className="container max-w-4xl mx-auto px-4">
        
        {/* Urgent Badge */}
        {config.urgencyText && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-medium text-sm animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {config.urgencyText}
            </div>
          </motion.div>
        )}

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-center mb-4 leading-tight text-gray-900 px-2 tracking-tight">
          {config.headline}
        </h1>
        
        {config.subheadline && (
          <p className="text-base sm:text-lg md:text-xl text-center text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            {config.subheadline}
          </p>
        )}

        {/* Rating Snippet */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
          </div>
          <span className="text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4">
            (১,৫০০+ কাস্টমার রিভিউ)
          </span>
        </div>

        {/* Product Image */}
        <div className="relative mx-auto mt-8 max-w-[500px]">
          {discount > 0 && (
            <div className="absolute -top-4 -right-4 z-10 bg-red-600 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold shadow-lg rotate-12">
              <span className="text-xs">ছাড়</span>
              <span className="text-lg leading-none">{discount}%</span>
            </div>
          )}
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gray-100 border-4 border-white">
            {product.imageUrl ? (
              <OptimizedImage
                src={product.imageUrl}
                alt={product.title}
                width={800}
                height={800}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-300">
                <ShoppingBag size={80} />
              </div>
            )}
          </div>
        </div>

        {/* CTA Button (Desktop) */}
        <div className="mt-10 text-center hidden md:block">
          <a href="#order-form" className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full font-bold text-xl shadow-xl shadow-emerald-200 hover:shadow-2xl hover:scale-105 transition transform">
            <span>অর্ডার করতে ক্লিক করুন</span>
            <ChevronRight />
          </a>
          <p className="mt-3 text-sm text-gray-500">স্টক সীমিত! দ্রুত অর্ডার করুন</p>
        </div>
      </div>
    </section>
  );
}
