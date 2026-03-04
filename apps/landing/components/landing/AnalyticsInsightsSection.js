import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUpRight, ShoppingBag, Eye, MousePointerClick } from 'lucide-react';
export function AnalyticsInsightsSection() {
    const { lang } = useTranslation();
    const containerRef = useRef(null);
    const TEXT = {
        en: {
            badge: 'Data-Driven Decisions',
            title: 'Analytics Dashboard',
            subtitle: 'Make decisions like a big business, based on real data.',
            cards: {
                revenue: 'Total Revenue',
                orders: 'Orders',
                conversion: 'Conversion',
                aov: 'Avg. Order Value'
            },
            insights: {
                trend: {
                    title: 'Sales Trend',
                    desc: 'See which times you sell the most.'
                },
                products: {
                    title: 'Top Products',
                    desc: 'Which products are performing best.'
                },
                status: {
                    title: 'Order Status',
                    desc: 'Track where your orders are.'
                },
                breakdown: {
                    title: 'Revenue Source',
                    desc: 'Where your money is coming from.'
                }
            },
            quote: 'Check your dashboard for 2 minutes daily, know everything about your business.'
        },
        bn: {
            badge: 'ডেটা-ড্রিভেন সিদ্ধান্ত',
            title: 'অ্যানালিটিক্স ড্যাশবোর্ড',
            subtitle: 'বড় বিজনেসের মতো সিদ্ধান্ত নিন, ডেটা দেখে।',
            cards: {
                revenue: 'মোট আয়',
                orders: 'অর্ডার',
                conversion: 'কনভার্সন',
                aov: 'গড় অর্ডার ভ্যালু'
            },
            insights: {
                trend: {
                    title: 'বিক্রয়ের ট্রেন্ড',
                    desc: 'দেখুন কোন সময় বেশি বিক্রি হয়।'
                },
                products: {
                    title: 'সেরা প্রোডাক্ট',
                    desc: 'কোন প্রোডাক্ট সবচেয়ে ভালো চলছে।'
                },
                status: {
                    title: 'অর্ডার স্ট্যাটাস',
                    desc: 'কতগুলো অর্ডার কোথায় আছে।'
                },
                breakdown: {
                    title: 'আয়ের উৎস',
                    desc: 'কোথা থেকে টাকা আসছে।'
                }
            },
            quote: 'প্রতিদিন ২ মিনিট ড্যাশবোর্ড দেখুন, বিজনেসের সব আপডেট জানুন।'
        }
    }[lang === 'bn' ? 'bn' : 'en'];
    return (_jsxs("section", { ref: containerRef, className: "relative py-24 md:py-32 overflow-hidden bg-[#0A0F0D]", children: [_jsx("div", { className: "absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" }), _jsx("div", { className: "absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full" }), _jsx("div", { className: "absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 blur-[100px] rounded-full" }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 relative z-10", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("span", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6", children: [_jsx(BarChart3, { className: "w-4 h-4" }), TEXT.badge] }), _jsx("h2", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6", children: TEXT.title }), _jsx("p", { className: "text-xl text-white/60 max-w-2xl mx-auto", children: TEXT.subtitle })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-12 items-center", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-2xl rounded-[3rem]" }), _jsxs("div", { className: "relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl", children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8", children: [
                                                    { label: TEXT.cards.revenue, value: '৳125,400', trend: '+23%', icon: DollarSign, color: 'text-emerald-400' },
                                                    { label: TEXT.cards.orders, value: '47', trend: '+15%', icon: ShoppingBag, color: 'text-blue-400' },
                                                    { label: TEXT.cards.conversion, value: '3.2%', trend: '+0.4%', icon: MousePointerClick, color: 'text-purple-400' },
                                                    { label: TEXT.cards.aov, value: '৳2,668', trend: '+8%', icon: TrendingUp, color: 'text-orange-400' }
                                                ].map((stat, i) => (_jsxs("div", { className: "bg-white/5 rounded-xl p-4 border border-white/5", children: [_jsx(stat.icon, { className: `w-5 h-5 ${stat.color} mb-2` }), _jsx("div", { className: "text-lg font-bold text-white", children: stat.value }), _jsx("div", { className: "text-xs text-white/50", children: stat.label }), _jsxs("div", { className: "text-xs text-emerald-400 mt-1 flex items-center gap-1", children: [_jsx(ArrowUpRight, { className: "w-3 h-3" }), " ", stat.trend] })] }, i))) }), _jsx("div", { className: "bg-white/5 rounded-xl p-6 border border-white/5 mb-8 h-48 relative overflow-hidden flex items-end justify-between gap-2", children: [40, 60, 45, 70, 55, 80, 65, 90, 75, 100, 85, 95].map((h, i) => (_jsx("div", { style: { height: `${h}%` }, className: "w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/60 rounded-t-sm" }, i))) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white/5 rounded-xl p-4 border border-white/5", children: [_jsxs("h4", { className: "text-white font-medium mb-3 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-emerald-400" }), " Top Products"] }), _jsx("div", { className: "space-y-2", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "flex items-center gap-2 text-sm text-white/70", children: [_jsx("span", { className: "w-4 h-4 flex items-center justify-center bg-white/10 rounded text-[10px]", children: i }), "Product Name ", i] }, i))) })] }), _jsxs("div", { className: "bg-white/5 rounded-xl p-4 border border-white/5", children: [_jsxs("h4", { className: "text-white font-medium mb-3 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-emerald-400" }), " Live Visitors"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-3 w-3 bg-emerald-500" })] }), _jsx("span", { className: "text-2xl font-bold text-white", children: "24" }), _jsx("span", { className: "text-sm text-white/50", children: "Active now" })] })] })] })] })] }), _jsxs("div", { className: "grid gap-6", children: [[
                                        { title: TEXT.insights.trend.title, desc: TEXT.insights.trend.desc, icon: TrendingUp },
                                        { title: TEXT.insights.products.title, desc: TEXT.insights.products.desc, icon: ShoppingBag },
                                        { title: TEXT.insights.status.title, desc: TEXT.insights.status.desc, icon: Eye },
                                        { title: TEXT.insights.breakdown.title, desc: TEXT.insights.breakdown.desc, icon: DollarSign }
                                    ].map((card, i) => (_jsxs("div", { className: "bg-white/[0.03] border border-white/10 rounded-xl p-6 flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0", children: _jsx(card.icon, { className: "w-6 h-6 text-emerald-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-white mb-1", children: card.title }), _jsx("p", { className: "text-white/60 text-sm", children: card.desc })] })] }, i))), _jsx("div", { className: "bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mt-4", children: _jsxs("p", { className: "text-emerald-300 font-medium italic", children: ["\"", TEXT.quote, "\""] }) })] })] })] })] }));
}
