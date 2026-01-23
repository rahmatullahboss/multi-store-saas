/**
 * Optimized Framer Motion Components
 * 
 * This file re-exports framer-motion components with tree-shaking optimizations.
 * Using the `m` component with LazyMotion reduces bundle size by ~30KB.
 * 
 * Usage:
 * Replace: import { motion } from 'framer-motion'
 * With:    import { m } from '~/lib/motion'
 * 
 * @see https://www.framer.com/motion/guide-reduce-bundle-size/
 */

import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

// Re-export commonly used items
export { m, AnimatePresence };

/**
 * Wrapper component that provides lazy-loaded animation features.
 * Use this at the root of your animated component tree.
 * 
 * Features included in domAnimation (lighter bundle):
 * - animate, initial, exit props
 * - whileHover, whileTap, whileFocus
 * - Gestures and layout animations
 * 
 * Features NOT included (require domMax):
 * - Drag and scroll-linked animations
 * - useMotionValue, useTransform (still work, but not SSR-safe)
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

/**
 * Pre-configured animation variants for common patterns.
 * Use with reduced-motion awareness.
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Stagger children animation for lists
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Performance-optimized spring config
 * Uses stiffness instead of duration for hardware-accelerated animations
 */
export const smoothSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export const snappySpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
  mass: 0.8,
};
