/**
 * Urgency CTA Wrapper
 * Dark theme with countdown and FOMO elements
 */

import type { CTAWrapperProps } from './types';

export function UrgencyCTAWrapper({ children, headline, subheadline }: CTAWrapperProps) {
  return (
    <section 
      id="order-form"
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: '#0F0F0F' }}
      data-section-type="cta"
    >
      {/* Warning stripes */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 animate-pulse" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 animate-pulse" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600 rounded-full opacity-10 blur-[150px]" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Urgency badges */}
        <div className="flex justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/30 border border-red-500/50">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-bold text-sm">👁️ ৪৭ জন দেখছেন</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-yellow-900/30 border border-yellow-500/50">
            <span className="text-yellow-400 font-bold text-sm">📦 মাত্র ১৫টি বাকি!</span>
          </div>
        </div>
        
        {/* Header */}
        {(headline || subheadline) && (
          <div className="text-center mb-10">
            {headline && (
              <h2 
                className="text-3xl md:text-4xl font-black text-white mb-3 uppercase"
                style={{ textShadow: '0 0 40px rgba(220, 38, 38, 0.5)' }}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="text-lg text-gray-400">{subheadline}</p>
            )}
          </div>
        )}
        
        {/* Form card */}
        <div 
          className="rounded-3xl p-8 md:p-12"
          style={{
            background: 'linear-gradient(180deg, #1F1F1F 0%, #0A0A0A 100%)',
            border: '2px solid rgba(220, 38, 38, 0.3)',
            boxShadow: '0 0 40px rgba(220, 38, 38, 0.2)',
          }}
        >
          {children}
        </div>
        
        {/* Countdown mock */}
        <div className="flex justify-center gap-4 mt-8">
          {['02', '45', '33'].map((num, i) => (
            <div key={i} className="text-center">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black"
                style={{
                  background: 'linear-gradient(180deg, #1F1F1F 0%, #0A0A0A 100%)',
                  border: '2px solid #DC2626',
                  color: '#FBBF24',
                }}
              >
                {num}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {i === 0 ? 'ঘণ্টা' : i === 1 ? 'মিনিট' : 'সেকেন্ড'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
