import { Zap, Shield, BarChart3, Globe, Box, Smartphone } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  type: 'features',
  name: 'Features',
  settings: [
     {
        type: 'text',
        id: 'heading',
        label: 'Heading',
        default: 'Everything you need',
     },
     {
        type: 'textarea',
        id: 'subheading',
        label: 'Subheading',
        default: 'No compromise on features.',
     },
  ],
};

const DEFAULT_FEATURES = [
  { 
    title: 'Global Scale', 
    description: 'Deploys instantly to 35 regions worldwide.',
    icon: 'Globe',
    colSpan: 2 
  },
  { 
    title: 'Secure by Design', 
    description: 'Enterprise-grade security built-in.',
    icon: 'Shield',
    colSpan: 1
  },
  { 
    title: 'Lightning Fast', 
    description: 'Optimized for speed and performance.',
    icon: 'Zap',
    colSpan: 1
  },
  { 
    title: 'Rich Analytics', 
    description: 'Real-time insights into your data.',
    icon: 'BarChart',
    colSpan: 2
  }
];

export default function ZenithFeatures({ settings }: SectionComponentProps) {
  const { heading, subheading } = settings;

  const getIcon = (name: string) => {
    switch(name) {
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Shield': return <Shield className="w-6 h-6 text-emerald-400" />;
      case 'Globe': return <Globe className="w-6 h-6 text-blue-400" />;
      case 'BarChart': return <BarChart3 className="w-6 h-6 text-purple-400" />;
      case 'Smartphone': return <Smartphone className="w-6 h-6 text-pink-400" />;
      default: return <Box className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="py-24 bg-slate-950 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{heading as string}</h2>
          <p className="text-lg text-slate-400">{subheading as string}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          {DEFAULT_FEATURES.map((feature: any, idx: number) => (
            <div 
              key={idx}
              className={`
                group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 
                hover:bg-slate-800/50 hover:border-slate-700 transition-all duration-300
                ${feature.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'}
                ${feature.colSpan === 3 ? 'md:col-span-3' : ''}
              `}
            >
              <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700">
                {getIcon(feature.icon)}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
