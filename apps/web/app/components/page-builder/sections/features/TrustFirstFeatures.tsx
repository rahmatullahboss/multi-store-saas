/**
 * Trust First Features - Clean, professional with trust indicators
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function TrustFirstFeatures({ title, features, theme, styleProps }: FeaturesVariantProps) {
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
      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: '#DCFCE7',
              color: '#166534',
              border: '1px solid #BBF7D0',
            }}
          >
            <span>✓</span>
            ১০০% গ্যারান্টি সহ
          </span>
        </div>

        {title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{ 
              color: headingColor || '#166534',
              ...headingStyle,
            }}
          >
            {title}
          </h2>
        )}
        
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          আমাদের পণ্যের বিশেষ বৈশিষ্ট্যগুলো যা আপনার জীবনকে সহজ করবে
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ 
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              {/* Checkmark badge */}
              <div 
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: '#22C55E' }}
              >
                ✓
              </div>
              
              {/* Icon */}
              <div 
                className="w-14 h-14 mb-5 rounded-xl flex items-center justify-center text-2xl"
                style={{ 
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                }}
              >
                {feature.icon}
              </div>
              
              <h3 
                className="text-lg font-bold mb-2"
                style={{ color: '#111827' }}
              >
                {feature.title}
              </h3>
              
              <p 
                className="text-sm leading-relaxed"
                style={{ color: '#6B7280' }}
              >
                {feature.description}
              </p>
              
              {/* Trust indicator */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <span className="text-green-500">●</span>
                ভেরিফাইড ফিচার
              </div>
            </div>
          ))}
        </div>
        
        {features.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            No features added yet
          </p>
        )}
      </div>
    </section>
  );
}
