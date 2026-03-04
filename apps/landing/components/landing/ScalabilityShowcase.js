import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Scalability Showcase Section
 *
 * Visualizes the difference between Traditional Hosting (crashing under load)
 * and Ozzyl's Auto-Scaling architecture (Cloudflare Workers + Edge Caching).
 *
 * Features:
 * - Animated Traffic Spike chart
 * - Interactive "Stress Test" toggle
 * - Comparison stats (Uptime, Response Time, Cost)
 */
import { useState, useEffect, useRef } from 'react';
import { Server, Activity, TrendingUp, ShieldCheck, AlertTriangle, Zap, Users, CheckCircle2, XCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/animations';
// Simple IntersectionObserver-based useInView (replaces framer-motion)
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
    accent: '#F9A825',
    success: '#10B981',
    danger: '#EF4444',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.1)',
};
// ============================================================================
// TRAFFIC SIMULATION GRAPH
// ============================================================================
const TrafficGraph = ({ isOzzyl, isStressTest }) => {
    const [bars, setBars] = useState(Array(20).fill(20));
    // Simulate traffic data
    useEffect(() => {
        const interval = setInterval(() => {
            setBars(prev => {
                const newBars = [...prev.slice(1)];
                // Base traffic
                let height = 20 + Math.random() * 15;
                // Spike during stress test
                if (isStressTest) {
                    height = 60 + Math.random() * 30;
                    // Traditional hosting crashes (drops to 0) occasionally under stress
                    if (!isOzzyl && Math.random() > 0.7) {
                        height = 5;
                    }
                }
                newBars.push(height);
                return newBars;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [isOzzyl, isStressTest]);
    return (_jsx("div", { className: "h-40 flex items-end gap-1 px-4 pb-0 opacity-80", children: bars.map((height, i) => {
            // Determine color based on height/state
            let color = isOzzyl ? COLORS.success : COLORS.accent;
            if (!isOzzyl && isStressTest && height < 10)
                color = COLORS.danger; // Crashed
            return (_jsx("div", { className: "flex-1 rounded-t-sm min-w-[4px]", style: {
                    height: `${height}%`,
                    backgroundColor: color,
                    opacity: (!isOzzyl && isStressTest && height < 10) ? 0.5 : 1
                } }, i));
        }) }));
};
// ============================================================================
// SCALABILITY SHOWCASE COMPONENT
// ============================================================================
export function ScalabilityShowcase() {
    const [isStressTest, setIsStressTest] = useState(false);
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    // Auto-start stress test when in view
    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setIsStressTest(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isInView]);
    return (_jsxs("section", { ref: containerRef, className: "py-24 relative bg-[#050807] overflow-hidden", children: [_jsx("div", { className: "absolute top-1/4 right-0 w-[600px] h-[600px] bg-[#006A4E]/10 blur-[120px] rounded-full pointer-events-none" }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 relative z-10", children: [_jsx(ScrollReveal, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#006A4E]/30 bg-[#006A4E]/10 backdrop-blur-sm mb-6", children: [_jsx(Activity, { className: "w-4 h-4 text-[#10B981]" }), _jsx("span", { className: "text-sm font-bold text-[#10B981] uppercase tracking-wider", children: "Unbeatable Reliability" })] }), _jsxs("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u0986\u09A8\u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u099F\u09CD\u09B0\u09BE\u09AB\u09BF\u0995? ", _jsx("span", { className: "text-[#10B981]", children: "\u09A8\u09CB \u099F\u09C7\u09A8\u09B6\u09A8!" })] }), _jsx("p", { className: "text-xl text-white/50 max-w-2xl mx-auto", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09B9\u09A0\u09BE\u09CE \u0995\u09B0\u09C7 \u09B9\u09BE\u099C\u09BE\u09B0 \u09B9\u09BE\u099C\u09BE\u09B0 \u09AD\u09BF\u099C\u09BF\u099F\u09B0 \u098F\u09B2\u09C7\u0993 \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09BE\u0987\u099F \u09A5\u09BE\u0995\u09AC\u09C7 \u09B8\u09C1\u09AA\u09BE\u09B0 \u09AB\u09BE\u09B8\u09CD\u099F\u0964 \u0995\u09BE\u09B0\u09A3 Ozzyl \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C7 \u0985\u099F\u09CB-\u09B8\u09CD\u0995\u09C7\u09B2\u09BF\u0982 \u099F\u09C7\u0995\u09A8\u09CB\u09B2\u099C\u09BF\u0964" })] }) }), _jsxs("div", { className: "grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch", children: [_jsxs("div", { className: "rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden relative group", children: [_jsxs("div", { className: "px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Server, { className: "w-5 h-5 text-white/40" }), _jsx("span", { className: "font-semibold text-white/80", children: "Traditional VPS/Shared" })] }), _jsx("div", { className: `flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isStressTest ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white/50'}`, children: isStressTest ? (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { className: "w-3 h-3" }), " CRASH RISK"] })) : ('Low Traffic') })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "flex justify-between mb-8", children: [_jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-white mb-1", children: isStressTest ? 'Error 502' : '200 OK' }), _jsx("div", { className: "text-sm text-white/40", children: "Status Code" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-3xl font-bold mb-1 ${isStressTest ? 'text-red-500' : 'text-white'}`, children: isStressTest ? 'Wait...' : '0.8s' }), _jsx("div", { className: "text-sm text-white/40", children: "Response Time" })] })] }), _jsxs("div", { className: "relative h-48 rounded-xl bg-black/20 border border-white/5 overflow-hidden mb-6 flex items-end", children: [_jsx(TrafficGraph, { isOzzyl: false, isStressTest: isStressTest }), isStressTest && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-[2px]", children: _jsx("div", { className: "bg-red-500/20 border border-red-500/50 px-4 py-2 rounded text-red-400 font-mono text-xs font-bold", children: "SERVER OVERLOAD" }) }))] }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-start gap-3 text-white/60 text-sm", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 shrink-0 mt-0.5" }), _jsx("span", { children: "\u09AD\u09BF\u099C\u09BF\u099F\u09B0 \u09AC\u09BE\u09DC\u09B2\u09C7 \u09B8\u09CD\u09B2\u09CB \u09B9\u09DF\u09C7 \u09AF\u09BE\u09DF \u09AC\u09BE \u0995\u09CD\u09B0\u09CD\u09AF\u09BE\u09B6 \u0995\u09B0\u09C7" })] }), _jsxs("li", { className: "flex items-start gap-3 text-white/60 text-sm", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 shrink-0 mt-0.5" }), _jsx("span", { children: "\u09B0\u200D\u09CD\u09AF\u09BE\u09AE \u09AC\u09BE \u09B8\u09BF\u09AA\u09BF\u0987\u0989 \u09B2\u09BF\u09AE\u09BF\u099F\u09C7\u09A1 \u09A5\u09BE\u0995\u09C7" })] }), _jsxs("li", { className: "flex items-start gap-3 text-white/60 text-sm", children: [_jsx(XCircle, { className: "w-4 h-4 text-red-500 shrink-0 mt-0.5" }), _jsx("span", { children: "\u09B8\u09CD\u0995\u09C7\u09B2 \u0995\u09B0\u09A4\u09C7 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u0986\u09AA\u0997\u09CD\u09B0\u09C7\u09A1 \u0995\u09B0\u09A4\u09C7 \u09B9\u09DF (Time Consuming)" })] })] })] }), isStressTest && (_jsx("div", { className: "absolute inset-0 border-2 border-red-500/20 rounded-3xl pointer-events-none animate-pulse" }))] }), _jsxs("div", { className: "rounded-3xl border border-[#10B981]/30 bg-gradient-to-b from-[#10B981]/5 to-transparent overflow-hidden relative shadow-[0_0_50px_-20px_rgba(16,185,129,0.2)]", children: [_jsxs("div", { className: "px-6 py-4 border-b border-[#10B981]/20 flex justify-between items-center bg-[#10B981]/5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Zap, { className: "w-5 h-5 text-[#10B981]" }), _jsx("span", { className: "font-semibold text-white", children: "Ozzyl Cloud Platform" })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-bold", children: [_jsx(ShieldCheck, { className: "w-3 h-3" }), " AUTO-SCALING ACTIVE"] })] }), _jsxs("div", { className: "p-8", children: [_jsxs("div", { className: "flex justify-between mb-8", children: [_jsxs("div", { children: [_jsx("div", { className: "text-3xl font-bold text-white mb-1", children: "200 OK" }), _jsx("div", { className: "text-sm text-white/40", children: "Always Online" })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-3xl font-bold text-[#10B981] mb-1", children: "0.05s" }), _jsx("div", { className: "text-sm text-white/40", children: "Constant Speed" })] })] }), _jsxs("div", { className: "relative h-48 rounded-xl bg-black/20 border border-[#10B981]/20 overflow-hidden mb-6 flex items-end", children: [_jsx(TrafficGraph, { isOzzyl: true, isStressTest: isStressTest }), _jsx("div", { className: "absolute top-4 right-4 flex flex-col gap-2 pointer-events-none", children: _jsxs("div", { className: "bg-[#10B981]/20 border border-[#10B981]/30 px-3 py-1.5 rounded text-[#10B981] font-mono text-xs font-bold flex items-center gap-2", children: [_jsx(Users, { className: "w-3 h-3" }), isStressTest ? 'Infinite Scaling' : 'Ready for Millions'] }) })] }), _jsxs("ul", { className: "space-y-3", children: [_jsxs("li", { className: "flex items-start gap-3 text-white/90 text-sm font-medium", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-[#10B981] shrink-0 mt-0.5" }), _jsxs("span", { children: ["\u09E7\u09E6 \u09AE\u09BF\u09B2\u09BF\u09DF\u09A8 \u09B6\u09AA, \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09C7\u0995\u09C7 \u09E7\u09E6 \u09AE\u09BF\u09B2\u09BF\u09DF\u09A8 \u09AD\u09BF\u099C\u09BF\u099F\u09B0? ", _jsx("span", { className: "text-[#10B981]", children: "No Problem!" })] })] }), _jsxs("li", { className: "flex items-start gap-3 text-white/90 text-sm font-medium", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-[#10B981] shrink-0 mt-0.5" }), _jsx("span", { children: "\u0997\u09CD\u09B2\u09CB\u09AC\u09BE\u09B2 \u098F\u099C \u09A8\u09C7\u099F\u0993\u09DF\u09BE\u09B0\u09CD\u0995 - \u099F\u09CD\u09B0\u09BE\u09AB\u09BF\u0995 \u09AC\u09BE\u09DC\u09B2\u09C7 \u0987\u09A8\u09AB\u09CD\u09B0\u09BE\u09B8\u09CD\u099F\u09CD\u09B0\u09BE\u0995\u099A\u09BE\u09B0 \u09AC\u09DC \u09B9\u09DF" })] }), _jsxs("li", { className: "flex items-start gap-3 text-white/90 text-sm font-medium", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-[#10B981] shrink-0 mt-0.5" }), _jsx("span", { children: "\u0985\u099F\u09CB\u09AE\u09CD\u09AF\u09BE\u099F\u09BF\u0995 \u09B8\u09CD\u0995\u09C7\u09B2\u09BF\u0982 - \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u0995\u09CD\u09B0\u09CD\u09AF\u09BE\u09B6 \u0995\u09B0\u09BE\u09B0 \u0995\u09CB\u09A8\u09CB \u09B8\u09C1\u09AF\u09CB\u0997 \u09A8\u09C7\u0987" })] })] })] })] })] }), _jsxs("div", { className: "mt-16 text-center", children: [_jsxs("button", { onClick: () => setIsStressTest(!isStressTest), className: "group relative inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95", children: [_jsx("span", { className: `w-3 h-3 rounded-full ${isStressTest ? 'bg-red-500 animate-pulse' : 'bg-white/20'}` }), _jsx("span", { className: "font-bold text-white tracking-wide", children: isStressTest ? 'STOP INFINITE LOAD' : 'TEST INFINITE SCALABILITY' }), _jsx(TrendingUp, { className: "w-4 h-4 text-white/50 group-hover:text-white transition-colors" })] }), _jsx("p", { className: "mt-4 text-sm text-white/30", children: "Click to simulate unlimited traffic load" })] })] })] }));
}
export default ScalabilityShowcase;
