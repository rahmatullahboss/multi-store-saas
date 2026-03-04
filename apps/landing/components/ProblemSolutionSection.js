import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Problem-Solution Section - UI/UX Pro Max
 *
 * Concept: "The Struggle is Real" → "But Not Anymore"
 *
 * DESIGN SYSTEM: Liquid Glass
 * - Left panel: Problem (Red/orange undertones, liquid noise)
 * - Right panel: Solution (Green/teal undertones, liquid noise)
 */
import { useRef, useState, useEffect } from 'react';
import { X, Check, Facebook, Code, FileSpreadsheet, DollarSign, HelpCircle, PartyPopper, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ClientOnly } from '@/components/LazySection';
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
    problem: {
        bg: 'rgba(239, 68, 68, 0.05)',
        orb: '#EF4444',
        border: 'rgba(239, 68, 68, 0.2)',
        text: 'rgba(255, 255, 255, 0.9)',
        textMuted: 'rgba(255, 255, 255, 0.5)',
    },
    solution: {
        bg: 'rgba(16, 185, 129, 0.05)',
        orb: '#10B981',
        border: 'rgba(16, 185, 129, 0.2)',
        text: 'rgba(255, 255, 255, 0.95)',
        textMuted: 'rgba(255, 255, 255, 0.6)',
    },
};
// ============================================================================
// LIQUID BACKGROUND ORBS
// ============================================================================
const LiquidBackground = ({ type }) => {
    const color = type === 'problem' ? COLORS.problem.orb : COLORS.solution.orb;
    return (_jsxs("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute -top-[20%] -left-[20%] w-[140%] h-[140%] opacity-[0.1]", style: {
                    background: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`,
                    filter: 'blur(80px)',
                } }), _jsx("div", { className: "absolute inset-0 opacity-[0.05]", style: { backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` } })] }));
};
// ============================================================================
// CONFETTI COMPONENT
// ============================================================================
const Confetti = ({ isActive }) => {
    const [pieces, setPieces] = useState([]);
    useEffect(() => {
        if (isActive && pieces.length === 0) {
            setPieces(Array.from({ length: 30 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 0.5,
                rotation: Math.random() * 360,
                color: ['#10B981', '#34D399', '#F9A825', '#006A4E'][Math.floor(Math.random() * 4)],
                size: Math.random() * 6 + 4,
            })));
        }
    }, [isActive]);
    if (!isActive)
        return null;
    return (_jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none z-20", children: pieces.map((p) => (_jsx("div", { className: "absolute rounded-full", style: {
                left: `${p.x}%`,
                top: '20%',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
            } }, p.id))) }));
};
// ============================================================================
// GLASS CARD
// ============================================================================
const GlassCard = ({ children, className = '', type = 'mid' }) => (_jsx("div", { className: `relative backdrop-blur-xl ${className}`, style: {
        backgroundColor: type === 'high' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    }, children: children }));
