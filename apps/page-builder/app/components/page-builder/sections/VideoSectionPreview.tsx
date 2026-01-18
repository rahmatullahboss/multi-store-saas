/**
 * Video Section Preview - Per-Section Styling Enabled
 */

import { Play } from 'lucide-react';
import { getSectionStyle, getHeadingStyle, type SectionStyleProps } from '~/lib/page-builder/sectionStyleUtils';

interface VideoProps extends SectionStyleProps {
  title?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export function VideoSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'ভিডিও দেখুন',
    videoUrl = '',
    thumbnailUrl = '',
    backgroundColor,
    backgroundGradient,
    textColor,
    headingColor,
    fontFamily,
    paddingY,
  } = props as VideoProps;
  
  const sectionStyle = getSectionStyle({ backgroundColor, backgroundGradient, textColor, fontFamily, paddingY });
  const headingStyle = getHeadingStyle({ headingColor, textColor });
  
  const finalHeadingColor = headingColor || textColor || '#FFFFFF';
  
  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  
  const youtubeId = getYouTubeId(videoUrl);
  const thumbnail = thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '');
  
  return (
    <section 
      className="py-12 px-6" 
      style={{ 
        backgroundColor: sectionStyle.backgroundColor || '#111827',
        background: sectionStyle.background,
        fontFamily: sectionStyle.fontFamily,
        paddingTop: sectionStyle.paddingTop,
        paddingBottom: sectionStyle.paddingBottom,
      }}
    >
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 
            className="text-2xl font-bold text-center mb-8"
            style={{ color: finalHeadingColor, ...headingStyle }}
          >
            {title}
          </h2>
        )}
        
        {videoUrl ? (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
            {thumbnail ? (
              <>
                <img 
                  src={thumbnail} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play size={28} className="text-gray-900 ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play size={48} className="text-gray-500" />
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video rounded-xl bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Play size={48} className="mx-auto mb-2" />
              <p>Add a video URL</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
