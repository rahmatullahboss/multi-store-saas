import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
export const meta = () => [
    { title: 'ইন্টিগ্রেশন - Ozzyl | পেমেন্ট, কুরিয়ার ও আরও' },
    {
        name: 'description',
        content: 'Ozzyl এর সকল ইন্টিগ্রেশন দেখুন - bKash, Nagad, SSLCommerz, Steadfast, Pathao, RedX এবং আরও।',
    },
];
function useIntegrations() {
    const { t } = useTranslation();
    return [
        { id: 'bkash-gateway', name: t('intNameBkashGateway'), category: 'payment', plan: 'paid', description: t('intDescBkashGateway'), features: [t('intFeatTokenized'), t('intFeatWebhook'), t('intFeatRefund'), t('intFeatTxLogs')], icon: 'B', color: '#E2136E', bgColor: 'rgba(226,19,110,0.1)' },
        { id: 'nagad-gateway', name: t('intNameNagadGateway'), category: 'payment', plan: 'paid', description: t('intDescNagadGateway'), features: [t('intFeatRSA'), t('intFeat3Step'), t('intFeatRealtime'), t('intFeatReconcile')], icon: 'N', color: '#F7941D', bgColor: 'rgba(247,148,29,0.1)' },
        { id: 'sslcommerz', name: t('intNameSSLCommerz'), category: 'payment', plan: 'platform', description: t('intDescSSLCommerz'), features: [t('intFeatCardsMFS'), t('intFeatNetBanking'), t('intFeatEMI'), t('intFeatPerStore')], icon: 'S', color: '#00A651', bgColor: 'rgba(0,166,81,0.1)' },
        { id: 'manual-bkash', name: t('intNameManualBkash'), category: 'payment', plan: 'free', description: t('intDescManualBkash'), features: [t('intFeatPersonalNum'), t('intFeatManualConfirm'), t('intFeatScreenshot'), t('intFeatOrderNotes')], icon: 'B', color: '#E2136E', bgColor: 'rgba(226,19,110,0.08)' },
        { id: 'manual-nagad', name: t('intNameManualNagad'), category: 'payment', plan: 'free', description: t('intDescManualNagad'), features: [t('intFeatPersonalNum'), t('intFeatTxIDVerify'), t('intFeatManualConfirm'), t('intFeatOrderNotes')], icon: 'N', color: '#F7941D', bgColor: 'rgba(247,148,29,0.08)' },
        { id: 'manual-rocket', name: t('intNameManualRocket'), category: 'payment', plan: 'free', description: t('intDescManualRocket'), features: [t('intFeatPersonalNum'), t('intFeatManualConfirm'), t('intFeatScreenshot'), t('intFeatAllPlans')], icon: 'R', color: '#8B2FC9', bgColor: 'rgba(139,47,201,0.1)' },
        { id: 'cod', name: t('intNameCOD'), category: 'payment', plan: 'free', description: t('intDescCOD'), features: [t('intFeatAllPlans'), t('intFeatCourierSynced'), t('intFeatAutoStatus'), t('intFeatCODReports')], icon: '₳', color: '#10B981', bgColor: 'rgba(16,185,129,0.1)' },
        { id: 'steadfast', name: t('intNameSteadfast'), category: 'courier', plan: 'free', description: t('intDescSteadfast'), features: [t('intFeatOrderCreation'), t('intFeatLiveTracking'), t('intFeatDeliveryRate'), t('intFeatReturnRate')], icon: 'SF', color: '#00D1FF', bgColor: 'rgba(0,209,255,0.1)' },
        { id: 'pathao', name: t('intNamePathao'), category: 'courier', plan: 'free', description: t('intDescPathao'), features: [t('intFeatOrderCreation'), t('intFeatLiveTracking'), t('intFeatPricePlan'), t('intFeatFraudHistory')], icon: 'P', color: '#EF4444', bgColor: 'rgba(239,68,68,0.1)' },
        { id: 'redx', name: t('intNameRedX'), category: 'courier', plan: 'free', description: t('intDescRedX'), features: [t('intFeatOrderCreation'), t('intFeatLiveTracking'), t('intFeatStatusWebhooks'), t('intFeatBulkDispatch')], icon: 'RX', color: '#FF3B30', bgColor: 'rgba(255,59,48,0.1)' },
        { id: 'fraud-steadfast', name: t('intNameFraudSteadfast'), category: 'fraud', plan: 'free', description: t('intDescFraudSteadfast'), features: [t('intFeatDeliveryPct'), t('intFeatReturnPct'), t('intFeatPhoneLookup'), t('intFeatPreDispatch')], icon: 'SF', color: '#00D1FF', bgColor: 'rgba(0,209,255,0.08)' },
        { id: 'fraud-pathao', name: t('intNameFraudPathao'), category: 'fraud', plan: 'free', description: t('intDescFraudPathao'), features: [t('intFeatCourierHistory'), t('intFeatRiskScoring'), t('intFeatPhoneLookup'), t('intFeatOrderFlagging')], icon: 'P', color: '#EF4444', bgColor: 'rgba(239,68,68,0.08)' },
        { id: 'fraud-redx', name: t('intNameFraudRedX'), category: 'fraud', plan: 'free', description: t('intDescFraudRedX'), features: [t('intFeatShipHistory'), t('intFeatReturnAnalysis'), t('intFeatPhoneLookup'), t('intFeatAutoFlagging')], icon: 'RX', color: '#FF3B30', bgColor: 'rgba(255,59,48,0.08)' },
        { id: 'cloudflare-ip', name: t('intNameCloudflare'), category: 'fraud', plan: 'platform', description: t('intDescCloudflare'), features: [t('intFeatCountryDetect'), t('intFeatBotDetect'), t('intFeatVPNProxy'), t('intFeatEdgeNative')], icon: 'CF', color: '#F6821F', bgColor: 'rgba(246,130,31,0.1)' },
        { id: 'stripe', name: t('intNameStripe'), category: 'coming-soon', plan: 'coming-soon', description: t('intDescStripe'), features: [t('intFeatIntlCards'), t('intFeatSubscriptions'), t('intFeatPayouts'), t('intFeatGlobalCoverage')], icon: 'St', color: '#635BFF', bgColor: 'rgba(99,91,255,0.1)' },
        { id: 'paypal', name: t('intNamePaypal'), category: 'coming-soon', plan: 'coming-soon', description: t('intDescPaypal'), features: [t('intFeatPaypalWallet'), t('intFeatGuestCheckout'), t('intFeatBuyerProtection'), t('intFeatMultiCurrency')], icon: 'PP', color: '#003087', bgColor: 'rgba(0,48,135,0.15)' },
        { id: 'dhl', name: t('intNameDHL'), category: 'coming-soon', plan: 'coming-soon', description: t('intDescDHL'), features: [t('intFeatIntlShipping'), t('intFeatLiveTracking'), t('intFeatCustomsDocs'), t('intFeatExpress')], icon: 'DH', color: '#FFCC00', bgColor: 'rgba(255,204,0,0.1)' },
        { id: 'fedex', name: t('intNameFedEx'), category: 'coming-soon', plan: 'coming-soon', description: t('intDescFedEx'), features: [t('intFeatGlobalLogistics'), t('intFeatLiveTracking'), t('intFeatRateCalc'), t('intFeatExpressEconomy')], icon: 'FX', color: '#4D148C', bgColor: 'rgba(77,20,140,0.12)' },
        { id: 'whatsapp', name: t('intNameWhatsApp'), category: 'coming-soon', plan: 'coming-soon', description: t('intDescWhatsApp'), features: [t('intFeatOrderNotif'), t('intFeatShippingAlerts'), t('intFeatMarketing'), t('intFeatTemplate')], icon: 'WA', color: '#25D366', bgColor: 'rgba(37,211,102,0.1)' },
        { id: 'facebook-catalog', name: t('intNameFacebook'), category: 'coming-soon', plan: 'coming-soon', description: t('intDescFacebook'), features: [t('intFeatAutoSync'), t('intFeatDynamicAds'), t('intFeatInstagramShop'), t('intFeatInventory')], icon: 'FB', color: '#1877F2', bgColor: 'rgba(24,119,242,0.1)' },
    ];
}
function PlanBadge({ plan }) {
    const { t } = useTranslation();
    const styles = {
        free: { label: t('intPlanAllPlans'), className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' },
        paid: { label: t('intPlanPaid'), className: 'bg-amber-500/15 text-amber-400 border border-amber-500/20' },
        platform: { label: t('intPlanPlatform'), className: 'bg-blue-500/15 text-blue-400 border border-blue-500/20' },
        'coming-soon': { label: t('intPlanComingSoon'), className: 'bg-purple-500/15 text-purple-400 border border-purple-500/20' },
    };
    const { label, className } = styles[plan];
    return _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${className}`, children: label });
}
function CategoryBadge({ category }) {
    const { t } = useTranslation();
    const styles = {
        payment: { label: t('intCatPayment'), className: 'text-pink-400/80 bg-pink-500/10' },
        courier: { label: t('intCatCourier'), className: 'text-cyan-400/80 bg-cyan-500/10' },
        fraud: { label: t('intCatFraud'), className: 'text-orange-400/80 bg-orange-500/10' },
        'coming-soon': { label: t('intCatComingSoon'), className: 'text-purple-400/80 bg-purple-500/10' },
    };
    const { label, className } = styles[category];
    return _jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${className}`, children: label });
}
function IntegrationCard({ integration, index }) {
    const delay = `${(index % 6) * 60}ms`;
    return (_jsxs("div", { className: "group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-300 ease-out hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl animate-fade-in-up", style: { animationDelay: delay }, children: [_jsx("div", { className: "absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl", style: { background: `linear-gradient(90deg, transparent, ${integration.color}, transparent)` } }), _jsxs("div", { className: "relative p-6 flex flex-col gap-4 h-full", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("div", { className: "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110", style: { background: integration.bgColor, color: integration.color, border: `1px solid ${integration.color}22` }, children: integration.icon }), _jsx(PlanBadge, { plan: integration.plan })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-semibold text-base leading-tight mb-1.5", children: integration.name }), _jsx(CategoryBadge, { category: integration.category })] }), _jsx("p", { className: "text-white/50 text-sm leading-relaxed flex-1", children: integration.description }), _jsx("div", { className: "flex flex-wrap gap-1.5 pt-1", children: integration.features.map((f) => (_jsx("span", { className: "text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/5 group-hover:text-white/60 group-hover:border-white/10 transition-colors duration-300", children: f }, f))) })] })] }));
}
export default function IntegrationsPage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const { t } = useTranslation();
    const INTEGRATIONS = useIntegrations();
    const TABS = [
        { id: 'all', label: t('intTabAll'), emoji: '⚡' },
        { id: 'payment', label: t('intTabPayment'), emoji: '💳' },
        { id: 'courier', label: t('intTabCourier'), emoji: '📦' },
        { id: 'fraud', label: t('intTabFraud'), emoji: '🛡️' },
        { id: 'coming-soon', label: t('intTabComingSoon'), emoji: '🚀' },
    ];
    const filtered = activeFilter === 'all' ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === activeFilter);
    const counts = {
        all: INTEGRATIONS.length,
        payment: INTEGRATIONS.filter((i) => i.category === 'payment').length,
        courier: INTEGRATIONS.filter((i) => i.category === 'courier').length,
        fraud: INTEGRATIONS.filter((i) => i.category === 'fraud').length,
        'coming-soon': INTEGRATIONS.filter((i) => i.category === 'coming-soon').length,
    };
    const stats = [
        { value: '7+', label: t('intStat1Label') },
        { value: '3', label: t('intStat2Label') },
        { value: '4', label: t('intStat3Label') },
        { value: '6', label: t('intStat4Label') },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-[#0A0A0F]", children: [_jsx(MarketingHeader, {}), _jsxs("main", { className: "relative pt-32 pb-24 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", style: { backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '64px 64px' } }), _jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 pointer-events-none blur-[120px] animate-pulse-soft", style: { background: 'radial-gradient(ellipse, #006A4E 0%, transparent 70%)' } }), _jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-14 animate-fade-in-up", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006A4E]/15 border border-[#006A4E]/30 mb-6", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#00D17A] animate-pulse-soft" }), _jsx("span", { className: "text-[#00D17A] text-xs font-semibold tracking-wider uppercase", children: t('intHeroBadge') })] }), _jsxs("h1", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight", children: [t('intHeroTitle'), ' ', _jsx("span", { className: "animate-shimmer", style: { background: 'linear-gradient(90deg, #00D17A, #006A4E, #00D17A)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }, children: t('intHeroTitleAccent') })] }), _jsx("p", { className: "text-lg text-white/50 max-w-2xl mx-auto leading-relaxed", children: t('intHeroSubtitle') })] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-16", children: stats.map((s, i) => (_jsxs("div", { className: "text-center p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-fade-in-up", style: { animationDelay: `${i * 80}ms` }, children: [_jsx("div", { className: "text-3xl font-bold text-white mb-1", children: s.value }), _jsx("div", { className: "text-xs text-white/40 uppercase tracking-wider", children: s.label })] }, s.label))) }), _jsx("div", { className: "flex flex-wrap justify-center gap-2 mb-10 animate-fade-in", style: { animationDelay: '200ms' }, children: TABS.map((tab) => {
                                    const isActive = activeFilter === tab.id;
                                    return (_jsxs("button", { onClick: () => setActiveFilter(tab.id), className: `relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${isActive ? 'bg-[#006A4E] text-white shadow-lg shadow-[#006A4E]/30 border border-[#00875F]/50' : 'bg-white/5 text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.15]'}`, children: [_jsx("span", { children: tab.emoji }), _jsx("span", { children: tab.label }), _jsx("span", { className: `inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-white/40'}`, children: counts[tab.id] })] }, tab.id));
                                }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", children: filtered.map((integration, index) => (_jsx(IntegrationCard, { integration: integration, index: index }, integration.id))) }), filtered.length === 0 && (_jsxs("div", { className: "text-center py-24 text-white/30", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDD0C" }), _jsx("p", { className: "text-lg", children: t('intEmptyState') })] })), _jsxs("div", { className: "mt-20 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#006A4E]/20 via-[#0A0A0F] to-[#006A4E]/10 p-12 text-center animate-fade-in-up", style: { animationDelay: '400ms' }, children: [_jsx("div", { className: "absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-[60px] opacity-40 pointer-events-none", style: { background: 'radial-gradient(ellipse, #006A4E, transparent)' } }), _jsxs("div", { className: "relative", children: [_jsx("p", { className: "text-[#00D17A] text-sm font-semibold uppercase tracking-widest mb-3", children: t('intBottomCTABadge') }), _jsx("h2", { className: "text-3xl sm:text-4xl font-bold text-white mb-4", children: t('intBottomCTATitle') }), _jsx("p", { className: "text-white/50 max-w-lg mx-auto mb-8 text-base", children: t('intBottomCTASubtitle') }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [_jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#006A4E]/30 hover:shadow-[#006A4E]/50 hover:-translate-y-0.5 active:scale-[0.98]", children: [t('intBottomCTAButton'), _jsx("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }) })] }), _jsx("a", { href: "/pricing", className: "inline-flex items-center justify-center px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-semibold rounded-xl text-sm transition-all duration-200 active:scale-[0.98]", children: t('intBottomCTASecondary') })] })] })] })] })] }), _jsx(Footer, {})] }));
}
