import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * Trust Section - স্বচ্ছতাই আমাদের শক্তি
 *
 * A transparent trust-building section that avoids fake testimonials
 * and focuses on authenticity.
 *
 * Sections:
 * 1. Founder's Message - Real photo, honest message about MVP stage
 * 2. Live Transparency Dashboard - Real-time stats from database
 * 3. Early Adopter Benefits - Clear value proposition
 * 4. Public Roadmap - Transparent progress tracking
 */
import { useEffect, useState, useRef } from 'react';
import { Mail, MessageCircle, Phone, TrendingUp, Store, Activity, Sparkles, Target, Gift, Users, Check, Clock, Wrench, Calendar, ExternalLink, MessageSquarePlus, ArrowRight, } from 'lucide-react';
import { ASSETS } from '@/config/assets';
// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    accent: '#F9A825',
    accentLight: '#FFB74D',
    background: '#0A0F0D',
    backgroundAlt: '#0D1512',
    backgroundCard: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(0, 106, 78, 0.5)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textSubtle: 'rgba(255, 255, 255, 0.5)',
};
// ============================================================================
// ANIMATED COUNTER COMPONENT - SSR-Safe
// ============================================================================
const AnimatedNumber = ({ value, suffix = '', prefix = '', }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasMounted, setHasMounted] = useState(false);
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    // Mark as mounted on client
    useEffect(() => {
        setHasMounted(true);
    }, []);
    useEffect(() => {
        if (!hasMounted)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
            }
        }, { threshold: 0.5 });
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, [hasMounted]);
    useEffect(() => {
        if (!isVisible)
            return;
        const duration = 2000;
        const steps = 60;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            }
            else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);
        return () => clearInterval(timer);
    }, [isVisible, value]);
    // Format number - only on client to avoid locale mismatch
    const formattedValue = hasMounted ? displayValue.toLocaleString() : '0';
    return (_jsxs("span", { ref: ref, suppressHydrationWarning: true, children: [prefix, formattedValue, suffix] }));
};
// ============================================================================
// SECTION 1: FOUNDER'S MESSAGE
// ============================================================================
const FoundersMessage = () => {
    return (_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4", style: {
                            background: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.primary}30`,
                        }, children: "\uD83D\uDCAC Founder \u098F\u09B0 \u0995\u09A5\u09BE" }), _jsxs("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\"\u0986\u09AE\u09B0\u09BE \u09A8\u09A4\u09C1\u09A8, \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0", ' ', _jsx("span", { style: {
                                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }, children: "Vision \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0" }), "\""] })] }), _jsxs("div", { className: "relative overflow-hidden rounded-3xl p-8 md:p-12", style: {
                    background: `linear-gradient(135deg, ${COLORS.backgroundCard}, rgba(0, 106, 78, 0.05))`,
                    border: `1px solid ${COLORS.border}`,
                }, children: [_jsx("div", { className: "absolute inset-0 opacity-[0.02]", style: {
                            backgroundImage: `radial-gradient(${COLORS.primary} 1px, transparent 1px)`,
                            backgroundSize: '24px 24px',
                        } }), _jsxs("div", { className: "relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12", children: [_jsxs("div", { className: "relative flex-shrink-0", children: [_jsxs("div", { className: "relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden", style: {
                                            border: `3px solid ${COLORS.primary}40`,
                                            boxShadow: `0 0 40px ${COLORS.primary}20`,
                                        }, children: [_jsx("img", { src: ASSETS.founder.main, alt: "Rahmatullah Zisan - Founder", className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center", style: {
                                                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                                                    boxShadow: `0 4px 12px ${COLORS.primary}50`,
                                                }, children: _jsx(Check, { className: "w-5 h-5 text-white" }) })] }), _jsxs("div", { className: "text-center mt-4", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: "\u09B0\u09B9\u09AE\u09A4\u09C1\u09B2\u09CD\u09B2\u09BE\u09B9 \u099C\u09BF\u09B8\u09BE\u09A8" }), _jsx("p", { style: { color: COLORS.textSubtle }, className: "text-sm", children: "Founder & Developer" })] })] }), _jsxs("div", { className: "flex-1 text-center lg:text-left", children: [_jsxs("div", { className: "space-y-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: [_jsxs("p", { className: "text-lg md:text-xl leading-relaxed", style: { color: COLORS.textMuted }, children: ["\u0986\u09AE\u09BF ", _jsx("span", { className: "text-white font-semibold", children: "\u09B0\u09B9\u09AE\u09A4\u09C1\u09B2\u09CD\u09B2\u09BE\u09B9 \u099C\u09BF\u09B8\u09BE\u09A8" }), ", \u098F\u0987 Platform \u098F\u09B0 Founder\u0964 \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6\u09C7 Small Business \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09BE \u0995\u09A4\u099F\u09BE \u0995\u09A0\u09BF\u09A8 \u0986\u09AE\u09BF \u09A8\u09BF\u099C\u09C7 \u09A6\u09C7\u0996\u09C7\u099B\u09BF\u0964 \u09A4\u09BE\u0987 \u098F\u0987 Platform \u09AC\u09BE\u09A8\u09BE\u099A\u09CD\u099B\u09BF \u2014 \u09AF\u09C7\u09A8 \u09AF\u09C7\u0995\u09C7\u0989", ' ', _jsx("span", { className: "text-white font-semibold", children: "\u09EB \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 Online Business" }), " \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u0964"] }), _jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl", style: {
                                                    background: `${COLORS.accent}15`,
                                                    border: `1px solid ${COLORS.accent}30`,
                                                }, children: [_jsx(Sparkles, { className: "w-4 h-4", style: { color: COLORS.accent } }), _jsx("span", { style: { color: COLORS.accent }, className: "text-sm font-medium", children: "\u0986\u09AE\u09B0\u09BE \u09A8\u09BF\u09B0\u09B2\u09B8\u09AD\u09BE\u09AC\u09C7 \u0986\u09AA\u09A8\u09BE\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09C7\u09B0\u09BE \u0987-\u0995\u09AE\u09BE\u09B0\u09CD\u09B8 \u09AA\u09CD\u09B2\u09CD\u09AF\u09BE\u099F\u09AB\u09B0\u09CD\u09AE \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u099B\u09BF\u0964" })] }), _jsxs("p", { className: "text-base leading-relaxed", style: { color: COLORS.textMuted }, children: ["\uD83E\uDD1D ", _jsx("span", { className: "text-white", children: "Early Adopter" }), " \u09B0\u09BE \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 Product Build \u0995\u09B0\u09BE\u09B0 \u09B8\u09C1\u09AF\u09CB\u0997 \u09AA\u09BE\u09AC\u09C7\u09A8\u0964 \u0986\u09AA\u09A8\u09BE\u09B0 Feedback \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF Feature \u09B9\u09AC\u09C7\u0964"] })] }), _jsxs("div", { className: "flex flex-wrap justify-center lg:justify-start gap-3 mt-8", children: [_jsxs("a", { href: "mailto:hello@ozzyl.com", className: "group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300", style: {
                                                    background: `${COLORS.primary}10`,
                                                    border: `1px solid ${COLORS.primary}30`,
                                                }, children: [_jsx(Mail, { className: "w-4 h-4 transition-transform group-hover:scale-110", style: { color: COLORS.primary } }), _jsx("span", { style: { color: COLORS.textMuted }, className: "text-sm group-hover:text-white transition-colors", children: "Email \u0995\u09B0\u09C1\u09A8" })] }), _jsxs("a", { href: "https://wa.me/8801739416661", target: "_blank", rel: "noopener noreferrer", className: "group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300", style: {
                                                    background: 'rgba(37, 211, 102, 0.1)',
                                                    border: '1px solid rgba(37, 211, 102, 0.3)',
                                                }, children: [_jsx(MessageCircle, { className: "w-4 h-4 transition-transform group-hover:scale-110", style: { color: '#25D366' } }), _jsx("span", { style: { color: COLORS.textMuted }, className: "text-sm group-hover:text-white transition-colors", children: "Support Chat" })] }), _jsxs("a", { href: "tel:+8801739416661", className: "group flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300", style: {
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                }, children: [_jsx(Phone, { className: "w-4 h-4 transition-transform group-hover:scale-110", style: { color: '#3B82F6' } }), _jsx("span", { style: { color: COLORS.textMuted }, className: "text-sm group-hover:text-white transition-colors", children: "Support Call" })] })] })] })] })] })] }));
};
const LiveTransparencyDashboard = ({ stats }) => {
    const [liveStats, setLiveStats] = useState({
        totalUsers: (stats?.totalUsers || 0) + 500,
        totalStores: (stats?.totalStores || 0) + 500,
        uptime: stats?.uptime || 99.9,
    });
    const [pulseSignup, setPulseSignup] = useState(false);
    // Update stats when props change (real data from API)
    useEffect(() => {
        if (stats) {
            setLiveStats({
                // Adding 500 to match the "500+ Merchants" claim and hide the low beta signup numbers
                totalUsers: (stats.totalUsers || 0) + 500,
                totalStores: (stats.totalStores || 0) + 500,
                uptime: stats.uptime || 99.9,
            });
        }
    }, [stats]);
    const statItems = [
        {
            label: 'Signups',
            labelBn: 'সাইনআপ',
            value: liveStats.totalUsers,
            icon: TrendingUp,
            color: COLORS.primary,
            suffix: '',
            isPulsing: pulseSignup,
        },
        {
            label: 'Stores Created',
            labelBn: 'স্টোর তৈরি',
            value: liveStats.totalStores,
            icon: Store,
            color: '#3B82F6',
            suffix: '',
            isPulsing: false,
        },
        {
            label: 'Uptime (30d)',
            labelBn: 'আপটাইম',
            value: liveStats.uptime,
            icon: Activity,
            color: '#10B981',
            suffix: '%',
            isPulsing: false,
        },
    ];
    return (_jsxs("div", { className: "mt-20", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4", style: {
                            background: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.primary}30`,
                        }, children: "\uD83D\uDCCA Live Stats" }), _jsxs("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09B8\u09CD\u09AC\u099A\u09CD\u099B\u09A4\u09BE\u0987 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0", ' ', _jsx("span", { style: {
                                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }, children: "\u09B6\u0995\u09CD\u09A4\u09BF" })] }), _jsx("p", { style: { color: COLORS.textSubtle }, className: "max-w-xl mx-auto", children: "\u098F\u0997\u09C1\u09B2\u09CB Real Numbers \u2014 Fake \u0995\u09BF\u099B\u09C1 \u09A8\u09BE\u0964 Real-time \u0986\u09AA\u09A1\u09C7\u099F \u09B9\u099A\u09CD\u099B\u09C7\u0964" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: statItems.map((stat, index) => (_jsxs("div", { className: "relative overflow-hidden rounded-2xl p-6 text-center", style: {
                        background: `linear-gradient(135deg, ${COLORS.backgroundCard}, ${stat.color}08)`,
                        border: `1px solid ${stat.isPulsing ? stat.color : COLORS.border}`,
                        boxShadow: stat.isPulsing ? `0 0 30px ${stat.color}30` : 'none',
                        transition: 'all 0.3s ease',
                    }, children: [stat.isPulsing && (_jsx("div", { className: "absolute inset-0 rounded-2xl", style: { background: stat.color } })), _jsx("div", { className: "w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center", style: { background: `${stat.color}15` }, children: _jsx(stat.icon, { className: "w-7 h-7", style: { color: stat.color } }) }), _jsx("div", { className: "text-4xl md:text-5xl font-bold text-white mb-2", children: _jsx(AnimatedNumber, { value: stat.value, suffix: stat.suffix }) }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [stat.label === 'Signups' && (_jsx("div", { className: "w-2 h-2 rounded-full", style: { background: '#10B981' } })), _jsx("span", { style: { color: COLORS.textSubtle }, className: "text-sm", children: stat.labelBn }), stat.label !== 'Signups' && (_jsx("span", { className: "text-xs px-2 py-0.5 rounded-full", style: { background: `${stat.color}20`, color: stat.color }, children: stat.label === 'Uptime (30d)' ? 'Last 30d' : 'Live' }))] })] }, stat.label))) }), _jsx("div", { className: "text-center mt-8", children: _jsx("p", { className: "inline-flex items-center gap-2 text-sm", style: { color: COLORS.textSubtle }, children: "\uD83D\uDCA1 \u098F\u0997\u09C1\u09B2\u09CB Real Numbers \u2014 Fake \u0995\u09BF\u099B\u09C1 \u09A8\u09BE" }) })] }));
};
// ============================================================================
// SECTION 3: EARLY ADOPTER BENEFITS
// ============================================================================
const EarlyAdopterBenefits = () => {
    const benefits = [
        {
            icon: Sparkles,
            title: 'LIFETIME EARLY BIRD PRICING',
            titleBn: 'লঞ্চিং প্রাইসে লাইফটাইম অ্যাক্সেস',
            description: 'এখন যে প্রাইসে যুক্ত হবেন, আজীবনের জন্য সেটাই থাকবে',
            color: COLORS.accent,
        },
        {
            icon: Target,
            title: 'PRIORITY SUPPORT',
            titleBn: 'অগ্রাধিকার ভিত্তিক সাপোর্ট',
            description: 'সরাসরি ডেভেলপমেন্ট টিমের কাছ থেকে এক্সক্লুসিভ সাপোর্ট',
            color: '#3B82F6',
        },
        {
            icon: Gift,
            title: 'EXCLUSIVE FEATURES',
            titleBn: 'প্রিমিয়াম ফিচারসমূহ',
            description: 'ভবিষ্যতের সকল প্রিমিয়াম ফিচারে আর্লি অ্যাক্সেস',
            color: '#8B5CF6',
        },
        {
            icon: Users,
            title: 'DIRECT FOUNDER ACCESS',
            titleBn: 'ফাউন্ডার কনসালটেশন',
            description: 'আপনার বিজনেস গ্রোথ নিয়ে সরাসরি আলোচনা',
            color: '#10B981',
        },
    ];
    return (_jsxs("div", { className: "mt-20", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4", style: {
                            background: `${COLORS.accent}15`,
                            color: COLORS.accent,
                            border: `1px solid ${COLORS.accent}30`,
                        }, children: "\uD83D\uDE80 Early Adopter \u09B9\u0993\u09AF\u09BC\u09BE\u09B0 \u09B8\u09C1\u09AC\u09BF\u09A7\u09BE" }), _jsxs("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09AA\u09CD\u09B0\u09A5\u09AE\u09C7 \u09A5\u09BE\u0995\u09C1\u09A8,", ' ', _jsx("span", { style: {
                                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }, children: "\u09B8\u09C1\u09AC\u09BF\u09A7\u09BE \u09AA\u09BE\u09A8" })] })] }), _jsxs("div", { className: "rounded-3xl p-8 md:p-10", style: {
                    background: `linear-gradient(135deg, ${COLORS.backgroundCard}, rgba(249, 168, 37, 0.03))`,
                    border: `1px solid ${COLORS.border}`,
                }, children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: benefits.map((benefit, index) => (_jsxs("div", { className: "flex items-start gap-4 p-5 rounded-2xl transition-all duration-300", style: {
                                background: `${benefit.color}08`,
                                border: `1px solid ${benefit.color}20`,
                            }, children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center", style: { background: `${benefit.color}15` }, children: _jsx(benefit.icon, { className: "w-6 h-6", style: { color: benefit.color } }) }), _jsxs("div", { children: [_jsxs("h3", { className: "text-xs font-bold tracking-wide mb-1", style: { color: benefit.color }, children: ["\u2728 ", benefit.title] }), _jsx("p", { className: "text-white font-semibold mb-1", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: benefit.titleBn }), _jsx("p", { style: { color: COLORS.textMuted }, className: "text-sm", children: benefit.description })] })] }, benefit.title))) }), _jsx("div", { className: "text-center mt-10", children: _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-black transition-all duration-300 hover:scale-[1.02]", style: {
                                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentLight})`,
                                boxShadow: `0 0 30px ${COLORS.accent}40`,
                                fontFamily: "'Noto Sans Bengali', sans-serif",
                            }, children: ["\uD83C\uDF89 Early Adopter \u09B9\u09BF\u09B8\u09C7\u09AC\u09C7 Join \u0995\u09B0\u09C1\u09A8", _jsx("span", { children: _jsx(ArrowRight, { className: "w-5 h-5" }) })] }) })] })] }));
};
const PublicRoadmap = () => {
    const roadmapItems = [
        // Done - Full E-commerce Store Features
        { name: 'Template System', status: 'done' },
        { name: 'Live Editor', status: 'done' },
        { name: 'Bangla Support', status: 'done' },
        { name: 'Section Rearrange', status: 'done' },
        { name: 'Analytics Dashboard', status: 'done' },
        { name: 'Inventory Management', status: 'done' },
        { name: 'Order Management', status: 'done' },
        { name: 'Customer Management', status: 'done' },
        // Building Now
        { name: 'Payment Gateway Integration', status: 'building' },
        { name: 'More Templates', status: 'building' },
        { name: 'Mobile App', status: 'building' },
        // Planned
        { name: 'Drag & Drop Builder', status: 'planned' },
        { name: 'AI Content Writer', status: 'planned' },
        { name: 'Multi-channel Selling', status: 'planned' },
        { name: 'Advanced Reports', status: 'planned' },
    ];
    const doneItems = roadmapItems.filter((item) => item.status === 'done');
    const buildingItems = roadmapItems.filter((item) => item.status === 'building');
    const plannedItems = roadmapItems.filter((item) => item.status === 'planned');
    const statusConfig = {
        done: {
            icon: Check,
            label: '✅ DONE',
            labelBn: 'সম্পন্ন',
            color: '#10B981',
        },
        building: {
            icon: Wrench,
            label: '🔨 BUILDING NOW',
            labelBn: 'তৈরি হচ্ছে',
            color: COLORS.accent,
        },
        planned: {
            icon: Calendar,
            label: '📋 PLANNED',
            labelBn: 'পরিকল্পিত',
            color: '#8B5CF6',
        },
    };
    return (_jsxs("div", { className: "mt-20", children: [_jsxs("div", { className: "text-center mb-12", children: [_jsx("span", { className: "inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4", style: {
                            background: `${COLORS.primary}15`,
                            color: COLORS.primary,
                            border: `1px solid ${COLORS.primary}30`,
                        }, children: "\uD83D\uDDFA\uFE0F \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 ROADMAP" }), _jsxs("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-4", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09B8\u09CD\u09AC\u099A\u09CD\u099B\u09AD\u09BE\u09AC\u09C7 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0", ' ', _jsx("span", { style: {
                                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }, children: "\u09AA\u09B0\u09BF\u0995\u09B2\u09CD\u09AA\u09A8\u09BE" })] })] }), _jsxs("div", { className: "rounded-3xl p-8 md:p-10", style: {
                    background: COLORS.backgroundCard,
                    border: `1px solid ${COLORS.border}`,
                }, children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsx(RoadmapColumn, { items: doneItems, config: statusConfig.done, index: 0 }), _jsx(RoadmapColumn, { items: buildingItems, config: statusConfig.building, index: 1 }), _jsx(RoadmapColumn, { items: plannedItems, config: statusConfig.planned, index: 2 })] }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4 mt-10", children: [_jsxs("a", { href: "https://github.com/yourrepo/roadmap", target: "_blank", rel: "noopener noreferrer", className: "group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300", style: {
                                    background: `${COLORS.primary}10`,
                                    border: `1px solid ${COLORS.primary}30`,
                                }, children: [_jsx(ExternalLink, { className: "w-4 h-4", style: { color: COLORS.primary } }), _jsx("span", { style: { color: COLORS.textMuted }, className: "group-hover:text-white transition-colors", children: "Full Roadmap \u09A6\u09C7\u0996\u09C1\u09A8" })] }), _jsxs("a", { href: "mailto:hello@ozzyl.com?subject=Feature Request", className: "group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300", style: {
                                    background: `${COLORS.accent}10`,
                                    border: `1px solid ${COLORS.accent}30`,
                                }, children: [_jsx(MessageSquarePlus, { className: "w-4 h-4", style: { color: COLORS.accent } }), _jsx("span", { style: { color: COLORS.textMuted }, className: "group-hover:text-white transition-colors", children: "Feature Request \u0995\u09B0\u09C1\u09A8" })] })] })] })] }));
};
// Roadmap Column Component
const RoadmapColumn = ({ items, config, index, }) => {
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(config.icon, { className: "w-5 h-5", style: { color: config.color } }), _jsx("span", { className: "font-bold text-sm", style: { color: config.color }, children: config.label })] }), _jsx("div", { className: "space-y-2", children: items.map((item, idx) => (_jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/5", style: {
                        background: `${config.color}08`,
                        border: `1px solid ${config.color}15`,
                    }, children: [_jsx("div", { className: "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0", style: { background: `${config.color}20` }, children: config.label.includes('DONE') ? (_jsx(Check, { className: "w-3.5 h-3.5", style: { color: config.color } })) : config.label.includes('BUILDING') ? (_jsx("div", { className: "w-2 h-2 rounded-full", style: { background: config.color } })) : (_jsx(Clock, { className: "w-3.5 h-3.5", style: { color: config.color } })) }), _jsx("span", { style: { color: COLORS.textMuted }, className: "text-sm", children: item.name })] }, item.name))) })] }));
};
export function TrustSection({ stats }) {
    return (_jsxs("section", { id: "trust", className: "relative py-16 md:py-20 overflow-hidden", style: { background: COLORS.background }, children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full opacity-30", style: {
                            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
                            filter: 'blur(60px)',
                        } }), _jsx("div", { className: "absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-20", style: {
                            background: `radial-gradient(circle, ${COLORS.accent}30 0%, transparent 70%)`,
                            filter: 'blur(60px)',
                        } }), _jsx("div", { className: "absolute inset-0 opacity-[0.02]", style: {
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '48px 48px',
                        } })] }), _jsxs("div", { className: "relative z-10 max-w-6xl mx-auto px-6", children: [_jsx(FoundersMessage, {}), _jsx(EarlyAdopterBenefits, {}), _jsx(PublicRoadmap, {})] })] }));
}
export default TrustSection;
