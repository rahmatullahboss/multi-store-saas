import { jsx as _jsx } from "react/jsx-runtime";
export function AnimatedText({ text, className = '', delay = 0, type = 'words', tag = 'span', }) {
    const shouldReduceMotion = useReducedMotion();
    // If reduced motion, just show the text
    if (shouldReduceMotion) {
        const Tag = tag;
        return _jsx(Tag, { className: className, children: text });
    }
    const items = type === 'words' ? text.split(' ') : text.split('');
    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: type === 'words' ? 0.08 : 0.03,
                delayChildren: delay,
            },
        },
    };
    const child = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
            },
        },
    };
    const span = tag;
    return (_jsx("span", { initial: "hidden", whileInView: "visible", className: `inline-flex flex-wrap ${className}`, children: items.map((item, index) => (_jsx("span", { className: "inline-block", style: { marginRight: type === 'words' ? '0.3em' : undefined }, children: item }, index))) }));
}
export function ShimmerText({ children, className = '' }) {
    const shouldReduceMotion = useReducedMotion();
    // No animation for reduced motion
    if (shouldReduceMotion) {
        return (_jsx("span", { className: `bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent ${className}`, children: children }));
    }
    return (_jsx("span", { className: `relative inline-block bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer ${className}`, children: children }));
}
export function Typewriter({ text, className = '', speed = 50 }) {
    const shouldReduceMotion = useReducedMotion();
    if (shouldReduceMotion) {
        return _jsx("span", { className: className, children: text });
    }
    return (_jsx("span", { className: className, style: { overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block' }, children: text }));
}
