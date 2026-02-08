/**
 * Urgency Guarantee - Dark FOMO style
 */

import { ShieldCheck } from 'lucide-react';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { GuaranteeVariantProps } from './types';

export function UrgencyGuarantee({ title, text, badgeLabel, theme: _theme, styleProps }: GuaranteeVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6 relative" 
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#0F0F0F',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-2xl mx-auto relative z-10">
        <div 
          className="p-10 rounded-xl text-center relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #065F46, #047857)',
            border: '2px solid #10B981',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)',
          }}
        >
          {/* Corner badge */}
          <div 
            className="absolute top-0 right-0 px-4 py-2 font-bold text-xs uppercase"
            style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
          >
            সীমিত অফার
          </div>
          
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            <ShieldCheck size={40} className="text-white" />
          </div>
          
          {title && (
            <h2 
              className="text-3xl font-black mb-4 uppercase"
              style={{ color: headingColor || '#FFFFFF', ...headingStyle }}
            >
              {title}
            </h2>
          )}
          
          {text && (
            <p className="text-lg mb-6 text-emerald-100 leading-relaxed">
              {text}
            </p>
          )}
          
          {badgeLabel && (
            <span 
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded animate-pulse"
              style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
            >
              🔒 {badgeLabel}
            </span>
          )}
          
          {/* Urgency footer */}
          <div className="mt-8 pt-6 border-t border-emerald-500/30 text-sm text-emerald-200">
            ⚡ এই গ্যারান্টি শুধুমাত্র আজকের অর্ডারের জন্য প্রযোজ্য
          </div>
        </div>
      </div>
    </section>
  );
}
