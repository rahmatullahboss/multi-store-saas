import type { SectionProps } from '../_core/types';

export function OrganicVideo({ config }: SectionProps) {
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
    <section className="py-24 bg-white relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-8 border-white aspect-video">
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
