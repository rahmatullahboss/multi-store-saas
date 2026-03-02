'use client';

/**
 * Modern Performance-Optimized Animation Components
 * - CSS-first approach where possible
 * - Respects prefers-reduced-motion
 * - Minimal JS for better performance
 */

import { ReactNode, useEffect, useState } from 'react';

// Hook to detect reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;

// Simple scroll-triggered reveal using CSS animations
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`animate-fade-in-up ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children as any}
    </div>
  );
}

// Stagger container for list animations
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
}

export function StaggerContainer({ children, className = '' }: StaggerContainerProps) {
  return <div className={className}>{children as any}</div>;

// Stagger item with CSS animation
interface StaggerItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function StaggerItem({ children, index, className = '' }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {children as any}
    </div>
  );
}

// Re-export optimized components
export { MorphingBlob, FloatingOrbs } from './MorphingBlob';
export { TiltCard } from './TiltCard';
export { MagneticButton, AnimatedButton } from './MagneticButton';
export { AnimatedText, ShimmerText, Typewriter } from './AnimatedText';
export { AnimatedCounter } from './AnimatedCounter';
export { PremiumCTAButton } from './PremiumCTAButton';
export {
  ScrollReveal as MotionScrollReveal,
  StaggerContainer as MotionStaggerContainer,
  StaggerItem as MotionStaggerItem,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
} from './ScrollReveal';
