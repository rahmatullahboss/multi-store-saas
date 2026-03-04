import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Speed Comparison Component - "দেখুন পার্থক্যটা"
 *
 * Shows a dramatic side-by-side race animation comparing:
 * - Regular hosting (slow, ~3.2s loading)
 * - Our platform with Cloudflare CDN (fast, ~0.4s loading)
 *
 * Features:
 * - Animated race with skeleton screens vs instant load
 * - Real-time timers counting up
 * - Replay button for repeated impact
 * - Emotional impact messaging about conversion rates
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { Zap, RefreshCw, TrendingUp, Clock, ShoppingCart, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
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
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textSubtle: 'rgba(255, 255, 255, 0.4)',
};
// ============================================================================
// SKELETON LOADER - Slow side
// ============================================================================
const SkeletonLoader = ({ progress }) => {
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-white/10" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-3 rounded bg-white/10", style: { width: `${Math.min(progress * 30, 70)}%` } }), _jsx("div", { className: "h-2 rounded bg-white/10", style: { width: `${Math.min(progress * 20, 50)}%` } })] })] }), _jsx("div", { className: "w-full aspect-square rounded-xl bg-white/10 flex items-center justify-center", children: _jsx(Loader2, { className: "w-8 h-8 text-white/20 animate-spin" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-3 rounded bg-white/10", style: { width: `${Math.min(progress * 25, 90)}%` } }), _jsx("div", { className: "h-3 rounded bg-white/10", style: { width: `${Math.min(progress * 20, 70)}%` } })] }), _jsx("div", { className: "h-10 rounded-lg bg-white/10", style: { width: `${Math.min(progress * 30, 100)}%` } }), _jsx("div", { className: "h-1 rounded-full bg-white/10 overflow-hidden mt-4", children: _jsx("div", { className: "h-full rounded-full", style: {
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${COLORS.red}80, ${COLORS.red})`,
                    } }) })] }));
};
// ============================================================================
// LOADED STORE PREVIEW - Fast side
// ============================================================================
const LoadedStore = () => {
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center", children: _jsx(ShoppingCart, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-white font-semibold text-sm", children: "\u09AB\u09CD\u09AF\u09BE\u09B6\u09A8 \u09B8\u09CD\u099F\u09CB\u09B0 \u09AC\u09BF\u09A1\u09BF" }), _jsx("p", { className: "text-white/50 text-xs", children: "Premium Fashion" })] })] }), _jsxs("div", { className: "w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-600/20 border border-white/10 overflow-hidden relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: _jsx("div", { className: "text-6xl", children: "\uD83D\uDC55" }) }), _jsx("div", { className: "absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded", children: "-30%" })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-white font-medium text-sm", children: "Premium Cotton T-Shirt" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-emerald-400 font-bold", children: "\u09F3 699" }), _jsx("span", { className: "text-white/40 line-through text-xs", children: "\u09F3 999" })] })] }), _jsxs("button", { className: "w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2", children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), "\u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8"] }), _jsxs("div", { className: "flex items-center justify-center gap-2 text-emerald-400 text-xs", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Ready to sell!"] })] }));
};
// ============================================================================
// TIMER DISPLAY
// ============================================================================
const Timer = ({ time, isComplete, isSlow }) => {
    return (_jsxs("div", { className: `flex items-center gap-2 px-3 py-2 rounded-lg ${isComplete
            ? isSlow ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            : 'bg-white/10 text-white'}`, children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { className: "font-mono font-bold text-lg", children: [time.toFixed(1), "s"] }), isComplete && (_jsx("span", { className: "text-xs", children: "\u23F1\uFE0F" }))] }));
};
// ============================================================================
// MAIN SPEED COMPARISON COMPONENT
// ============================================================================
export function SpeedComparison() {
    const sectionRef = useRef(null);
    const isInView = useInViewSimple(sectionRef);
    const [isRacing, setIsRacing] = useState(false);
    const [slowTime, setSlowTime] = useState(0);
    const [fastTime, setFastTime] = useState(0);
    const [slowComplete, setSlowComplete] = useState(false);
    const [fastComplete, setFastComplete] = useState(false);
    const [slowProgress, setSlowProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const isMobile = useIsMobile();
    const SLOW_LOAD_TIME = 3.2;
    const FAST_LOAD_TIME = 0.4;
    const startRace = useCallback(() => {
        setIsRacing(true);
        setHasStarted(true);
        setSlowTime(0);
        setFastTime(0);
        setSlowComplete(false);
        setFastComplete(false);
        setSlowProgress(0);
    }, []);
    // Auto-start when in view
    useEffect(() => {
        if (isInView && !hasStarted) {
            if (isMobile) {
                // Instant finish on mobile
                setSlowTime(SLOW_LOAD_TIME);
                setFastTime(FAST_LOAD_TIME);
                setSlowProgress(100);
                setSlowComplete(true);
                setFastComplete(true);
                setHasStarted(true);
            }
            else {
                const timer = setTimeout(() => {
                    startRace();
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [isInView, hasStarted, startRace, isMobile]);
    // Race animation logic
    useEffect(() => {
        if (!isRacing)
            return;
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            // Update slow side
            if (elapsed < SLOW_LOAD_TIME) {
                setSlowTime(elapsed);
                setSlowProgress((elapsed / SLOW_LOAD_TIME) * 100);
            }
            else if (!slowComplete) {
                setSlowTime(SLOW_LOAD_TIME);
                setSlowProgress(100);
                setSlowComplete(true);
            }
            // Update fast side
            if (elapsed < FAST_LOAD_TIME) {
                setFastTime(elapsed);
            }
            else if (!fastComplete) {
                setFastTime(FAST_LOAD_TIME);
                setFastComplete(true);
            }
            // Stop when both complete
            if (elapsed >= SLOW_LOAD_TIME) {
                clearInterval(interval);
                setIsRacing(false);
            }
        }, 50);
        return () => clearInterval(interval);
    }, [isRacing, slowComplete, fastComplete]);
    const handleReplay = () => {
        setHasStarted(false);
        setTimeout(() => startRace(), 100);
    };
    return (_jsxs("section", { ref: sectionRef, className: "relative py-16 md:py-20 overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsx("div", { className: "absolute inset-0", children: _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full", style: {
                        background: `radial-gradient(ellipse, ${COLORS.primary}10 0%, transparent 70%)`,
                    } }) }), _jsx("div", { className: "absolute inset-0 opacity-[0.02]", style: {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                } }), _jsxs("div", { className: "relative z-10 max-w-5xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6", style: {
                                    backgroundColor: `${COLORS.accent}10`,
                                    borderColor: `${COLORS.accent}30`,
                                }, children: [_jsx(Zap, { className: "w-4 h-4", style: { color: COLORS.accent } }), _jsx("span", { style: { color: COLORS.accent }, className: "text-sm font-medium", children: "SPEED COMPARISON" })] }), _jsxs("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }, children: ["\u09A6\u09C7\u0996\u09C1\u09A8", ' ', _jsx("span", { className: "bg-clip-text text-transparent", style: {
                                            backgroundImage: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.green} 100%)`,
                                        }, children: "\u09AA\u09BE\u09B0\u09CD\u09A5\u0995\u09CD\u09AF\u099F\u09BE" })] }), _jsx("p", { className: "text-lg max-w-2xl mx-auto", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 Hosting \u09AC\u09A8\u09BE\u09AE \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 Cloudflare-powered Platform" })] }), _jsxs("div", { className: "relative rounded-3xl overflow-hidden p-8 md:p-12", style: {
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }, children: [_jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex", children: _jsx("div", { className: "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg", style: {
                                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.cyan} 100%)`,
                                        boxShadow: `0 0 30px ${COLORS.primary}50`,
                                    }, children: "VS" }) }), _jsxs("div", { className: "grid md:grid-cols-2 gap-8 md:gap-16", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-red-400" }), _jsx("h3", { className: "text-lg font-semibold text-white/80", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 Hosting" })] }), _jsx("div", { className: "rounded-2xl p-6 min-h-[320px] relative overflow-hidden", style: {
                                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                }, children: !slowComplete ? (_jsx(SkeletonLoader, { progress: slowProgress }, "skeleton")) : (_jsx("div", { children: _jsx(LoadedStore, {}) }, "loaded")) }), _jsx("div", { className: "mt-4 flex justify-center", children: _jsx(Timer, { time: slowTime, isComplete: slowComplete, isSlow: true }) }), slowComplete && (_jsx("p", { className: "mt-3 text-red-400/80 text-sm", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\uD83D\uDE29 \u0997\u09CD\u09B0\u09BE\u09B9\u0995 \u0985\u09AA\u09C7\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09A4\u09C7 \u0995\u09B0\u09A4\u09C7 \u099A\u09B2\u09C7 \u0997\u09C7\u099B\u09C7..." }))] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [_jsx(Zap, { className: "w-5 h-5 text-emerald-400" }), _jsx("h3", { className: "text-lg font-semibold text-white/80", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 Platform" })] }), _jsx("div", { className: "rounded-2xl p-6 min-h-[320px] relative overflow-hidden", style: {
                                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)',
                                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                                }, children: !fastComplete ? (_jsx("div", { className: "h-full flex items-center justify-center", children: _jsx("div", { className: "w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500" }) }, "loading")) : (_jsx(LoadedStore, {}, "loaded")) }), _jsx("div", { className: "mt-4 flex justify-center", children: _jsx(Timer, { time: fastTime, isComplete: fastComplete, isSlow: false }) }), fastComplete && (_jsx("p", { className: "mt-3 text-emerald-400/80 text-sm", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\uD83C\uDF89 \u09A4\u09BE\u09CE\u0995\u09CD\u09B7\u09A3\u09BF\u0995! \u0997\u09CD\u09B0\u09BE\u09B9\u0995 \u0995\u09C7\u09A8\u09BE\u0995\u09BE\u099F\u09BE \u0995\u09B0\u099B\u09C7!" }))] })] }), _jsx("div", { className: "flex justify-center mt-8", children: _jsxs("button", { onClick: handleReplay, disabled: isRacing, className: "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50", style: {
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: COLORS.text,
                                    }, children: [_jsx(RefreshCw, { className: `w-5 h-5 ${isRacing ? 'animate-spin' : ''}` }), _jsx("span", { style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\uD83D\uDD04 \u0986\u09AC\u09BE\u09B0 \u09A6\u09C7\u0996\u09C1\u09A8" })] }) })] }), _jsx("div", { className: "mt-12 text-center", children: _jsxs("div", { className: "inline-flex items-center gap-4 px-8 py-5 rounded-2xl", style: {
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                            }, children: [_jsx(TrendingUp, { className: "w-8 h-8 text-emerald-400" }), _jsxs("div", { className: "text-left", children: [_jsxs("p", { className: "text-2xl md:text-3xl font-bold text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: [_jsx("span", { className: "text-emerald-400", children: "8x" }), " \u09A6\u09CD\u09B0\u09C1\u09A4 Loading = ", _jsx("span", { className: "text-cyan-400", children: "40%" }), " \u09AC\u09C7\u09B6\u09BF Sales"] }), _jsx("p", { className: "text-sm text-white/50", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u0997\u09AC\u09C7\u09B7\u09A3\u09BE\u09AF\u09BC \u09AA\u09CD\u09B0\u09AE\u09BE\u09A3\u09BF\u09A4: \u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u09A6\u09C7\u09B0\u09BF\u09A4\u09C7 7% conversion \u0995\u09AE\u09C7 \u09AF\u09BE\u09AF\u09BC" })] })] }) }), _jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-6 text-sm", style: { color: COLORS.textSubtle }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-400" }), _jsx("span", { children: "Cloudflare Edge Network" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-cyan-400" }), _jsx("span", { children: "310+ Global Servers" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-violet-400" }), _jsx("span", { children: "Smart Caching" })] })] })] })] }));
}
export default SpeedComparison;
