import type { SectionProps } from '../_core/types';

export function MobileFirstVideo({ config }: SectionProps) {
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
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl aspect-[9/16] bg-black">
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
