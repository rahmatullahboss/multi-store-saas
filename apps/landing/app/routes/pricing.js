import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MarketingHeader } from '@/components/MarketingHeader';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { ClientOnly } from '@/components/LazySection';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
export const meta = () => [
    { title: 'মূল্য তালিকা - Ozzyl | সাশ্রয়ী ই-কমার্স সমাধান' },
    {
        name: 'description',
        content: 'Ozzyl এর মূল্য তালিকা দেখুন। ছোট ব্যবসা থেকে বড় এন্টারপ্রাইজ - সবার জন্য সাশ্রয়ী প্যাকেজ।',
    },
];
export default function PricingPage() {
    return (_jsxs("div", { className: "min-h-screen bg-[#0A0A0F]", children: [_jsx(MarketingHeader, {}), _jsx("div", { className: "pt-20", children: _jsx(PricingSection, {}) }), _jsx(Footer, {}), _jsx(ClientOnly, { children: _jsx(OzzylAIChatWidget, {}) })] }));
}
