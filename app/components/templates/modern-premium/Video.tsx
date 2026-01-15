import type { SectionProps } from '../_core/types';

export function ModernPremiumVideo({ config }: SectionProps) {
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
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.08)] border-8 border-white aspect-video relative group">
          <iframe
            src={embedUrl}
            title="Product Video"
            className="w-full h-full scale-[1.01]"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
