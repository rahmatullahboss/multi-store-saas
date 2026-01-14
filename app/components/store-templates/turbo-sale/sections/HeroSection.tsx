
import { Link } from '@remix-run/react';
import { Play, ArrowRight, ShoppingCart } from 'lucide-react';
import type { SectionSettings } from '~/components/store-sections/registry';
import { withAISchema } from '~/utils/ai-editable';

interface TurboHeroSectionProps {
  settings: SectionSettings;
  theme: any;
}

export const TURBO_HERO_AI_SCHEMA = {
  component: 'TurboHeroSection',
  version: '1.0.0',
  type: 'turbo-hero',
  properties: {
    heading: { type: 'string', aiAction: 'enhance' },
    subheading: { type: 'string', aiAction: 'enhance' },
    videoUrl: { type: 'string', description: 'YouTube video ID or URL' },
    offerText: { type: 'string', description: 'e.g. 50% OFF TODAY' },
    primaryAction: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        url: { type: 'string' }
      }
    }
  }
};

function TurboHeroSectionBase({ settings, theme }: TurboHeroSectionProps) {
  const {
      heading = "আপনার জীবনের সেরা সমাধান!",
      subheading = "মাত্র ৩ দিনে ফলাফল। ১০০% গ্যারান্টি। আজই অর্ডার করুন।",
      videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
      offerText = "৫০% ছাড়!",
      primaryAction = { label: 'অর্ডার করতে ক্লিক করুন', url: '/products' }
  } = settings || {};

  // Simple YouTube Embed Parser
  const getEmbedUrl = (url: string) => {
      if(url.includes('embed')) return url;
      if(url.includes('v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]}`;
      return url;
  };

  return (
    <div className="py-8 md:py-12 bg-white border-b-4 border-yellow-400">
      <div className="max-w-6xl mx-auto px-4">
         <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 bg-red-600 text-white font-bold rounded-full animate-pulse mb-4 shadow-lg">
                {offerText}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {heading}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium">
                {subheading}
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Video Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100">
               <iframe 
                 src={getEmbedUrl(videoUrl)} 
                 className="w-full h-full"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
               ></iframe>
            </div>

            {/* CTA Container */}
            <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">দেরি করবেন না! অফারটি সীমিত সময়ের জন্য।</h3>
                
                <Link 
                   to={primaryAction.url}
                   className="block w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl md:text-2xl font-bold rounded-lg shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 animate-bounce-slow"
                >
                   <ShoppingCart className="w-6 h-6" />
                   {primaryAction.label}
                </Link>

                <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                   <span>১০ জন এই মুহূর্তে ভিডিওটি দেখছেন</span>
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="font-bold text-gray-800 text-lg">১০০%</span>
                      <span className="text-xs text-gray-500">অরজিনাল</span>
                   </div>
                   <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="font-bold text-gray-800 text-lg">ক্যাশ অন</span>
                      <span className="text-xs text-gray-500">ডেলিভারি</span>
                   </div>
                </div>
            </div>
         </div>
      </div>
      <style>{`
          @keyframes bounce-slow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
          }
          .animate-bounce-slow {
              animation: bounce-slow 2s infinite;
          }
      `}</style>
    </div>
  );
}

const TurboHeroSection = withAISchema(TurboHeroSectionBase, TURBO_HERO_AI_SCHEMA as any);
export default TurboHeroSection;
