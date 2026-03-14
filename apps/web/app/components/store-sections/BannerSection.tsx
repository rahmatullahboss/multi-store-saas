
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { SectionSettings } from './registry';

interface BannerSectionProps {
  settings: SectionSettings;
  theme: any;
}

export default function BannerSection({ settings, theme }: BannerSectionProps) {
  if (!settings.image) return null;

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-center">
        <img 
          src={settings.image} 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" /> {/* Dark overlay */}
        
        <div className="relative z-10 px-8 md:px-12 max-w-xl text-white">
           {settings.heading && (
             <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
               {settings.heading}
             </h2>
           )}
           {settings.subheading && (
             <p className="text-lg md:text-xl text-white/90 mb-8 font-medium">
               {settings.subheading}
             </p>
           )}
           {settings.primaryAction?.url && (
             <Link
               to={settings.primaryAction.url}
               className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold bg-white text-black transition-transform hover:scale-105"
             >
               {settings.primaryAction.label || 'Shop Now'}
               <ChevronRight className="w-4 h-4" />
             </Link>
           )}
        </div>
      </div>
    </section>
  );
}
