/**
 * Scroll Reveal Animation Components - OPTIMIZED
 * Simplified animations with reduced motion support
 */
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

// Simplified animation variants (reduced y values)
export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

interface ScrollRevealProps {
  children: ReactNode;
  variant?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variants = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
};

export function ScrollReveal({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.5, // Reduced from 0.6
  className = '',
  once = true,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion, just show content
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      variants={variants[variant]}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children as any}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className = '', delay = 0 }: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1, // Reduced from 0.15
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children as any}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children as any}
    </motion.div>
  );
}
