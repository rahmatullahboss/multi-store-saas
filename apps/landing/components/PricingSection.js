import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * UI/UX Pro Max - Pricing Section
 *
 * Implements "Value-Based Pricing" model with Liquid Glass aesthetics.
 * Visualizes the massive value provided vs the low cost.
 */
import { useState } from 'react';
import { Check, Sparkles, Zap, Shield, CreditCard, Globe, BarChart3, MessageSquare, ArrowRight, Layout, } from 'lucide-react';
import { BRAND } from '@/config/branding';
import { ASSETS } from '@/config/assets';
import { useTranslation, useFormatPrice } from '@/app/contexts/LanguageContext';
// ============================================================================
// MARKET VALUE STACK
// ============================================================================
const ValueItem = ({ icon: Icon, title, value, color, delay, }) => {
    const { lang } = useTranslation();
    return (_jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl mb-3 border backdrop-blur-md relative overflow-hidden group", style: {
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
        }, children: [_jsx("div", { className: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", style: { background: `linear-gradient(90deg, transparent, ${color}10, transparent)` } }), _jsxs("div", { className: "flex items-center gap-4 relative z-10", children: [_jsx("div", { className: "w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/5", style: { color }, children: _jsx(Icon, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white/90 text-sm md:text-base", children: title }), _jsx("div", { className: "text-xs text-white/40", children: lang === 'bn' ? 'মার্কেট স্ট্যান্ডার্ড' : 'Market Standard' })] })] }), _jsxs("div", { className: "text-right relative z-10", children: [_jsx("div", { className: "font-bold text-white/90 font-mono", children: value }), _jsx("div", { className: "text-[10px] text-white/30 uppercase tracking-wider", children: lang === 'bn' ? 'প্রতি মাস' : 'Per Month' })] })] }));
};
// ============================================================================
// PRICING CARD
// ============================================================================
const PricingCard = ({ plan, isAnnual }) => {
    const { lang } = useTranslation();
    const formatPrice = useFormatPrice();
    const isPopular = plan.popular;
    const price = isAnnual ? plan.price.annual : plan.price.monthly;
    // Format price display
    const displayPrice = price === -1
        ? lang === 'bn'
            ? 'কাস্টম'
            : 'Custom'
        : price === 0
            ? lang === 'bn'
                ? 'ফ্রি'
                : 'Free'
            : formatPrice(price).replace('.00', '');
    return (_jsxs("div", { className: `relative p-8 rounded-[32px] border h-full flex flex-col ${isPopular
            ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-emerald-500/50 shadow-2xl shadow-emerald-900/20'
            : 'bg-[#0A0A12]/80 border-white/10'}`, children: [isPopular && (_jsxs("div", { className: "absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20", children: [_jsx(Sparkles, { className: "w-3 h-3 text-black" }), lang === 'bn' ? 'জনপ্রিয়' : 'Best Value'] })), isPopular && (_jsxs("div", { className: "absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none", children: [_jsx("div", { className: "absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-[80px]" }), _jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 mix-blend-overlay" })] })), _jsxs("div", { className: "mb-8 relative z-10", children: [_jsx("h3", { className: `text-xl font-bold mb-2 ${isPopular ? 'text-emerald-400' : 'text-white'}`, children: plan.name }), _jsx("p", { className: "text-sm text-white/50 min-h-[40px]", children: plan.description })] }), _jsxs("div", { className: "mb-8 relative z-10", children: [_jsxs("div", { className: "flex items-end gap-1", children: [_jsx("span", { className: `text-4xl md:text-5xl font-bold text-white ${lang === 'bn' ? 'font-bengali' : ''}`, children: displayPrice }), _jsx("span", { className: "text-white/40 mb-1", children: price !== -1 && (lang === 'bn' ? '/মাস' : '/month') })] }), isAnnual && price !== -1 && (_jsxs("div", { className: "text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1", children: [_jsx(Zap, { className: "w-3 h-3" }), lang === 'bn' ? 'বার্ষিক প্ল্যানে ২০% ছাড়' : 'Save 20% with annual billing'] }))] }), _jsx("div", { className: "space-y-4 mb-8 flex-1 relative z-10", children: plan.features.map((feature, idx) => (_jsxs("div", { className: "flex items-start gap-3 text-sm text-white/80", children: [_jsx("div", { className: `mt-1 p-0.5 rounded-full ${isPopular ? 'bg-emerald-500/20' : 'bg-white/10'}`, children: _jsx(Check, { className: `w-3 h-3 ${isPopular ? 'text-emerald-400' : 'text-white/70'}` }) }), _jsx("span", { children: feature })] }, idx))) }), _jsxs("a", { href: plan.href, className: `w-full py-4 rounded-2xl font-bold text-sm transition-all relative z-10 group overflow-hidden flex items-center justify-center ${isPopular
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg hover:shadow-emerald-500/25'
                    : 'bg-white/10 text-white hover:bg-white/20'}`, children: [_jsxs("span", { className: "relative z-10 flex items-center justify-center gap-2", children: [plan.cta, _jsx(ArrowRight, { className: "w-4 h-4 group-hover:translate-x-1 transition-transform" })] }), isPopular && (_jsx("div", { className: "absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" }))] })] }));
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function PricingSection() {
    const { lang } = useTranslation();
    const [isAnnual, setIsAnnual] = useState(true);
    const TEXT = {
        en: {
            marketCost: 'Market Cost',
            marketSub: 'If you bought these tools separately...',
            monthlyCost: 'Monthly Cost',
            brandSub: 'All-in-One Platform',
            startPrice: 'Free',
            startSub: 'To Start',
            save97: '97% Cheaper than market',
            noSkill: 'No technical skills needed',
            monthly: 'Monthly',
            annual: 'Annual',
            save20: '-20%',
            guarantee: '14-Day Money Back Guarantee — No questions asked',
            headerTag: 'Unbeatable Value',
            headerTitle: 'Simple Pricing,',
            headerHighlight: 'Massive ROI',
            headerDesc: "We've bundled everything you need to succeed. No hidden fees.",
            marketTotal: '62,000+',
        },
        bn: {
            marketCost: 'মার্কেট কস্ট',
            marketSub: 'যদি আপনি এই টুলগুলো আলাদা আলাদা কিনতেন...',
            monthlyCost: 'মাসিক খরচ',
            brandSub: 'অল-ইন-ওয়ান প্ল্যাটফর্ম',
            startPrice: 'ফ্রি',
            startSub: 'দিয়ে শুরু করুন',
            save97: 'মার্কেট থেকে ৯৭% সাশ্রয়ী',
            noSkill: 'কোনো টেকনিক্যাল নলেজ লাগবে না',
            monthly: 'মাসিক',
            annual: 'বাৎসরিক',
            save20: '-২০%',
            guarantee: '১৪ দিনের মানিব্যাক গ্যারান্টি — কোনো প্রশ্ন করা হবে না',
            headerTag: 'অবিশ্বাস্য ভ্যালু',
            headerTitle: 'সহজ প্রাইসিং,',
            headerHighlight: 'সেরা রিটার্ন',
            headerDesc: 'সাফল্যের জন্য প্রয়োজনীয় সবকিছু পাচ্ছেন এক প্যাকেজে। কোনো গোপন চার্জ নেই।',
            marketTotal: '৬২,০০০+',
        },
    }[lang === 'bn' ? 'bn' : 'en'];
    const marketValues = lang === 'bn'
        ? [
            {
                title: 'প্রিমিয়াম ই-কমার্স ওয়েবসাইট',
                value: '৳৫০,০০০+',
                icon: Globe,
                color: '#3B82F6',
            },
            { title: 'ল্যান্ডিং পেজ বিল্ডার', value: '৳৫,০০০', icon: Layout, color: '#A855F7' },
            { title: 'হোস্টিং এবং সার্ভার', value: '৳২,০০০', icon: CreditCard, color: '#F97316' },
            { title: 'ইনভেন্টরি ম্যানেজমেন্ট', value: '৳৩,০০০', icon: BarChart3, color: '#10B981' },
            {
                title: 'মার্কেটিং টুলস (SMS/Email)',
                value: '৳২,০০০',
                icon: MessageSquare,
                color: '#EF4444',
            },
        ]
        : [
            { title: 'Premium E-commerce Website', value: '৳50,000+', icon: Globe, color: '#3B82F6' },
            { title: 'Landing Page Builder', value: '৳5,000', icon: Layout, color: '#A855F7' },
            { title: 'Hosting & Server', value: '৳2,000', icon: CreditCard, color: '#F97316' },
            { title: 'Inventory Management', value: '৳3,000', icon: BarChart3, color: '#10B981' },
            {
                title: 'Marketing Tools (SMS/Email)',
                value: '৳2,000',
                icon: MessageSquare,
                color: '#EF4444',
            },
        ];
    const plans = [
        {
            name: lang === 'bn' ? 'ফ্রি স্টার্টার' : 'Free Starter',
            description: lang === 'bn' ? 'ব্যবসা শুরু করার জন্য পারফেক্ট।' : 'Perfect for testing the waters.',
            price: { monthly: 0, annual: 0 },
            features: lang === 'bn'
                ? ['২০টি প্রোডাক্ট লিমিট', '৫০টি অর্ডার লিমিট', 'ফুল স্টোর মোড', 'ফেসবুক CAPI', 'বিকাশ ও নগদ', 'ফ্রড ডিটেকশন']
                : ['20 Products Limit', '50 Orders Limit', 'Full Store Mode', 'Facebook CAPI', 'bKash & Nagad', 'Fraud Detection'],
            cta: lang === 'bn' ? 'বিনামূল্যে শুরু করুন →' : 'Start for Free →',
            popular: false,
            href: 'https://app.ozzyl.com/auth/register',
        },
        {
            name: lang === 'bn' ? 'স্টার্টার' : 'Starter',
            description: lang === 'bn' ? 'লঞ্চ করার জন্য যা যা প্রয়োজন।' : 'Everything you need to launch.',
            price: { monthly: 799, annual: 639 },
            features: lang === 'bn'
                ? [
                    '৫০টি প্রোডাক্ট',
                    '৫০০ অর্ডার লিমিট',
                    '৩টি প্রিমিয়াম থিম',
                    'কাস্টম ডোমেইন',
                    'স্ট্যান্ডার্ড অ্যানালিটিক্স',
                ]
                : [
                    '50 Products',
                    '500 Orders Limit',
                    'All Themes Access',
                    'Custom Domain',
                    'Standard Analytics',
                ],
            cta: lang === 'bn' ? 'স্টার্টার প্ল্যান নিন →' : 'Get Starter →',
            popular: false,
            href: 'https://app.ozzyl.com/auth/register?plan=starter',
        },
        {
            name: lang === 'bn' ? 'প্রিমিয়াম' : 'Premium',
            description: lang === 'bn' ? 'গ্রোইং ব্যবসার জন্য সেরা পছন্দ।' : 'Best for growing businesses.',
            price: { monthly: 1999, annual: 1599 },
            features: lang === 'bn'
                ? [
                    'আনলিমিটেড প্রোডাক্ট',
                    '২,০০০ অর্ডার লিমিট',
                    'সব প্রিমিয়াম থিম',
                    'মার্কেটিং অটোমেশন',
                    'প্রায়োরিটি সাপোর্ট',
                ]
                : [
                    'Unlimited Products',
                    '2,000 Orders Limit',
                    'All Premium Themes',
                    'Marketing Automation',
                    'Priority Support',
                ],
            cta: lang === 'bn' ? 'প্রিমিয়াম প্ল্যান নিন' : 'Get Premium',
            popular: true,
            href: 'https://app.ozzyl.com/auth/register?plan=premium',
        },
        {
            name: lang === 'bn' ? 'বিজনেস' : 'Business',
            description: lang === 'bn' ? 'বড় টিম এবং ভলিউম সেলারদের জন্য।' : 'For high-volume sellers & teams.',
            price: { monthly: -1, annual: -1 },
            features: lang === 'bn'
                ? [
                    'সব প্রিমিয়াম ফিচার',
                    'টিম মেম্বার একাউন্ট',
                    'অ্যাডভান্সড অ্যানালিটিক্স',
                    'ডেডিকেটেড ম্যানেজার',
                    'API এক্সেস',
                ]
                : [
                    'Everything in Premium',
                    'Team Member Accounts',
                    'Advanced Analytics',
                    'Dedicated Manager',
                    'API Access',
                ],
            cta: lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন →' : 'Contact Sales →',
            popular: false,
            href: 'mailto:contact@ozzyl.com?subject=Business Plan Inquiry',
        },
    ];
    return (_jsxs("section", { className: "py-24 px-4 bg-[#0A0A12] relative overflow-hidden", children: [_jsxs("div", { className: "absolute inset-0 bg-[#0A0A12]", children: [_jsx("div", { className: "absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen" }), _jsx("div", { className: "absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full mix-blend-screen" })] }), _jsxs("div", { className: "max-w-7xl mx-auto relative z-10", children: [_jsxs("div", { className: "text-center mb-20", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 backdrop-blur-sm", children: [_jsx(Zap, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { className: "text-sm font-medium text-emerald-300", children: TEXT.headerTag })] }), _jsxs("h2", { className: `text-3xl md:text-5xl font-bold text-white mb-6 ${lang === 'bn' ? 'font-bengali' : ''}`, children: [TEXT.headerTitle, ' ', _jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400", children: TEXT.headerHighlight })] }), _jsx("p", { className: "text-white/60 max-w-2xl mx-auto text-lg", children: TEXT.headerDesc })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24 items-center", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute -left-10 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-red-500/20 rounded-full hidden md:block" }), _jsxs("div", { className: "mb-8 pl-0 md:pl-6", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: TEXT.marketCost }), _jsx("p", { className: "text-white/50 text-sm", children: TEXT.marketSub })] }), _jsxs("div", { className: "space-y-4 relative", children: [marketValues.map((item, idx) => (_jsx(ValueItem, { ...item, delay: idx * 0.1 }, idx))), _jsxs("div", { className: "pt-6 mt-6 border-t border-white/10 flex justify-between items-end pl-4 pr-4", children: [_jsx("div", { className: "text-white/50 font-medium", children: TEXT.monthlyCost }), _jsxs("div", { className: "text-3xl font-bold text-red-400 line-through decoration-red-400/50", children: ["\u09F3", TEXT.marketTotal] })] })] })] }), _jsxs("div", { className: "relative p-8 rounded-[40px] border border-emerald-500/30 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 backdrop-blur-md overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" }), _jsx("div", { className: "absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 blur-[100px]" }), _jsxs("div", { className: "relative z-10 text-center", children: [_jsx("div", { className: "w-32 h-32 mx-auto bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-8 transform rotate-3", children: _jsx("img", { src: ASSETS.brand.icon, alt: BRAND.name, className: "w-28 h-28 object-contain brightness-0" }) }), _jsx("h3", { className: "text-3xl font-bold text-white mb-2", children: BRAND.name }), _jsx("p", { className: "text-emerald-300 font-medium mb-8", children: TEXT.brandSub }), _jsx("div", { className: `text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 mb-4 tracking-tight pt-2 pb-1 leading-normal ${lang === 'bn' ? 'font-bengali' : ''}`, children: TEXT.startPrice }), _jsx("p", { className: "text-white/50 uppercase tracking-widest text-xs font-bold mb-10", children: TEXT.startSub }), _jsxs("div", { className: "inline-flex flex-col gap-2 w-full max-w-sm", children: [_jsxs("div", { className: "flex items-center gap-3 text-white/80 bg-white/5 px-4 py-3 rounded-lg border border-white/5", children: [_jsx(Check, { className: "w-5 h-5 text-emerald-400" }), _jsx("span", { className: "text-sm font-medium", children: TEXT.save97 })] }), _jsxs("div", { className: "flex items-center gap-3 text-white/80 bg-white/5 px-4 py-3 rounded-lg border border-white/5", children: [_jsx(Check, { className: "w-5 h-5 text-emerald-400" }), _jsx("span", { className: "text-sm font-medium", children: TEXT.noSkill })] })] })] })] })] }), _jsx("div", { className: "flex justify-center mb-16", children: _jsxs("div", { className: "bg-white/5 p-1 rounded-xl flex items-center relative border border-white/10", children: [_jsx("button", { onClick: () => setIsAnnual(false), className: `px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 ${!isAnnual ? 'text-black bg-white shadow-lg' : 'text-white/60 hover:text-white'}`, children: TEXT.monthly }), _jsxs("button", { onClick: () => setIsAnnual(true), className: `px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative z-10 flex items-center gap-2 ${isAnnual ? 'text-black bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'text-white/60 hover:text-white'}`, children: [TEXT.annual, _jsx("span", { className: `text-[10px] items-center px-1.5 py-0.5 rounded-full font-bold ${isAnnual ? 'bg-black/20 text-black' : 'bg-emerald-500 text-black'}`, children: TEXT.save20 })] })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-4", children: plans.map((plan, idx) => (_jsx("div", { className: "h-full", children: _jsx(PricingCard, { plan: plan, isAnnual: isAnnual }) }, idx))) }), _jsx("div", { className: "mt-20 max-w-3xl mx-auto text-center", children: _jsxs("div", { className: "inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20", children: [_jsx(Shield, { className: "w-5 h-5 text-emerald-400" }), _jsx("span", { className: "text-sm font-medium text-emerald-100", children: TEXT.guarantee })] }) })] })] }));
}
export default PricingSection;
