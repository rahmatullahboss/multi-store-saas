import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MorphingBlob({ color, size = '400px', position = { top: '20%', left: '10%' }, delay = 0, className = '', }) {
    const shouldReduceMotion = useReducedMotion();
    // If reduced motion is preferred, show static blob
    if (shouldReduceMotion) {
        return (_jsx("div", { className: `absolute pointer-events-none ${className}`, style: {
                ...position,
                width: size,
                height: size,
                background: color,
                filter: 'blur(60px)',
                opacity: 0.4,
                borderRadius: '50%',
            } }));
    }
    return (_jsx("div", { className: `absolute pointer-events-none ${className}`, style: {
            ...position,
            width: size,
            height: size,
            background: color,
            // Reduced blur for better performance
            filter: 'blur(60px)',
            opacity: 0.4,
        } }));
}
// Animated gradient orbs for hero section - REDUCED to 2 orbs
export function FloatingOrbs() {
    const shouldReduceMotion = useReducedMotion();
    // Skip orbs entirely on reduced motion
    if (shouldReduceMotion) {
        return (_jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: _jsx("div", { className: "absolute", style: {
                    top: '-10%',
                    left: '-5%',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(16, 185, 129, 0.3)',
                    filter: 'blur(60px)',
                    borderRadius: '50%',
                } }) }));
    }
    return (_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx(MorphingBlob, { color: "rgba(16, 185, 129, 0.3)", size: "400px", position: { top: '-10%', left: '-5%' }, delay: 0 }), _jsx(MorphingBlob, { color: "rgba(20, 184, 166, 0.25)", size: "450px", position: { top: '40%', right: '-10%' }, delay: 5 })] }));
}
