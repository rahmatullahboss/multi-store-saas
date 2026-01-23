/**
 * Default Hero - Classic gradient with multiple layout options
 */

import type { SectionTheme } from '~/lib/page-builder/types';
import { scrollToOrderForm } from '../../OrderNowButton';
import { getSectionStyle, getHeadingStyle } from '~/lib/page-builder/sectionStyleUtils';

interface DefaultHeroProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  backgroundImage: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  textColor?: string;
  headingColor?: string;
  fontFamily?: string;
  paddingY?: string;
  variant: string;
  theme?: SectionTheme;
  primaryColor: string;
  accentColor: string;
}

export function DefaultHero({
  headline, subheadline, ctaText, badgeText, backgroundImage,
  backgroundColor, backgroundGradient, textColor, headingColor,
  fontFamily, paddingY, variant, theme, primaryColor, accentColor
}: DefaultHeroProps) {
  const bgColor = theme?.bgColor || '#4F46E5';
  const badgeBg = theme?.badgeBg || 'rgba(255,255,255,0.2)';
  const badgeTextColor = theme?.badgeText || '#FFFFFF';
  const buttonBg = theme?.buttonBg || '#FFFFFF';
  const buttonText = theme?.buttonText || '#4F46E5';

  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });

  const getBackgroundStyle = (): React.CSSProperties => {
    if (backgroundColor || backgroundGradient) return sectionStyle;
    if (backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
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
    if (theme?.style === 'urgent') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #450a0a 100%)` };
    }
    if (theme?.style === 'premium') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #0a0a0b 100%)` };
    }
    if (theme?.style === 'nature') {
      return { background: `linear-gradient(135deg, ${bgColor} 0%, #dcfce7 100%)` };
    }
    return { background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` };
  };

  const isDarkBg = variant === 'glow' || theme?.style === 'urgent' || theme?.style === 'premium' || theme?.style === 'dark' || !theme;
  const isLightBg = variant === 'modern' || theme?.style === 'professional' || theme?.style === 'nature' || theme?.style === 'minimal';
  
  const titleColor = headingColor || textColor || (isLightBg ? (theme?.textColor || '#1D3557') : '#FFFFFF');
  const subtitleColor = textColor || (isLightBg ? (theme?.mutedTextColor || '#6C757D') : 'rgba(255,255,255,0.9)');

  const renderContent = () => {
    const commonContent = (
      <>
        {badgeText && (
          <span 
            className="inline-block px-4 py-2 mb-4 text-sm font-bold rounded-full animate-pulse"
            style={{ backgroundColor: badgeBg, color: badgeTextColor }}
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
          <p className="text-lg md:text-xl mb-8 leading-relaxed opacity-90" style={{ color: subtitleColor }}>
            {subheadline}
          </p>
        )}
        <button 
          className="px-8 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg cursor-pointer"
          style={{ background: buttonBg, color: theme?.style === 'urgent' ? '#7F1D1D' : buttonText }}
          onClick={scrollToOrderForm}
        >
          {ctaText}
        </button>
      </>
    );

    if (variant === 'split-left') {
      return (
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">{commonContent}</div>
          <div className="flex-1">
            <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span style={{ color: subtitleColor }}>Image Placeholder</span>
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'split-right') {
      return (
        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
          <div className="flex-1 text-left">{commonContent}</div>
          <div className="flex-1">
            <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span style={{ color: subtitleColor }}>Image Placeholder</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto text-center relative z-10">
        {variant === 'glow' && (
          <>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          </>
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
