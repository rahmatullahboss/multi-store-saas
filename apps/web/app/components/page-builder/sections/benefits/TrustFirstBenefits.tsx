/**
 * Trust First Benefits - Clean, professional with trust indicators
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function TrustFirstBenefits({ title, subtitle, benefits, theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}
          >
            <span>✓</span> ভেরিফাইড বেনিফিটস
          </span>
        </div>

        {title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ color: headingColor || '#166534', ...headingStyle }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="relative p-6 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: '#22C55E' }}
              >
                ✓
              </div>
              
              <div 
                className="w-14 h-14 mb-4 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
              >
                {benefit.icon || '✓'}
              </div>
              
              <h3 className="text-lg font-bold mb-2" style={{ color: '#111827' }}>
                {benefit.title}
              </h3>
              
              {benefit.description && (
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {benefit.description}
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <span className="text-green-500">●</span>
                গ্যারান্টি সহ
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
