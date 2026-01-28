/**
 * Animated Counter Component - OPTIMIZED
 * Counts up with reduced motion support
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({
  end,
  duration = 1.5, // Reduced from 2
  suffix = '',
  prefix = '',
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // If reduced motion, just show the final number
    if (shouldReduceMotion) {
      setCount(end);
      return;
    }

    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      const startTime = Date.now();
      const endTime = startTime + duration * 1000;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / (duration * 1000), 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * end);

        setCount(currentCount);

        if (now < endTime) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration, shouldReduceMotion]);

  // If reduced motion, show static number
  if (shouldReduceMotion) {
    return (
      <span ref={ref} className={className}>
        {prefix}
        {end.toLocaleString()}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3 }}
    >
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </motion.span>
  );
}
