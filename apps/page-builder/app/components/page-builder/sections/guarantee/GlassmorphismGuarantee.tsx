/**
 * Glassmorphism Guarantee - Frosted glass style
 */

import { ShieldCheck } from 'lucide-react';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { GuaranteeVariantProps } from './types';

export function GlassmorphismGuarantee({ title, text, badgeLabel, theme, styleProps }: GuaranteeVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative overflow-hidden" 
      style={{
        background: sectionStyle.background || 'linear-gradient(135deg, #0F0F23 0%, #1a1a3e 50%, #0F0F23 100%)',
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {/* Background glow */}
      <div 
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ 
          background: 'radial-gradient(circle, #10B981, transparent)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        <div 
          className="p-10 rounded-3xl text-center"
          style={{ 
            background: 'rgba(16, 185, 129, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
          }}
        >
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <ShieldCheck size={40} className="text-emerald-400" />
          </div>
          
          {title && (
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
            >
              {title}
            </h2>
          )}
          
          {text && (
            <p className="text-lg mb-6 text-white/70 leading-relaxed">
              {text}
            </p>
          )}
          
          {badgeLabel && (
            <span 
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-full text-sm"
              style={{ 
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
              }}
            >
              ✓ {badgeLabel}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
