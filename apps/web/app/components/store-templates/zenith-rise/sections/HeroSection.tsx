
import { Link } from '@remix-run/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
import type { SectionSettings } from '~/components/store-sections/registry';
import { withAISchema } from '~/utils/ai-editable';

interface ZenithHeroSectionProps {
  settings: SectionSettings;
  theme: any;
}

export const ZENITH_HERO_AI_SCHEMA = {
  component: 'ZenithHeroSection',
  version: '1.0.0',
  type: 'zenith-hero',
  properties: {
    heading: {
      type: 'string',
      maxLength: 100,
      description: 'The main headline. Use simple, direct language.',
      aiAction: 'enhance'
    },
    titleHighlight: {
      type: 'string',
      maxLength: 50,
      description: 'The part of the headline to highlight with a gradient.',
    },
    subheading: {
      type: 'string',
      maxLength: 200,
      description: 'Supporting text.',
      aiAction: 'enhance'
    },
    primaryAction: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        url: { type: 'string' }
      }
    },
    image: {
      type: 'image',
      description: 'Hero image (floating product shot or dashboard preview)'
    }
  }
};

function ZenithHeroSectionBase({ settings, theme }: ZenithHeroSectionProps) {
  const {
    heading = "Supercharge Your Workflow",
    subheading = "The ultimate platform for modern creators. Scale your business with powerful tools designed for growth.",
    primaryAction = { label: 'Get Started', url: '/signup' },
    image,
    titleHighlight = "Workflow"
  } = settings || {};

  // Construct heading with highlight if present
  const renderHeading = () => {
    if (!heading.includes(titleHighlight)) return heading;
    const parts = heading.split(titleHighlight);
    return (
      <>
        {parts[0]}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">
          {titleHighlight}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="relative overflow-hidden min-h-[90vh] flex items-center justify-center pt-20 pb-20">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className="text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm mb-6 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">New Version 2.0 Released</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100">
             {titleHighlight ? renderHeading() : heading}
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200">
            {subheading}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up delay-300">
            <Link 
              to={primaryAction.url} 
              className="px-8 py-4 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10 flex items-center gap-2"
            >
              {primaryAction.label}
              <ArrowRight size={18} />
            </Link>
            
            <button className="px-8 py-4 rounded-full bg-slate-900 border border-slate-700 text-white font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 group">
              <Play size={18} className="fill-current text-white group-hover:text-indigo-400 transition-colors" />
              Watch Demo
            </button>
          </div>

          <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-slate-500 text-sm animate-fade-in-up delay-500">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
               <CheckCircle size={16} className="text-emerald-500" />
               <span>14-day free trial</span>
            </div>
          </div>
        </div>

        {/* Right Content - Visual */}
        <div className="relative group animate-fade-in-up delay-400 lg:block hidden">
           <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-slate-700 bg-slate-900/50 backdrop-blur-sm transform transition-transform duration-700 hover:rotate-1 hover:scale-[1.02]">
              {image ? (
                <img src={image} alt="App Preview" className="w-full h-auto object-cover" />
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-slate-600 font-mono text-sm">App Dashboard Preview</span>
                  {/* Placeholder Content */}
                  <div className="absolute inset-8 border border-dashed border-slate-700 rounded-lg flex items-center justify-center">
                     <div className="text-center">
                       <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-4 animate-pulse"></div>
                       <div className="h-2 w-32 bg-slate-800 rounded mx-auto mb-2"></div>
                       <div className="h-2 w-24 bg-slate-800 rounded mx-auto"></div>
                     </div>
                  </div>
                </div>
              )}
              
              {/* Floating Element */}
              <div className="absolute -bottom-6 -left-6 px-6 py-4 bg-slate-800 rounded-xl shadow-xl border border-slate-600 flex items-center gap-4 animate-float">
                 <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                   <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <div>
                   <p className="text-xs text-slate-400">Status</p>
                   <p className="text-sm font-bold text-white">System Optimal</p>
                 </div>
              </div>
           </div>
           
           {/* Decorative Glow */}
           <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-500"></div>
        </div>
      </div>

       <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
}

const ZenithHeroSection = withAISchema(ZenithHeroSectionBase, ZENITH_HERO_AI_SCHEMA as any);
export default ZenithHeroSection;
