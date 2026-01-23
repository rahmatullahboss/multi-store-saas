/**
 * Urgency Hero - Dark FOMO Style
 * Black bg, countdown timer, red accents, stock warnings
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function UrgencyHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section className="relative py-20 px-6 overflow-hidden" style={{ background: '#0F0F0F' }}>
      {/* Animated warning stripes */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 animate-pulse" />
      
      {/* Glowing red accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600 rounded-full opacity-10 blur-[150px]" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {badgeText && (
          <div 
            className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-lg animate-pulse"
            style={{
              background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 50%, #DC2626 100%)',
              boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)',
            }}
          >
            <span className="text-white font-black uppercase tracking-wider">{badgeText}</span>
          </div>
        )}
        
        {/* Countdown mock */}
        <div className="flex justify-center gap-4 mb-8">
          {['02', '45', '33'].map((num, i) => (
            <div key={i} className="text-center">
              <div 
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-3xl md:text-4xl font-black"
                style={{
                  background: 'linear-gradient(180deg, #1F1F1F 0%, #0A0A0A 100%)',
                  border: '2px solid #DC2626',
                  color: '#FBBF24',
                  boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)',
                }}
              >
                {num}
              </div>
              <p className="text-xs text-gray-500 mt-2 uppercase">
                {i === 0 ? 'ঘণ্টা' : i === 1 ? 'মিনিট' : 'সেকেন্ড'}
              </p>
            </div>
          ))}
        </div>
        
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight uppercase"
          style={{ color: '#FFFFFF', textShadow: '0 0 40px rgba(220, 38, 38, 0.5)' }}
        >
          {headline}
        </h1>
        
        {subheadline && (
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">{subheadline}</p>
        )}
        
        {/* Stock warning */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/30 border border-red-500/50">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-bold text-sm">👁️ ৪৭ জন এখন দেখছেন</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-yellow-900/30 border border-yellow-500/50">
            <span className="text-yellow-400 font-bold text-sm">📦 মাত্র ১৫টি বাকি!</span>
          </div>
        </div>
        
        <button 
          onClick={scrollToOrderForm}
          className="group relative px-12 py-6 text-2xl font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all hover:scale-105 overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 100%)',
            color: 'white',
            boxShadow: '0 0 40px rgba(220, 38, 38, 0.5)',
          }}
        >
          <span className="relative z-10 flex items-center gap-3">🔥 {ctaText}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </section>
  );
}
