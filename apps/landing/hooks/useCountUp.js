'use client';
import { useEffect, useState } from 'react';
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function useCountUp(target, { duration = 1200, enabled = true } = {}) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!enabled)
            return;
        if (prefersReducedMotion()) {
            setValue(target);
            return;
        }
        let rafId;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) {
                rafId = requestAnimationFrame(tick);
            }
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [target, duration, enabled]);
    return value;
}
