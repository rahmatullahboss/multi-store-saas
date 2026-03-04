import { useState, useEffect } from 'react';
/**
 * SSR-safe hook to detect mobile viewport
 * Returns false during SSR and initial hydration to prevent mismatch
 */
export function useIsMobile(breakpoint = 768) {
    // Always start with false for SSR consistency
    const [isMobile, setIsMobile] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        // Mark as mounted
        setHasMounted(true);
        // Check initial window size
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };
        // Initial check after mount
        checkMobile();
        // Add event listener
        window.addEventListener('resize', checkMobile);
        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);
    // Return false until mounted to ensure SSR/hydration consistency
    return hasMounted ? isMobile : false;
}
