/**
 * Neubrutalist CTA Wrapper
 * Bold borders, offset shadows, raw aesthetic
 */

import type { CTAWrapperProps } from './types';

export function NeubrutalistCTAWrapper({ children, headline, subheadline }: CTAWrapperProps) {
  return (
    <section 
      id="order-form"
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: '#FEF08A' }}
      data-section-type="cta"
    >
      {/* Decorative shapes */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-[#FF6B6B] rounded-full border-4 border-black" />
      <div className="absolute bottom-10 left-10 w-20 h-20 bg-[#4ECDC4] border-4 border-black rotate-45" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        {(headline || subheadline) && (
          <div className="text-center mb-10">
            {headline && (
              <h2 
                className="text-4xl md:text-5xl font-black mb-4 uppercase"
                style={{ color: '#000', textShadow: '4px 4px 0 #FF6B6B' }}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>{subheadline}</p>
            )}
          </div>
        )}
        
        {/* Form card with brutalist style */}
        <div 
          className="p-8 md:p-12"
          style={{
            background: '#fff',
            border: '6px solid #000',
            boxShadow: '12px 12px 0 #000',
          }}
        >
          {children}
        </div>
        
        {/* Sticker */}
        <div 
          className="absolute -top-4 -right-4 px-4 py-2 text-sm font-black uppercase rotate-12"
          style={{ background: '#4ECDC4', border: '3px solid #000' }}
        >
          অর্ডার! 📦
        </div>
      </div>
    </section>
  );
}
