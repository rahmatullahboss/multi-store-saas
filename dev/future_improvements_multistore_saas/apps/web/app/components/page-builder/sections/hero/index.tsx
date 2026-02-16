/**
 * Hero Section Preview - Main Entry Point
 * 
 * Renders different hero variants based on the variant prop.
 * Each variant is in its own file for maintainability.
 */

import type { HeroSectionPreviewProps, HeroProps } from './types';
import { GlassmorphismHero } from './GlassmorphismHero';
import { NeubrutalistHero } from './NeubrutalistHero';
import { BentoHero } from './BentoHero';
import { TrustFirstHero } from './TrustFirstHero';
import { StoryDrivenHero } from './StoryDrivenHero';
import { WorldClassStoryHero } from './WorldClassStoryHero';
import { UrgencyHero } from './UrgencyHero';
import { SocialProofHero } from './SocialProofHero';
import { OrganicHero } from './OrganicHero';
import { DefaultHero } from './DefaultHero';

export function HeroSectionPreview({ props, theme }: HeroSectionPreviewProps) {
  const {
    headline = 'আপনার পণ্যের শিরোনাম',
    subheadline = '',
    ctaText = 'অর্ডার করুন',
    badgeText = '',
    backgroundImage = '',
    productImage,
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
    variant = 'default',
  } = props as HeroProps;

  const primaryColor = theme?.primaryColor || '#6366F1';
  const accentColor = theme?.accentColor || '#8B5CF6';

  // Route to appropriate variant component
  switch (variant) {
    case 'glassmorphism':
      return (
        <GlassmorphismHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );
    
    case 'neubrutalism':
      return (
        <NeubrutalistHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );
    
    case 'bento':
      return (
        <BentoHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );
    
    case 'trust-first':
      return (
        <TrustFirstHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );
    
    case 'story-driven':
      return (
        <StoryDrivenHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );

    case 'story-driven-premium':
      return (
        <WorldClassStoryHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
          backgroundImage={backgroundImage}
        />
      );
    
    case 'urgency':
      return (
        <UrgencyHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );
    
      return (
        <SocialProofHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
        />
      );

    case 'organic':
      return (
        <OrganicHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
          productImage={productImage}
        />
      );
    
    default:
      return (
        <DefaultHero
          headline={headline}
          subheadline={subheadline}
          ctaText={ctaText}
          badgeText={badgeText}
          backgroundImage={backgroundImage}
          backgroundColor={backgroundColor}
          backgroundGradient={backgroundGradient}
          textColor={textColor}
          headingColor={headingColor}
          fontFamily={fontFamily}
          paddingY={paddingY}
          variant={variant}
          theme={theme}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      );
  }
}

// Re-export types
export type { HeroSectionPreviewProps, HeroProps, HeroVariant } from './types';
