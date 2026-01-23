/**
 * Hero Section for Store Homepage
 * 
 * Large banner with heading, image, and call to action.
 * Supports multiple layout variants.
 */

import { Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';
import type { HomeContext } from '~/lib/template-resolver.server';

interface HeroSectionProps {
  sectionId: string;
  props: {
    heading?: string;
    subheading?: string;
    image?: string;
    primaryAction?: { label: string; url: string };
    secondaryAction?: { label?: string; url?: string };
    alignment?: 'left' | 'center' | 'right';
    layout?: 'standard' | 'split' | 'fullscreen';
    overlayOpacity?: number;
  };
  context: HomeContext;
}

export default function HeroSection({ sectionId, props, context }: HeroSectionProps) {
  const {
    heading = 'Welcome to Our Store',
    subheading = 'Discover our premium collection',
    image,
    primaryAction = { label: 'Shop Now', url: '/#products' },
    secondaryAction,
    alignment = 'center',
    layout = 'standard',
    overlayOpacity = 0.4,
  } = props;

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const themeColors = context.theme;

  return (
    <section 
      id={sectionId}
      className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: themeColors.backgroundColor || '#f8fafc',
      }}
    >
      {/* Background Image */}
      {image && (
        <>
          <img
            src={image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}

      {/* Content */}
      <div className={`relative z-10 max-w-4xl mx-auto px-4 py-16 flex flex-col ${alignmentClasses[alignment]}`}>
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          style={{ 
            color: image ? '#ffffff' : (themeColors.textColor || '#1f2937'),
            fontFamily: themeColors.headingFont || 'inherit',
          }}
        >
          {heading}
        </h1>

        {subheading && (
          <p 
            className="text-lg md:text-xl mb-8 max-w-2xl opacity-90"
            style={{ 
              color: image ? '#ffffff' : (themeColors.textColor || '#4b5563'),
              fontFamily: themeColors.bodyFont || 'inherit',
            }}
          >
            {subheading}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {primaryAction && (
            <Link
              to={primaryAction.url}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: themeColors.accentColor || '#6366f1',
                color: '#ffffff',
              }}
            >
              {primaryAction.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {secondaryAction?.label && (
            <Link
              to={secondaryAction.url || '#'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105"
              style={{
                borderColor: image ? '#ffffff' : (themeColors.accentColor || '#6366f1'),
                color: image ? '#ffffff' : (themeColors.accentColor || '#6366f1'),
                backgroundColor: 'transparent',
              }}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
