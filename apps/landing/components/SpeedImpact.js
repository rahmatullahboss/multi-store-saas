import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Speed Impact Section - "Speed = Sales"
 *
 * Shows the business impact of speed with real statistics
 * from Google/Amazon research.
 *
 * Features:
 * - Animated statistics counters
 * - Side-by-side business comparison
 * - Money counter with "cha-ching" effect
 * - Bengali explanations for local audience
 */
import { useRef, useState, useEffect } from 'react';
import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';
import { TrendingDown, TrendingUp, DollarSign, Users, ShoppingCart, Zap, AlertTriangle, CheckCircle, Sparkles, } from 'lucide-react';
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
    orange: '#F97316',
    purple: '#A855F7',
    background: '#0A0F0D',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textSubtle: 'rgba(255, 255, 255, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
};
const AnimatedNumber = ({ value, duration = 2, prefix = '', suffix = '', color = COLORS.text, className = '', onComplete, }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const displayValue = useCountUp(value, { duration: duration * 1000, enabled: isInView });
    useEffect(() => {
        if (!isInView)
            return;
        const timeout = setTimeout(() => onComplete?.(), duration * 1000);
        return () => clearTimeout(timeout);
    }, [isInView, duration, onComplete]);
    return (_jsxs("span", { ref: ref, className: `${className} -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { color }, children: [prefix, displayValue.toLocaleString(), suffix] }));
};
const StatCard = ({ icon: Icon, stat, description, descriptionBn, isNegative, delay = 0, }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const color = isNegative ? COLORS.red : COLORS.green;
    const TrendIcon = isNegative ? TrendingDown : TrendingUp;
    return (_jsxs("div", { ref: ref, className: `rounded-xl p-5 relative overflow-hidden group -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: {
            background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
            border: `1px solid ${color}20`,
            animationDelay: `${delay}s`,
        }, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105", style: { background: `${color}20` }, children: _jsx(Icon, { className: "w-5 h-5", style: { color } }) }), _jsx(TrendIcon, { className: "w-5 h-5", style: { color } })] }), _jsx("p", { className: "text-2xl font-bold text-white mb-1", children: stat }), _jsx("p", { className: "text-sm text-white/70", children: description }), _jsx("p", { className: "text-xs mt-1", style: { color: COLORS.textSubtle, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: descriptionBn })] }));
};
const ComparisonTable = ({ isInView }) => {
    const [animationComplete, setAnimationComplete] = useState(false);
    const slowData = {
        visitors: 1000,
        stayed: 470,
        bought: 47,
        sales: 47000,
    };
    const fastData = {
        visitors: 1000,
        stayed: 950,
        bought: 95,
        sales: 95000,
    };
    return (_jsxs("div", { className: `rounded-2xl overflow-hidden -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            animationDelay: '0.2s',
        }, children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 p-4 border-b", style: { borderColor: COLORS.border }, children: [_jsx("div", { className: "text-sm font-medium", style: { color: COLORS.textMuted }, children: _jsx("span", { style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09AE\u09C7\u099F\u09CD\u09B0\u09BF\u0995\u09CD\u09B8" }) }), _jsx("div", { className: "text-center", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-400" }), _jsx("span", { className: "text-sm font-medium text-red-400", children: "Slow Site (3s+)" })] }) }), _jsx("div", { className: "text-center", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Zap, { className: "w-4 h-4 text-green-400" }), _jsx("span", { className: "text-sm font-medium text-green-400", children: "Fast Site (<1s)" })] }) })] }), [
                {
                    label: 'Visitors আসে',
                    icon: Users,
                    slow: { value: slowData.visitors, suffix: ' জন' },
                    fast: { value: fastData.visitors, suffix: ' জন' },
                    delay: 0.1,
                },
                {
                    label: 'থেকে যায়',
                    icon: CheckCircle,
                    slow: { value: slowData.stayed, suffix: ' জন', color: COLORS.red },
                    fast: { value: fastData.stayed, suffix: ' জন', color: COLORS.green },
                    delay: 0.2,
                },
                {
                    label: 'কেনাকাটা করে',
                    icon: ShoppingCart,
                    slow: { value: slowData.bought, suffix: ' জন', color: COLORS.red },
                    fast: { value: fastData.bought, suffix: ' জন', color: COLORS.green },
                    delay: 0.3,
                },
                {
                    label: 'Daily Sales',
                    icon: DollarSign,
                    slow: { value: slowData.sales, prefix: '৳', color: COLORS.red },
                    fast: { value: fastData.sales, prefix: '৳', color: COLORS.green },
                    delay: 0.4,
                    isHighlight: true,
                },
            ].map((row, index) => (_jsxs("div", { className: `grid grid-cols-3 gap-4 p-4 ${row.isHighlight ? 'bg-white/[0.02]' : ''} -fade-in-left ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { borderBottom: index < 3 ? `1px solid ${COLORS.border}` : 'none', animationDelay: `${row.delay}s` }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(row.icon, { className: "w-4 h-4", style: { color: COLORS.textMuted } }), _jsx("span", { className: "text-sm", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: row.label })] }), _jsx("div", { className: "text-center", children: _jsx(AnimatedNumber, { value: row.slow.value, prefix: row.slow.prefix, suffix: row.slow.suffix, color: row.slow.color || COLORS.text, className: `font-mono ${row.isHighlight ? 'text-lg font-bold' : 'text-sm'}`, duration: 1.5 }) }), _jsx("div", { className: "text-center", children: _jsx(AnimatedNumber, { value: row.fast.value, prefix: row.fast.prefix, suffix: row.fast.suffix, color: row.fast.color || COLORS.text, className: `font-mono ${row.isHighlight ? 'text-lg font-bold' : 'text-sm'}`, duration: 1.5, onComplete: row.isHighlight ? () => setAnimationComplete(true) : undefined }) })] }, index))), _jsx("div", { className: `p-4 text-center -fade-in-up ${animationComplete ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`, style: {
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }, children: _jsxs("div", { className: "flex items-center justify-center gap-3", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDC46" }), _jsxs("p", { className: "text-lg font-bold", style: { color: COLORS.green, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8", ' ', _jsx("span", { className: "animate-glow-text", children: "\u09F348,000" }), ' ', "\u09AC\u09C7\u09B6\u09BF \u09B6\u09C1\u09A7\u09C1 Speed \u098F\u09B0 \u099C\u09A8\u09CD\u09AF!"] }), animationComplete && _jsx("span", { className: "text-2xl -pop", children: "\uD83D\uDCB0" })] }) })] }));
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function SpeedImpact() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, rootMargin: '-100px' });
    return (_jsxs("section", { ref: sectionRef, className: "relative py-16 md:py-20 overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsx("div", { className: "absolute inset-0", children: _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full -pulse-soft", style: {
                        background: `radial-gradient(ellipse, ${COLORS.accent}08 0%, transparent 70%)`,
                    } }) }), _jsxs("div", { className: "relative z-10 max-w-5xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: `inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: {
                                    backgroundColor: `${COLORS.accent}10`,
                                    borderColor: `${COLORS.accent}30`,
                                }, children: [_jsx(DollarSign, { className: "w-4 h-4", style: { color: COLORS.accent } }), _jsx("span", { style: { color: COLORS.accent }, className: "text-sm font-medium", children: "SPEED = SALES" })] }), _jsx("h2", { className: `text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }, children: "\uD83D\uDCB0 Speed \u0995\u09C7\u09A8 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09AC\u09AA\u09C2\u09B0\u09CD\u09A3?" }), _jsxs("p", { className: `text-lg max-w-2xl mx-auto -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u26A1 ", _jsx("span", { className: "text-white font-semibold", children: "Facebook \u098F\u09B0 \u09AE\u09A4\u09CB Speed" }), ", \u0986\u09AA\u09A8\u09BE\u09B0 \u099B\u09CB\u099F Business \u098F\u0993 \u2014 Research \u09AC\u09B2\u099B\u09C7:"] })] }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4 mb-12", children: [_jsx(StatCard, { icon: TrendingDown, stat: "7% Loss", description: "1 Second Delay = 7% Conversion Loss", descriptionBn: "\u09E7 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u09A6\u09C7\u09B0\u09BF\u09A4\u09C7 \u09ED% \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u09B9\u09BE\u09B0\u09BE\u09A8", isNegative: true, delay: 0.2 }), _jsx(StatCard, { icon: Users, stat: "53% Leave", description: "3+ Second Load = 53% Visitors Leave", descriptionBn: "\u09E9+ \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1\u09C7 \u09EB\u09E9% \u09AD\u09BF\u099C\u09BF\u099F\u09B0 \u099A\u09B2\u09C7 \u09AF\u09BE\u09AF\u09BC", isNegative: true, delay: 0.3 }), _jsx(StatCard, { icon: TrendingUp, stat: "+8% Sales", description: "0.1s Improvement = 8% More Conversions", descriptionBn: "\u09E6.\u09E7 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1 \u09A6\u09CD\u09B0\u09C1\u09A4 = \u09EE% \u09AC\u09C7\u09B6\u09BF \u09AC\u09BF\u0995\u09CD\u09B0\u09BF", isNegative: false, delay: 0.4 })] }), _jsxs("div", { className: `mb-8 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { animationDelay: '0.3s' }, children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-6", children: [_jsx("span", { className: "text-2xl", children: "\uD83D\uDCA1" }), _jsx("h3", { className: "text-xl font-bold text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09AC\u09BE\u09B8\u09CD\u09A4\u09AC \u0989\u09A6\u09BE\u09B9\u09B0\u09A3:" })] }), _jsxs("p", { className: "text-center mb-6", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09A7\u09B0\u09C1\u09A8 \u0986\u09AA\u09A8\u09BE\u09B0 Store \u098F \u09AA\u09CD\u09B0\u09A4\u09BF\u09A6\u09BF\u09A8 ", _jsx("span", { className: "text-white font-semibold", children: "1,000 \u099C\u09A8" }), ' ', "\u0986\u09B8\u09C7..."] }), _jsx(ComparisonTable, { isInView: isInView })] }), _jsxs("div", { className: `text-center -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, children: [_jsxs("div", { className: "inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-transform duration-200 hover:scale-[1.02]", style: {
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 106, 78, 0.1) 100%)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                }, children: [_jsx(Sparkles, { className: "w-6 h-6", style: { color: COLORS.accent } }), _jsxs("p", { className: "text-lg font-bold text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u098F\u0987 Speed \u0986\u09AA\u09A8\u09BE\u09B0 \u09B8\u09AC Store \u098F", ' ', _jsx("span", { className: "bg-clip-text text-transparent", style: {
                                                    backgroundImage: `linear-gradient(135deg, ${COLORS.green} 0%, ${COLORS.cyan} 100%)`,
                                                }, children: "FREE!" }), ' ', "\u26A1"] })] }), _jsx("p", { className: `text-xs mt-4 -fade-in ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { color: COLORS.textSubtle }, children: "* Source: Google/SOASTA Research, Amazon Internal Studies" })] })] })] }));
}
export default SpeedImpact;
