/**
 * Glassmorphism CTA Wrapper
 * Frosted glass effect with blur and gradients
 */

import type { CTAWrapperProps } from './types';

export function GlassmorphismCTAWrapper({ children, headline, subheadline }: CTAWrapperProps) {
  return (
    <section 
      id="order-form"
      className="relative py-20 px-4 overflow-hidden"
      data-section-type="cta"
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0F0F23 0%, #1a1a3e 50%, #2d1b4e 100%)' }} />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        {(headline || subheadline) && (
          <div className="text-center mb-10">
            {headline && (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 50%, #818CF8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="text-lg text-gray-300 opacity-80">{subheadline}</p>
            )}
          </div>
        )}
        
        {/* Form card with glass effect */}
        <div 
          className="backdrop-blur-xl rounded-3xl p-8 md:p-12"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
