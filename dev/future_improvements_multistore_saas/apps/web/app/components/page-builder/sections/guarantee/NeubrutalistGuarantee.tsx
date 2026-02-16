/**
 * Neubrutalist Guarantee - Bold, raw aesthetic
 */

import { ShieldCheck } from 'lucide-react';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { GuaranteeVariantProps } from './types';

export function NeubrutalistGuarantee({ title, text, badgeLabel, theme: _theme, styleProps }: GuaranteeVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-16 px-6" 
      style={{
        backgroundColor: sectionStyle.backgroundColor || '#4ECDC4',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily || '"Space Grotesk", sans-serif',
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div 
          className="p-8 text-center relative"
          style={{ 
            backgroundColor: '#FFFFFF',
            border: '4px solid #000000',
            boxShadow: '12px 12px 0 #000000',
          }}
        >
          {/* Corner decoration */}
          <div 
            className="absolute top-0 right-0 w-16 h-16"
            style={{ background: 'linear-gradient(135deg, transparent 50%, #FFE500 50%)' }}
          />
          
          <div 
            className="inline-flex items-center justify-center w-20 h-20 mb-6"
            style={{ 
              backgroundColor: '#FFE500',
              border: '4px solid #000000',
              boxShadow: '6px 6px 0 #000000',
            }}
          >
            <ShieldCheck size={40} className="text-black" />
          </div>
          
          {title && (
            <h2 
              className="text-3xl font-black mb-4 uppercase"
              style={{ 
                color: headingColor || '#000000', 
                textShadow: '3px 3px 0 #4ECDC4',
                ...headingStyle,
              }}
            >
              {title}
            </h2>
          )}
          
          {text && (
            <p className="text-lg mb-6 font-medium text-black/80">
              {text}
            </p>
          )}
          
          {badgeLabel && (
            <span 
              className="inline-block px-6 py-3 font-black text-sm uppercase"
              style={{ 
                backgroundColor: '#A8E6CF',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0 #000000',
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
