import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { MessageCircle, Bell, Zap, ShoppingCart, Truck, Gift, Check } from 'lucide-react';
import { ASSETS } from '@/config/assets';
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
export function WhatsAppSMSAutomationSection() {
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    const [activeMessage, setActiveMessage] = useState(0);
    const messages = [
        {
            type: 'order_placed',
            title: 'Order Placed',
            icon: ShoppingCart,
            time: 'Just now',
            content: (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-bold", children: "\uD83D\uDFE2 Your Store Name" }), _jsx("p", { children: "\u0986\u09B8\u09B8\u09BE\u09B2\u09BE\u09AE\u09C1 \u0986\u09B2\u09BE\u0987\u0995\u09C1\u09AE \u09B0\u09B9\u09BF\u09AE \u09AD\u09BE\u0987!" }), _jsx("p", { children: "\u0986\u09AA\u09A8\u09BE\u09B0 Order #12345 \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u0997\u09C3\u09B9\u09C0\u09A4 \u09B9\u09AF\u09BC\u09C7\u099B\u09C7! \u2705" }), _jsxs("div", { className: "my-2 border-l-2 border-gray-200 pl-2", children: [_jsx("p", { children: "\uD83D\uDCE6 Product: Red T-Shirt" }), _jsx("p", { children: "\uD83D\uDCB0 Total: \u09F31,299" })] }), _jsx("p", { children: "\u0986\u09AE\u09B0\u09BE \u09B6\u09C0\u0998\u09CD\u09B0\u0987 Delivery \u0995\u09B0\u09AC\u0964 \u09A7\u09A8\u09CD\u09AF\u09AC\u09BE\u09A6! \uD83D\uDE4F" })] }))
        },
        {
            type: 'shipped',
            title: 'Order Shipped',
            icon: Truck,
            time: 'Tomorrow, 10:00 AM',
            content: (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-bold", children: "\uD83D\uDFE2 Your Store Name" }), _jsx("p", { children: "\uD83D\uDE9A \u0986\u09AA\u09A8\u09BE\u09B0 Order Ship \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!" }), _jsxs("div", { className: "my-2 border-l-2 border-gray-200 pl-2", children: [_jsx("p", { children: "Tracking: STD-BD-789456" }), _jsx("p", { children: "\uD83D\uDCCD Track \u0995\u09B0\u09C1\u09A8: ozzyl.com/t/789" })] }), _jsx("p", { children: "\u0986\u09A8\u09C1\u09AE\u09BE\u09A8\u09BF\u0995 Delivery: \u0986\u0997\u09BE\u09AE\u09C0\u0995\u09BE\u09B2" })] }))
        },
        {
            type: 'abandon_cart',
            title: 'Cart Recovery',
            icon: Bell,
            time: '2 hours later',
            content: (_jsxs(_Fragment, { children: [_jsx("p", { className: "font-bold", children: "\uD83D\uDFE2 Your Store Name" }), _jsx("p", { children: "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB! \uD83D\uDC4B" }), _jsx("p", { children: "\u0986\u09AA\u09A8\u09BE\u09B0 Cart \u098F \u0995\u09BF\u099B\u09C1 Item \u09B0\u09AF\u09BC\u09C7 \u0997\u09C7\u099B\u09C7!" }), _jsx("div", { className: "my-2 border-l-2 border-gray-200 pl-2", children: _jsx("p", { children: "\uD83D\uDED2 Red T-Shirt - \u09F3999" }) }), _jsx("p", { children: "\u098F\u0996\u09A8\u0987 Order \u0995\u09B0\u09B2\u09C7 10% OFF! \uD83C\uDF89" }), _jsx("p", { className: "font-mono text-xs bg-gray-100 p-1 rounded mt-1 w-fit", children: "Code: COMEBACK10" }), _jsx("button", { className: "mt-2 text-blue-500 font-medium text-sm", children: "\uD83D\uDED2 Order Complete \u0995\u09B0\u09C1\u09A8" })] }))
        }
    ];
    useEffect(() => {
        if (!isInView)
            return;
        const interval = setInterval(() => {
            setActiveMessage((prev) => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [isInView, messages.length]);
    return (_jsx("div", { className: "py-24 bg-[#0F1115] overflow-hidden", ref: containerRef, children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6", children: [_jsx(MessageCircle, { className: "w-4 h-4 text-green-400" }), _jsx("span", { className: "text-sm font-semibold text-green-400", children: "Automated Engagement" })] }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-white mb-6", children: ["Customer \u098F\u09B0 \u0995\u09BE\u099B\u09C7 \u09AA\u09CC\u0981\u099B\u09BE\u09A8 ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400", children: "Automatically!" })] }), _jsx("p", { className: "text-xl text-gray-400 mb-8", children: "Order \u0995\u09A8\u09AB\u09BE\u09B0\u09CD\u09AE\u09C7\u09B6\u09A8 \u09A5\u09C7\u0995\u09C7 \u09B6\u09C1\u09B0\u09C1 \u0995\u09B0\u09C7 \u09A1\u09C7\u09B2\u09BF\u09AD\u09BE\u09B0\u09BF \u0986\u09AA\u09A1\u09C7\u099F \u2014 \u09B8\u09AC \u09AE\u09C7\u09B8\u09C7\u099C \u09AF\u09BE\u09AC\u09C7 \u0985\u099F\u09CB\u09AE\u09C7\u099F\u09BF\u0995\u0964 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0986\u09B0 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C1\u09AF\u09BC\u09BE\u09B2\u09BF \u0995\u09B2 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7 \u09A8\u09BE\u0964" }), _jsxs("div", { className: "mb-10", children: [_jsx("p", { className: "text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold", children: "Powering Your Messages" }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2 text-gray-300 font-semibold bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700", children: [_jsx("div", { className: "w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold", children: "W" }), "WhatsApp Cloud API"] }), _jsxs("div", { className: "flex items-center gap-2 text-gray-300 font-semibold bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700", children: [_jsx("div", { className: "w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold", children: "S" }), "SSL Wireless"] })] })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                    { label: 'Order Confirmation', icon: Check },
                                    { label: 'Shipping Updates', icon: Truck },
                                    { label: 'Cart Recovery (HUGE!)', icon: Zap },
                                    { label: 'Birthday Wishes', icon: Gift },
                                ].map((item, idx) => (_jsxs("div", { className: "flex items-center gap-2 text-gray-300", children: [_jsx("div", { className: "w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center", children: _jsx(item.icon, { className: "w-3 h-3 text-green-400" }) }), item.label] }, idx))) })] }), _jsxs("div", { className: "relative mx-auto", children: [_jsx("div", { className: "absolute inset-0 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" }), _jsxs("div", { className: "relative w-[320px] mx-auto h-[640px] bg-gray-900 border-[8px] border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden", children: [_jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-800 rounded-b-2xl z-20" }), _jsxs("div", { className: "h-8 bg-gray-900 w-full z-10 relative flex justify-between items-center px-6 pt-2", children: [_jsx("span", { className: "text-[10px] text-white", children: "9:41" }), _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-white/20" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-white/20" })] })] }), _jsxs("div", { className: "bg-[#075E54] p-4 pt-4 text-white flex items-center gap-3 shadow-md z-10 relative", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs", children: _jsx("div", { className: "w-8 h-8 rounded-full overflow-hidden bg-white", children: _jsx("img", { src: ASSETS.brand.icon, alt: "Store", className: "w-full h-full object-cover", onError: (e) => (e.currentTarget.src = 'https://placehold.co/40x40') }) }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-sm", children: "Your Store Name" }), _jsx("p", { className: "text-[10px] opacity-80", children: "Official Business Account" })] })] }), _jsxs("div", { className: "p-4 space-y-4 bg-[#ece5dd] h-full", style: { backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', opacity: 0.9 }, children: [_jsx("div", { className: "flex justify-center my-2", children: _jsx("span", { className: "bg-[#dcf8c6] text-gray-600 text-[10px] px-2 py-1 rounded shadow-sm", children: "Today" }) }), messages.map((msg, idx) => (_jsx("div", { className: "flex flex-col gap-1 items-start max-w-[85%]", children: _jsxs("div", { className: "bg-white rounded-lg rounded-tl-none p-3 shadow-sm text-xs text-gray-800 relative group", children: [msg.content, _jsx("span", { className: "absolute bottom-1 right-2 text-[9px] text-gray-400", children: msg.time })] }) }, idx))), activeMessage < messages.length - 1 && (_jsx("div", { className: "bg-white px-3 py-2 rounded-full w-fit shadow-sm", children: _jsxs("div", { className: "flex gap-1", children: [_jsx("div", { className: "w-1.5 h-1.5 bg-gray-400 rounded-full -bounce" }), _jsx("div", { className: "w-1.5 h-1.5 bg-gray-400 rounded-full -bounce delay-100" }), _jsx("div", { className: "w-1.5 h-1.5 bg-gray-400 rounded-full -bounce delay-200" })] }) }))] })] }), _jsxs("div", { className: "absolute top-1/2 -right-12 translate-y-1/2 bg-white text-gray-900 p-4 rounded-xl shadow-2xl border border-gray-100 hidden md:block w-48", children: [_jsx("h4", { className: "text-xs font-bold text-gray-500 uppercase mb-2", children: "Impact" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs font-medium mb-1", children: [_jsx("span", { children: "Open Rate" }), _jsx("span", { className: "text-green-600", children: "98%" })] }), _jsx("div", { className: "h-1.5 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-green-500 w-[98%]" }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs font-medium mb-1", children: [_jsx("span", { children: "Cart Recovery" }), _jsx("span", { className: "text-blue-600", children: "+25%" })] }), _jsx("div", { className: "h-1.5 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-blue-500 w-[25%]" }) })] })] })] })] })] }) }) }));
}
