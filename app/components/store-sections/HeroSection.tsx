
import { Link } from '@remix-run/react';
import { ChevronRight } from 'lucide-react';
import type { SectionSettings } from './registry';
import { useTranslation } from '~/contexts/LanguageContext';

interface HeroSectionProps {
  settings: SectionSettings;
  theme: any;
}

export default function HeroSection({ settings, theme }: HeroSectionProps) {
  const { t } = useTranslation();
  
  const alignmentClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[settings.alignment || 'center'];

  return (
    <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
      {settings.image ? (
        <img 
          src={settings.image} 
          alt="Hero Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary} 0%, #2d2d2d 100%)`
          }}
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className={`relative h-full flex flex-col justify-center px-4 max-w-7xl mx-auto w-full ${alignmentClass}`}>
        <div className="max-w-2xl">
          {settings.heading && (
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-4 text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {settings.heading}
            </h1>
          )}
          
          {settings.subheading && (
            <p className="text-lg text-white/80 mb-8">
              {settings.subheading}
            </p>
          )}
          
          {settings.primaryAction?.label && (
            <Link
              to={settings.primaryAction.url}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium uppercase tracking-wider transition-all"
              style={{ 
                backgroundColor: 'transparent',
                color: 'white',
                border: `2px solid ${theme.accent}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent;
                e.currentTarget.style.color = theme.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              {settings.primaryAction.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
