import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Final CTA Section - "আজই শুরু করুন, Future Build করুন"
 *
 * Compelling final call-to-action with exclusivity-based urgency
 *
 * Features:
 * - Mission statement emphasizing being first Bengali e-commerce platform
 * - Large glowing animated CTA button
 * - Trust badges (no credit card, fast setup, early bird pricing)
 * - Secondary CTAs for conversation
 * - Live signup notification (real, not fake)
 */
import { useRef } from 'react';
import { ArrowRight, Check, Mail, Sparkles, Diamond } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { useInView } from '@/hooks/useInView';
// ============================================================================
// DESIGN TOKENS
// ============================================================================
const COLORS = {
    primary: '#006A4E', // Bangladesh Green
    primaryLight: '#00875F',
    accent: '#F9A825', // Golden Yellow
    background: '#0A0A0F',
    violet: '#8B5CF6',
    blue: '#3B82F6',
};
// ============================================================================
// GLOWING CTA BUTTON
// ============================================================================
const GlowingCTAButton = () => {
    const { t } = useTranslation();
    return (_jsxs("div", { className: "relative inline-block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]", children: [_jsx("div", { className: "absolute -inset-1 rounded-2xl blur-xl opacity-60 -glow", style: {
                    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.accent})`,
                } }), _jsxs("a", { href: "https://app.ozzyl.com/auth/register", className: "relative flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold text-xl rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-[#006A4E]/50", style: {
                    boxShadow: `0 0 40px ${COLORS.primary}40`,
                }, children: [_jsx("span", { style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: t('finalCtaPrimary') }), _jsx("span", { className: "animate-nudge-x", children: _jsx(ArrowRight, { className: "w-6 h-6" }) })] })] }));
};
// ============================================================================
// TRUST BADGES
// ============================================================================
const TrustBadges = () => {
    const { t } = useTranslation();
    const badges = [
        { icon: Check, text: t('heroTrust1') },
        { icon: Check, text: t('heroDemoReady') },
        { icon: Sparkles, text: t('finalCtaEarlyBird') },
    ];
    return (_jsx("div", { className: "flex flex-wrap justify-center gap-4 mt-6", children: badges.map((badge, i) => (_jsxs("div", { className: "flex items-center gap-2 text-white/60 text-sm -fade-in-up", style: { animationDelay: `${0.2 + i * 0.1}s` }, children: [_jsx(badge.icon, { className: "w-4 h-4 text-[#006A4E]" }), _jsx("span", { children: badge.text })] }, i))) }));
};
// ============================================================================
// DECORATIVE DIAMONDS
// ============================================================================
const DecorativeDiamonds = () => {
    return (_jsx("div", { className: "flex justify-center gap-2 mb-8", children: [...Array(16)].map((_, i) => (_jsx("div", { className: "animate-fade-in-up", style: { animationDelay: `${i * 0.05}s` }, children: _jsx(Diamond, { className: `w-3 h-3 ${i % 4 === 0
                    ? 'text-[#006A4E]'
                    : i % 4 === 1
                        ? 'text-[#F9A825]'
                        : i % 4 === 2
                            ? 'text-[#8B5CF6]'
                            : 'text-white/20'}`, fill: "currentColor" }) }, i))) }));
};
// ============================================================================
// MAIN FINAL CTA COMPONENT
// ============================================================================
export function FinalCTA({ stats }) {
    const { t } = useTranslation();
    const totalUsers = stats?.totalUsers || 0;
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, rootMargin: '0px 0px -20% 0px' });
    return (_jsxs("section", { ref: sectionRef, className: "py-16 relative overflow-hidden", style: { backgroundColor: COLORS.background }, children: [_jsxs("div", { className: "absolute inset-0", children: [_jsx("div", { className: "absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full -float-x", style: {
                            background: `radial-gradient(circle, ${COLORS.primary}20 0%, transparent 70%)`,
                        } }), _jsx("div", { className: "absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full -float-reverse", style: {
                            background: `radial-gradient(circle, ${COLORS.violet}15 0%, transparent 70%)`,
                        } }), _jsx("div", { className: "absolute inset-0 opacity-[0.03]", style: {
                            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                        } })] }), _jsxs("div", { className: "relative z-10 max-w-4xl mx-auto px-4 text-center", children: [_jsx(DecorativeDiamonds, {}), _jsxs("h2", { className: `text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: [t('finalCtaTitlePart1'), ' ', _jsx("span", { className: "bg-clip-text text-transparent", style: {
                                    backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.accent} 100%)`,
                                }, children: t('finalCtaTitlePart2') }), ' ', t('finalCtaTitlePart3')] }), _jsxs("div", { className: `bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-10 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, children: [_jsx("p", { className: "text-xl md:text-2xl text-white/80 leading-relaxed mb-6", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: t('finalCtaMission') }), _jsx("p", { className: "text-lg text-white/60", style: { fontFamily: "'Noto Sans Bengali', sans-serif" }, children: t('finalCtaJourney') })] }), _jsx("div", { className: `mb-4 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, children: _jsx(GlowingCTAButton, {}) }), _jsx(TrustBadges, {}), _jsxs("div", { className: "flex items-center justify-center gap-4 my-10", children: [_jsx("div", { className: "h-px w-20 bg-gradient-to-r from-transparent to-white/20" }), _jsx("span", { className: "text-white/40 text-sm", children: t('finalCtaOr') }), _jsx("div", { className: "h-px w-20 bg-gradient-to-l from-transparent to-white/20" })] }), _jsxs("div", { className: `flex flex-wrap justify-center gap-4 mb-12 -fade-in-up ${isInView ? 'opacity-100' : 'opacity-0'}`, children: [_jsxs("a", { href: "mailto:hello@ozzyl.com", className: "group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300", children: [_jsx(Mail, { className: "w-4 h-4" }), _jsxs("span", { children: ["\uD83D\uDCE7 ", t('finalCtaSecondaryCall')] })] }), _jsxs("a", { href: "/contact", className: "group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all duration-300", children: [_jsx(Mail, { className: "w-4 h-4" }), _jsxs("span", { children: ["\uD83D\uDCE7 ", t('finalCtaSecondaryMail')] })] })] })] })] }));
}
export default FinalCTA;
