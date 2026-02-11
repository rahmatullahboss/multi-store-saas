'use client';

/**
 * LottieIcon Component
 * 
 * A reusable wrapper for Lottie animations with performance optimizations:
 * - Lazy loading
 * - Intersection Observer for viewport-based playback
 * - Configurable loop, autoplay, and hover effects
 * - Responsive sizing
 */

import { useEffect, useRef, useState } from 'react';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

interface LottieIconProps {
  /** Path to the Lottie JSON file or animation data */
  src: string | object;
  
  /** Size in pixels (width and height will be equal) */
  size?: number;
  
  /** Custom width (overrides size) */
  width?: number;
  
  /** Custom height (overrides size) */
  height?: number;
  
  /** Whether to loop the animation */
  loop?: boolean;
  
  /** Whether to autoplay on mount */
  autoplay?: boolean;
  
  /** Play animation on hover */
  playOnHover?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Animation speed (1 = normal, 2 = 2x speed, etc.) */
  speed?: number;
  
  /** Enable lazy loading (only play when in viewport) */
  lazy?: boolean;
  
  /** Accessibility label */
  ariaLabel?: string;
}

export function LottieIcon({
  src,
  size = 24,
  width,
  height,
  loop = true,
  autoplay = true,
  playOnHover = false,
  className = '',
  speed = 1,
  lazy = false,
  ariaLabel,
}: LottieIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy);
  const [animationData, setAnimationData] = useState<object | null>(
    typeof src === 'object' ? src : null
  );
  const [isHovered, setIsHovered] = useState(false);

  // Load animation data if src is a string (URL)
  useEffect(() => {
    if (typeof src === 'string') {
      console.log('[Lottie] Loading animation from:', src);
      fetch(src)
        .then((res) => {
          console.log('[Lottie] Fetch response:', res.status, res.ok);
          return res.json();
        })
        .then((data) => {
          console.log('[Lottie] Animation data loaded:', Object.keys(data));
          setAnimationData(data);
        })
        .catch((err) => console.error('[Lottie] Failed to load animation:', src, err));
    } else if (typeof src === 'object') {
      console.log('[Lottie] Using inline animation data');
      setAnimationData(src);
    }
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Set animation speed
  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  // Handle hover play/pause
  useEffect(() => {
    if (!playOnHover || !lottieRef.current) return;

    if (isHovered) {
      lottieRef.current.play();
    } else {
      lottieRef.current.stop();
    }
  }, [isHovered, playOnHover]);

  const finalWidth = width || size;
  const finalHeight = height || size;

  const shouldPlay = autoplay && isInView;

  if (!animationData) {
    // Skeleton placeholder while loading
    console.log('[Lottie] Showing skeleton, no animation data yet for:', src);
    return (
      <div
        ref={containerRef}
        style={{ width: finalWidth, height: finalHeight }}
        className={`bg-white/5 rounded animate-pulse ${className}`}
        aria-label={ariaLabel}
        title="Loading animation..."
      />
    );
  }

  console.log('[Lottie] Rendering animation:', typeof src === 'string' ? src : 'inline');

  return (
    <div
      ref={containerRef}
      style={{ width: finalWidth, height: finalHeight }}
      className={`inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => playOnHover && setIsHovered(true)}
      onMouseLeave={() => playOnHover && setIsHovered(false)}
      role="img"
      aria-label={ariaLabel}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={shouldPlay}
        style={{ width: finalWidth, height: finalHeight }}
      />
    </div>
  );
}

export default LottieIcon;
