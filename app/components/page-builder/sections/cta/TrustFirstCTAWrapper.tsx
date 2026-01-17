/**
 * Trust-First CTA Wrapper
 * Green theme with trust badges and floating reviews
 */

import type { CTAWrapperProps } from './types';

export function TrustFirstCTAWrapper({ children, headline, subheadline }: CTAWrapperProps) {
  return (
    <section 
      id="order-form"
      className="relative py-20 px-4 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' }}
      data-section-type="cta"
    >
      {/* Floating trust cards */}
      <div className="absolute top-10 left-8 hidden lg:block">
        <div className="bg-white rounded-xl p-3 shadow-lg border border-emerald-100 transform -rotate-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xs font-semibold text-emerald-700">১০০% নিরাপদ</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 right-8 hidden lg:block">
        <div className="bg-white rounded-xl p-3 shadow-lg border border-emerald-100 transform rotate-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xs font-semibold text-emerald-700">৪.৯/৫ রেটিং</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header with trust badge */}
        {(headline || subheadline) && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white shadow-md border border-emerald-200">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-800 font-semibold text-sm">সিকিউর অর্ডার ফর্ম</span>
            </div>
            {headline && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{headline}</h2>
            )}
            {subheadline && (
              <p className="text-lg text-gray-600">{subheadline}</p>
            )}
          </div>
        )}
        
        {/* Form card */}
        <div 
          className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl"
          style={{ border: '2px solid rgba(16, 185, 129, 0.2)' }}
        >
          {children}
        </div>
        
        {/* Trust footer */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">🔒</span>
            <span className="text-sm font-medium">SSL সিকিউর</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">🚚</span>
            <span className="text-sm font-medium">ফাস্ট ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-xl">↩️</span>
            <span className="text-sm font-medium">ইজি রিটার্ন</span>
          </div>
        </div>
      </div>
    </section>
  );
}
