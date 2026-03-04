import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Cloudflare Benefits Cards - Enterprise-Grade Features
 *
 * Horizontal scrolling cards explaining Cloudflare advantages
 * in simple, non-technical Bengali with hover interactions:
 * - Card lift with shadow
 * - Icon pulse/bounce animation
 * - Background gradient shift
 * - Tooltip with more details
 */
import { useRef, useState } from 'react';
import { Shield } from 'lucide-react';
import { LottieIcon } from '@/components/ui/LottieIcon';
import { LOTTIE_ANIMATIONS } from '@/lib/lottie-animations';
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
// DESIGN TOKENS - Matching Infrastructure Section theme
// ============================================================================
const COLORS = {
    primary: '#006A4E', // Bangladesh Green
    primaryLight: '#00875F',
    primaryDark: '#004D38',
    accent: '#F9A825', // Golden Yellow
    accentLight: '#FFB74D',
    cyan: '#22D3EE', // Data flow color
    purple: '#A855F7', // Secondary accent
    blue: '#3B82F6', // Blue accent
    background: '#0A0F0D',
    backgroundAlt: '#0D1512',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    textSubtle: 'rgba(255, 255, 255, 0.4)',
};
const BENEFITS = [
    {
        id: 'speed',
        icon: 'zap',
        title: 'SPEED',
        titleEn: 'বিদ্যুৎ গতি',
        bengaliQuote: '"বিশ্বের সবচেয়ে দ্রুত CDN"',
        specs: ['<100ms worldwide', 'Edge Caching'],
        color: COLORS.accent,
        gradient: `linear-gradient(135deg, ${COLORS.accent}20 0%, ${COLORS.accent}05 100%)`,
        tooltip: 'আপনার স্টোর বাংলাদেশ থেকে আমেরিকা - সব জায়গায় একই দ্রুত।',
    },
    {
        id: 'security',
        icon: 'shield',
        title: 'SECURITY',
        titleEn: 'সুরক্ষা',
        bengaliQuote: '"হ্যাকার থেকে সুরক্ষিত"',
        specs: ['DDoS Attack Protection', 'Auto SSL Certificate'],
        color: COLORS.primary,
        gradient: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.primary}05 100%)`,
        tooltip: 'প্রতিদিন মিলিয়ন হ্যাকার অ্যাটাক ব্লক করে।',
    },
    {
        id: 'global',
        icon: 'globe',
        title: 'GLOBAL',
        titleEn: 'বিশ্বব্যাপী',
        bengaliQuote: '"পৃথিবীর যেকোনো প্রান্তে Fast"',
        specs: ['310+ Edge Locations', '6 Continents'],
        color: COLORS.cyan,
        gradient: `linear-gradient(135deg, ${COLORS.cyan}20 0%, ${COLORS.cyan}05 100%)`,
        tooltip: 'বিশ্বের ১০০+ দেশে সার্ভার।',
    },
    {
        id: 'uptime',
        icon: 'clock',
        title: 'UPTIME',
        titleEn: 'নিরবচ্ছিন্ন',
        bengaliQuote: '"কখনো Down হয় না"',
        specs: ['99.99% Guaranteed', 'Zero Downtime Deploys'],
        color: COLORS.purple,
        gradient: `linear-gradient(135deg, ${COLORS.purple}20 0%, ${COLORS.purple}05 100%)`,
        tooltip: 'বছরে মাত্র ৫২ মিনিট ডাউনটাইম।',
    },
    {
        id: 'cache',
        icon: 'database',
        title: 'CACHE',
        titleEn: 'স্মার্ট ক্যাশ',
        bengaliQuote: '"Smart Caching = দ্রুত"',
        specs: ['Edge Cache Everywhere', 'Instant Purge'],
        color: COLORS.blue,
        gradient: `linear-gradient(135deg, ${COLORS.blue}20 0%, ${COLORS.blue}05 100%)`,
        tooltip: 'ছবি, ভিডিও সব কাছের সার্ভারে রাখে।',
    },
    {
        id: 'ssl',
        icon: 'lock',
        title: 'SSL',
        titleEn: 'ফ্রি HTTPS',
        bengaliQuote: '"Free HTTPS সবার জন্য"',
        specs: ['Auto SSL Certificate', 'Always Encrypted'],
        color: COLORS.primaryLight,
        gradient: `linear-gradient(135deg, ${COLORS.primaryLight}20 0%, ${COLORS.primaryLight}05 100%)`,
        tooltip: 'কোনো খরচ ছাড়াই SSL সার্টিফিকেট।',
    },
];
const BenefitCardComponent = ({ benefit, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    // Map icon names to Lottie animations
    const iconMap = {
        zap: LOTTIE_ANIMATIONS.zap,
        shield: LOTTIE_ANIMATIONS.shield,
        globe: LOTTIE_ANIMATIONS.globe,
        clock: LOTTIE_ANIMATIONS.clock,
        database: LOTTIE_ANIMATIONS.database,
        lock: LOTTIE_ANIMATIONS.lock,
    };
    const lottieIconSrc = iconMap[benefit.icon] || LOTTIE_ANIMATIONS.zap;
    return (_jsx("div", { className: "relative group flex-shrink-0 w-[280px] sm:w-[300px]", onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), children: _jsxs("div", { className: "relative h-full p-6 rounded-2xl backdrop-blur-xl border transition-all duration-500 cursor-pointer overflow-hidden", style: {
                background: benefit.gradient,
                borderColor: isHovered ? `${benefit.color}50` : 'rgba(255,255,255,0.1)',
                boxShadow: isHovered
                    ? `0 0 30px ${benefit.color}30, 0 8px 16px rgba(0,0,0,0.3)`
                    : '0 4px 12px rgba(0,0,0,0.2)',
            }, children: [_jsx("div", { className: "absolute inset-0 rounded-2xl opacity-0", style: {
                        background: `radial-gradient(circle at ${isHovered ? '30% 30%' : '50% 50%'}, ${benefit.color}25 0%, transparent 70%)`,
                    } }), _jsx("div", { className: "absolute -inset-1 rounded-2xl opacity-0 pointer-events-none", style: {
                        background: `linear-gradient(135deg, ${benefit.color}30 0%, transparent 50%)`,
                    } }), _jsxs("div", { className: "relative z-10", children: [_jsx("div", { className: "w-14 h-14 rounded-xl flex items-center justify-center mb-4", style: {
                                background: `linear-gradient(135deg, ${benefit.color}30 0%, ${benefit.color}10 100%)`,
                                border: `1px solid ${benefit.color}40`,
                            }, children: _jsx(LottieIcon, { src: lottieIconSrc, size: 28, loop: isHovered, autoplay: isHovered, className: "transition-transform" }) }), _jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-xs font-bold tracking-widest mb-1", style: { color: benefit.color }, children: benefit.title }), _jsx("h3", { className: "text-lg font-bold text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: benefit.titleEn })] }), _jsx("p", { className: "text-base mb-4 leading-relaxed", style: {
                                color: COLORS.text,
                                fontFamily: "'Noto Sans Bengali', sans-serif",
                            }, children: benefit.bengaliQuote }), _jsx("div", { className: "space-y-2", children: benefit.specs.map((spec, i) => (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full", style: { background: benefit.color } }), _jsx("span", { style: { color: COLORS.textMuted }, children: spec })] }, i))) })] }), _jsx("div", { className: "absolute left-0 right-0 -bottom-2 mx-4 px-4 py-3 rounded-xl backdrop-blur-md border z-20", style: {
                        background: 'rgba(0,0,0,0.85)',
                        borderColor: `${benefit.color}40`,
                    }, children: _jsxs("p", { className: "text-sm", style: {
                            color: COLORS.text,
                            fontFamily: "'Noto Sans Bengali', sans-serif",
                        }, children: ["\uD83D\uDCA1 ", benefit.tooltip] }) })] }) }));
};
// ============================================================================
// MAIN SECTION COMPONENT
// ============================================================================
export function CloudflareBenefitsCards() {
    const sectionRef = useRef(null);
    const isInView = useInViewSimple(sectionRef);
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };
    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 320;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };
    return (_jsxs("section", { ref: sectionRef, className: "relative py-12 md:py-16 overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full", style: {
                            background: `radial-gradient(ellipse, ${COLORS.primary}10 0%, transparent 70%)`,
                        } }), _jsx("div", { className: "absolute bottom-1/4 right-1/4 w-[500px] h-[300px] rounded-full", style: {
                            background: `radial-gradient(ellipse, ${COLORS.cyan}10 0%, transparent 70%)`,
                        } })] }), _jsx("div", { className: "absolute inset-0 opacity-[0.02]", style: {
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                } }), _jsxs("div", { className: "relative z-10 max-w-7xl mx-auto px-6", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm mb-6", style: {
                                    backgroundColor: `${COLORS.primary}10`,
                                    borderColor: `${COLORS.primary}30`,
                                }, children: [_jsx(Shield, { className: "w-4 h-4", style: { color: COLORS.primary } }), _jsx("span", { style: { color: COLORS.primary }, className: "text-sm font-medium", children: "ENTERPRISE-GRADE FEATURES" })] }), _jsxs("h2", { className: "text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }, children: ["Enterprise-Grade Features,", ' ', _jsx("span", { className: "bg-clip-text text-transparent", style: {
                                            backgroundImage: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                                        }, children: "\u0986\u09AA\u09A8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF FREE" })] }), _jsx("p", { className: "text-lg max-w-2xl mx-auto", style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: "\u09AC\u09A1\u09BC \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u0997\u09C1\u09B2\u09CB\u09B0 \u09AE\u09A4\u09CB Technology \u098F\u0996\u09A8 \u0986\u09AA\u09A8\u09BE\u09B0 \u099B\u09CB\u099F \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u099C\u09A8\u09CD\u09AF, \u0995\u09CB\u09A8\u09CB \u0996\u09B0\u099A \u099B\u09BE\u09A1\u09BC\u09BE\u0987\u0964" })] }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => scroll('left'), className: "absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hidden md:flex", style: {
                                    background: 'rgba(0,0,0,0.6)',
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    opacity: canScrollLeft ? 1 : 0.3,
                                    cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                                }, "aria-label": "Scroll left", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("button", { onClick: () => scroll('right'), className: "absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 hidden md:flex", style: {
                                    background: 'rgba(0,0,0,0.6)',
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    opacity: canScrollRight ? 1 : 0.3,
                                    cursor: canScrollRight ? 'pointer' : 'not-allowed',
                                }, "aria-label": "Scroll right", children: _jsx("svg", { className: "w-5 h-5 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }), _jsx("div", { className: "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0A0F0D] to-transparent z-10 pointer-events-none hidden md:block" }), _jsx("div", { className: "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0A0F0D] to-transparent z-10 pointer-events-none hidden md:block" }), _jsx("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex gap-6 overflow-x-auto pb-8 pt-4 px-4 md:px-8 scrollbar-hide", style: {
                                    scrollSnapType: 'x mandatory',
                                    WebkitOverflowScrolling: 'touch',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                }, children: BENEFITS.map((benefit, index) => (_jsx("div", { style: { scrollSnapAlign: 'start' }, children: _jsx(BenefitCardComponent, { benefit: benefit, index: index }) }, benefit.id))) }), _jsx("div", { className: "flex justify-center gap-2 mt-4 md:hidden", children: _jsx("span", { className: "text-xs", style: { color: COLORS.textSubtle }, children: "\u2190 Swipe to see more \u2192" }) })] }), _jsx("div", { className: "text-center mt-12", children: _jsxs("div", { className: "inline-flex items-center gap-3 px-6 py-3 rounded-full border", style: {
                                background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.cyan}15 100%)`,
                                borderColor: `${COLORS.primary}40`,
                            }, children: [_jsx("span", { className: "text-2xl", children: "\uD83C\uDDE7\uD83C\uDDE9" }), _jsxs("span", { style: { color: COLORS.text, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: [_jsx("span", { className: "font-semibold", children: "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09BF \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF" }), ' ', _jsx("span", { style: { color: COLORS.accent }, children: "\u09AC\u09BF\u09B6\u09CD\u09AC\u09AE\u09BE\u09A8\u09C7\u09B0 Technology" })] })] }) })] }), _jsx("style", { children: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` })] }));
}
export default CloudflareBenefitsCards;
