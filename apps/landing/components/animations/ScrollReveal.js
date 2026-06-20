import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
export function ScrollReveal({ children, direction = 'up', delay = 0, className = '' }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                obs.disconnect();
            }
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    const dirMap = {
        up: 'translateY(30px)',
        down: 'translateY(-30px)',
        left: 'translateX(-30px)',
        right: 'translateX(30px)',
        scale: 'scale(0.95)',
    };
    return (_jsx("div", { ref: ref, className: className, style: {
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : dirMap[direction] || 'translateY(30px)',
            transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        }, children: children }));
}
export default ScrollReveal;
export function StaggerContainer({ children, className = '' }) {
    return _jsx("div", { className: className, children: children });
}
export function StaggerItem({ children, className = '', delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                obs.disconnect();
            }
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return (_jsx("div", { ref: ref, className: className, style: {
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
        }, children: children }));
}
