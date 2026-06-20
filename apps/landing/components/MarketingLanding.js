import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SaaS Marketing Landing Page - NEXT.JS 16 OPTIMIZED VERSION
 *
 * Performance optimizations (Vercel React Best Practices):
 * - Better dynamic imports with conditional loading
 * - Reduced LazySection overhead
 * - Content-visibility for long sections
 * - useMemo for expensive computations
 * - Reduced re-renders
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { Rocket } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ClientOnly } from '@/components/LazySection';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { Footer } from '@/components/Footer';
// ============================================================================
// CRITICAL - Load immediately (above the fold)
// ============================================================================
import { MarketingHeader } from '@/components/MarketingHeader';
import { AwardWinningHero } from '@/components/AwardWinningHero';
import { FraudDetectionSection } from '@/components/FraudDetectionSection';
import { ProblemSolutionSection } from '@/components/ProblemSolutionSection';
import { AIShowcaseSection } from '@/components/landing/AIShowcaseSection';
import { BentoFeaturesSection } from '@/components/BentoFeaturesSection';
import { ComparisonSection } from '@/components/ComparisonSection';
import { FAQSection } from '@/components/FAQSection';
import { FinalCTA } from '@/components/FinalCTA';
import { CustomerBenefitsSection } from '@/components/landing/CustomerBenefitsSection';
import { CourierIntegrationSection } from '@/components/landing/CourierIntegrationSection';
import { AIPoweredFinalCTA } from '@/components/landing/AIPoweredFinalCTA';
import { PaymentIntegrationSection } from '@/components/landing/PaymentIntegrationSection';
import { PricingSection } from '@/components/PricingSection';
// ============================================================================
// OPTIMIZED DYNAMIC IMPORTS
// ============================================================================
// Simple skeleton - minimal animation
const SectionSkeleton = () => (_jsx("div", { className: "w-full py-16 animate-pulse", children: _jsxs("div", { className: "max-w-6xl mx-auto px-4", children: [_jsx("div", { className: "h-8 bg-gray-800/20 rounded-lg w-1/3 mx-auto mb-8" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [1, 2, 3].map((i) => (_jsx("div", { className: "h-48 bg-gray-800/10 rounded-xl" }, i))) })] }) }));
function LazySectionWrapper({ children, minHeight = '400px', className = '', }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '200px' } // Start loading 200px before viewport
        );
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => observer.disconnect();
    }, []);
    return (_jsx("div", { ref: ref, style: {
            minHeight: isVisible ? undefined : minHeight,
            contain: 'layout style',
            contentVisibility: isVisible ? 'visible' : 'auto',
        }, className: className, children: isVisible ? children : _jsx(SectionSkeleton, {}) }));
}
// ============================================================================
// MAIN COMPONENT - Optimized
// ============================================================================
export function MarketingLanding({ stats }) {
    const { t } = useTranslation();
    // Memoize stats to prevent unnecessary re-renders
    const marketingStats = useMemo(() => stats || {
        totalUsers: 15420,
        totalStores: 850,
        uptime: 99.99,
    }, [stats]);
    return (_jsxs("div", { className: "min-h-screen overflow-hidden bg-[#0A0A0F]", children: [_jsx(MarketingHeader, {}), _jsx(AwardWinningHero, { theme: "dark", totalUsers: marketingStats?.totalUsers }), _jsx(LazySectionWrapper, { minHeight: "300px", children: _jsx(ProblemSolutionSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "600px", children: _jsx(AIShowcaseSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "400px", children: _jsx(BentoFeaturesSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "500px", children: _jsx(FraudDetectionSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "400px", children: _jsx(PaymentIntegrationSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "600px", children: _jsx(CourierIntegrationSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "600px", children: _jsx(CustomerBenefitsSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "400px", children: _jsx(ComparisonSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "600px", children: _jsx(PricingSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "400px", children: _jsx(FAQSection, {}) }), _jsx(LazySectionWrapper, { minHeight: "300px", children: _jsx(AIPoweredFinalCTA, {}) }), _jsx(LazySectionWrapper, { minHeight: "300px", children: _jsx(FinalCTA, { stats: marketingStats }) }), _jsx(Footer, {}), _jsx("div", { className: "fixed bottom-6 right-6 z-40", children: _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm sm:text-base shadow-xl shadow-[#006A4E]/40 hover:shadow-2xl hover:shadow-[#006A4E]/50 active:scale-[0.95] hover:scale-[1.05] transition-all duration-200", children: [_jsx(Rocket, { className: "w-4 h-4 sm:w-5 sm:h-5" }), t('getStarted')] }) }), _jsx(ClientOnly, { children: _jsx(OzzylAIChatWidget, {}) })] }));
}
