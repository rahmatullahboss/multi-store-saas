import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';
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
export function TaxReportsSection() {
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    const stats = [
        { label: 'Total Revenue', value: '৳12,45,000', change: '+12%', color: 'text-white' },
        { label: 'VAT Collected', value: '৳1,87,500', change: '+8%', color: 'text-orange-400' },
        { label: 'Net Profit', value: '৳4,50,000', change: '+15%', color: 'text-green-400' },
    ];
    const tableData = [
        { month: 'July 2024', revenue: '৳1,20,000', vat: '৳18,000', status: 'Calculated' },
        { month: 'Aug 2024', revenue: '৳1,35,000', vat: '৳20,250', status: 'Calculated' },
        { month: 'Sep 2024', revenue: '৳98,000', vat: '৳14,700', status: 'Pending' },
    ];
    return (_jsx("div", { className: "py-24 bg-[#0A0A0F] relative overflow-hidden", ref: containerRef, children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6", children: [_jsx(FileText, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { className: "text-sm font-semibold text-emerald-400", children: "Automated Accounting" })] }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-white mb-6", children: ["Tax Season \u098F \u2014 ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400", children: "No Tension!" })] }), _jsx("p", { className: "text-xl text-gray-400 mb-8", children: "\u09A6\u09BF\u09A8\u09B6\u09C7\u09B7\u09C7 \u09B9\u09BF\u09B8\u09BE\u09AC \u09AE\u09C7\u09B2\u09BE\u09A8\u09CB \u09A8\u09BF\u09AF\u09BC\u09C7 \u0986\u09B0 \u099A\u09BF\u09A8\u09CD\u09A4\u09BE \u09A8\u09C7\u0987\u0964 \u09B8\u09C7\u09B2\u09B8, \u09AD\u09CD\u09AF\u09BE\u099F \u098F\u09AC\u0982 \u09AA\u09CD\u09B0\u09AB\u09BF\u099F \u09B0\u09BF\u09AA\u09CB\u09B0\u09CD\u099F \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995 \u09A4\u09C8\u09B0\u09BF \u09B9\u09AC\u09C7\u0964 \u098F\u0995 \u0995\u09CD\u09B2\u09BF\u0995\u09C7 \u09A1\u09BE\u0989\u09A8\u09B2\u09CB\u09A1 \u0995\u09B0\u09C7 CA \u0995\u09C7 \u09AA\u09BE\u09A0\u09BF\u09AF\u09BC\u09C7 \u09A6\u09BF\u09A8\u0964" }), _jsx("div", { className: "space-y-4", children: [
                                    { title: 'Monthly VAT Reports', desc: 'প্রতি মাসের ভ্যাট রিপোর্ট অটোমেটিক জেনারেট হয়' },
                                    { title: 'Profit & Loss Statement', desc: 'খরচ বাদ দিয়ে কত লাভ হলো তা জানুন' },
                                    { title: 'Excel Export', desc: 'যেকোনো রিপোর্ট এক্সেলে ডাউনলোড করার সুবিধা' },
                                ].map((item, idx) => (_jsxs("div", { className: "flex gap-4 p-4 rounded-xl hover:bg-gray-800/30 transition-colors border border-transparent hover:border-gray-800", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0", children: _jsx(TrendingUp, { className: "w-5 h-5 text-emerald-400" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-bold", children: item.title }), _jsx("p", { className: "text-gray-500 text-sm", children: item.desc })] })] }, idx))) })] }), _jsxs("div", { className: "bg-[#0F1115] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-2xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h3", { className: "text-white font-bold text-lg", children: "Financial Overview" }), _jsx("span", { className: "text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full", children: "FY 2024-25" })] }), _jsx("div", { className: "grid grid-cols-3 gap-4 mb-8", children: stats.map((stat, idx) => (_jsxs("div", { className: "bg-gray-800/50 p-4 rounded-xl border border-gray-700", children: [_jsx("p", { className: "text-xs text-gray-500 mb-1", children: stat.label }), _jsx("p", { className: `font-bold text-lg mb-1 ${stat.color}`, children: stat.value })] }, idx))) }), _jsx("div", { className: "overflow-hidden rounded-xl border border-gray-800", children: _jsxs("table", { className: "w-full text-sm text-left", children: [_jsx("thead", { className: "bg-gray-800/50 text-gray-400", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 font-medium", children: "Period" }), _jsx("th", { className: "px-4 py-3 font-medium", children: "Revenue" }), _jsx("th", { className: "px-4 py-3 font-medium", children: "VAT" }), _jsx("th", { className: "px-4 py-3 font-medium text-right", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-800 bg-gray-900/30", children: tableData.map((row, idx) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 text-gray-300", children: row.month }), _jsx("td", { className: "px-4 py-3 text-white font-medium", children: row.revenue }), _jsx("td", { className: "px-4 py-3 text-gray-400", children: row.vat }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx("span", { className: `text-xs px-2 py-1 rounded-full ${row.status === 'Calculated' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`, children: row.status }) })] }, idx))) })] }) }), _jsx("div", { className: "mt-8 flex gap-4", children: _jsxs("button", { className: "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors", children: [_jsx(Download, { className: "w-4 h-4" }), " Download Report"] }) })] })] }) }) }));
}
