import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, X, Zap, Clock, TrendingUp, Smile, Cpu } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
export function AISocialProofSection() {
    const { t } = useTranslation();
    const comparisonData = [
        { name: 'Shopify', visitor: false, merchant: false, customer: false },
        { name: 'WooCommerce', visitor: false, merchant: false, customer: false },
        { name: 'Local Platforms', visitor: false, merchant: false, customer: false },
        { name: 'OZZYL', visitor: true, merchant: true, customer: true, highlight: true },
    ];
    const benefits = [
        {
            icon: Zap,
            title: t('landingSocialProof_saveStaffCost'),
            sub: t('landingSocialProof_noSupportNeeded'),
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10'
        },
        {
            icon: Clock,
            title: t('landingSocialProof_available247'),
            sub: t('landingSocialProof_someoneIsThere'),
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
        },
        {
            icon: TrendingUp,
            title: t('landingSocialProof_scaleNoHiring'),
            sub: t('landingSocialProof_handle1000Customers'),
            color: 'text-green-400',
            bg: 'bg-green-400/10'
        },
        {
            icon: Smile,
            title: t('landingSocialProof_happyCustomers'),
            sub: t('landingSocialProof_instantResponseTrust'),
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
        }
    ];
    return (_jsxs("section", { className: "relative py-24 overflow-hidden bg-[#0A0F0D]", children: [_jsx("div", { className: "absolute inset-0 bg-emerald-900/10 opacity-30 pointer-events-none" }), _jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("div", { className: "inline-block px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-4", children: t('landingSocialProof_firstInBD') }), _jsx("h2", { className: "text-3xl md:text-5xl font-bold text-white mb-6", children: t('landingSocialProof_title') })] }), _jsx("div", { className: "max-w-4xl mx-auto mb-20 overflow-x-auto", children: _jsxs("div", { className: "bg-[#111] border border-white/10 rounded-2xl overflow-hidden min-w-[600px]", children: [_jsxs("div", { className: "grid grid-cols-4 p-4 border-b border-white/10 bg-white/5 text-sm font-bold text-white/60", children: [_jsx("div", { className: "pl-4", children: t('landingSocialProof_platformCol') }), _jsx("div", { className: "text-center", children: t('landingShowcase_visitorTitle') }), _jsx("div", { className: "text-center", children: t('landingShowcase_merchantTitle') }), _jsx("div", { className: "text-center", children: t('landingShowcase_customerTitle') })] }), comparisonData.map((item, i) => (_jsxs("div", { className: `grid grid-cols-4 p-4 items-center border-b border-white/5 last:border-0 ${item.highlight ? 'bg-emerald-900/20' : 'hover:bg-white/5'}`, children: [_jsxs("div", { className: `pl-4 font-bold ${item.highlight ? 'text-emerald-400 text-lg flex items-center gap-2' : 'text-white/80'}`, children: [item.highlight && _jsx("span", { className: "text-xl", children: "\uD83C\uDFC6" }), item.name, item.highlight && _jsx("span", { className: "text-xs font-normal text-emerald-500/70 ml-2 hidden sm:inline", children: t('landingSocialProof_allThree') })] }), _jsx("div", { className: "text-center flex justify-center", children: item.visitor ? _jsx(Check, { className: "w-6 h-6 text-emerald-400" }) : _jsx(X, { className: "w-5 h-5 text-white/20" }) }), _jsx("div", { className: "text-center flex justify-center", children: item.merchant ? _jsx(Check, { className: "w-6 h-6 text-emerald-400" }) : _jsx(X, { className: "w-5 h-5 text-white/20" }) }), _jsx("div", { className: "text-center flex justify-center", children: item.customer ? _jsx(Check, { className: "w-6 h-6 text-emerald-400" }) : _jsx(X, { className: "w-5 h-5 text-white/20" }) })] }, i)))] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20", children: benefits.map((item, i) => (_jsxs("div", { className: "bg-white/5 border border-white/10 rounded-xl p-6 hover:border-emerald-500/30 transition-colors group", children: [_jsx("div", { className: `w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`, children: _jsx(item.icon, { className: `w-6 h-6 ${item.color}` }) }), _jsx("h3", { className: "text-lg font-bold text-white mb-1", children: item.title }), _jsx("p", { className: "text-sm text-white/60", children: item.sub })] }, i))) }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-white/30 text-xs font-bold uppercase tracking-widest mb-6", children: t('landingSocialProof_poweredBy') }), _jsxs("div", { className: "inline-flex items-center gap-8 justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Cpu, { className: "w-5 h-5" }), " ", _jsx("span", { className: "font-bold text-white", children: "Google" })] }), _jsx("div", { className: "w-1 h-1 bg-white/20 rounded-full" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Cpu, { className: "w-5 h-5" }), " ", _jsx("span", { className: "font-bold text-white", children: "Xiaomi" })] }), _jsx("div", { className: "w-1 h-1 bg-white/20 rounded-full" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5" }), " ", _jsx("span", { className: "font-bold text-white", children: t('landingSocialProof_advancedNLP') })] })] }), _jsx("p", { className: "text-emerald-500/50 text-xs mt-4", children: t('landingSocialProof_bestTech') })] })] })] }));
}
