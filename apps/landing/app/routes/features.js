import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { ShoppingBag, CreditCard, Truck, ShieldAlert, Palette, BarChart3, Building2, Smartphone, Package, ClipboardList, Layers, Tag, Repeat, Banknote, Globe, MapPin, AlertTriangle, UserX, BadgeCheck, Layout, PaintBucket, ImagePlus, TrendingUp, DollarSign, Star, Lock, LinkIcon, TabletSmartphone, CheckCircle2, Zap, ArrowRight, } from 'lucide-react';
export const meta = () => [
    { title: 'ফিচারস - Ozzyl | সম্পূর্ণ ই-কমার্স ফিচার' },
    {
        name: 'description',
        content: 'Ozzyl এর সকল ফিচার দেখুন - পেমেন্ট, কুরিয়ার, ফ্রড ডিটেকশন, থিম এবং আরও অনেক কিছু।',
    },
];
// ─── useInView hook ────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
        } }, { threshold, rootMargin: '0px 0px -40px 0px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, inView];
}
// ─── Feature Data hook ────────────────────────────────────────────────────────
function useFeatures() {
    const { t } = useTranslation();
    const FEATURES = [
        {
            id: 'store-management', icon: ShoppingBag,
            title: t('featCatStoreManagement'), description: t('featCatStoreDesc'),
            accentColor: '#006A4E', glowColor: 'rgba(0, 106, 78, 0.15)', badge: 'Core',
            subFeatures: [
                { label: t('featSubProductCatalog'), icon: Package },
                { label: t('featSubOrderMgmt'), icon: ClipboardList },
                { label: t('featSubInventory'), icon: Layers },
                { label: t('featSubCategories'), icon: Tag },
                { label: t('featSubVariants'), icon: Repeat },
                { label: t('featSubDiscounts'), icon: BadgeCheck },
            ],
        },
        {
            id: 'payment-gateways', icon: CreditCard,
            title: t('featCatPayments'), description: t('featCatPaymentsDesc'),
            accentColor: '#F59E0B', glowColor: 'rgba(245, 158, 11, 0.12)', badge: 'BD-Native',
            subFeatures: [
                { label: 'bKash Gateway API', icon: Banknote },
                { label: t('featSubNagadGateway'), icon: Banknote },
                { label: t('featSubSSLCommerz'), icon: CreditCard },
                { label: t('featSubManualMFS'), icon: Repeat },
                { label: t('featSubCOD'), icon: Package },
                { label: t('featSubMultiGateway'), icon: Globe },
            ],
        },
        {
            id: 'courier-integration', icon: Truck,
            title: t('featCatCourier'), description: t('featCatCourierDesc'),
            accentColor: '#3B82F6', glowColor: 'rgba(59, 130, 246, 0.12)',
            subFeatures: [
                { label: t('featSubSteadfast'), icon: MapPin },
                { label: t('featSubPathao'), icon: MapPin },
                { label: t('featSubRedX'), icon: MapPin },
                { label: t('featSubBulkParcel'), icon: Layers },
                { label: t('featSubLiveStatus'), icon: TrendingUp },
                { label: t('featSubCourierCost'), icon: DollarSign },
            ],
        },
        {
            id: 'fraud-detection', icon: ShieldAlert,
            title: t('featCatFraud'), description: t('featCatFraudDesc'),
            accentColor: '#EF4444', glowColor: 'rgba(239, 68, 68, 0.12)', badge: 'Smart',
            subFeatures: [
                { label: t('featSubDeliveryScore'), icon: BarChart3 },
                { label: 'Return rate analysis per customer', icon: Repeat },
                { label: t('featSubIPFlag'), icon: AlertTriangle },
                { label: t('featSubBlacklist'), icon: UserX },
                { label: t('featSubCODAutoConfirm'), icon: BadgeCheck },
                { label: 'Risk level dashboard', icon: ShieldAlert },
            ],
        },
        {
            id: 'theme-system', icon: Palette,
            title: t('featCatThemes'), description: t('featCatThemesDesc'),
            accentColor: '#8B5CF6', glowColor: 'rgba(139, 92, 246, 0.12)', badge: '3 Active Themes',
            subFeatures: [
                { label: 'starter-store — clean & minimal', icon: Layout },
                { label: 'luxe-boutique — luxury fashion', icon: Star },
                { label: 'nova-lux — premium lifestyle', icon: Zap },
                { label: t('featSubColors'), icon: PaintBucket },
                { label: t('featSubLogo'), icon: ImagePlus },
                { label: t('featSubAnnouncement'), icon: Tag },
            ],
        },
        {
            id: 'analytics', icon: BarChart3,
            title: t('featCatAnalytics'), description: t('featCatAnalyticsDesc'),
            accentColor: '#10B981', glowColor: 'rgba(16, 185, 129, 0.12)',
            subFeatures: [
                { label: t('featSubRealtimeCharts'), icon: TrendingUp },
                { label: 'Revenue & GMV tracking', icon: DollarSign },
                { label: 'Top products by sales', icon: Star },
                { label: t('featSubOrderBreakdown'), icon: ClipboardList },
                { label: t('featSubAcquisition'), icon: BarChart3 },
                { label: t('featSubCourierStats'), icon: Truck },
            ],
        },
        {
            id: 'multi-tenant', icon: Building2,
            title: t('featCatMultiTenant'), description: t('featCatMultiTenantDesc'),
            accentColor: '#06B6D4', glowColor: 'rgba(6, 182, 212, 0.12)', badge: 'Enterprise-Grade',
            subFeatures: [
                { label: t('featSubPerStoreIsolation'), icon: Lock },
                { label: t('featSubCustomDomain'), icon: Globe },
                { label: t('featSubEdgeCDN'), icon: Zap },
                { label: 'Sub-100ms TTFB globally', icon: TrendingUp },
                { label: 'Unlimited store creation', icon: Building2 },
                { label: t('featSubDomainSSL'), icon: LinkIcon },
            ],
        },
        {
            id: 'mobile-app', icon: Smartphone,
            title: t('featCatMobile'), description: t('featCatMobileDesc'),
            accentColor: '#F97316', glowColor: 'rgba(249, 115, 22, 0.12)', badge: 'Android & iOS',
            subFeatures: [
                { label: t('featSubCapacitor'), icon: TabletSmartphone },
                { label: t('featSubAndroidIOS'), icon: Smartphone },
                { label: t('featSubPushNotif'), icon: Zap },
                { label: t('featSubMobileOrders'), icon: ClipboardList },
                { label: 'Dashboard & analytics view', icon: BarChart3 },
                { label: t('featSubInventoryMobile'), icon: Package },
            ],
        },
    ];
    return FEATURES;
}
// ─── Animated Feature Card ────────────────────────────────────────────────────
function FeatureCard({ category, index }) {
    const [ref, inView] = useInView(0.1);
    const Icon = category.icon;
    const delayMs = (index % 4) * 80;
    return (_jsxs("div", { ref: ref, className: "group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col gap-5 overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]", style: {
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0px)' : 'translateY(28px)',
            transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms, border-color 0.3s ease, background-color 0.3s ease`,
        }, children: [_jsx("div", { className: "absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none", style: { background: category.glowColor } }), _jsx("div", { className: "absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500", style: { background: `linear-gradient(90deg, transparent, ${category.accentColor}60, transparent)` } }), _jsxs("div", { className: "flex items-start justify-between gap-3 relative z-10", children: [_jsx("div", { className: "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110", style: { background: `${category.accentColor}18`, border: `1px solid ${category.accentColor}30` }, children: _jsx(Icon, { className: "w-6 h-6", style: { color: category.accentColor } }) }), category.badge && (_jsx("span", { className: "text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 tracking-wide uppercase", style: { background: `${category.accentColor}15`, color: category.accentColor, border: `1px solid ${category.accentColor}30` }, children: category.badge }))] }), _jsxs("div", { className: "relative z-10", children: [_jsx("h3", { className: "text-lg font-bold text-white mb-2 leading-snug", children: category.title }), _jsx("p", { className: "text-sm text-white/50 leading-relaxed", children: category.description })] }), _jsx("div", { className: "h-px bg-white/[0.06] relative z-10" }), _jsx("ul", { className: "flex flex-col gap-2.5 relative z-10", children: category.subFeatures.map((sf) => (_jsxs("li", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-5 h-5 rounded-md flex items-center justify-center shrink-0", style: { background: `${category.accentColor}12` }, children: _jsx(CheckCircle2, { className: "w-3 h-3", style: { color: category.accentColor } }) }), _jsx("span", { className: "text-sm text-white/60 hover:text-white/85 transition-colors duration-200", children: sf.label })] }, sf.label))) })] }));
}
// ─── Hero ─────────────────────────────────────────────────────────────────────
function FeaturesHero() {
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        const id = setTimeout(() => setMounted(true), 30);
        return () => clearTimeout(id);
    }, []);
    return (_jsxs("section", { className: "relative pt-36 pb-20 px-4 overflow-hidden", children: [_jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none", style: { background: 'radial-gradient(ellipse at center, rgba(0,106,78,0.18) 0%, transparent 70%)', filter: 'blur(40px)' } }), _jsx("div", { className: "absolute inset-0 pointer-events-none opacity-[0.025]", style: { backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '60px 60px' } }), _jsxs("div", { className: "relative max-w-4xl mx-auto text-center", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006A4E]/30 bg-[#006A4E]/10 mb-6", style: { opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s' }, children: [_jsx(Zap, { className: "w-3.5 h-3.5 text-[#00875F]" }), _jsx("span", { className: "text-xs font-semibold text-[#00875F] tracking-widest uppercase", children: t('featuresHeroBadge') })] }), _jsxs("h1", { className: "text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight", style: { opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s' }, children: [t('featuresHeroTitle'), ' ', _jsx("span", { className: "relative inline-block", style: { background: 'linear-gradient(135deg, #006A4E 0%, #00C07A 50%, #00875F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }, children: t('featuresHeroTitleAccent') })] }), _jsx("p", { className: "text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10", style: { opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.55s ease 0.18s, transform 0.55s ease 0.18s' }, children: t('featuresHeroSubtitle') }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", style: { opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.55s ease 0.26s, transform 0.55s ease 0.26s' }, children: [_jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition-all shadow-[0_4px_24px_rgba(0,106,78,0.35)] hover:shadow-[0_6px_30px_rgba(0,106,78,0.5)] active:scale-[0.98]", children: ["Start for free ", _jsx(ArrowRight, { className: "w-4 h-4" })] }), _jsx("a", { href: "/pricing", className: "inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-medium rounded-xl text-sm transition-all", children: "View pricing" })] }), _jsx("div", { className: "mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4", style: { opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.38s' }, children: [
                            { value: '8', label: t('featuresStatCategories') },
                            { value: '3', label: t('featuresStatThemes') },
                            { value: '5+', label: t('featuresStatPayments') },
                            { value: '3', label: t('featuresStatCouriers') },
                        ].map((stat) => (_jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [_jsx("span", { className: "text-2xl font-extrabold text-white", children: stat.value }), _jsx("span", { className: "text-xs text-white/40 tracking-wide", children: stat.label })] }, stat.label))) })] })] }));
}
// ─── Category Nav ─────────────────────────────────────────────────────────────
function CategoryNav() {
    const [activeId, setActiveId] = useState('store-management');
    const FEATURES = useFeatures();
    useEffect(() => {
        if (!('IntersectionObserver' in window))
            return;
        const observer = new IntersectionObserver((entries) => { for (const entry of entries) {
            if (entry.isIntersecting)
                setActiveId(entry.target.id);
        } }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
        FEATURES.forEach(({ id }) => { const el = document.getElementById(id); if (el)
            observer.observe(el); });
        return () => observer.disconnect();
    }, []);
    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el)
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    };
    return (_jsx("nav", { className: "sticky top-24 z-30 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06] mb-16", children: _jsx("div", { className: "max-w-6xl mx-auto px-4", children: _jsx("div", { className: "flex items-center gap-1 overflow-x-auto py-3", children: FEATURES.map((f) => {
                    const Icon = f.icon;
                    const isActive = activeId === f.id;
                    return (_jsxs("button", { onClick: () => scrollTo(f.id), className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0", style: { color: isActive ? f.accentColor : 'rgba(255,255,255,0.45)', background: isActive ? `${f.accentColor}12` : 'transparent', border: `1px solid ${isActive ? f.accentColor + '30' : 'transparent'}` }, children: [_jsx(Icon, { className: "w-3.5 h-3.5" }), _jsx("span", { children: f.title })] }, f.id));
                }) }) }) }));
}
// ─── Comparison Strip ─────────────────────────────────────────────────────────
function ComparisonStrip() {
    const [ref, inView] = useInView(0.1);
    const { t } = useTranslation();
    const rows = [
        { feature: t('featCompareBkashNagad'), ozzyl: true },
        { feature: t('featCompareFraud'), ozzyl: true },
        { feature: t('featCompareCouriers'), ozzyl: true },
        { feature: t('featCompareEdge'), ozzyl: true },
        { feature: t('featCompareMultiTenant'), ozzyl: true },
        { feature: t('featCompareMobile'), ozzyl: true },
        { feature: t('featCompareNoFees'), ozzyl: true },
        { feature: t('featCompareBangla'), ozzyl: true },
    ];
    return (_jsxs("div", { ref: ref, className: "mb-24", style: { opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }, children: [_jsxs("div", { className: "text-center mb-10", children: [_jsx("h2", { className: "text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight", children: t('featCompareTitle') }), _jsx("p", { className: "text-white/45 text-sm sm:text-base", children: t('featCompareSubtitle') })] }), _jsx("div", { className: "overflow-x-auto rounded-2xl border border-white/[0.08]", children: _jsxs("table", { className: "w-full min-w-[480px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/[0.08]", children: [_jsx("th", { className: "text-left px-6 py-4 text-sm font-semibold text-white/40 w-full", children: t('featCompareFeature') }), _jsx("th", { className: "px-6 py-4 text-center text-sm font-bold text-[#00875F] whitespace-nowrap", children: "Ozzyl" }), _jsx("th", { className: "px-6 py-4 text-center text-sm font-medium text-white/30 whitespace-nowrap", children: t('featCompareOthers') })] }) }), _jsx("tbody", { children: rows.map((row, i) => (_jsxs("tr", { className: "border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors", style: { opacity: inView ? 1 : 0, transition: `opacity 0.4s ease ${i * 50 + 200}ms` }, children: [_jsx("td", { className: "px-6 py-3.5 text-sm text-white/65", children: row.feature }), _jsx("td", { className: "px-6 py-3.5 text-center", children: _jsx("span", { className: "inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#006A4E]/20", children: _jsx(CheckCircle2, { className: "w-4 h-4 text-[#00875F]" }) }) }), _jsx("td", { className: "px-6 py-3.5 text-center", children: _jsx("span", { className: "inline-block w-4 h-0.5 bg-white/20 rounded-full mx-auto" }) })] }, row.feature))) })] }) })] }));
}
// ─── Bottom CTA ───────────────────────────────────────────────────────────────
function BottomCTA() {
    const [ref, inView] = useInView(0.15);
    const { t } = useTranslation();
    return (_jsxs("section", { ref: ref, className: "relative mx-4 mb-20 rounded-3xl overflow-hidden", style: { opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.6s ease, transform 0.6s ease' }, children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#006A4E] via-[#005740] to-[#003D2E]" }), _jsx("div", { className: "absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" }), _jsx("div", { className: "absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" }), _jsx("div", { className: "absolute inset-0 pointer-events-none opacity-[0.06]", style: { backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' } }), _jsxs("div", { className: "relative z-10 max-w-2xl mx-auto text-center py-20 px-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6", children: [_jsx(Zap, { className: "w-3.5 h-3.5 text-white" }), _jsx("span", { className: "text-xs font-semibold text-white tracking-widest uppercase", children: t('featBottomCTABadge') })] }), _jsx("h2", { className: "text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight", children: t('featBottomCTATitle') }), _jsx("p", { className: "text-white/75 text-base sm:text-lg mb-10 leading-relaxed", children: t('featBottomCTASubtitle') }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3", children: [_jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "inline-flex items-center gap-2 px-8 py-4 bg-white text-[#006A4E] font-bold rounded-xl text-sm hover:bg-white/90 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]", children: [t('featBottomCTAButton'), " ", _jsx(ArrowRight, { className: "w-4 h-4" })] }), _jsx("a", { href: "/pricing", className: "inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-sm transition-all", children: t('featBottomCTASecondary') })] })] })] }));
}
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
    const FEATURES = useFeatures();
    return (_jsxs("div", { className: "min-h-screen bg-[#0A0A0F]", children: [_jsx(MarketingHeader, {}), _jsx(FeaturesHero, {}), _jsx(CategoryNav, {}), _jsxs("main", { className: "max-w-6xl mx-auto px-4 pb-8", children: [_jsxs("div", { className: "text-center mb-14", children: [_jsx("h2", { className: "text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight", children: "Built for every aspect of your business" }), _jsx("p", { className: "text-white/50 text-base sm:text-lg max-w-xl mx-auto", children: "One platform. No integrations to juggle. No plugins to maintain." })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-24", children: FEATURES.map((category, index) => (_jsx("div", { id: category.id, className: "scroll-mt-28", children: _jsx(FeatureCard, { category: category, index: index }) }, category.id))) }), _jsx(ComparisonStrip, {})] }), _jsx(BottomCTA, {}), _jsx(Footer, {})] }));
}
