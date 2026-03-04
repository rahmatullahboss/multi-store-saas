import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { Layers, Zap } from 'lucide-react';
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
export function UnifiedCommunicationHub() {
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    const channels = [
        { name: 'WhatsApp', icon: '📱', color: 'bg-green-500' },
        { name: 'Email', icon: '📧', color: 'bg-blue-500' },
        { name: 'SMS', icon: '💬', color: 'bg-indigo-500' },
        { name: 'Messenger', icon: '⚡', color: 'bg-sky-500' },
    ];
    return (_jsxs("div", { className: "py-24 bg-[#0A0A0F] relative overflow-hidden", ref: containerRef, children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0A0A0F] to-[#0A0A0F] pointer-events-none" }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6", children: [_jsx(Layers, { className: "w-4 h-4 text-white" }), _jsx("span", { className: "text-sm font-semibold text-white", children: "All-in-One Hub" })] }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-white mb-6", children: ["\u09B8\u09AC Channel \u2014 ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400", children: "\u098F\u0995 Dashboard \u098F!" })] }), _jsx("p", { className: "text-xl text-gray-400 max-w-2xl mx-auto", children: "\u0986\u09B2\u09BE\u09A6\u09BE \u0986\u09B2\u09BE\u09A6\u09BE \u09AA\u09C7\u099C \u09AC\u09BE \u0985\u09CD\u09AF\u09BE\u09AA\u09C7 \u09B2\u0997\u0987\u09A8 \u0995\u09B0\u09BE\u09B0 \u09A6\u09B0\u0995\u09BE\u09B0 \u09A8\u09C7\u0987\u0964 \u09B8\u09AC \u0995\u09BE\u09B8\u09CD\u099F\u09AE\u09BE\u09B0 \u0995\u09AE\u09BF\u0989\u09A8\u09BF\u0995\u09C7\u09B6\u09A8 \u098F\u0995 \u099C\u09BE\u09AF\u09BC\u0997\u09BE \u09A5\u09C7\u0995\u09C7 \u09AE\u09CD\u09AF\u09BE\u09A8\u09C7\u099C \u0995\u09B0\u09C1\u09A8\u0964" })] }), _jsxs("div", { className: "relative h-[500px] flex items-center justify-center", children: [_jsxs("div", { className: "z-20 bg-gray-900 border border-gray-700 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] relative", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg", children: _jsx(Zap, { className: "w-8 h-8 fill-white" }) }), _jsx("h3", { className: "text-white font-bold text-lg", children: "Unified Hub" }), _jsx("p", { className: "text-xs text-gray-500", children: "Central Control" }), _jsx("div", { className: "absolute inset-0 border border-blue-500/30 rounded-full -ping opacity-20", style: { animationDuration: '3s' } }), _jsx("div", { className: "absolute -inset-4 border border-purple-500/20 rounded-full -pulse" })] }), channels.map((channel, idx) => {
                                // Calculate position in circle
                                const angle = (idx * (360 / channels.length)) * (Math.PI / 180);
                                const radius = 160; // Distance from center
                                const x = Math.cos(angle) * radius;
                                const y = Math.sin(angle) * radius;
                                return (_jsxs("div", { className: "absolute z-10 hidden md:flex flex-col items-center", children: [_jsx("div", { className: "absolute top-1/2 left-1/2 w-0.5 bg-gradient-to-b from-gray-700 to-transparent -z-10 origin-top", style: {
                                                transform: `rotate(${idx * 90 + 90}deg) translateY(24px)`,
                                                height: '100px' // Visual line (simplified, actual drawing lines in CSS/SVG is better but this works for simple viz)
                                            } }), _jsxs("div", { className: "bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-xl flex flex-col items-center w-32 backdrop-blur-sm", children: [_jsx("div", { className: `w-10 h-10 ${channel.color} rounded-full flex items-center justify-center text-lg mb-2 shadow-lg`, children: channel.icon }), _jsx("span", { className: "text-white font-semibold text-sm", children: channel.name })] })] }, idx));
                            }), _jsx("div", { className: "md:hidden grid grid-cols-2 gap-4 w-full", children: channels.map((channel, idx) => (_jsxs("div", { className: "bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center", children: [_jsx("div", { className: `w-10 h-10 ${channel.color} rounded-full flex items-center justify-center text-lg mb-2`, children: channel.icon }), _jsx("span", { className: "text-white font-medium", children: channel.name })] }, idx))) })] }), _jsx("div", { className: "mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 max-w-4xl mx-auto", children: _jsxs("div", { className: "flex flex-col md:flex-row justify-between items-center gap-8", children: [_jsxs("div", { className: "text-center md:text-left", children: [_jsx("h4", { className: "text-gray-400 text-sm uppercase tracking-wider font-semibold mb-2", children: "Total Monthly Cost (Competitors)" }), _jsxs("div", { className: "space-y-1 text-gray-500 text-sm", children: [_jsx("p", { children: "Mailchimp: \u09F32,000" }), _jsx("p", { children: "WA Business API: \u09F35,000" }), _jsx("p", { children: "SMS Gateway: \u09F31,500" })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-gray-700", children: _jsx("p", { className: "text-xl font-bold text-red-400", children: "Total: \u09F38,500 / month" }) })] }), _jsx("div", { className: "hidden md:block h-24 w-px bg-gray-700" }), _jsxs("div", { className: "text-center md:text-right", children: [_jsx("h4", { className: "text-blue-400 text-sm uppercase tracking-wider font-semibold mb-2", children: "With Ozzyl" }), _jsxs("p", { className: "text-4xl font-bold text-white mb-2", children: ["\u09F3499 ", _jsx("span", { className: "text-sm text-gray-400 font-normal", children: "/ month" })] }), _jsx("span", { className: "bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold", children: "ALL INCLUDED" })] })] }) })] })] }));
}
