import { jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Animated Counter Component - OPTIMIZED
 * Counts up with reduced motion support
 */
import { useEffect, useRef, useState } from 'react';
// Simple useInView (replaces framer-motion)
function useInViewSimple(ref, options) {
    const [inView, setInView] = React.useState(false);
    React.useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                if (options?.once !== false)
                    observer.disconnect();
            }
        }, { rootMargin: options?.margin || '0px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return inView;
}
export function AnimatedCounter({ end, duration = 1.5, // Reduced from 2
suffix = '', prefix = '', className = '', }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInViewSimple(ref);
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
                }
                else {
                    setCount(end);
                }
            };
            requestAnimationFrame(animate);
        }
    }, [isInView, end, duration, shouldReduceMotion]);
    // If reduced motion, show static number
    if (shouldReduceMotion) {
        return (_jsxs("span", { ref: ref, className: className, children: [prefix, end.toLocaleString(), suffix] }));
    }
    return (_jsxs("span", { ref: ref, className: className, children: [prefix, count.toLocaleString(), suffix] }));
}
