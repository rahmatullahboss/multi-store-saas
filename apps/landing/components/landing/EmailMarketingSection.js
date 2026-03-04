import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { Mail, Clock, DollarSign, LayoutTemplate, ShoppingCart } from 'lucide-react';
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
export function EmailMarketingSection() {
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    const templates = [
        { name: 'Welcome Email', color: 'bg-blue-500', icon: '👋' },
        { name: 'Order Confirm', color: 'bg-green-500', icon: '✅' },
        { name: 'Abandon Cart', color: 'bg-orange-500', icon: '🛒' },
        { name: 'Promo Sale', color: 'bg-purple-500', icon: '🎉' },
    ];
    return (_jsxs("div", { className: "py-24 bg-[#0A0A0F] relative overflow-hidden", ref: containerRef, children: [_jsx("div", { className: "absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6", children: [_jsx(Mail, { className: "w-4 h-4 text-orange-400" }), _jsx("span", { className: "text-sm font-semibold text-orange-400", children: "Mailchimp Alternative Built-in" })] }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-white mb-6", children: ["Email Marketing \u2014 ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400", children: "\u09AF\u09C7\u09AD\u09BE\u09AC\u09C7 \u09AC\u09A1\u09BC\u09B0\u09BE \u0995\u09B0\u09C7" })] }), _jsx("p", { className: "text-xl text-gray-400 max-w-2xl mx-auto", children: "\u09A5\u09BE\u09B0\u09CD\u09A1 \u09AA\u09BE\u09B0\u09CD\u099F\u09BF \u099F\u09C1\u09B2\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09AE\u09BE\u09B8\u09C7 $20-$50 \u0996\u09B0\u099A \u0995\u09B0\u09BE\u09B0 \u09A6\u09B0\u0995\u09BE\u09B0 \u09A8\u09C7\u0987\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AC\u09BF\u09B2\u09CD\u099F-\u0987\u09A8 \u0985\u099F\u09CB\u09AE\u09C7\u09B6\u09A8 \u09A6\u09BF\u09AF\u09BC\u09C7\u0987 \u09B8\u09AC \u09B9\u09AC\u09C7!" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-2 bg-[#0F1115] border border-gray-800 rounded-3xl p-8 overflow-hidden relative group", children: [_jsx("div", { className: "absolute top-0 right-0 p-4 bg-gray-800/50 rounded-bl-2xl border-b border-l border-gray-700", children: _jsx("span", { className: "text-xs font-mono text-gray-400", children: "FLOW BUILDER" }) }), _jsx("h3", { className: "text-2xl font-bold text-white mb-4", children: "Visual Automation Flow" }), _jsx("p", { className: "text-gray-400 mb-8 max-w-md", children: " \u09A1\u09CD\u09B0\u09CD\u09AF\u09BE\u0997-\u098F\u09A8\u09CD\u09A1-\u09A1\u09CD\u09B0\u09AA \u0995\u09B0\u09C7 \u09B8\u09C7\u099F \u0995\u09B0\u09C1\u09A8 \u0995\u0996\u09A8 \u0995\u09CB\u09A8 \u0987\u09AE\u09C7\u0987\u09B2 \u09AF\u09BE\u09AC\u09C7\u0964 \u09AF\u09C7\u09AE\u09A8: \u0985\u09B0\u09CD\u09A1\u09BE\u09B0 \u0995\u09B0\u09BE\u09B0 \u09E9 \u09A6\u09BF\u09A8 \u09AA\u09B0 \u09B0\u09BF\u09AD\u09BF\u0989 \u09B0\u09BF\u0995\u09CB\u09AF\u09BC\u09C7\u09B8\u09CD\u099F\u0964" }), _jsxs("div", { className: "relative h-64 w-full flex flex-col items-center", children: [_jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: _jsxs("svg", { className: "w-full h-full absolute", style: { strokeDasharray: '5,5' }, children: [_jsx("line", { x1: "50%", y1: "20%", x2: "50%", y2: "50%", stroke: "#374151", strokeWidth: "2" }), _jsx("line", { x1: "50%", y1: "50%", x2: "50%", y2: "80%", stroke: "#374151", strokeWidth: "2" })] }) }), _jsxs("div", { className: "z-10 bg-blue-500/10 border border-blue-500/30 px-6 py-3 rounded-xl text-blue-300 font-medium flex items-center gap-2 mb-8", children: [_jsx(ShoppingCart, { className: "w-4 h-4" }), " New Order Placed"] }), _jsxs("div", { className: "z-10 bg-gray-800 border border-gray-700 px-4 py-2 rounded-full text-gray-400 text-sm flex items-center gap-2 mb-8", children: [_jsx(Clock, { className: "w-3 h-3" }), " Wait 3 Days"] }), _jsxs("div", { className: "z-10 bg-green-500/10 border border-green-500/30 px-6 py-3 rounded-xl text-green-300 font-medium flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4" }), " Send Review Request"] })] })] }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "bg-[#0F1115] border border-gray-800 rounded-3xl p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-white mb-4 flex items-center gap-2", children: [_jsx(LayoutTemplate, { className: "w-5 h-5 text-purple-400" }), " Ready Templates"] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: templates.map((t, idx) => (_jsxs("div", { className: "bg-gray-800/50 p-3 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors", children: [_jsx("div", { className: `w-8 h-8 ${t.color}/20 rounded-lg flex items-center justify-center text-lg mb-2`, children: t.icon }), _jsx("span", { className: "text-sm text-gray-300 font-medium", children: t.name })] }, idx))) })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-6", children: [_jsxs("h3", { className: "text-lg font-bold text-white mb-2 flex items-center gap-2", children: [_jsx(DollarSign, { className: "w-5 h-5 text-green-400" }), " Massive Savings"] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: "Mailchimp" }), _jsx("span", { className: "text-red-400 line-through", children: "\u09F32,000/mo" })] }), _jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-400", children: "Klaviyo" }), _jsx("span", { className: "text-red-400 line-through", children: "\u09F34,500/mo" })] }), _jsx("div", { className: "h-px bg-gray-700/50" }), _jsxs("div", { className: "flex justify-between items-center font-bold text-lg", children: [_jsx("span", { className: "text-white", children: "Our Platform" }), _jsx("span", { className: "text-green-400", children: "FREE" })] })] }), _jsx("div", { className: "mt-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-center text-sm font-semibold", children: "Save \u09F324,000+/year!" })] })] })] })] })] }));
}
