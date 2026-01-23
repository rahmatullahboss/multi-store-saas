import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1` : url;
}

export function VideoFocusHero({
  config,
  isEditMode,
  onUpdate,
}: SectionProps) {
  const hasVideo = config.videoUrl && (
    config.videoUrl.includes('youtube') || 
    config.videoUrl.includes('youtu.be') || 
    config.videoUrl.includes('vimeo') || 
    config.videoUrl.endsWith('.mp4')
  );

  return (
    <MagicSectionWrapper
      sectionId="hero"
      sectionLabel="Video Hero"
      data={{ headline: config.headline, subheadline: config.subheadline, videoUrl: config.videoUrl }}
      onUpdate={(data) => onUpdate?.('hero', data)}
      isEditable={isEditMode}
    >
      <section className="relative">
        {hasVideo ? (
          <div className="relative w-full aspect-video max-h-[70vh]">
            {config.videoUrl!.includes('youtube') || config.videoUrl!.includes('youtu.be') ? (
              <iframe 
                src={getYouTubeEmbedUrl(config.videoUrl!)} 
                title="Product Video" 
                className="w-full h-full" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            ) : config.videoUrl!.includes('vimeo') ? (
              <iframe 
                src={getVimeoEmbedUrl(config.videoUrl!)} 
                title="Product Video" 
                className="w-full h-full" 
                frameBorder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowFullScreen 
              />
            ) : (
              <video 
                src={config.videoUrl} 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover" 
              />
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg text-white">{config.headline}</h1>
                {config.subheadline && <p className="text-lg md:text-xl text-gray-200 max-w-2xl">{config.subheadline}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full aspect-video max-h-[70vh] bg-gradient-to-br from-purple-900 via-gray-900 to-black flex items-center justify-center">
            <div className="text-center p-6">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">{config.headline}</h1>
              {config.subheadline && <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">{config.subheadline}</p>}
            </div>
          </div>
        )}
      </section>
    </MagicSectionWrapper>
  );
}
