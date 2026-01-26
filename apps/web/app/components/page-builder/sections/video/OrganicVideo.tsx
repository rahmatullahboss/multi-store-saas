import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export interface VideoVariantProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
}

export function OrganicVideo({ videoUrl, thumbnailUrl, title }: VideoVariantProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Container */}
      <div className="container mx-auto px-6 relative z-10">
        
        {title && (
          <div className="text-center mb-12">
             <span className="inline-block px-4 py-1.5 rounded-full bg-[#fefce8] text-[#d97706] text-xs font-black uppercase tracking-[0.2em] mb-4 border border-[#fefce8]">
               Watch Story
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
            className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-[#3f6212]/20 border-[6px] border-white bg-black aspect-video group cursor-pointer"
            onClick={!isPlaying ? handlePlay : undefined}
          >
            {!isPlaying ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {thumbnailUrl && (
                  <img src={thumbnailUrl} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                )}
                <div className="relative z-20 w-20 h-20 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center pl-1 shadow-lg group-hover:scale-110 transition-transform duration-300">
                   <svg className="w-8 h-8 text-[#3f6212]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                {/* Pulse Effect */}
                <div className="absolute z-10 w-20 h-20 bg-white/50 rounded-full animate-ping"></div>
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
    </section>
  );
}
