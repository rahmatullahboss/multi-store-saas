/**
 * Magnetic Button Component - CSS/JS light
 * Simplified magnetic effect with reduced motion support
 */
'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export function MagneticButton({ children, className = '', magnetStrength = 0.2, }) {
    const ref = useRef(null);
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    useEffect(() => {
        setShouldReduceMotion(prefersReducedMotion());
    }, []);
    let lastCall = 0;
    const handleMouseMove = (e) => {
        if (shouldReduceMotion)
            return;
        const now = Date.now();
        if (now - lastCall < 33)
            return;
        lastCall = now;
        if (!ref.current)
            return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = (e.clientX - centerX) * magnetStrength;
        const distanceY = (e.clientY - centerY) * magnetStrength;
        setOffset({ x: distanceX, y: distanceY });
    };
    const handleMouseLeave = () => {
        setOffset({ x: 0, y: 0 });
    };
    const style = shouldReduceMotion
        ? undefined
        : {
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            transition: 'transform 120ms ease-out',
        };
    return (_jsx("div", { ref: ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave, style: style, className: `inline-block ${className}`, children: children }));
}
export function AnimatedButton({ children, className = '', onClick }) {
    return (_jsx(MagneticButton, { children: _jsx("button", { onClick: onClick, className: `${className} transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]`, children: children }) }));
}
