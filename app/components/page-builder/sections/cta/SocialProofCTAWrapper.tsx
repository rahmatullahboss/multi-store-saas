/**
 * Social Proof CTA Wrapper
 * Facebook-style with engagement indicators
 */

import type { CTAWrapperProps } from './types';

export function SocialProofCTAWrapper({ children, headline, subheadline }: CTAWrapperProps) {
  return (
    <section 
      id="order-form"
      className="py-12 px-4"
      style={{ background: '#F0F2F5' }}
      data-section-type="cta"
    >
      <div className="max-w-2xl mx-auto">
        {/* Facebook-style card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="p-4 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
              📦
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
                অর্ডার ফর্ম
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </p>
              <p className="text-xs text-gray-500">সিকিউর চেকআউট</p>
            </div>
          </div>
          
          {/* Header content */}
          {(headline || subheadline) && (
            <div className="p-4 border-b border-gray-100">
              {headline && (
                <h2 className="text-xl font-bold text-gray-900 mb-1">{headline}</h2>
              )}
              {subheadline && (
                <p className="text-gray-600 text-sm">{subheadline}</p>
              )}
            </div>
          )}
          
          {/* Engagement stats */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">👍</span>
                <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">❤️</span>
              </div>
              <span className="text-xs text-gray-500 ml-1">৩৪৭ জন অর্ডার করেছেন</span>
            </div>
          </div>
          
          {/* Form content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Recent orders */}
          <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500 font-semibold">সাম্প্রতিক অর্ডার:</p>
            {[
              { name: 'Rahim', time: '২ মি. আগে', location: 'ঢাকা' },
              { name: 'Fatema', time: '৫ মি. আগে', location: 'চট্টগ্রাম' },
            ].map((order, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">👤</div>
                <span className="text-gray-700">{order.name} ({order.location})</span>
                <span className="text-gray-400">• {order.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
