import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { BaseHeroProps } from './types';
import { scrollToOrderForm } from '../../OrderNowButton';

export function WorldClassStoryHero({ headline, subheadline, ctaText, badgeText, backgroundImage }: BaseHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-50"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {backgroundImage && (
            <motion.div 
                style={{ y, opacity }}
                className="absolute inset-0 w-full h-full"
            >
                <img 
                    src={backgroundImage} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-20 filter sepia brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 via-stone-50/80 to-stone-50" />
            </motion.div>
        )}
        
        {/* Animated Gradient Orbs */}
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-amber-200/30 blur-[120px]" 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.1, 1],
                x: [0, 50, 0],
                opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-200/20 blur-[150px]" 
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        {badgeText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="h-[1px] w-12 bg-amber-800/40"></span>
            <span className="text-amber-900 font-medium tracking-[0.2em] uppercase text-sm">
              {badgeText}
            </span>
            <span className="h-[1px] w-12 bg-amber-800/40"></span>
          </motion.div>
        )}

        {/* Headline */}
        <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-stone-900"
            style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {headline.split(' ').map((word, i) => (
            <span key={i} className="inline-block mr-[0.25em] relative">
              {word}
              {/* Subtle underline for emphasis on random words or specific logic if needed */}
            </span>
          ))}
        </motion.h1>

        {/* Subheadline (The Hook) */}
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-stone-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: '"Lato", sans-serif' }}
        >
            {subheadline}
        </motion.p>

        {/* Cinematic CTA */}
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
        >
            <button
                onClick={scrollToOrderForm}
                className="group relative inline-flex items-center justify-center px-10 py-5 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-full shadow-2xl hover:shadow-[0_20px_50px_rgba(217,119,6,0.3)]"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-amber-700 to-orange-800"></span>
                <span className="absolute px-5 py-2 transition-all opacity-0 group-hover:opacity-20 bg-white/20 blur"></span>
                <span className="relative flex items-center gap-3 text-lg tracking-wide uppercase">
                    {ctaText}
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </span>
            </button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-stone-400"
        >
            <span className="text-xs uppercase tracking-widest">Scroll to Discover</span>
            <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-[1px] h-12 bg-stone-300"
            />
        </motion.div>
      </div>
    </section>
  );
}
