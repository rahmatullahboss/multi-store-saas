/**
 * Social Proof Features - Facebook-style card layout
 */

import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';
import type { FeaturesVariantProps } from './types';

export function SocialProofFeatures({ title, features, theme, styleProps }: FeaturesVariantProps) {
  const { backgroundColor, backgroundGradient, textColor, headingColor, fontFamily, paddingY } = styleProps;
  
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
        {/* Facebook-style post header */}
        <div 
          className="rounded-t-lg p-4"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E4E6EB',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: '#1877F2' }}
            >
              S
            </div>
            <div>
              <div className="font-semibold text-gray-900">Store Official</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>Just now</span>
                <span>·</span>
                <span>🌐</span>
              </div>
            </div>
          </div>
          
          {title && (
            <h2 
              className="text-lg font-normal mt-3"
              style={{ 
                color: headingColor || '#050505',
                ...headingStyle,
              }}
            >
              {title} 👇
            </h2>
          )}
        </div>
        
        {/* Features as Facebook post content */}
        <div 
          className="p-4"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50"
              >
                {/* Icon as emoji */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ 
                    backgroundColor: '#E7F3FF',
                  }}
                >
                  {feature.icon}
                </div>
                
                <div className="flex-1">
                  <h3 
                    className="font-semibold text-sm"
                    style={{ color: '#050505' }}
                  >
                    {feature.title}
                  </h3>
                  
                  <p 
                    className="text-sm mt-1"
                    style={{ color: '#65676B' }}
                  >
                    {feature.description}
                  </p>
                </div>
                
                {/* Like indicator */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>👍</span>
                  <span>{Math.floor(Math.random() * 50) + 10}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Facebook-style reactions */}
        <div 
          className="rounded-b-lg p-3 flex items-center justify-between"
          style={{ 
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E4E6EB',
          }}
        >
          <div className="flex items-center gap-1">
            <span className="text-base">👍❤️😍</span>
            <span className="text-sm text-gray-500 ml-1">{features.length * 23 + 47}</span>
          </div>
          <div className="text-sm text-gray-500">
            {features.length * 5 + 12} comments · {features.length * 8 + 34} shares
          </div>
        </div>
        
        {features.length === 0 && (
          <div 
            className="p-8 text-center"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <p className="text-gray-500">No features added yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
