import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { ClipboardList, ShieldAlert, History, User } from 'lucide-react';
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
export function ActivityLogsSection() {
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    const logs = [
        { time: '3:45 PM', user: 'রাসেল', action: 'updated Order #12345', details: 'Status: Processing → Shipped', ip: '103.123.xxx.xxx', type: 'info' },
        { time: '3:30 PM', user: 'সুমি', action: 'added new Product', details: '"Blue Denim Jacket" - ৳2,499', ip: '103.456.xxx.xxx', type: 'success' },
        { time: '2:15 PM', user: 'আপনি', action: 'changed Store Settings', details: 'Shipping Zone updated', ip: '103.789.xxx.xxx', type: 'warning' },
        { time: '1:00 PM', user: 'Unknown', action: 'Failed Login Attempt', details: 'Blocked by Firewall', ip: '45.123.xxx.xxx', type: 'danger' },
    ];
    return (_jsx("div", { className: "py-24 bg-[#0A0A0F] relative", ref: containerRef, children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", children: [_jsxs("div", { className: "order-2 lg:order-1", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6", children: [_jsx(History, { className: "w-4 h-4 text-cyan-400" }), _jsx("span", { className: "text-sm font-semibold text-cyan-400", children: "Audit Trail" })] }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-white mb-6", children: ["\u0995\u09C7 \u0995\u09BF \u0995\u09B0\u09C7\u099B\u09C7 \u2014 ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400", children: "\u09B8\u09AC Record \u0986\u099B\u09C7" })] }), _jsx("p", { className: "text-xl text-gray-400 mb-8", children: "\u09B8\u09CD\u099F\u09BE\u09AB\u09A6\u09C7\u09B0 \u0995\u09BE\u099C\u09C7\u09B0 \u09B8\u09CD\u09AC\u099A\u09CD\u099B\u09A4\u09BE \u09A8\u09BF\u09B6\u09CD\u099A\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964 \u09AD\u09C1\u09B2 \u09B9\u09B2\u09C7 \u0995\u09C7 \u0995\u09B0\u09C7\u099B\u09C7 \u09A4\u09BE \u09B8\u09B9\u099C\u09C7\u0987 \u09AC\u09C7\u09B0 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09AC\u09C7\u09A8\u0964" }), _jsx("div", { className: "grid grid-cols-2 gap-6", children: [
                                    { title: 'Login Activity', desc: 'কে কখন লগইন করলো' },
                                    { title: 'Order Changes', desc: 'কে স্ট্যাটাস চেঞ্জ করলো' },
                                    { title: 'Product Updates', desc: 'কে প্রাইস চেঞ্জ করলো' },
                                    { title: 'Settings Audit', desc: 'সেন্সিটিভ চেঞ্জ লগ' },
                                ].map((item, idx) => (_jsxs("div", { className: "flex gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-cyan-400", children: _jsx(ClipboardList, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "text-white font-semibold", children: item.title }), _jsx("p", { className: "text-sm text-gray-500", children: item.desc })] })] }, idx))) })] }), _jsxs("div", { className: "order-1 lg:order-2 bg-[#0F1115] border border-gray-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative", children: [_jsxs("div", { className: "flex items-center justify-between mb-6 pb-4 border-b border-gray-800", children: [_jsxs("h3", { className: "text-lg font-bold text-white flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 bg-green-500 rounded-full -pulse" }), " Live Activity Feed"] }), _jsx("button", { className: "text-xs text-gray-500 hover:text-white transition", children: "Export Logs" })] }), _jsxs("div", { className: "space-y-4 relative", children: [_jsx("div", { className: "absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-800" }), logs.map((log, idx) => (_jsxs("div", { className: "relative flex gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition cursor-default z-10", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-[#0F1115] ${log.type === 'danger' ? 'bg-red-500 text-white' :
                                                    log.type === 'success' ? 'bg-green-500 text-white' :
                                                        'bg-gray-700 text-gray-300'}`, children: log.type === 'danger' ? _jsx(ShieldAlert, { className: "w-4 h-4" }) : _jsx(User, { className: "w-4 h-4" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("p", { className: "text-sm font-medium text-white", children: [_jsx("span", { className: "font-bold text-cyan-300", children: log.user }), " ", log.action] }), _jsx("span", { className: "text-xs text-gray-500", children: log.time })] }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: log.details }), _jsxs("p", { className: "text-[10px] text-gray-600 mt-1 font-mono", children: ["IP: ", log.ip] })] })] }, idx)))] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("button", { className: "text-sm text-gray-500 hover:text-white transition", children: "Load More Activity..." }) })] })] }) }) }));
}
