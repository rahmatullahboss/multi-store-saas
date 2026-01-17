/**
 * Story-Driven CTA Wrapper
 * Warm emotional style with amber theme
 */

import type { CTAWrapperProps } from './types';

export function StoryDrivenCTAWrapper({ children, headline, subheadline }: CTAWrapperProps) {
  return (
    <section 
      id="order-form"
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' }}
      data-section-type="cta"
    >
      {/* Decorative quotes */}
      <div className="absolute top-10 left-10 text-6xl opacity-10">❝</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10 rotate-180">❝</div>
      
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header with emotional touch */}
        {(headline || subheadline) && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-amber-100 border border-amber-300">
              <span className="text-xl">💛</span>
              <span className="text-amber-800 font-semibold text-sm">আপনার পালা</span>
            </div>
            {headline && (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ color: '#78350F', fontFamily: 'Georgia, serif' }}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p 
                className="text-lg italic"
                style={{ color: '#92400E', fontFamily: 'Georgia, serif' }}
              >
                "{subheadline}"
              </p>
            )}
          </div>
        )}
        
        {/* Form card */}
        <div 
          className="bg-white rounded-3xl p-8 md:p-12"
          style={{ 
            border: '2px dashed #D97706',
            boxShadow: '0 10px 40px rgba(217, 119, 6, 0.1)',
          }}
        >
          {children}
        </div>
        
        {/* Emotional footer */}
        <p className="text-center mt-8 text-amber-700 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
          আজই আপনার সফলতার গল্প শুরু করুন ❤️
        </p>
      </div>
    </section>
  );
}
