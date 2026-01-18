/**
 * Story-Driven Hero - Warm Emotional Narrative
 * Amber/cream bg, handwritten feel, quote styling
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function StoryDrivenHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section 
      className="relative py-20 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)' }}
    >
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20">❝</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 rotate-180">❝</div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          {badgeText && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-amber-100 border border-amber-300">
              <span className="text-2xl">💛</span>
              <span className="text-amber-800 font-semibold">{badgeText}</span>
            </div>
          )}
          
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight"
            style={{ color: '#78350F', fontFamily: 'Georgia, serif' }}
          >
            {headline}
          </h1>
          
          {subheadline && (
            <div 
              className="relative max-w-3xl mx-auto p-8 rounded-3xl"
              style={{ background: 'rgba(255, 255, 255, 0.7)', border: '2px dashed #D97706' }}
            >
              <p 
                className="text-xl md:text-2xl leading-relaxed italic"
                style={{ color: '#92400E', fontFamily: 'Georgia, serif' }}
              >
                "{subheadline}"
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="text-left">
                  <p className="font-bold text-amber-900">একজন সন্তুষ্ট গ্রাহক</p>
                  <p className="text-sm text-amber-700">ঢাকা, বাংলাদেশ</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <button 
            onClick={scrollToOrderForm}
            className="group inline-flex items-center gap-3 px-10 py-5 text-xl font-bold rounded-2xl transition-all hover:scale-105 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
              color: 'white',
              boxShadow: '0 10px 40px rgba(217, 119, 6, 0.3)',
            }}
          >
            <span>{ctaText}</span>
            <span className="text-2xl group-hover:animate-bounce">❤️</span>
          </button>
          
          <p className="mt-6 text-amber-700 text-lg">
            আজই আপনার গল্প শুরু করুন...
          </p>
        </div>
      </div>
    </section>
  );
}
