import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Comparison Section - "কেন আমরাই Best Choice?"
 *
 * Showcase why our platform wins for Bangladeshi entrepreneurs
 *
 * Features:
 * - Comparison table (Shopify vs Wix vs Our Brand)
 * - Animated checkmarks on scroll
 * - Strikethrough price animations
 * - Gradient highlighted brand column
 * - Mobile: Swipeable comparison cards
 * - Premium glassmorphism effects
 */
import { useRef, useState } from 'react';
import { Check, X, ArrowRight, ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/animations';
import { ASSETS } from '@/config/assets';
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
    primary: '#006A4E', // Bangladesh Green
    primaryLight: '#00875F',
    accent: '#F9A825', // Golden Yellow
    accentLight: '#FFB74D',
    background: '#0A0F0D',
    backgroundAlt: '#0D1512',
};
const comparisonFeatures = [
    {
        nameBn: 'বাংলা Interface',
        nameEn: 'Bangla Interface',
        shopify: false,
        wix: false,
        ours: true,
        highlight: true,
    },
    {
        nameBn: 'Monthly Cost',
        nameEn: 'Monthly Cost',
        shopify: '৳৫,০০০+',
        wix: '৳২,০০০+',
        ours: '৳৪৯৯',
        highlight: true,
    },
    {
        nameBn: 'Landing Page + E-commerce',
        nameEn: 'Landing Page + E-commerce',
        shopify: 'Needs Extra $',
        wix: 'Needs Extra $',
        ours: true,
        highlight: false,
    },
    {
        nameBn: 'Setup Time',
        nameEn: 'Setup Time',
        shopify: 'Hours',
        wix: 'Hours',
        ours: '৫ মিনিট',
        highlight: true,
    },
    {
        nameBn: 'Local Support',
        nameEn: 'Local Support',
        shopify: false,
        wix: false,
        ours: true,
        highlight: false,
    },
    {
        nameBn: 'Free Plan',
        nameEn: 'Free Plan',
        shopify: false,
        wix: 'Limited',
        ours: true,
        highlight: false,
    },
    {
        nameBn: 'Custom Design Service',
        nameEn: 'Custom Design Service',
        shopify: '৳৫০,০০০+',
        wix: '৳৩০,০০০+',
        ours: 'Ultimate এ Included',
        highlight: true,
    },
];
// ============================================================================
// ANIMATED CHECK ICON
// ============================================================================
const AnimatedCheck = ({ delay = 0, isBrandColumn = false, }) => {
    const ref = useRef(null);
    const isInView = useInViewSimple(ref);
    return (_jsxs("div", { ref: ref, className: "flex items-center justify-center gap-1", children: [_jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center ${isBrandColumn
                    ? 'bg-gradient-to-br from-[#006A4E] to-[#00875F] shadow-lg shadow-[#006A4E]/40'
                    : 'bg-green-500/20'}`, children: _jsx(Check, { className: `w-4 h-4 ${isBrandColumn ? 'text-white' : 'text-green-400'}` }) }), isBrandColumn && (_jsx("span", { className: "text-lg", children: "\uD83C\uDDE7\uD83C\uDDE9" }))] }));
};
// ============================================================================
// ANIMATED X ICON
// ============================================================================
const AnimatedX = ({ delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInViewSimple(ref);
    return (_jsx("div", { ref: ref, children: _jsx("div", { className: "w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center", children: _jsx(X, { className: "w-4 h-4 text-red-400/60" }) }) }));
};
// ============================================================================
// STRIKETHROUGH PRICE
// ============================================================================
const StrikethroughPrice = ({ price, delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInViewSimple(ref);
    return (_jsxs("div", { ref: ref, className: "relative inline-block", children: [_jsx("span", { className: "text-white/40 text-sm font-medium", children: price }), _jsx("div", { className: "absolute top-1/2 left-0 right-0 h-0.5 bg-red-400/60", style: { transformOrigin: 'left' } })] }));
};
// ============================================================================
// OUR PRICE HIGHLIGHT
// ============================================================================
const OurPrice = ({ price, label, delay = 0, }) => {
    const ref = useRef(null);
    const isInView = useInViewSimple(ref);
    return (_jsx("div", { ref: ref, className: "text-center", children: _jsxs("div", { className: "inline-block", children: [_jsx("span", { className: "text-white font-bold text-lg", children: price }), label && (_jsx("span", { className: "block text-xs text-[#F9A825] font-semibold mt-0.5", children: label }))] }) }));
};
// ============================================================================
// FEATURE CELL RENDERER
// ============================================================================
const FeatureCell = ({ value, delay = 0, isBrandColumn = false, isHighlight = false, }) => {
    // Boolean true = check
    if (value === true) {
        return _jsx(AnimatedCheck, { delay: delay, isBrandColumn: isBrandColumn });
    }
    // Boolean false = X
    if (value === false) {
        return _jsx(AnimatedX, { delay: delay });
    }
    // Price (contains ৳ and +)
    if (typeof value === 'string' && value.includes('৳') && value.includes('+')) {
        return _jsx(StrikethroughPrice, { price: value, delay: delay });
    }
    // Our highlight price
    if (isBrandColumn && typeof value === 'string' && value.includes('৳')) {
        // Check if it's just price or has label
        if (value === '৳৪৯৯') {
            return _jsx(OurPrice, { price: value, label: "(\u09E7\u09E6x \u0995\u09AE!)", delay: delay });
        }
        return _jsx(OurPrice, { price: value, delay: delay });
    }
    // Brand column - special highlighting
    if (isBrandColumn) {
        const ref = useRef(null);
        const isInView = useInViewSimple(ref);
        return (_jsx("div", { ref: ref, children: _jsxs("div", { className: "flex items-center justify-center gap-1", children: [_jsx(Check, { className: "w-4 h-4 text-[#006A4E]" }), _jsx("span", { className: "text-white font-medium text-sm", children: value })] }) }));
    }
    // Other text values - muted
    return _jsx("span", { className: "text-white/40 text-sm", children: value });
};
// ============================================================================
// MOBILE COMPARISON CARD
// ============================================================================
const MobileComparisonCard = ({ platform, isOurs = false, features, }) => {
    const platformNames = {
        shopify: 'Shopify',
        wix: 'Wix/Others',
        ours: 'আমাদের Platform',
    };
    return (_jsxs("div", { className: `flex-shrink-0 w-[85vw] max-w-[320px] snap-center ${isOurs
            ? 'bg-gradient-to-br from-[#006A4E]/20 to-[#00875F]/10 border-2 border-[#006A4E]/50'
            : 'bg-white/5 border border-white/10'} backdrop-blur-xl rounded-3xl p-6 mx-2`, children: [_jsxs("div", { className: "text-center mb-6 pb-4 border-b border-white/10", children: [isOurs && (_jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9A825]/20 rounded-full text-[#F9A825] text-xs font-semibold mb-2", children: [_jsx(Sparkles, { className: "w-3 h-3" }), "Best Choice"] })), _jsx("h3", { className: `text-xl font-bold ${isOurs ? 'text-white' : 'text-white/60'} flex flex-col items-center gap-2`, children: isOurs ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-12 h-12 bg-white/10 rounded-xl p-2 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center", children: _jsx("img", { src: ASSETS.brand.logoSmall, alt: "Ozzyl", className: "w-8 h-8 object-contain" }) }), "Ozzyl"] })) : (platformNames[platform]) }), isOurs && _jsx("span", { className: "text-2xl mt-1 block", children: "\uD83C\uDDE7\uD83C\uDDE9" })] }), _jsx("div", { className: "space-y-4", children: features.map((feature, i) => (_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx("span", { className: "text-white/60 text-sm flex-1", children: feature.nameBn }), _jsx("div", { className: "flex-shrink-0", children: _jsx(FeatureCell, { value: feature[platform], delay: i * 0.05, isBrandColumn: isOurs, isHighlight: feature.highlight }) })] }, i))) })] }));
};
// ============================================================================
// MAIN COMPARISON SECTION COMPONENT
// ============================================================================
export function ComparisonSection() {
    const [mobileCardIndex, setMobileCardIndex] = useState(2); // Start with "ours"
    const platforms = ['shopify', 'wix', 'ours'];
    const nextCard = () => {
        setMobileCardIndex((prev) => (prev + 1) % platforms.length);
    };
    const prevCard = () => {
        setMobileCardIndex((prev) => (prev - 1 + platforms.length) % platforms.length);
    };
    return (_jsxs("section", { className: "py-16 relative overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full", style: {
                            background: `radial-gradient(circle, ${COLORS.primary}15 0%, transparent 70%)`,
                        } }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full", style: {
                            background: `radial-gradient(circle, ${COLORS.accent}10 0%, transparent 70%)`,
                        } }), _jsx("div", { className: "absolute inset-0 opacity-[0.02]", style: {
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        } })] }), _jsxs("div", { className: "relative z-10 max-w-7xl mx-auto px-4", children: [_jsx(ScrollReveal, { children: _jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6", style: {
                                        backgroundColor: `${COLORS.primary}10`,
                                        borderColor: `${COLORS.primary}30`,
                                    }, children: [_jsx(Zap, { className: "w-4 h-4", style: { color: COLORS.accent } }), _jsx("span", { className: "text-sm", style: { color: COLORS.accent }, children: "\u09B8\u09CE \u09A4\u09C1\u09B2\u09A8\u09BE" })] }), _jsxs("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u0995\u09C7\u09A8 \u0986\u09AE\u09B0\u09BE\u0987", ' ', _jsx("span", { className: "bg-clip-text text-transparent", style: {
                                                backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                                            }, children: "Best Choice?" })] }), _jsx("p", { className: "text-lg text-white/50 max-w-2xl mx-auto", children: "\u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C0 \u0989\u09A6\u09CD\u09AF\u09CB\u0995\u09CD\u09A4\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u0995\u09C7\u09A8 \u09B8\u09C7\u09B0\u09BE, \u09A8\u09BF\u099C\u09C7\u0987 \u09A6\u09C7\u0996\u09C1\u09A8" })] }) }), _jsx("div", { className: "hidden lg:block", children: _jsxs("div", { className: "bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl", children: [_jsxs("div", { className: "grid grid-cols-4 border-b border-white/10", children: [_jsx("div", { className: "p-6 text-white/60 font-semibold text-lg", children: "Feature" }), _jsx("div", { className: "p-6 text-center text-white/60 font-semibold", children: _jsx("span", { className: "text-lg", children: "Shopify" }) }), _jsx("div", { className: "p-6 text-center text-white/60 font-semibold", children: _jsx("span", { className: "text-lg", children: "Wix/Others" }) }), _jsxs("div", { className: "p-6 text-center relative", style: {
                                                background: `linear-gradient(180deg, ${COLORS.primary}30 0%, ${COLORS.primary}10 100%)`,
                                            }, children: [_jsxs("div", { className: "absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg", style: {
                                                        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.accentLight} 100%)`,
                                                        color: '#000',
                                                        boxShadow: `0 4px 35px ${COLORS.accent}40, 0 4px 25px ${COLORS.accent}70, 0 4px 15px ${COLORS.accent}40`,
                                                    }, children: [_jsx(Sparkles, { className: "w-3 h-3" }), "Best Choice"] }), _jsxs("div", { className: "text-xl font-bold text-white flex flex-col items-center justify-center gap-2 mt-3", children: [_jsx("div", { className: "w-12 h-12 bg-white/10 rounded-xl p-2 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center", children: _jsx("img", { src: ASSETS.brand.logoSmall, alt: "Ozzyl", className: "w-8 h-8 object-contain" }) }), _jsxs("span", { className: "flex items-center gap-2", children: ["Ozzyl", _jsx("span", { className: "text-2xl", children: "\uD83C\uDDE7\uD83C\uDDE9" })] })] })] })] }), _jsx(StaggerContainer, { children: comparisonFeatures.map((feature, i) => (_jsx(StaggerItem, { children: _jsxs("div", { className: `grid grid-cols-4 border-b border-white/5 ${feature.highlight ? 'bg-white/[0.02]' : ''}`, children: [_jsx("div", { className: "p-5 flex items-center", children: _jsx("span", { className: "text-white/80 font-medium", children: feature.nameBn }) }), _jsx("div", { className: "p-5 flex items-center justify-center", children: _jsx(FeatureCell, { value: feature.shopify, delay: i * 0.05 }) }), _jsx("div", { className: "p-5 flex items-center justify-center", children: _jsx(FeatureCell, { value: feature.wix, delay: i * 0.05 + 0.1 }) }), _jsx("div", { className: "p-5 flex items-center justify-center", style: {
                                                        background: `linear-gradient(180deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
                                                        boxShadow: `inset 0 0 30px ${COLORS.primary}10`,
                                                    }, children: _jsx(FeatureCell, { value: feature.ours, delay: i * 0.05 + 0.2, isBrandColumn: true, isHighlight: feature.highlight }) })] }) }, i))) })] }) }), _jsxs("div", { className: "lg:hidden", children: [_jsx("div", { className: "flex items-center justify-center gap-2 mb-6", children: platforms.map((_, i) => (_jsx("button", { onClick: () => setMobileCardIndex(i), className: `w-2 h-2 rounded-full transition-all duration-300 ${i === mobileCardIndex ? 'w-8 bg-[#006A4E]' : 'bg-white/20'}` }, i))) }), _jsxs("div", { className: "relative", children: [_jsx("button", { onClick: prevCard, className: "absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsx("button", { onClick: nextCard, className: "absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition", children: _jsx(ChevronRight, { className: "w-5 h-5" }) }), _jsx("div", { className: "flex justify-center overflow-hidden py-4", children: _jsx("div", { children: _jsx(MobileComparisonCard, { platform: platforms[mobileCardIndex], isOurs: platforms[mobileCardIndex] === 'ours', features: comparisonFeatures }) }, mobileCardIndex) })] }), _jsx("p", { className: "text-center text-white/30 text-xs mt-4", children: "\u2190 \u09B8\u09CB\u09AF\u09BC\u09BE\u0987\u09AA \u0995\u09B0\u09C1\u09A8 \u2192" })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4 mt-12", children: [_jsxs("a", { href: "#pricing", className: "group px-6 py-3 rounded-xl font-semibold text-white/70 border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300 flex items-center gap-2", children: ["\u09A6\u09C7\u0996\u09C1\u09A8 Details", _jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })] }), _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "group px-8 py-3 rounded-xl font-bold text-black overflow-hidden flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg", style: {
                                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                                    boxShadow: `0 0 30px ${COLORS.primary}40`,
                                }, children: [_jsx("span", { children: "\u09AB\u09CD\u09B0\u09BF\u09A4\u09C7 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8" }), _jsx("span", { children: _jsx(ArrowRight, { className: "w-5 h-5" }) })] })] }), _jsx("p", { className: "text-center text-white/30 text-sm mt-8", children: "\u2713 \u0995\u09CB\u09A8\u09CB \u0995\u09CD\u09B0\u09C7\u09A1\u09BF\u099F \u0995\u09BE\u09B0\u09CD\u09A1 \u09B2\u09BE\u0997\u09AC\u09C7 \u09A8\u09BE \u00A0\u2022\u00A0 \u2713 \u09EB \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u09B8\u09C7\u099F\u0986\u09AA \u00A0\u2022\u00A0 \u2713 \u099A\u09BF\u09B0\u0995\u09BE\u09B2 \u09AB\u09CD\u09B0\u09BF \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u09A8" })] })] }));
}
export default ComparisonSection;
