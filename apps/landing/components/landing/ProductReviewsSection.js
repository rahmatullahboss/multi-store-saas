import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { Star, CheckCircle2, Camera } from 'lucide-react';
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
export function ProductReviewsSection() {
    const containerRef = useRef(null);
    const isInView = useInViewSimple(containerRef);
    const reviews = [
        { name: 'আরিফ হোসেন', rating: 5, date: '2 days ago', text: 'দারুণ Quality! Delivery ও অনেক দ্রুত হয়েছে। আবার কিনব।', verified: true, photo: true },
        { name: 'সাবরিনা আক্তার', rating: 4, date: '5 days ago', text: 'Product ভালো, তবে Size একটু বড় হয়ে গেছে।', verified: true, photo: false },
        { name: 'তানভীর আহমেদ', rating: 5, date: '1 week ago', text: 'Best product at this price point. Highly recommended!', verified: true, photo: true },
    ];
    return (_jsx("div", { className: "py-24 bg-[#0F1115] relative overflow-hidden", ref: containerRef, children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-yellow-400" }), _jsx("span", { className: "text-sm font-semibold text-yellow-400", children: "Trust Builder" })] }), _jsxs("h2", { className: "text-4xl lg:text-5xl font-bold text-white mb-6", children: ["Customer \u098F\u09B0 \u0995\u09A5\u09BE\u0987 \u2014 ", _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400", children: "\u0986\u09B8\u09B2 Proof" })] }), _jsx("p", { className: "text-xl text-gray-400 max-w-2xl mx-auto", children: "Social Proof \u09B8\u09C7\u09B2\u09B8 \u09AC\u09BE\u09A1\u09BC\u09BE\u09AF\u09BC\u0964 \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AC\u09BF\u09B2\u09CD\u099F-\u0987\u09A8 \u09B0\u09BF\u09AD\u09BF\u0989 \u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A6\u09BF\u09AF\u09BC\u09C7 \u09AC\u09BF\u09B6\u09CD\u09AC\u09BE\u09B8 \u0985\u09B0\u09CD\u099C\u09A8 \u0995\u09B0\u09C1\u09A8\u0964" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-8 flex flex-col justify-center items-center text-center shadow-lg", children: [_jsx("h3", { className: "text-6xl font-black text-white mb-2", children: "4.8" }), _jsx("div", { className: "flex gap-1 mb-4", children: [1, 2, 3, 4, 5].map(i => _jsx(Star, { className: "w-6 h-6 text-yellow-400 fill-yellow-400" }, i)) }), _jsx("p", { className: "text-gray-400 mb-8", children: "Based on 482 Reviews" }), _jsx("div", { className: "w-full space-y-3", children: [5, 4, 3, 2, 1].map((star) => (_jsxs("div", { className: "flex items-center gap-3 w-full", children: [_jsxs("div", { className: "flex items-center gap-1 w-12 flex-shrink-0", children: [_jsx("span", { className: "text-sm font-medium text-gray-300", children: star }), _jsx(Star, { className: "w-3 h-3 text-gray-500" })] }), _jsx("div", { className: "flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-yellow-400 rounded-full" }) }), _jsx("span", { className: "text-xs text-gray-500 w-8 text-right", children: star === 5 ? '85%' : star === 4 ? '10%' : '2%' })] }, star))) })] }), _jsx("div", { className: "md:col-span-2 space-y-6", children: reviews.map((review, idx) => (_jsxs("div", { className: "bg-gray-800/50 border border-gray-700 rounded-2xl p-6 relative hover:bg-gray-800 transition-colors", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg", children: review.name[0] }), _jsxs("div", { children: [_jsxs("h4", { className: "font-bold text-white text-md flex items-center gap-2", children: [review.name, review.verified && _jsx(CheckCircle2, { className: "w-4 h-4 text-green-400" })] }), _jsx("p", { className: "text-xs text-gray-500", children: review.date })] })] }), _jsx("div", { className: "flex text-yellow-500", children: [...Array(review.rating)].map((_, i) => _jsx(Star, { className: "w-4 h-4 fill-yellow-500" }, i)) })] }), _jsx("p", { className: "text-gray-300 mb-4", children: review.text }), review.photo && (_jsx("div", { className: "flex gap-2 mb-4", children: _jsx("div", { className: "w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center text-gray-500", children: _jsx(Camera, { className: "w-5 h-5" }) }) })), review.verified && (_jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), " Verified Purchase"] }))] }, idx))) })] }), _jsxs("div", { className: "mt-12 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-bold text-white", children: "Impact on Conversion" }), _jsx("p", { className: "text-gray-400 text-sm", children: "Products with reviews convert up to 270% better!" })] }), _jsxs("div", { className: "flex gap-8", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-white mb-1", children: "93%" }), _jsx("p", { className: "text-xs text-gray-500 uppercase", children: "Customers Read Reviews" })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-white mb-1", children: "65%" }), _jsx("p", { className: "text-xs text-gray-500 uppercase", children: "Trust Photo Reviews" })] })] })] })] }) }));
}
