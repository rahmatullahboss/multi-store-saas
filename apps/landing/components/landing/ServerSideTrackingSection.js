import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ServerSideTrackingSection
 *
 * Marketing section for Server-Side Tracking & Facebook Conversions API feature.
 * Inspired by best-in-class SaaS landing pages (Northbeam, Triple Whale, Segment).
 *
 * Key messaging pillars:
 * 1. Ad blocker bypass — never miss a conversion
 * 2. iOS 14+ / privacy-first world — server sends data directly
 * 3. Better ROAS — accurate data = smarter ad spend
 * 4. Zero setup complexity — one click in dashboard
 */
import { useState } from 'react';
import { ShieldCheck, TrendingUp, Server, Globe, BarChart3, Lock, CheckCircle2, ArrowRight, WifiOff, RefreshCw, } from 'lucide-react';
// ─── tiny helpers ────────────────────────────────────────────────────────────
function Badge({ children }) {
    return (_jsx("span", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider", children: children }));
}
function SectionHeading({ title, subtitle }) {
    return (_jsxs("div", { className: "text-center mb-12 md:mb-16", children: [_jsx("h2", { className: "text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight", children: title }), subtitle && (_jsx("p", { className: "text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed", children: subtitle }))] }));
}
// ─── Comparison diagram: Browser Pixel vs Server CAPI ───────────────────────
function TrackingComparisonDiagram() {
    const [activeTab, setActiveTab] = useState('browser');
    return (_jsxs("div", { className: "relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden", children: [_jsxs("div", { className: "flex border-b border-white/10", children: [_jsxs("button", { onClick: () => setActiveTab('browser'), className: `flex-1 py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'browser'
                            ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500'
                            : 'text-white/40 hover:text-white/70'}`, children: [_jsx(WifiOff, { className: "inline w-3.5 h-3.5 mr-1.5 -mt-0.5" }), "Browser Pixel (\u09AA\u09C1\u09B0\u09A8\u09CB \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF)"] }), _jsxs("button", { onClick: () => setActiveTab('server'), className: `flex-1 py-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'server'
                            ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500'
                            : 'text-white/40 hover:text-white/70'}`, children: [_jsx(Server, { className: "inline w-3.5 h-3.5 mr-1.5 -mt-0.5" }), "Server-Side CAPI (Ozzyl \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF)"] })] }), _jsx("div", { className: "p-5 md:p-6 min-h-[220px]", children: activeTab === 'browser' ? (_jsxs("div", { className: "space-y-3", children: [[
                            { icon: WifiOff, color: 'text-red-400', label: 'Ad blocker ব্লক করে', blocked: true },
                            { icon: WifiOff, color: 'text-red-400', label: 'iOS 14+ ITP কুকি মুছে দেয়', blocked: true },
                            { icon: WifiOff, color: 'text-red-400', label: 'Slow JS → conversion miss', blocked: true },
                            { icon: WifiOff, color: 'text-red-400', label: 'Browser crash = ডেটা হারায়', blocked: true },
                        ].map((item) => (_jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10", children: [_jsx(item.icon, { className: `w-4 h-4 ${item.color} flex-shrink-0` }), _jsx("span", { className: "text-white/60 text-sm", children: item.label }), _jsx("span", { className: "ml-auto text-xs text-red-400 font-bold", children: "BLOCKED" })] }, item.label))), _jsx("p", { className: "text-center text-red-400/80 text-xs mt-2 font-medium", children: "\u0997\u09A1\u09BC\u09C7 \u09EA\u09E6\u2013\u09EC\u09E6% conversion miss \u09B9\u09AF\u09BC \uD83D\uDE1E" })] })) : (_jsxs("div", { className: "space-y-3", children: [[
                            { label: 'Customer order করে', step: '1' },
                            { label: 'Ozzyl server সাথে সাথে Meta-তে পাঠায়', step: '2' },
                            { label: 'Ad blocker? iOS? — কোনো বাধা নেই', step: '3' },
                            { label: 'আপনার ROAS সঠিকভাবে দেখায়', step: '4' },
                        ].map((item) => (_jsxs("div", { className: "flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10", children: [_jsx("span", { className: "w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0", children: item.step }), _jsx("span", { className: "text-white/70 text-sm", children: item.label }), _jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" })] }, item.label))), _jsx("p", { className: "text-center text-emerald-400/80 text-xs mt-2 font-medium", children: "\u09EF\u09EE%+ conversion accuracy \u2705" })] })) })] }));
}
// ─── Stats row ───────────────────────────────────────────────────────────────
const STATS = [
    { value: '40–60%', label: 'Conversion miss হয় ব্রাউজার পিক্সেলে', color: 'text-red-400' },
    { value: '98%+', label: 'Accuracy আমাদের server tracking-এ', color: 'text-emerald-400' },
    { value: '3x', label: 'Better ROAS accurate data দিয়ে', color: 'text-blue-400' },
];
// ─── Feature cards ───────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: ShieldCheck,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        title: 'Ad Blocker Bypass',
        desc: 'আপনার customer ad blocker use করলেও purchase event সরাসরি Meta server-এ পৌঁছায়। একটা conversion-ও miss হয় না।',
    },
    {
        icon: Globe,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        title: 'iOS 14+ Privacy Ready',
        desc: 'Apple-এর ITP এবং ATT framework আপনার tracking ভাঙতে পারবে না। Server থেকে সরাসরি data পাঠানো হয়।',
    },
    {
        icon: TrendingUp,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        title: 'উন্নত Match Rate',
        desc: 'Email, phone, city — সব data SHA-256 hash করে Meta-তে পাঠানো হয়। Event Match Quality (EMQ) score অনেক বেশি।',
    },
    {
        icon: RefreshCw,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        title: 'Deduplication বিল্ট-ইন',
        desc: 'Browser pixel এবং server CAPI একই সাথে চলে। Unique event_id দিয়ে duplicate গণনা আটকানো হয় automatically।',
    },
    {
        icon: BarChart3,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        title: 'সঠিক ROAS রিপোর্ট',
        desc: 'Facebook Ads Manager-এ সঠিক conversion data দেখুন। সঠিক data মানে সঠিক বিজ্ঞাপনে বিনিয়োগ — বেশি profit।',
    },
    {
        icon: Lock,
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        title: '১ ক্লিকে সেটআপ',
        desc: 'Pixel ID এবং Access Token বসান। Ozzyl বাকি সব করবে। কোনো code লাগবে না, কোনো developer লাগবে না।',
    },
];
// ─── Event flow visual ───────────────────────────────────────────────────────
const EVENTS_TRACKED = [
    { name: 'PageView', desc: 'প্রতিটি পেজ ভিজিট', color: '#60a5fa' },
    { name: 'ViewContent', desc: 'পণ্য দেখা', color: '#34d399' },
    { name: 'AddToCart', desc: 'কার্টে যোগ', color: '#f59e0b' },
    { name: 'InitiateCheckout', desc: 'চেকআউট শুরু', color: '#a78bfa' },
    { name: 'Purchase', desc: 'অর্ডার সম্পন্ন ✓', color: '#10b981' },
];
function EventFlowVisual() {
    return (_jsxs("div", { className: "rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6", children: [_jsx("p", { className: "text-white/40 text-xs uppercase tracking-widest font-semibold mb-4", children: "Tracked Events (Server + Browser)" }), _jsx("div", { className: "flex flex-col gap-2", children: EVENTS_TRACKED.map((ev, i) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full flex-shrink-0", style: { backgroundColor: ev.color, boxShadow: `0 0 0 2px #0A0A0F, 0 0 0 4px ${ev.color}` } }), i < EVENTS_TRACKED.length - 1 && (_jsx("div", { className: "w-px h-5 bg-white/10 my-0.5" }))] }), _jsxs("div", { className: "flex items-center justify-between flex-1 py-1", children: [_jsx("span", { className: "font-mono text-sm font-semibold", style: { color: ev.color }, children: ev.name }), _jsx("span", { className: "text-white/40 text-xs", children: ev.desc }), _jsxs("div", { className: "flex gap-1 ml-2", children: [_jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono", children: "Browser" }), _jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono", children: "Server" })] })] })] }, ev.name))) })] }));
}
// ─── Setup steps ─────────────────────────────────────────────────────────────
const SETUP_STEPS = [
    { step: '01', title: 'Facebook Pixel ID', desc: 'Events Manager থেকে আপনার Pixel ID কপি করুন' },
    { step: '02', title: 'Access Token', desc: 'Conversions API access token generate করুন' },
    { step: '03', title: 'Ozzyl Dashboard-এ বসান', desc: 'Settings → Analytics → Facebook CAPI-তে paste করুন' },
    { step: '04', title: 'Done! 🎉', desc: 'সব conversion এখন server থেকে track হচ্ছে' },
];
// ─── Main component ───────────────────────────────────────────────────────────
export function ServerSideTrackingSection() {
    return (_jsxs("section", { className: "relative py-20 md:py-28 overflow-hidden bg-[#0A0A0F]", children: [_jsxs("div", { className: "absolute inset-0 pointer-events-none", children: [_jsx("div", { className: "absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/8 rounded-full blur-[120px]" }), _jsx("div", { className: "absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-600/6 rounded-full blur-[100px]" })] }), _jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "text-center mb-14 md:mb-20", children: [_jsxs(Badge, { children: [_jsx(Server, { className: "w-3.5 h-3.5" }), "Server-Side Tracking"] }), _jsxs("h2", { className: "mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5", children: ["\u0986\u09B0 \u0995\u09CB\u09A8\u09CB", ' ', _jsx("span", { className: "bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent", children: "Conversion Miss" }), ' ', "\u09A8\u09BE"] }), _jsxs("p", { className: "text-white/50 text-base md:text-xl max-w-2xl mx-auto leading-relaxed", children: ["Facebook Conversions API \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF server \u09A5\u09C7\u0995\u09C7 Meta-\u09A4\u09C7 data \u09AA\u09BE\u09A0\u09BE\u09A8\u0964 Ad blocker, iOS 14+, browser crash \u2014 \u0995\u09CB\u09A8\u09CB \u0995\u09BF\u099B\u09C1\u0987 \u0986\u09AA\u09A8\u09BE\u09B0", ' ', _jsx("span", { className: "text-white/80 font-medium", children: "ROAS" }), " \u09A8\u09B7\u09CD\u099F \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7 \u09A8\u09BE\u0964"] })] }), _jsx("div", { className: "grid grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 max-w-3xl mx-auto", children: STATS.map((stat) => (_jsxs("div", { className: "text-center p-4 rounded-2xl border border-white/8 bg-white/[0.03]", children: [_jsx("div", { className: `text-2xl md:text-4xl font-bold mb-1 ${stat.color}`, children: stat.value }), _jsx("div", { className: "text-white/40 text-xs md:text-sm leading-snug", children: stat.label })] }, stat.value))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 md:mb-16", children: [_jsxs("div", { children: [_jsx("p", { className: "text-white/40 text-xs uppercase tracking-widest font-semibold mb-3", children: "\u09AA\u09C1\u09B0\u09A8\u09CB vs \u09A8\u09A4\u09C1\u09A8 \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF" }), _jsx(TrackingComparisonDiagram, {})] }), _jsx("div", { children: _jsx(EventFlowVisual, {}) })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 md:mb-20", children: FEATURES.map((feat) => (_jsxs("div", { className: `group p-5 md:p-6 rounded-2xl border ${feat.border} bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300`, children: [_jsx("div", { className: `w-10 h-10 rounded-xl ${feat.bg} flex items-center justify-center mb-4`, children: _jsx(feat.icon, { className: `w-5 h-5 ${feat.color}` }) }), _jsx("h3", { className: "text-white font-semibold text-base mb-2", children: feat.title }), _jsx("p", { className: "text-white/45 text-sm leading-relaxed", children: feat.desc })] }, feat.title))) }), _jsxs("div", { className: "max-w-3xl mx-auto mb-14", children: [_jsx("p", { className: "text-center text-white/40 text-xs uppercase tracking-widest font-semibold mb-8", children: "\u09AE\u09BE\u09A4\u09CD\u09B0 \u09EA \u09A7\u09BE\u09AA\u09C7 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC \u0995\u09B0\u09C1\u09A8" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: SETUP_STEPS.map((s) => (_jsxs("div", { className: "flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/8", children: [_jsx("span", { className: "text-2xl font-black text-white/10 font-mono leading-none flex-shrink-0 pt-0.5", children: s.step }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-semibold text-sm mb-0.5", children: s.title }), _jsx("p", { className: "text-white/40 text-xs leading-relaxed", children: s.desc })] })] }, s.step))) })] }), _jsxs("div", { className: "rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 p-8 md:p-10 text-center", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-3", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-400 -pulse" }), _jsx("span", { className: "text-emerald-400 text-sm font-semibold", children: "\u098F\u0996\u09A8\u0987 \u09B8\u0995\u09CD\u09B0\u09BF\u09AF\u09BC" })] }), _jsx("h3", { className: "text-white text-2xl md:text-3xl font-bold mb-3", children: "\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF conversion track \u0995\u09B0\u09C1\u09A8 \u2014 \u09B8\u09BE\u09B0\u09CD\u09AD\u09BE\u09B0 \u09A5\u09C7\u0995\u09C7 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF" }), _jsx("p", { className: "text-white/50 mb-6 max-w-lg mx-auto text-sm md:text-base", children: "Ozzyl-\u098F\u09B0 \u09B8\u09BE\u09A5\u09C7 \u0986\u09AA\u09A8\u09BE\u09B0 Facebook Ads \u0986\u09B0\u0993 \u09B8\u09CD\u09AE\u09BE\u09B0\u09CD\u099F \u09B9\u09AC\u09C7\u0964 \u09B8\u09A0\u09BF\u0995 data, \u09B8\u09A0\u09BF\u0995 \u0985\u09AA\u099F\u09BF\u09AE\u09BE\u0987\u099C\u09C7\u09B6\u09A8, \u09AC\u09C7\u09B6\u09BF profit\u0964" }), _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold rounded-full text-sm md:text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-[0.98] transition-all duration-200", children: ["\u098F\u0996\u09A8\u0987 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C1\u09A8", _jsx(ArrowRight, { className: "w-4 h-4" })] }), _jsx("p", { className: "text-white/25 text-xs mt-4", children: "\u09AB\u09CD\u09B0\u09BF \u099F\u09CD\u09B0\u09BE\u09AF\u09BC\u09BE\u09B2 \u2022 \u0995\u09CB\u09A8\u09CB credit card \u09B2\u09BE\u0997\u09AC\u09C7 \u09A8\u09BE \u2022 \u09E7 \u09AE\u09BF\u09A8\u09BF\u099F\u09C7 \u09B8\u09C7\u099F\u0986\u09AA" })] })] })] }));
}
