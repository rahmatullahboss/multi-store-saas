'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * LazySection - Intersection Observer based lazy loading wrapper
 *
 * Only renders children when the section enters viewport.
 * This dramatically reduces initial JS parsing and execution time.
 *
 * SSR-SAFE: Always renders fallback on server and during initial hydration,
 * then switches to real content after mount + intersection.
 */
import { useEffect, useRef, useState } from 'react';
/**
 * Default skeleton that matches common section styling
 */
function DefaultSkeleton({ minHeight }) {
    return (_jsx("div", { className: "w-full animate-pulse bg-gradient-to-b from-transparent to-gray-900/5", style: { minHeight: minHeight || '400px' }, children: _jsxs("div", { className: "max-w-6xl mx-auto px-4 py-16", children: [_jsx("div", { className: "h-8 bg-gray-800/20 rounded-lg w-1/3 mx-auto mb-8" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-48 bg-gray-800/10 rounded-xl" }, i))) })] }) }));
}
// Priority-based root margins for progressive loading
const PRIORITY_ROOT_MARGIN = {
    high: '500px', // Load when 500px away (early preload for critical sections)
    medium: '200px', // Load when 200px away (balanced)
    low: '50px', // Load when very close (save bandwidth for below-fold)
};
export function LazySection({ children, fallback, rootMargin, minHeight = '400px', className = '', priority = 'medium', }) {
    // Start with false to match SSR output (skeleton)
    const [shouldRender, setShouldRender] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const ref = useRef(null);
    // Use priority-based root margin if not explicitly provided
    const effectiveRootMargin = rootMargin ?? PRIORITY_ROOT_MARGIN[priority];
    useEffect(() => {
        setHasMounted(true);
        // Server-side rendering check
        if (typeof window === 'undefined' || !ref.current)
            return;
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            // Fallback: just render immediately
            setShouldRender(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setShouldRender(true);
                // Once visible, stop observing
                observer.disconnect();
            }
        }, {
            rootMargin: effectiveRootMargin,
            threshold: 0.01, // Trigger when even 1% is visible
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [effectiveRootMargin]);
    // Always show fallback until we've mounted AND section is in view
    const showChildren = hasMounted && shouldRender;
    return (_jsx("div", { ref: ref, className: className, style: { minHeight: showChildren ? 'auto' : minHeight }, children: showChildren ? children : fallback || _jsx(DefaultSkeleton, { minHeight: minHeight }) }));
}
export function ClientOnly({ children, fallback = null }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted ? _jsx(_Fragment, { children: children }) : _jsx(_Fragment, { children: fallback });
}
