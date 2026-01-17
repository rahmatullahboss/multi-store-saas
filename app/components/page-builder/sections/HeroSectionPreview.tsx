/**
 * Hero Section Preview - Theme-enabled with Per-Section Styling
 * 
 * Renders differently based on template theme.
 * User can override colors via per-section styling controls.
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { scrollToOrderForm } from '../OrderNowButton';
import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface HeroProps extends SectionStyleProps {
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
    // Per-section styling props
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
    variant = 'centered',
  } = props as HeroProps & { variant?: 'centered' | 'split-left' | 'split-right' | 'glow' | 'modern' };
  
  // Default theme colors
  const bgColor = theme?.bgColor || '#4F46E5';
  const badgeBg = theme?.badgeBg || 'rgba(255,255,255,0.2)';
  const badgeTextColor = theme?.badgeText || '#FFFFFF';
  const buttonBg = theme?.buttonBg || '#FFFFFF';
  const buttonText = theme?.buttonText || '#4F46E5';
  const primaryColor = theme?.primaryColor || '#4F46E5';
  const accentColor = theme?.accentColor || '#7C3AED';
  
  // Get per-section styling
  const sectionStyle = getSectionStyle({ 
    backgroundColor, 
    backgroundGradient, 
    textColor, 
    fontFamily, 
    paddingY 
  });
  
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  // Generate gradient based on theme style (only if no per-section override)
  const getBackgroundStyle = (): React.CSSProperties => {
    // Per-section background takes priority
    if (backgroundColor || backgroundGradient) {
      return sectionStyle;
    }
    
    if (backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    
    // Variant-specific backgrounds
    if (variant === 'glow') {
      return { 
        background: `radial-gradient(circle at 50% 50%, ${bgColor} 0%, #000000 100%)`,
        position: 'relative',
        overflow: 'hidden',
      };
    }

    if (variant === 'modern') {
       return { background: `linear-gradient(180deg, ${bgColor} 0%, #ffffff 100%)` };
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

  // Text colors based on background (use override if provided)
  const isDarkBg = variant === 'glow' || theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark' || !theme;
  const isLightBg = variant === 'modern' || theme?.style === 'professional' || theme?.style === 'nature' || theme?.style === 'minimal';
  
  const titleColor = headingColor || textColor || (isLightBg ? (theme?.textColor || '#1D3557') : '#FFFFFF');
  const subtitleColor = textColor || (isLightBg ? (theme?.mutedTextColor || '#6C757D') : 'rgba(255,255,255,0.9)');
  
  // Render content based on variant
  const renderContent = () => {
    const commonContent = (
       <>
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
          className={`font-bold mb-4 leading-tight ${variant === 'modern' ? 'text-5xl md:text-7xl tracking-tighter' : 'text-3xl md:text-4xl lg:text-5xl'}`}
          style={{ color: titleColor, ...headingStyle }}
        >
          {headline}
        </h1>
        
        {subheadline && (
          <p 
            className="text-lg md:text-xl mb-8 leading-relaxed opacity-90"
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
       </>
    );

    if (variant === 'split-left') {
        return (
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-left">
                    {commonContent}
                </div>
                <div className="flex-1">
                     {/* Placeholder for split image if we had one in props, for now simplified */}
                     <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <span style={{color: subtitleColor}}>Image Placeholder</span>
                     </div>
                </div>
            </div>
        )
    }

    if (variant === 'split-right') {
         return (
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 text-left">
                    {commonContent}
                </div>
                <div className="flex-1">
                     <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <span style={{color: subtitleColor}}>Image Placeholder</span>
                     </div>
                </div>
            </div>
        )
    }

    // Default centered, glow, modern
    return (
        <div className="max-w-3xl mx-auto text-center relative z-10">
            {variant === 'glow' && (
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            )}
             {variant === 'glow' && (
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            )}
            {commonContent}
        </div>
    );
  };

  return (
    <section 
      className="relative py-16 px-6 overflow-hidden"
      style={{
        ...getBackgroundStyle(),
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      {renderContent()}
    </section>
  );
}
