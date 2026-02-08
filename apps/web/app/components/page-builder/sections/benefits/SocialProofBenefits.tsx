/**
 * Social Proof Benefits - Facebook-style layout
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { BenefitsVariantProps } from './types';

export function SocialProofBenefits({ title, subtitle, benefits, theme, styleProps }: BenefitsVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps || {};
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  return (
    <section 
      className="py-12 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#F0F2F5',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div 
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: '#1877F2' }}
              >
                B
              </div>
              <div>
                <div className="font-semibold text-gray-900">Benefits Update</div>
                <div className="text-xs text-gray-500">Sponsored · 🌐</div>
              </div>
            </div>
            
            {title && (
              <h2 
                className="text-lg font-normal mt-3"
                style={{ color: headingColor || '#050505', ...headingStyle }}
              >
                {title} ✨
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          
          {/* Benefits list */}
          <div className="p-4 space-y-3">
            {benefits.map((benefit, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: '#E7F3FF' }}
                >
                  {benefit.icon || '✓'}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {benefit.title}
                  </h3>
                  {benefit.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {benefit.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>👍</span>
                  <span>{Math.floor(Math.random() * 30) + 10}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span>👍❤️</span>
              <span>{benefits.length * 15 + 32}</span>
            </div>
            <div>{benefits.length * 4 + 8} shares</div>
          </div>
        </div>
      </div>
    </section>
  );
}
