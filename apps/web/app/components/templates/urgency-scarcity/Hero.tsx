/**
 * Urgency-Scarcity Hero - FOMO Focused Design
 * 
 * UNIQUE STRUCTURE:
 * - Blinking urgency elements
 * - Multiple countdown timers
 * - Stock warning bars
 * - "X people viewing" notifications
 * - Flash sale aesthetic
 * - Dark dramatic background
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Eye, ShoppingCart, Flame, Zap, TrendingUp } from 'lucide-react';
import { MagicSectionWrapper } from '~/components/editor';
import { OptimizedImage } from '~/components/OptimizedImage';
import type { SectionProps } from '../_core/types';

export function UrgencyScarcityHero({
  config,
  product,
  isEditMode,
  onUpdate,
  formatPrice,
}: SectionProps) {
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  // Simulated live viewers
  const [viewers, setViewers] = useState(47);
  const [stockPercent, setStockPercent] = useState(23);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Hero Section"
      data={{ headline: config.headline, subheadline: config.subheadline }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      {/* Dark dramatic background */}
      <section className="bg-black min-h-screen relative overflow-hidden">
        
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-yellow-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/20 rounded-full blur-[100px]" />

        {/* Flashing top bar */}
        <div className="bg-red-600 py-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-4 text-white">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-sm md:text-base animate-pulse">
              ⚠️ {config.heroBadgeText || 'সতর্কতা: স্টক প্রায় শেষ!'} ⚠️
            </span>
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 relative z-10">
          
          {/* Live viewers notification */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 animate-pulse">
              <Eye className="w-4 h-4 text-red-400" />
              <span className="text-white text-sm">
                <span className="font-bold text-red-400">{viewers}</span> জন এখন দেখছে
              </span>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>

          {/* Main headline with glow */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-center text-white mb-4 leading-tight">
            <span className="text-yellow-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              {config.headline}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 text-center max-w-2xl mx-auto mb-10">
            {config.subheadline}
          </p>

          {/* Countdown Timer - Large */}
          <div className="flex justify-center mb-10">
            <div className="bg-gradient-to-r from-red-900/50 via-red-800/50 to-red-900/50 border-2 border-red-500 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 justify-center mb-3">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-bold uppercase tracking-wider text-sm">
                  {config.heroCountdownText || 'অফার শেষ হবে'}
                </span>
              </div>
              <div className="flex items-center gap-3 md:gap-6">
                {[
                  { value: '02', label: 'ঘণ্টা' },
                  { value: '45', label: 'মিনিট' },
                  { value: '30', label: 'সেকেন্ড' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-6">
                    <div className="text-center">
                      <div className="bg-black border-2 border-red-500 rounded-lg px-4 py-3 min-w-[70px]">
                        <span className="text-4xl md:text-5xl font-mono font-black text-white">
                          {item.value}
                        </span>
                      </div>
                      <span className="text-red-400 text-xs mt-1 block uppercase">{item.label}</span>
                    </div>
                    {i < 2 && (
                      <span className="text-red-500 text-4xl font-bold animate-pulse">:</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-red-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]">
              <div className="grid md:grid-cols-2">
                
                {/* Image */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 flex items-center justify-center">
                  {/* Discount flash */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-black text-xl animate-bounce shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        -{discount}%
                      </div>
                    </div>
                  )}
                  
                  {/* Stock warning */}
                  <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={12} />
                    মাত্র {stockPercent}% বাকি
                  </div>

                  {product.imageUrl ? (
                    <OptimizedImage
                      src={product.imageUrl}
                      alt={product.title}
                      className="max-w-full max-h-80 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gray-800 rounded-2xl" />
                  )}
                </div>

                {/* Info */}
                <div className="p-8 flex flex-col justify-center">
                  {/* Stock bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <TrendingUp size={14} />
                        দ্রুত বিক্রি হচ্ছে!
                      </span>
                      <span className="text-gray-400">{stockPercent}% বাকি</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-yellow-500 rounded-full transition-all animate-pulse"
                        style={{ width: `${stockPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-gray-400 text-sm mb-1">{config.heroPriceLabel || 'ফ্ল্যাশ সেল মূল্য'}</p>
                    <div className="flex items-baseline gap-4">
                      <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-2xl text-gray-500 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Urgency points */}
                  <div className="space-y-2 mb-6">
                    {[
                      '✓ আজকেই অর্ডার করলে ফ্রি ডেলিভারি',
                      '✓ মাত্র ১৫টি বাকি আছে',
                      '✓ এই দামে আর পাবেন না',
                    ].map((point, i) => (
                      <p key={i} className="text-gray-300 text-sm flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" />
                        {point}
                      </p>
                    ))}
                  </div>

                  {/* CTA - Glowing */}
                  <a
                    href="#order-form"
                    className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:from-yellow-300 hover:to-yellow-400 text-black py-5 rounded-xl font-black text-xl text-center transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] active:scale-[0.98] animate-pulse"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <ShoppingCart className="fill-black" />
                      {config.heroCtaText || 'এখনই অর্ডার করুন'}
                    </span>
                  </a>

                  <p className="text-center text-gray-500 text-xs mt-4">
                    ⚡ ক্যাশ অন ডেলিভারি ⚡ দ্রুত শিপিং ⚡
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shimmer animation */}
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </section>
    </MagicSectionWrapper>
  );
}
