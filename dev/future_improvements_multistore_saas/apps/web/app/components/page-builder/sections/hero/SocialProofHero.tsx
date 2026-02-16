/**
 * Social Proof Hero - Facebook/Social Media Style
 * FB post card, reactions, comments, blue theme
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function SocialProofHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section className="py-12 px-6" style={{ background: '#F0F2F5' }}>
      <div className="max-w-2xl mx-auto">
        {/* Facebook-style post card */}
        <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
          {/* Post header */}
          <div className="p-4 flex items-center gap-3 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              🏪
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 flex items-center gap-1">
                অফিশিয়াল স্টোর
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </p>
              <p className="text-xs text-gray-500">Sponsored · 📱</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">•••</button>
          </div>
          
          {/* Post content */}
          <div className="p-4">
            {badgeText && <p className="text-blue-600 font-semibold mb-2">{badgeText}</p>}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight">{headline}</h1>
            {subheadline && <p className="text-gray-600 mb-4">{subheadline}</p>}
          </div>
          
          {/* Image placeholder */}
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
          
          {/* Engagement stats */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">👍</span>
                <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">❤️</span>
                <span className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">😮</span>
              </div>
              <span className="text-sm text-gray-500 ml-1">২.৪K</span>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>৩৪৭ মন্তব্য</span>
              <span>৮৯ শেয়ার</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="px-4 py-2 border-t border-gray-100 grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 font-semibold text-sm">👍 Like</button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 font-semibold text-sm">💬 Comment</button>
            <button className="flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-100 text-gray-600 font-semibold text-sm">↗️ Share</button>
          </div>
          
          {/* CTA Button */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={scrollToOrderForm}
              className="w-full py-3 font-bold text-white rounded-lg transition-all hover:opacity-90 cursor-pointer"
              style={{ background: '#1877F2' }}
            >
              {ctaText} →
            </button>
          </div>
          
          {/* Recent comments */}
          <div className="px-4 pb-4 space-y-3">
            {[
              { name: 'Rahim Ahmed', text: 'আমি অর্ডার করেছি, অসাধারণ! 👍', time: '২ মি.' },
              { name: 'Fatema Begum', text: 'কোয়ালিটি সত্যিই ভালো 🔥', time: '৫ মি.' },
            ].map((comment, i) => (
              <div key={i} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">👤</div>
                <div className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
                  <p className="font-semibold text-sm text-gray-900">{comment.name}</p>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>
                <span className="text-xs text-gray-400 self-end">{comment.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
