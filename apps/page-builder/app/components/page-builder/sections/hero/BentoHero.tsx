/**
 * Bento Grid Hero - Apple/Tech Style
 * Black bg, modular grid boxes, stats cards, minimal
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function BentoHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section className="py-16 px-6" style={{ background: '#000' }}>
      <div className="max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4 auto-rows-[120px] md:auto-rows-[150px]">
          
          {/* Main Hero Card - spans 4 columns and 2 rows */}
          <div 
            className="col-span-4 row-span-2 rounded-3xl p-8 md:p-12 flex flex-col justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              {badgeText && (
                <span className="inline-block px-4 py-2 mb-6 text-sm font-semibold rounded-full bg-white/10 text-purple-300 border border-purple-500/30">
                  {badgeText}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {headline}
              </h1>
              {subheadline && (
                <p className="text-lg text-gray-400 max-w-xl">{subheadline}</p>
              )}
            </div>
          </div>
          
          {/* CTA Card */}
          <div 
            className="col-span-2 row-span-1 rounded-3xl p-6 flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' }}
            onClick={scrollToOrderForm}
          >
            <span className="text-white font-bold text-lg flex items-center gap-2">
              {ctaText}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
          
          {/* Stats Cards */}
          <div 
            className="col-span-2 row-span-1 rounded-3xl p-6 flex flex-col justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-3xl font-bold text-white">১৫K+</span>
            <span className="text-gray-500 text-sm">সন্তুষ্ট গ্রাহক</span>
          </div>
          
          <div 
            className="col-span-2 row-span-1 rounded-3xl p-6 flex flex-col justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-3xl font-bold text-white">৪.৯⭐</span>
            <span className="text-gray-500 text-sm">গড় রেটিং</span>
          </div>
          
          <div 
            className="col-span-2 row-span-1 rounded-3xl p-6 flex flex-col justify-center"
            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <span className="text-3xl font-bold text-emerald-400">১০০%</span>
            <span className="text-emerald-500/70 text-sm">অরিজিনাল গ্যারান্টি</span>
          </div>
          
          <div 
            className="col-span-2 row-span-1 rounded-3xl p-6 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-center">
              <span className="text-2xl">🚚</span>
              <p className="text-gray-400 text-xs mt-1">ফ্রি ডেলিভারি</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
