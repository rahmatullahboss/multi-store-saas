import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Infrastructure CTA Section
 *
 * Final call-to-action for the infrastructure showcase.
 * "এই Enterprise Technology ব্যবহার করুন — FREE!"
 */
import { useRef } from 'react';
import { ArrowRight, Sparkles, Zap, Shield, Globe, Clock } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { useInView } from '@/hooks/useInView';
// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
    primary: '#006A4E',
    primaryLight: '#00875F',
    accent: '#F9A825',
    cyan: '#22D3EE',
    green: '#10B981',
    background: '#0A0F0D',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.6)',
};
// ============================================================================
// BENEFIT PILL
// ============================================================================
const BenefitPill = ({ icon: Icon, text }) => (_jsxs("div", { className: "flex items-center gap-2 px-4 py-2 rounded-full transition-transform duration-200 hover:scale-[1.03]", style: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
    }, children: [_jsx(Icon, { className: "w-4 h-4 text-green-400" }), _jsx("span", { className: "text-sm text-white/80", children: text })] }));
// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function InfrastructureCTA() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, rootMargin: '-100px' });
    const { t } = useTranslation();
    return (_jsxs("section", { ref: sectionRef, className: "relative py-16 md:py-20 overflow-hidden", style: {
            background: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.background} 50%, ${COLORS.cyan}10 100%)`,
        }, children: [_jsx("div", { className: "absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl -float-x", style: { background: `${COLORS.primary}20` } }), _jsx("div", { className: "absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl -float-reverse", style: { background: `${COLORS.cyan}20` } }), _jsxs("div", { className: "relative z-10 max-w-4xl mx-auto px-6 text-center", children: [_jsxs("div", { className: `inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: {
                            background: `linear-gradient(135deg, ${COLORS.accent}20 0%, ${COLORS.accent}10 100%)`,
                            border: `1px solid ${COLORS.accent}40`,
                        }, children: [_jsx("div", { className: "animate-wiggle", children: _jsx(Sparkles, { className: "w-4 h-4", style: { color: COLORS.accent } }) }), _jsxs("span", { className: "text-sm font-medium", style: { color: COLORS.accent, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: ["\uD83D\uDD25 ", t('infraCtaBadge')] })] }), _jsxs("h2", { className: `text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { fontFamily: "'Noto Sans Bengali', 'Inter', sans-serif" }, children: [t('infraCtaTitlePart1'), ' ', _jsx("span", { className: "bg-clip-text text-transparent", style: {
                                    backgroundImage: `linear-gradient(135deg, ${COLORS.cyan} 0%, ${COLORS.green} 100%)`,
                                }, children: t('infraCtaTitlePart2') }), ' ', "\u2014", _jsx("br", {}), t('infraCtaTitlePart3'), ' ', _jsx("span", { className: "inline-block -glow-text", style: { color: COLORS.accent }, children: "FREE!" })] }), _jsx("p", { className: `text-lg md:text-xl mb-8 max-w-2xl mx-auto -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { color: COLORS.textMuted, fontFamily: "'Noto Sans Bengali', sans-serif" }, children: t('infraCtaSubtitle') }), _jsxs("div", { className: `flex flex-wrap justify-center gap-3 mb-10 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, children: [_jsx(BenefitPill, { icon: Zap, text: t('infraLatency') }), _jsx(BenefitPill, { icon: Shield, text: t('infraSecurity') }), _jsx(BenefitPill, { icon: Globe, text: t('infraGlobalServers') }), _jsx(BenefitPill, { icon: Clock, text: t('infraUptime') })] }), _jsxs("div", { className: `flex flex-col sm:flex-row items-center justify-center gap-4 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, children: [_jsx("div", { className: "transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]", children: _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg overflow-hidden", style: {
                                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                                        boxShadow: `0 0 40px ${COLORS.primary}60`,
                                    }, children: [_jsx("div", { className: "absolute inset-0 -glow", style: {
                                                background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.accent} 100%)`,
                                            } }), _jsx("span", { className: "relative text-white", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: t('infraCtaPrimary') }), _jsx("span", { className: "relative -nudge-x", children: _jsx(ArrowRight, { className: "w-5 h-5 text-white" }) })] }) }), _jsx("div", { className: "transition-transform duration-200 hover:scale-[1.02]", children: _jsx("a", { href: "#demo", className: "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white/80 hover:text-white transition-colors", style: {
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                    }, children: _jsx("span", { style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: t('infraCtaSecondary') }) }) })] }), _jsxs("p", { className: `text-sm mt-8 -fade-in ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { color: COLORS.textMuted }, children: ["\u2713 ", t('heroTrust1'), " \u00A0\u2022\u00A0 \u2713 ", t('heroDemoReady'), " \u00A0\u2022\u00A0 \u2713", ' ', t('planFreeDesc')] })] })] }));
}
export default InfrastructureCTA;
