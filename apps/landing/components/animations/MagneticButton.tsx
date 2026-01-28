/**
 * Magnetic Button Component - OPTIMIZED
 * Simplified magnetic effect with reduced motion support
 */
'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  magnetStrength?: number;
}

export function MagneticButton({
  children,
  className = '',
  magnetStrength = 0.2, // Reduced from 0.3
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Softer spring for less CPU usage
  const springConfig = { stiffness: 200, damping: 20 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  // Throttled mouse handler
  let lastCall = 0;
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;

    // Throttle to ~30fps
    const now = Date.now();
    if (now - lastCall < 33) return;
    lastCall = now;

    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * magnetStrength;
    const distanceY = (e.clientY - centerY) * magnetStrength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // If reduced motion, no magnetic effect
  if (shouldReduceMotion) {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={`inline-block ${className}`}
    >
      {children as any}
    </motion.div>
  );
}

// Animated button with simpler effects
interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AnimatedButton({ children, className = '', onClick }: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <button onClick={onClick} className={className}>
        {children as any}
      </button>
    );
  }

  return (
    <MagneticButton>
      <motion.button
        onClick={onClick}
        className={className}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 15px 30px rgba(16, 185, 129, 0.3)',
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        {children as any}
      </motion.button>
    </MagneticButton>
  );
}
