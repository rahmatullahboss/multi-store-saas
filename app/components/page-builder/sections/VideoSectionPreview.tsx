/**
 * Video Section Preview
 */

import { Play } from 'lucide-react';

interface VideoProps {
  title?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export function VideoSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'ভিডিও দেখুন',
    videoUrl = '',
    thumbnailUrl = '',
  } = props as VideoProps;
  
  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  
  const youtubeId = getYouTubeId(videoUrl);
  const thumbnail = thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '');
  
  return (
    <section className="py-12 px-6 bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-white mb-8">
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
