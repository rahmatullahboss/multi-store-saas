import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Premium CTA Button - PERFORMANCE OPTIMIZED
 * Removed heavy particle effects and simplified animations
 * - No more 8 particle animations
 * - Simplified glow effect (CSS only, no JS animation)
 * - Removed infinite gradient animation
 * - Respects prefers-reduced-motion
 */
import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
export function PremiumCTAButton({ children, href, onClick, className = '', }) {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const buttonContent = (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300", style: {
                    background: 'linear-gradient(135deg, #00875F 0%, #006A4E 50%, #F9A825 100%)',
                } }), _jsx("div", { className: "absolute -inset-1 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300", style: {
                    background: 'linear-gradient(135deg, #00875F, #F9A825)',
                } }), _jsxs("span", { className: "relative z-10 flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-5 h-5" }), children] }), isHovered && !shouldReduceMotion && (_jsx("div", { className: "absolute inset-0 rounded-xl overflow-hidden", style: {
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shine 1.5s ease-in-out',
                } }))] }));
}
const commonProps = {
    ref: ref,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: `group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${className}`,
    style: {
        background: 'linear-gradient(135deg, #006A4E 0%, #00875F 100%)',
        boxShadow: '0 0 20px rgba(0, 135, 95, 0.25)',
    },
};
if (href) {
    return (_jsx("a", { ...commonProps, href: href, children: buttonContent }));
}
return (_jsx("button", { ...commonProps, onClick: onClick, children: buttonContent }));
