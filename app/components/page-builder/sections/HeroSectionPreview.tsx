/**
 * Hero Section Preview - Theme-enabled
 * 
 * Renders differently based on template theme.
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { scrollToOrderForm } from '../OrderNowButton';

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  badgeText?: string;
  backgroundImage?: string;
}

interface HeroSectionPreviewProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
}

export function HeroSectionPreview({ props, theme }: HeroSectionPreviewProps) {
  const {
    headline = 'আপনার পণ্যের শিরোনাম',
    subheadline = '',
    ctaText = 'অর্ডার করুন',
    badgeText = '',
    backgroundImage = '',
  } = props as HeroProps;
  
  // Default theme colors
  const bgColor = theme?.bgColor || '#4F46E5';
  const textColor = theme?.textColor || '#FFFFFF';
  const badgeBg = theme?.badgeBg || 'rgba(255,255,255,0.2)';
  const badgeTextColor = theme?.badgeText || '#FFFFFF';
  const buttonBg = theme?.buttonBg || '#FFFFFF';
  const buttonText = theme?.buttonText || '#4F46E5';
  const primaryColor = theme?.primaryColor || '#4F46E5';
  const accentColor = theme?.accentColor || '#7C3AED';
  
  // Generate gradient based on theme style
  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Theme-specific gradients
    if (theme?.style === 'urgent') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #450a0a 100%)` };
    } else if (theme?.style === 'premium') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #0a0a0b 100%)` };
    } else if (theme?.style === 'nature') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #dcfce7 100%)` };
    } else if (theme?.style === 'dark') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #0f172a 100%)` };
    } else if (theme?.style === 'professional') {
      return { background: `linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)` };
    } else if (theme?.style === 'minimal') {
      return { background: `linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)` };
    }
    
    return { background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` };
  };

  // Text colors based on background
  const isDarkBg = theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark' || !theme;
  const isLightBg = theme?.style === 'professional' || theme?.style === 'nature' || theme?.style === 'minimal';
  
  const titleColor = isLightBg ? (theme?.textColor || '#1D3557') : '#FFFFFF';
  const subtitleColor = isLightBg ? (theme?.mutedTextColor || '#6C757D') : 'rgba(255,255,255,0.9)';
  
  return (
    <section 
      className="relative py-16 px-6"
      style={getBackgroundStyle()}
    >
      <div className="max-w-3xl mx-auto text-center">
        {badgeText && (
          <span 
            className="inline-block px-4 py-2 mb-4 text-sm font-bold rounded-full animate-pulse"
            style={{ 
              backgroundColor: badgeBg, 
              color: badgeTextColor,
            }}
          >
            {badgeText}
          </span>
        )}
        
        <h1 
          className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          style={{ color: titleColor }}
        >
          {headline}
        </h1>
        
        {subheadline && (
          <p 
            className="text-lg md:text-xl mb-8 leading-relaxed"
            style={{ color: subtitleColor }}
          >
            {subheadline}
          </p>
        )}
        
        <button 
          className="px-8 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg cursor-pointer"
          style={{ 
            background: buttonBg.includes('gradient') ? buttonBg : buttonBg,
            color: theme?.style === 'urgent' ? '#7F1D1D' : buttonText,
          }}
          onClick={scrollToOrderForm}
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
}
