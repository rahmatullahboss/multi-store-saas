import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Fraud Detection Section
 *
 * Highlights the AI-powered fraud detection capabilities.
 */
import { ShieldAlert, ShieldCheck, Database, Activity, Lock, AlertTriangle } from 'lucide-react';
// ============================================================================
// DESIGN TOKENS (Consistent with TrustSection)
// ============================================================================
const COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    accent: '#DC2626', // Red for alert/warning
    accentLight: '#EF4444',
    background: '#0A0F0D',
    backgroundCard: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    textSubtle: 'rgba(255, 255, 255, 0.5)',
    success: '#10B981',
    warning: '#F59E0B'
};
export const FraudDetectionSection = () => {
    const features = [
        {
            icon: Database,
            title: "Shared Database",
            titleBn: "শেয়ার্ড কুরিয়ার ডাটাবেস",
            description: "সারা দেশের লক্ষ লক্ষ পার্সেলের কুরিয়ার ডেলিভারি রেকর্ড থেকে রিয়েল-টাইম ডাটা।",
            color: COLORS.primaryLight
        },
        {
            icon: Activity,
            title: "Steadfast Integration",
            titleBn: "স্টেডফাস্ট ফ্রড ট্র্যাকিং",
            description: "কাস্টমারের ফোন নাম্বার দিয়ে সরাসরি স্টেডফাস্টের সেন্ট্রাল সার্ভার থেকে ক্যান্সেলেশন রেট বের করে।",
            color: COLORS.warning
        },
        {
            icon: Lock,
            title: "Block High Risk",
            titleBn: "রিস্কি অর্ডার পেন্ডিং",
            description: "যাদের ক্যান্সেলেশন রেট ৫% এর বেশি বা কোনো রেকর্ড নেই, সেসব অর্ডার ম্যানুয়াল ভেরিফিকেশনের জন্য পেন্ডিং রাখে।",
            color: COLORS.accent
        },
        {
            icon: ShieldCheck,
            title: "Auto-Confirm Safe COD",
            titleBn: "নিরাপদ COD অটো-কনফার্ম",
            description: "যাদের ডেলিভারি রেকর্ড ভালো (ক্যান্সেলেশন রেট ৫% এর কম), তাদের ক্যাশ অন ডেলিভারি (COD) অর্ডার নিজে থেকেই কনফার্ম হয়ে যায়!",
            color: COLORS.success
        }
    ];
    return (_jsxs("div", { className: "relative py-24 overflow-hidden", children: [_jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none", style: { background: COLORS.accent } }), _jsxs("div", { className: "max-w-6xl mx-auto px-4 relative z-10", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("span", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4", style: {
                                    background: `${COLORS.accent}15`,
                                    color: COLORS.accentLight,
                                    border: `1px solid ${COLORS.accent}30`,
                                }, children: [_jsx(ShieldAlert, { className: "w-4 h-4" }), "Advanced Protection"] }), _jsxs("h2", { className: "text-3xl md:text-5xl font-bold text-white mb-6", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\u09AB\u09C7\u0987\u0995 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0993 \u09AB\u09CD\u09B0\u09A1 \u09A5\u09C7\u0995\u09C7", ' ', _jsx("span", { style: {
                                            background: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.warning})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }, children: "\u09B8\u09C1\u09B0\u0995\u09CD\u09B7\u09BE" })] }), _jsx("p", { style: { color: COLORS.textMuted }, className: "max-w-2xl mx-auto text-lg", children: "\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u0985\u09CD\u09AF\u09BE\u09A1\u09AD\u09BE\u09A8\u09CD\u09B8\u09A1 \u09AB\u09CD\u09B0\u09A1 \u09A1\u09BF\u099F\u09C7\u0995\u09B6\u09A8 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u0986\u09AA\u09A8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B8\u09BE\u09B0 \u0995\u09CD\u09B7\u09A4\u09BF \u0995\u09AE\u09BE\u09AC\u09C7 \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AB\u09BF\u099F \u09AC\u09BE\u09DC\u09BE\u09AC\u09C7\u0964 \u09AB\u09C7\u0995 \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0986\u09B0 \u09B0\u09BF\u099F\u09BE\u09B0\u09CD\u09A8 \u09B0\u09C7\u099F \u0995\u09AE\u09BE\u09A8\u09CB\u09B0 \u09B8\u09C7\u09B0\u09BE \u09B8\u09AE\u09BE\u09A7\u09BE\u09A8\u0964" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", children: [_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: features.map((feature, index) => (_jsxs("div", { className: "p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]", style: {
                                        background: `linear-gradient(135deg, ${COLORS.backgroundCard}, ${feature.color}05)`,
                                        borderColor: `${feature.color}20`
                                    }, children: [_jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center mb-4", style: { background: `${feature.color}15` }, children: _jsx(feature.icon, { className: "w-6 h-6", style: { color: feature.color } }) }), _jsx("h3", { className: "text-lg font-bold text-white mb-2", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: feature.titleBn }), _jsx("p", { className: "text-sm leading-relaxed", style: { color: COLORS.textMuted }, children: feature.description })] }, feature.title))) }), _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "rounded-2xl p-6 border relative overflow-hidden", style: {
                                            background: '#111',
                                            borderColor: COLORS.border,
                                            boxShadow: `0 20px 50px -10px black`
                                        }, children: [_jsxs("div", { className: "flex items-center gap-4 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-500" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-red-400 font-bold text-sm", children: "High Risk Order Detected" }), _jsx("p", { className: "text-red-400/70 text-xs", children: "Risk Score: 85/100 (Blacklisted Phone)" })] }), _jsx("div", { className: "ml-auto px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg", children: "BLOCKED" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: "Order Velocity" }), _jsx("span", { className: "text-yellow-500", children: "High (5 orders/day)" })] }), _jsx("div", { className: "w-full h-1 bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-yellow-500 w-[70%]" }) }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: "COD Return Rate" }), _jsx("span", { className: "text-red-500", children: "Critical (45%)" })] }), _jsx("div", { className: "w-full h-1 bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-red-500 w-[85%]" }) }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: "IP Reputation" }), _jsx("span", { className: "text-green-500", children: "Clean" })] }), _jsx("div", { className: "w-full h-1 bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-green-500 w-[100%]" }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-6", children: [_jsx("div", { className: "py-2 text-center rounded-lg bg-gray-800 text-gray-400 text-xs font-medium cursor-not-allowed", children: "Accept Order" }), _jsx("div", { className: "py-2 text-center rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-medium", children: "Verify via OTP" })] })] }), _jsx("div", { className: "absolute -top-6 -right-6 w-24 h-24 bg-red-500/20 rounded-full blur-2xl -z-10" }), _jsx("div", { className: "absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -z-10" })] })] })] })] }));
};
