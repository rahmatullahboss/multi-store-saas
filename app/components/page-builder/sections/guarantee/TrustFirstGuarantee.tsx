/**
 * Trust First Guarantee - Clean green trust style
 */

import { ShieldCheck } from 'lucide-react';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { GuaranteeVariantProps } from './types';

export function TrustFirstGuarantee({ title, text, badgeLabel, theme, styleProps }: GuaranteeVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6" 
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#F0FDF4',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div 
          className="p-10 rounded-3xl text-center relative"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '2px solid #BBF7D0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
          }}
        >
          {/* Trust badge corner */}
          <div 
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: '#22C55E', color: '#FFFFFF' }}
          >
            ✓ ১০০% গ্যারান্টি
          </div>
          
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: '#DCFCE7' }}
          >
            <ShieldCheck size={40} className="text-green-600" />
          </div>
          
          {title && (
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: headingColor || '#166534', ...headingStyle }}
            >
              {title}
            </h2>
          )}
          
          {text && (
            <p className="text-lg mb-6 text-gray-600 leading-relaxed">
              {text}
            </p>
          )}
          
          {badgeLabel && (
            <span 
              className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-full text-sm"
              style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {badgeLabel}
            </span>
          )}
          
          {/* Trust indicators */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">✓ ভেরিফাইড</span>
            <span className="flex items-center gap-1">✓ নিরাপদ</span>
            <span className="flex items-center gap-1">✓ বিশ্বস্ত</span>
          </div>
        </div>
      </div>
    </section>
  );
}
