import { useEffect, useState } from 'react';

/**
 * Custom hook to detect if the user prefers reduced motion.
 * 
 * Uses the `prefers-reduced-motion` media query to determine if
 * animations should be simplified or disabled.
 * 
 * @returns boolean - true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns simplified animation variants when reduced motion is preferred.
 * 
 * @param fullAnimation - The full animation object
 * @param reducedAnimation - The simplified animation (default: no animation)
 * @returns The appropriate animation based on user preference
 */
export function useAccessibleAnimation<T>(
  fullAnimation: T,
  reducedAnimation: T
): T {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? reducedAnimation : fullAnimation;
}
