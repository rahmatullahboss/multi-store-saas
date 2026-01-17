/**
 * Trust-First Hero - Green, Testimonial Focused
 * Floating review cards, stats row, emerald gradients
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function TrustFirstHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section 
      className="relative py-20 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)' }}
    >
      {/* Floating review cards */}
      <div className="absolute top-20 left-8 hidden lg:block animate-float">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-emerald-100 max-w-[200px] transform -rotate-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm">👤</div>
            <div>
              <p className="text-xs font-semibold text-gray-800">রাহিম</p>
              <p className="text-yellow-500 text-xs">⭐⭐⭐⭐⭐</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">"অসাধারণ প্রোডাক্ট!"</p>
        </div>
      </div>
      
      <div className="absolute bottom-20 right-8 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-emerald-100 max-w-[200px] transform rotate-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm">👩</div>
            <div>
              <p className="text-xs font-semibold text-gray-800">ফাতেমা</p>
              <p className="text-yellow-500 text-xs">⭐⭐⭐⭐⭐</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">"সেরা সার্ভিস!"</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-white shadow-md border border-emerald-200">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-emerald-800 font-semibold">{badgeText}</span>
          </div>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {headline}
        </h1>
        
        {subheadline && (
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}
        
        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">১৫,০০০+</p>
            <p className="text-sm text-gray-500">সন্তুষ্ট গ্রাহক</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">৪.৯/৫</p>
            <p className="text-sm text-gray-500">গড় রেটিং</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-600">৯৮%</p>
            <p className="text-sm text-gray-500">পজিটিভ রিভিউ</p>
          </div>
        </div>
        
        <button 
          onClick={scrollToOrderForm}
          className="inline-flex items-center gap-3 px-10 py-5 text-xl font-bold text-white rounded-2xl transition-all hover:scale-105 cursor-pointer shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          {ctaText}
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
        
        {/* Trust icons */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm font-medium">১০০% নিরাপদ</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">🚚</span>
            <span className="text-sm font-medium">ক্যাশ অন ডেলিভারি</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-2xl">↩️</span>
            <span className="text-sm font-medium">৭ দিন রিটার্ন</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-10px) rotate(-6deg); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
