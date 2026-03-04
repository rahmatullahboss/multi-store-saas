import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CDN Explainer Component - "সহজ বাংলায় বুঝুন"
 *
 * A simple, visual explainer for non-technical users
 * who don't understand what CDN means.
 *
 * Features:
 * - Animated data packet traveling long distance (slow) vs short (fast)
 * - Side by side comparison
 * - Bengali language explanations
 * - Speed counters showing the difference
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { HelpCircle, RefreshCw, Globe, Server, User, Zap, Clock, MapPin, } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
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
// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    accent: '#F9A825',
    cyan: '#22D3EE',
    red: '#EF4444',
    green: '#10B981',
    background: '#0A0F0D',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textSubtle: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
};
const DataPacket = ({ isAnimating, duration, color, delay = 0 }) => {
    return (_jsx("div", { className: "absolute w-4 h-4 rounded-full", style: {
            background: `radial-gradient(circle, ${color} 0%, ${color}80 50%, transparent 100%)`,
            boxShadow: `0 0 20px ${color}, 0 0 40px ${color}50`,
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
        } }));
};
const ConnectionLine = ({ progress, color, isDashed }) => {
    return (_jsxs("div", { className: "relative w-full h-1 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 rounded-full", style: {
                    background: 'rgba(255,255,255,0.1)',
                    borderStyle: isDashed ? 'dashed' : 'solid',
                } }), _jsx("div", { className: "absolute h-full rounded-full", style: {
                    background: `linear-gradient(90deg, ${color}80, ${color})`,
                    boxShadow: `0 0 10px ${color}50`,
                    width: `${progress * 100}%`,
                } })] }));
};
const LocationNode = ({ icon: Icon, label, sublabel, color, isActive, emoji, }) => {
    return (_jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsxs("div", { className: "w-16 h-16 rounded-2xl flex items-center justify-center relative", style: {
                    background: `${color}20`,
                    border: `2px solid ${color}40`,
                    boxShadow: isActive ? `0 0 30px ${color}40` : 'none',
                }, children: [emoji ? (_jsx("span", { className: "text-2xl", children: emoji })) : (_jsx(Icon, { className: "w-7 h-7", style: { color } })), isActive && (_jsx("div", { className: "absolute inset-0 rounded-2xl", style: { border: `2px solid ${color}` } }))] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-white text-sm font-medium", children: label }), sublabel && (_jsx("p", { className: "text-xs", style: { color: COLORS.textSubtle }, children: sublabel }))] })] }));
};
const ScenarioCard = ({ title, titleBn, isGood, customerLocation, serverLocation, serverEmoji, distance, time, currentTime, isAnimating, progress, isComplete, }) => {
    const color = isGood ? COLORS.green : COLORS.red;
    return (_jsxs("div", { className: "rounded-2xl p-6 relative overflow-hidden", style: {
            background: `linear-gradient(135deg, ${color}05 0%, ${color}02 100%)`,
            border: `1px solid ${color}20`,
        }, children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-white font-semibold", children: title }), _jsx("p", { className: "text-sm", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: titleBn })] }), _jsx("div", { className: `px-3 py-1 rounded-full text-xs font-bold ${isGood ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`, children: isGood ? '⚡ FAST' : '🐢 SLOW' })] }), _jsxs("div", { className: "flex items-center justify-between gap-4 mb-6", children: [_jsx(LocationNode, { emoji: "\uD83D\uDC64", icon: User, label: "Customer", sublabel: customerLocation, color: COLORS.cyan, isActive: isAnimating && !isComplete }), _jsxs("div", { className: "flex-1 relative py-4", children: [_jsx(ConnectionLine, { progress: progress, color: color, isDashed: !isGood }), _jsx("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-white/40", children: distance }), isAnimating && (_jsx("div", { className: "absolute inset-x-0 top-1/2 -translate-y-1/2", children: _jsx(DataPacket, { isAnimating: isAnimating, duration: isGood ? 0.5 : 3, color: color }) }))] }), _jsx(LocationNode, { emoji: serverEmoji, icon: Server, label: "Server", sublabel: serverLocation, color: isGood ? COLORS.green : COLORS.accent, isActive: isComplete })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4", style: { color: COLORS.textMuted } }), _jsxs("span", { className: "font-mono text-lg", style: { color }, children: [currentTime.toFixed(1), "s"] }), isComplete && (_jsx("span", { className: "text-sm", children: "\u23F1\uFE0F" }))] }), isComplete && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-2xl", children: isGood ? '😊' : '😫' }), _jsx("span", { className: "text-sm font-medium", style: { color, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: isGood ? 'Super Fast!' : 'অনেক Slow!' })] }))] })] }));
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CDNExplainer() {
    const sectionRef = useRef(null);
    const isInView = useInViewSimple(sectionRef);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slowTime, setSlowTime] = useState(0);
    const [fastTime, setFastTime] = useState(0);
    const [slowProgress, setSlowProgress] = useState(0);
    const [fastProgress, setFastProgress] = useState(0);
    const [slowComplete, setSlowComplete] = useState(false);
    const [fastComplete, setFastComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const isMobile = useIsMobile();
    const SLOW_TIME = 0.8; // Competitors from Singapore
    const FAST_TIME = 0.05; // Our platform from Dhaka edge
    const startAnimation = useCallback(() => {
        setIsAnimating(true);
        setHasStarted(true);
        setSlowTime(0);
        setFastTime(0);
        setSlowProgress(0);
        setFastProgress(0);
        setSlowComplete(false);
        setFastComplete(false);
    }, []);
    // Auto-start when in view
    useEffect(() => {
        if (isInView && !hasStarted) {
            if (isMobile) {
                // Instant finish on mobile
                setSlowTime(SLOW_TIME);
                setFastTime(FAST_TIME);
                setSlowProgress(100);
                setFastProgress(100);
                setSlowComplete(true);
                setFastComplete(true);
                setHasStarted(true);
            }
            else {
                const timer = setTimeout(() => startAnimation(), 800);
                return () => clearTimeout(timer);
            }
        }
    }, [isInView, hasStarted, startAnimation, isMobile]);
    // Animation logic
    useEffect(() => {
        if (!isAnimating)
            return;
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            // Update slow side
            if (elapsed < SLOW_TIME) {
                setSlowTime(elapsed);
                setSlowProgress((elapsed / SLOW_TIME) * 100);
            }
            else if (!slowComplete) {
                setSlowTime(SLOW_TIME);
                setSlowProgress(100);
                setSlowComplete(true);
            }
            // Update fast side
            if (elapsed < FAST_TIME) {
                setFastTime(elapsed);
                setFastProgress((elapsed / FAST_TIME) * 100);
            }
            else if (!fastComplete) {
                setFastTime(FAST_TIME);
                setFastProgress(100);
                setFastComplete(true);
            }
            // Stop when both complete
            if (elapsed >= SLOW_TIME) {
                clearInterval(interval);
                setIsAnimating(false);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [isAnimating, slowComplete, fastComplete]);
    const handleReplay = () => {
        setHasStarted(false);
        setTimeout(() => startAnimation(), 100);
    };
    return (_jsxs("section", { ref: sectionRef, className: "relative py-16 md:py-20 overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsx("div", { className: "absolute inset-0", children: _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full", style: {
                        background: `radial-gradient(ellipse, ${COLORS.cyan}08 0%, transparent 70%)`,
                    } }) }), _jsxs("div", { className: "relative z-10 max-w-5xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6", style: {
                                    backgroundColor: `${COLORS.accent}10`,
                                    borderColor: `${COLORS.accent}30`,
                                }, children: [_jsx(HelpCircle, { className: "w-4 h-4", style: { color: COLORS.accent } }), _jsx("span", { style: { color: COLORS.accent, fontFamily: "'Noto Sans Bengali', sans-serif" }, className: "text-sm font-medium", children: "\u09B8\u09B9\u099C \u09AC\u09BE\u0982\u09B2\u09BE\u09AF\u09BC \u09AC\u09C1\u099D\u09C1\u09A8" })] }), _jsx("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }, children: "\uD83E\uDD14 CDN \u0995\u09BF \u099C\u09BF\u09A8\u09BF\u09B8?" }), _jsxs("p", { className: "text-lg max-w-2xl mx-auto", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["CDN \u09AE\u09BE\u09A8\u09C7 Content Delivery Network\u0964 \u098F\u099F\u09BE \u0986\u09AA\u09A8\u09BE\u09B0 Website \u0995\u09C7", _jsx("span", { className: "text-white font-semibold", children: " \u09AA\u09C3\u09A5\u09BF\u09AC\u09C0\u09B0 \u0995\u09BE\u099B\u09C7\u09B0 Server \u09A5\u09C7\u0995\u09C7" }), " \u09A6\u09CD\u09B0\u09C1\u09A4 \u09B8\u09BE\u09B0\u09CD\u09AD \u0995\u09B0\u09C7\u0964"] })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6 mb-8", children: [_jsx(ScenarioCard, { title: "COMPETITORS", titleBn: "\u0985\u09A8\u09CD\u09AF\u09BE\u09A8\u09CD\u09AF Platform", isGood: false, customerLocation: "Dhaka, BD", serverLocation: "Singapore \uD83C\uDDF8\uD83C\uDDEC", serverEmoji: "\uD83D\uDDA5\uFE0F", distance: "3,000+ km", time: "0.8s", currentTime: slowTime, isAnimating: isAnimating, progress: slowProgress, isComplete: slowComplete }), _jsx(ScenarioCard, { title: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 PLATFORM", titleBn: "Cloudflare Bangladesh Edge", isGood: true, customerLocation: "Dhaka, BD", serverLocation: "Dhaka Edge \uD83C\uDDE7\uD83C\uDDE9", serverEmoji: "\u26A1", distance: "Same City!", time: "0.05s", currentTime: fastTime, isAnimating: isAnimating, progress: fastProgress, isComplete: fastComplete })] }), _jsx("div", { className: "flex justify-center mb-10", children: _jsxs("button", { onClick: handleReplay, disabled: isAnimating, className: "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50", style: {
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: COLORS.text,
                                fontFamily: "'Noto Sans Bengali', sans-serif",
                            }, children: [_jsx(RefreshCw, { className: `w-5 h-5 ${isAnimating ? 'animate-spin' : ''}` }), "\uD83D\uDD04 \u0986\u09AC\u09BE\u09B0 \u09A6\u09C7\u0996\u09C1\u09A8"] }) }), _jsxs("div", { className: "rounded-2xl p-6 text-center", style: {
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(34, 211, 238, 0.08) 100%)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                        }, children: [_jsxs("div", { className: "flex items-center justify-center gap-3 mb-4", children: [_jsx(Zap, { className: "w-6 h-6 text-yellow-400" }), _jsx("h3", { className: "text-xl font-bold text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09B8\u09B9\u099C \u0995\u09A5\u09BE\u09AF\u09BC:" })] }), _jsxs("p", { className: "text-lg text-white/80 mb-2 leading-relaxed", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\uD83C\uDF0D ", _jsx("span", { className: "text-cyan-400 font-semibold", children: "\u09A2\u09BE\u0995\u09BE \u09A5\u09C7\u0995\u09C7 \u09A6\u09C1\u09AC\u09BE\u0987" }), " \u2014 \u09B8\u09AC \u099C\u09BE\u09AF\u09BC\u0997\u09BE\u09AF\u09BC", ' ', _jsx("span", { className: "text-green-400 font-semibold", children: "1 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1\u09C7 Load!" })] }), _jsx("p", { className: "text-base text-white/60 mb-4 leading-relaxed", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u0986\u09AA\u09A8\u09BE\u09B0 Customer \u098F\u09B0 \u0995\u09BE\u099B\u09C7\u09B0 Server \u09A5\u09C7\u0995\u09C7\u0987 Content Serve \u09B9\u09AF\u09BC \u2014 \u09A4\u09BE\u0987 Lightning Fast! \u26A1" }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5", children: [_jsx(MapPin, { className: "w-4 h-4 text-cyan-400" }), _jsxs("span", { style: { color: COLORS.textMuted }, children: ["\u09A2\u09BE\u0995\u09BE\u09AF\u09BC Edge Server: ", _jsx("span", { className: "text-white", children: "~5ms" })] })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5", children: [_jsx(Globe, { className: "w-4 h-4 text-green-400" }), _jsxs("span", { style: { color: COLORS.textMuted }, children: ["Competitors (Singapore): ", _jsx("span", { className: "text-white", children: "~80ms" })] })] })] })] }), _jsx("div", { className: "mt-8 grid grid-cols-3 gap-4 text-center", children: [
                            { value: '8x', label: 'দ্রুত', color: COLORS.green },
                            { value: '40%', label: 'বেশি Sales', color: COLORS.cyan },
                            { value: '99.9%', label: 'Uptime', color: COLORS.accent },
                        ].map((stat, index) => (_jsxs("div", { className: "p-4 rounded-xl", style: {
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }, children: [_jsx("p", { className: "text-2xl font-bold", style: { color: stat.color }, children: stat.value }), _jsx("p", { className: "text-sm", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: stat.label })] }, index))) })] })] }));
}
export default CDNExplainer;
