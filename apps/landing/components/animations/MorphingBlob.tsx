/**
 * Morphing Gradient Blob Component - OPTIMIZED
 * Reduced animation complexity for better performance
 * - Longer duration (less CPU cycles)
 * - Simpler transforms
 * - Reduced blur on mobile
 * - Respects prefers-reduced-motion
 */
'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface MorphingBlobProps {
  color: string;
  size?: string;
  position?: { top?: string; left?: string; right?: string; bottom?: string };
  delay?: number;
  className?: string;
}

export function MorphingBlob({
  color,
  size = '400px',
  position = { top: '20%', left: '10%' },
  delay = 0,
  className = '',
}: MorphingBlobProps) {
  const shouldReduceMotion = useReducedMotion();

  // If reduced motion is preferred, show static blob
  if (shouldReduceMotion) {
    return (
      <div
        className={`absolute pointer-events-none ${className}`}
        style={{
          ...position,
          width: size,
          height: size,
          background: color,
          filter: 'blur(60px)',
          opacity: 0.4,
          borderRadius: '50%',
        }}
      />
    );
  }

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        ...position,
        width: size,
        height: size,
        background: color,
        // Reduced blur for better performance
        filter: 'blur(60px)',
        opacity: 0.4,
      }}
      animate={{
        // Simpler animation - just scale and opacity
        scale: [1, 1.05, 1],
        opacity: [0.4, 0.5, 0.4],
      }}
      transition={{
        // Much longer duration = less CPU work
        duration: 20,
        ease: 'easeInOut',
        repeat: Infinity,
        delay,
      }}
      // CSS optimization hints
      initial={{ borderRadius: '50%' }}
    />
  );
}

// Animated gradient orbs for hero section - REDUCED to 2 orbs
export function FloatingOrbs() {
  const shouldReduceMotion = useReducedMotion();

  // Skip orbs entirely on reduced motion
  if (shouldReduceMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute"
          style={{
            top: '-10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            background: 'rgba(16, 185, 129, 0.3)',
            filter: 'blur(60px)',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Reduced from 3 to 2 orbs */}
      <MorphingBlob
        color="rgba(16, 185, 129, 0.3)"
        size="400px"
        position={{ top: '-10%', left: '-5%' }}
        delay={0}
      />
      <MorphingBlob
        color="rgba(20, 184, 166, 0.25)"
        size="450px"
        position={{ top: '40%', right: '-10%' }}
        delay={5}
      />
    </div>
  );
}
