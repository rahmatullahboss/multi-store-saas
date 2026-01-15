import type { SectionProps } from '../_core/types';

export function LuxeVideo({ config }: SectionProps) {
  const videoUrl = config.videoUrl;

  if (!videoUrl) return null;

  // Simple YouTube/Vimeo embed logic
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com/watch?v=')) {
    embedUrl = videoUrl.replace('watch?v=', 'embed/');
  } else if (videoUrl.includes('youtu.be/')) {
    embedUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
  } else if (videoUrl.includes('vimeo.com/')) {
    embedUrl = videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
  }

  return (
    <section className="py-24 bg-stone-950">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-stone-800 aspect-video relative group">
           <div className="absolute inset-0 bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <iframe
            src={embedUrl}
            title="Product Video"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
