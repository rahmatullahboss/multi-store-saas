import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from './types';

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}

export function VideoSection({
  config,
  isEditMode,
  onUpdate,
  lang = 'bn',
}: SectionProps) {
  const t = (key: string) => {
    const translations: any = {
      bn: {
        watchInVideo: 'ভিডিওতে দেখুন',
        watchVideoDetails: 'পণ্যটি সম্পর্কে আরও বিস্তারিত জানতে ভিডিওটি দেখুন',
      },
      en: {
        watchInVideo: 'Watch in Video',
        watchVideoDetails: 'Watch the video to learn more about the product',
      }
    };
    return translations[lang]?.[key] || key;
  };

  if (!config.videoUrl) return null;

  return (
    <MagicSectionWrapper
      sectionId="video"
      sectionLabel="Video Section"
      data={{ videoUrl: config.videoUrl }}
      onUpdate={(newData: any) => onUpdate?.('videoUrl', newData.videoUrl)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              🎬 {t('watchInVideo')}
            </h2>
            <p className="text-xl text-gray-400">{t('watchVideoDetails')}</p>
          </div>
          
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
            {config.videoUrl.includes('youtube.com') || config.videoUrl.includes('youtu.be') ? (
              <iframe
                src={getYouTubeEmbedUrl(config.videoUrl)}
                title="Product Video"
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : config.videoUrl.includes('vimeo.com') ? (
              <iframe
                src={getVimeoEmbedUrl(config.videoUrl)}
                title="Product Video"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={config.videoUrl}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
