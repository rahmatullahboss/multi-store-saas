/**
 * Glassmorphism Hero - Awwwards 2025 Trend
 * Frosted glass with blur effects, animated orbs, gradient text
 */

import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseHeroProps } from './types';

export function GlassmorphismHero({ headline, subheadline, ctaText, badgeText }: BaseHeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0F0F23 0%, #1a1a3e 50%, #2d1b4e 100%)' }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-50 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30" />
      
      {/* Content card with glass effect */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div 
          className="backdrop-blur-xl rounded-3xl p-12 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          {badgeText && (
            <div 
              className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#E0E7FF',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              {badgeText}
            </div>
          )}
          
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #A5B4FC 50%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {headline}
          </h1>
          
          {subheadline && (
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed opacity-80">
              {subheadline}
            </p>
          )}
          
          <button 
            onClick={scrollToOrderForm}
            className="group relative px-8 py-4 font-bold text-lg rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            <span className="relative z-10 text-white flex items-center gap-2">
              {ctaText}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
        
        {/* Floating elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 border border-white/10 rounded-2xl rotate-12 backdrop-blur-sm" />
        <div className="absolute -bottom-10 -left-10 w-16 h-16 border border-white/10 rounded-full backdrop-blur-sm" />
      </div>
    </section>
  );
}
