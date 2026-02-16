import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MouseEvent } from 'react';
import { scrollToOrderForm } from '../../OrderNowButton';
import type { BaseCtaProps } from './types';

export function MagneticStoryCTA({ headline, subheadline, buttonText }: BaseCtaProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section 
      className="relative py-32 px-6 overflow-hidden bg-stone-900 group"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
      
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(217, 119, 6, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-amber-50 mb-8 tracking-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
        >
            {headline}
        </motion.h2>
        
        <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-stone-400 mb-12 max-w-2xl mx-auto font-light"
            style={{ fontFamily: '"Lato", sans-serif' }}
        >
            {subheadline}
        </motion.p>
        
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <button 
                onClick={scrollToOrderForm}
                className="relative inline-flex items-center gap-4 px-12 py-6 bg-amber-600 text-stone-50 text-xl font-bold uppercase tracking-widest rounded-full overflow-hidden transition-all hover:bg-amber-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(217,119,6,0.6)]"
            >
                {buttonText}
                <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </button>
        </motion.div>
      </div>
    </section>
  );
}
