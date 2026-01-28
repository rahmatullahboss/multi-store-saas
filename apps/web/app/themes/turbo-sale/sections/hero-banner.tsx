import { Link } from '@remix-run/react';
import { ShoppingCart } from 'lucide-react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'আপনার জীবনের সেরা সমাধান!',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'মাত্র ৩ দিনে ফলাফল। ১০০% গ্যারান্টি। আজই অর্ডার করুন।',
    },
    {
      type: 'text',
      id: 'offer_text',
      label: 'Offer Text',
      default: '৫০% ছাড়!',
    },
    {
      type: 'url',
      id: 'video_url',
      label: 'Video URL (YouTube)',
      default: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    {
      type: 'text',
      id: 'cta_label',
      label: 'Button Label',
      default: 'অর্ডার করতে ক্লিক করুন',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'Button Link',
      default: '/products',
    },
  ],
};

// Simple YouTube Embed Parser
const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if(url.includes('embed')) return url;
    if(url.includes('v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
    if(url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
    return url;
};

export default function TurboHero({ context, settings }: SectionComponentProps) {
  const { getLink } = context;

  return (
    <div className="py-8 md:py-12 bg-white border-b-4 border-yellow-400">
      <div className="max-w-6xl mx-auto px-4">
         <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 bg-red-600 text-white font-bold rounded-full animate-pulse mb-4 shadow-lg">
                {settings.offer_text as string}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 font-heading">
                {settings.heading as string}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium font-heading">
                {settings.subheading as string}
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Video Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-gray-100">
               <iframe 
                 src={getEmbedUrl(settings.video_url as string)} 
                 className="w-full h-full"
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 allowFullScreen
                 title="Product Video"
               ></iframe>
            </div>

            {/* CTA Container */}
            <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xl text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 font-heading">দেরি করবেন না! অফারটি সীমিত সময়ের জন্য।</h3>
                
                <Link 
                   to={getLink(settings.cta_link as string || '/products')}
                   className="block w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl md:text-2xl font-bold rounded-lg shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 animate-bounce-slow"
                >
                   <ShoppingCart className="w-6 h-6" />
                   {settings.cta_label as string}
                </Link>

                <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
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
