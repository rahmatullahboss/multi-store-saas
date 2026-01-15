import type { SectionProps } from '../_core/types';

export function MinimalLightVideo({ config }: SectionProps) {
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
    <section className="py-24 bg-stone-50/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-sm border border-stone-200 aspect-video">
          <iframe
            src={embedUrl}
            title="Product Video"
            className="w-full h-full grayscale-[0.5] hover:grayscale-0 transition-all duration-700"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
