'use client';
import { useEffect, useState } from 'react';
export function useInView(ref, { rootMargin = '0px', threshold = 0.1, once = true } = {}) {
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const element = ref.current;
        if (!element)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            const isIntersecting = entry.isIntersecting;
            if (isIntersecting) {
                setIsInView(true);
                if (once)
                    observer.disconnect();
                return;
            }
            if (!once) {
                setIsInView(false);
            }
        }, { rootMargin, threshold });
        observer.observe(element);
        return () => observer.disconnect();
    }, [ref, rootMargin, threshold, once]);
    return isInView;
}
