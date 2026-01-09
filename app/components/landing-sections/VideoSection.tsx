/**
 * Video Section Component
 * 
 * Embedded video player for product demo
 */

import type { BaseSectionProps } from './types';

export function VideoSection({ config }: BaseSectionProps) {
  if (!config.videoUrl) return null;

  // Convert YouTube URLs to embed format
  const getEmbedUrl = (url: string) => {
    return url
      .replace('youtu.be/', 'youtube.com/embed/')
      .replace('watch?v=', 'embed/');
  };

  return (
    <section className="py-12 bg-white">
      <div className="container max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">ভিডিওতে বিস্তারিত দেখুন</h2>
        <div className="aspect-video rounded-3xl overflow-hidden shadow-xl border-4 border-gray-100 bg-black">
          <iframe 
            src={getEmbedUrl(config.videoUrl)} 
            className="w-full h-full" 
            allowFullScreen 
            title="Product Video"
          />
        </div>
      </div>
    </section>
  );
}
