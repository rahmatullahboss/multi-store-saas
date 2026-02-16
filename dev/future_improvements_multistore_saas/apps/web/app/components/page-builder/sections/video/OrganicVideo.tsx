import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export interface VideoVariantProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
}

export function OrganicVideo({ title, videoUrl, thumbnailUrl, badgeText }: VideoVariantProps & { badgeText?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    // setTimeout to allow video element to render
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  return (
    <section className="relative py-20 pb-56 md:pb-64 bg-[#fefce8] overflow-hidden">
      {/* Container */}
      <div className="container mx-auto px-6 relative z-10">
        
        {title && (
          <div className="text-center mb-12">
             <span className="inline-block px-4 py-1.5 rounded-full bg-[#ecfccb] text-[#3f6212] text-xs font-black uppercase tracking-[0.2em] mb-4 border border-[#ecfccb]">
               {badgeText || 'Watch Story'}
             </span>
             <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#3f6212]">
               {title}
             </h2>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative">
          {/* Organic Border Frame */}
          <div className="absolute inset-0 bg-[#d97706]/10 transform rotate-2 rounded-[3.5rem] scale-105 z-0"></div>
          <div className="absolute inset-0 bg-[#3f6212]/5 transform -rotate-2 rounded-[3.5rem] scale-105 z-0"></div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-[#3f6212]/20 border-[6px] border-[#ecfccb] bg-[#ecfccb]/20 aspect-video group cursor-pointer"
            onClick={!isPlaying ? handlePlay : undefined}
          >
            {!isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {thumbnailUrl && (
                  <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover transition-opacity" />
                )}
                <div className="relative z-20 w-20 h-20 bg-[#ecfccb]/90 backdrop-blur-md rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform duration-300">
                   <svg className="w-8 h-8 text-[#3f6212]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                {/* Pulse Effect */}
                <div className="absolute z-10 w-20 h-20 bg-[#ecfccb]/50 rounded-full animate-ping"></div>
              </div>
            ) : (
              <video 
                ref={videoRef}
                src={videoUrl} 
                className="w-full h-full object-cover" 
                controls 
                autoPlay
              />
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave - Transition to Showcase (#f7fee7) */}
      <div className="absolute bottom-[-2px] left-0 w-full overflow-hidden leading-[0] z-20">
        <svg className="relative block w-[calc(100%+1.3px)] h-[120px] md:h-[160px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            {/* Background Rect (Next Section Color - Green) */}
            <rect width="100%" height="100%" fill="#f7fee7" />
            
            {/* Layer 3 - Solid (Current Section Color - Cream) */}
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#fefce8"></path>
        </svg>
      </div>
    </section>
  );
}
