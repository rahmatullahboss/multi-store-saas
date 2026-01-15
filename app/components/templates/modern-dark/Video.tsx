import type { SectionProps } from '../_core/types';

export function ModernDarkVideo({ config }: SectionProps) {
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
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-zinc-800 aspect-video relative group">
           <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
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