// ============================================================================
// PAIN POINT CARD
// ============================================================================
const PainPointCard = ({ icon: Icon, text, delay = 0 }) => (_jsx("div", { className: "group", children: _jsx("div", { className: "relative p-3 rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 transition-colors backdrop-blur-sm", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0", children: _jsx(X, { className: "w-4 h-4 text-red-500" }) }), _jsxs("div", { className: "flex-1 flex items-center gap-2", children: [_jsx(Icon, { className: "w-4 h-4 text-white/30" }), _jsx("span", { className: "text-sm text-white/70 font-medium font-bengali", children: text })] })] }) }) }));
// ============================================================================
// SOLUTION STEP
// ============================================================================
const SolutionStep = ({ number, text, isComplete, delay = 0 }) => (_jsxs("div", { className: "flex items-center gap-4 relative", children: [_jsx("div", { className: "absolute left-[15px] top-8 bottom-[-16px] w-[2px] bg-white/5 last:hidden" }), _jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border relative z-10", style: {
                backgroundColor: isComplete ? COLORS.solution.orb : 'transparent',
                borderColor: isComplete ? COLORS.solution.orb : 'rgba(255,255,255,0.2)',
                color: isComplete ? '#000' : 'rgba(255,255,255,0.4)',
            }, children: isComplete ? _jsx(Check, { className: "w-4 h-4" }) : _jsx("span", { className: "text-xs font-bold", children: number }) }), _jsxs("div", { className: "flex-1 py-1", children: [_jsx("p", { className: `text-sm font-medium transition-colors duration-300 font-bengali ${isComplete ? 'text-white' : 'text-white/40'}`, children: text }), isComplete && (_jsx("div", { className: "h-[2px] bg-emerald-500/50 mt-1 rounded-full" }))] })] }));
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function ProblemSolutionSection() {
    const sectionRef = useRef(null);
    const isInView = useInViewSimple(sectionRef);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [showConfetti, setShowConfetti] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        if (isInView) {
            [0, 1, 2].forEach((i) => setTimeout(() => setCompletedSteps(prev => [...prev, i]), 800 + i * 800));
            setTimeout(() => setShowConfetti(true), 3500);
        }
    }, [isInView]);
    const painPoints = [
        { icon: Facebook, text: t('problemPain1') },
        { icon: Code, text: t('problemPain2') },
        { icon: FileSpreadsheet, text: t('problemPain3') },
        { icon: DollarSign, text: t('problemPain4') },
        { icon: HelpCircle, text: t('problemPain5') },
    ];
    const steps = [
        { number: '1', text: t('problemStep1') },
        { number: '2', text: t('problemStep2') },
        { number: '3', text: t('problemStep3') },
    ];
    return (_jsxs("section", { ref: sectionRef, className: "relative py-20 px-4 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[#0A0A12]" }), _jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)]" }), _jsxs("div", { className: "max-w-6xl mx-auto relative z-10", children: [_jsx("div", { className: "text-center mb-16", children: _jsxs("h2", { className: "text-3xl md:text-5xl font-bold text-white mb-4 font-bengali leading-tight", children: [t('problemHeaderTitle1'), " ", _jsx("span", { className: "text-red-400", children: t('problemHeaderTitle2') }), " ", t('problemHeaderTitle3'), ' ', _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400", children: t('problemHeaderTitle4') })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12", children: [_jsxs("div", { className: "relative rounded-3xl overflow-hidden border border-white/5 bg-white/5", children: [_jsx(LiquidBackground, { type: "problem" }), _jsxs("div", { className: "relative p-6 md:p-10 z-10 h-full flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-4 mb-8", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20 flex items-center justify-center text-2xl", children: "\uD83D\uDE2B" }), _jsxs("h3", { className: "text-2xl font-bold text-white font-bengali", children: [t('problemLeftTitle1'), " ", _jsx("span", { className: "text-red-400", children: t('problemLeftTitle2') }), " ", t('problemLeftTitle3')] })] }), _jsx("div", { className: "space-y-4 flex-1", children: painPoints.map((point, i) => (_jsx(PainPointCard, { ...point, delay: i * 0.1 }, i))) })] })] }), _jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block", children: _jsx("div", { className: "w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20", children: _jsx(ArrowRight, { className: "w-8 h-8 text-white" }) }) }), _jsxs("div", { className: "relative rounded-3xl overflow-hidden border border-white/10 bg-white/5", children: [_jsx(LiquidBackground, { type: "solution" }), _jsx(ClientOnly, { children: _jsx(Confetti, { isActive: showConfetti }) }), _jsxs("div", { className: "relative p-6 md:p-10 z-10 h-full flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-4 mb-8", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(16,185,129,0.2)]", children: "\u2728" }), _jsxs("h3", { className: "text-2xl font-bold text-white font-bengali", children: [t('problemRightTitle1'), " ", _jsx("span", { className: "text-emerald-400", children: t('problemRightTitle2') })] })] }), _jsx("div", { className: "space-y-2 mb-8 flex-1", children: steps.map((step, i) => (_jsx(SolutionStep, { ...step, isComplete: completedSteps.includes(i), delay: i * 0.2 }, i))) }), _jsxs("div", { className: "p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2", children: [_jsx(PartyPopper, { className: "w-5 h-5 text-emerald-400" }), _jsxs("span", { className: "font-bold text-emerald-100 font-bengali", children: [t('problemSuccess'), " \uD83C\uDF89"] })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-6", children: ['No Coding', 'Drag & Drop', 'Instant Launch'].map((tag, i) => (_jsx("span", { className: "px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/60", children: tag }, i))) })] })] })] })] })] }));
}
export default ProblemSolutionSection;
