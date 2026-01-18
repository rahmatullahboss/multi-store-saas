/**
 * Neubrutalist Hero - Bold & Raw Aesthetic
 * Yellow bg, thick black borders, offset shadows, uppercase
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function NeubrutalistHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section 
      className="relative py-20 px-6 overflow-hidden"
      style={{ background: '#FEF08A' }}
    >
      {/* Decorative shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-[#FF6B6B] rounded-full border-4 border-black" />
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-[#4ECDC4] border-4 border-black rotate-45" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-[#A855F7] border-4 border-black" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            {badgeText && (
              <div 
                className="inline-block px-6 py-3 mb-6 text-lg font-black uppercase tracking-wider"
                style={{
                  background: '#000',
                  color: '#FEF08A',
                  border: '4px solid #000',
                  transform: 'rotate(-2deg)',
                }}
              >
                {badgeText}
              </div>
            )}
            
            <h1 
              className="text-5xl md:text-7xl font-black mb-6 leading-none uppercase"
              style={{
                color: '#000',
                textShadow: '4px 4px 0 #FF6B6B, 8px 8px 0 #4ECDC4',
              }}
            >
              {headline}
            </h1>
            
            {subheadline && (
              <p className="text-xl md:text-2xl font-bold mb-8 leading-relaxed" style={{ color: '#1a1a1a' }}>
                {subheadline}
              </p>
            )}
            
            <button 
              onClick={scrollToOrderForm}
              className="group relative px-10 py-5 text-xl font-black uppercase tracking-wider cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1"
              style={{
                background: '#000',
                color: '#FEF08A',
                border: '4px solid #000',
                boxShadow: '8px 8px 0 #000',
              }}
            >
              {ctaText} →
            </button>
          </div>
          
          {/* Right - Image placeholder with brutalist frame */}
          <div className="relative">
            <div 
              className="aspect-square flex items-center justify-center text-2xl font-black"
              style={{
                background: '#fff',
                border: '6px solid #000',
                boxShadow: '12px 12px 0 #000',
              }}
            >
              <span className="text-gray-400">📦 PRODUCT</span>
            </div>
            {/* Sticker */}
            <div 
              className="absolute -top-6 -right-6 px-4 py-2 text-sm font-black uppercase rotate-12"
              style={{
                background: '#FF6B6B',
                border: '3px solid #000',
              }}
            >
              HOT! 🔥
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
