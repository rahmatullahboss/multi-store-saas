'use client';

import { useEffect, useState } from 'react';

type InViewOptions = {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

export function useInView<T extends Element>(
  ref: React.RefObject<T>,
  { rootMargin = '0px', threshold = 0.1, once = true }: InViewOptions = {}
): boolean {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          setIsInView(true);
          if (once) observer.disconnect();
          return;
        }

        if (!once) {
          setIsInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, once]);

  return isInView;
}
