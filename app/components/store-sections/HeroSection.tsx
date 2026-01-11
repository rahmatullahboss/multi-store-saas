
import { Link, useSearchParams } from '@remix-run/react';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import type { SectionSettings } from './registry';
import { useTranslation } from '~/contexts/LanguageContext';

interface HeroSectionProps {
  settings: SectionSettings;
  theme: any;
  categories?: string[];
}

export default function HeroSection({ settings, theme, categories = [] }: HeroSectionProps) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');
  
  const layout = settings.layout || 'standard'; // 'standard' | 'marketplace'
  const validCategories = categories.filter(Boolean).slice(0, 10);

  const alignmentClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[settings.alignment || 'center'];

  if (layout === 'marketplace') {
    return (
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Category Sidebar (Desktop) */}
          <aside className="hidden lg:block w-56 shrink-0 z-10">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full border border-gray-100">
              <div 
                className="p-3 font-semibold border-b flex items-center gap-2 text-sm" 
                style={{ color: theme.text, backgroundColor: theme.cardBg }}
              >
                <Grid3X3 className="w-4 h-4" />
                Categories
              </div>
              <div className="py-1">
                {validCategories.map((category) => {
                  const isActive = currentCategory === category;
                  return (
                    <Link
                      key={category}
                      to={`/?category=${encodeURIComponent(category)}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-gray-50"
                      style={{ 
                        backgroundColor: isActive ? `${theme.primary}10` : 'transparent',
                        color: isActive ? theme.primary : theme.text,
                        borderLeft: isActive ? `3px solid ${theme.primary}` : '3px solid transparent'
                      }}
                    >
                      <span className="truncate">{category}</span>
                      <ChevronRight className="w-3 h-3 ml-auto opacity-40" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Banner */}
          <div className="flex-1">
             <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden group">
               {settings.image ? (
                 <img 
                   src={settings.image} 
                   alt="Hero Banner" 
                   className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 />
               ) : (
                 <div 
                   className="absolute inset-0"
                   style={{ 
                     background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`
                   }}
                 />
               )}
               
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

               {/* Content */}
               <div className="absolute inset-0 flex items-center px-8 md:px-12">
                 <div className="max-w-lg">
                   {settings.heading && (
                     <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight drop-shadow-md">
                       {settings.heading}
                     </h1>
                   )}
                   {settings.subheading && (
                     <p className="text-white/90 text-sm md:text-base mb-6 drop-shadow">
                       {settings.subheading}
                     </p>
                   )}
                   {settings.primaryAction?.label && (
                     <Link
                       to={settings.primaryAction.url}
                       className="inline-flex items-center gap-2 px-6 py-2.5 rounded shadow-lg font-medium text-sm transition-transform hover:scale-105 active:scale-95"
                       style={{ 
                         backgroundColor: theme.accent, 
                         color: 'white'
                       }}
                     >
                       {settings.primaryAction.label}
                       <ChevronRight className="w-4 h-4" />
                     </Link>
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>
    );
  }

  // Standard Hero
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
              className="text-2xl sm:text-5xl lg:text-6xl font-semibold mb-4 text-white"
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
