/**
 * SaaS Marketing Landing Page - AWARD-WINNING PREMIUM DESIGN
 * 
 * Features:
 * - DARK MODE Option with Purple/Blue gradients (Stripe/Linear inspired)
 * - EMERALD/TEAL GREEN light mode (supercharged)
 * - Morphing gradient blobs with parallax
 * - Framer Motion scroll animations
 * - 3D card effects and micro-interactions
 * - Animated counters and text reveals
 * - Premium glassmorphism effects
 * - Magnetic buttons and hover states
 */

import { useState, useEffect } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { motion } from 'framer-motion';
import { Store, Zap, BarChart3, Globe, Check, ArrowRight, Star, Users, ShoppingBag, TrendingUp, Sparkles, Rocket, MessageCircle, ChevronRight, Play, Package, Truck, Smartphone, ChevronDown, Moon, Sun, Menu, X } from 'lucide-react';
import { useLanguage, useTranslation } from '~/contexts/LanguageContext';
import { AnimatedCounter, ScrollReveal, StaggerContainer, StaggerItem, FloatingOrbs, TiltCard, MagneticButton, ShimmerText } from '~/components/animations';
import { AwardWinningHero } from '~/components/AwardWinningHero';
import { AIHeroSection } from '~/components/AIHeroSection';
import { AIShowcaseSection } from '~/components/landing/AIShowcaseSection';
import { DragDropBuilderShowcase } from '~/components/landing/DragDropBuilderShowcase';
import { EditorModeComparison } from '~/components/landing/EditorModeComparison';
import { AIMagicSection } from '~/components/landing/AIMagicSection';
import { AISocialProofSection } from '~/components/landing/AISocialProofSection';
import { AIPoweredFinalCTA } from '~/components/landing/AIPoweredFinalCTA';
import { ProblemSolutionSection } from '~/components/ProblemSolutionSection';
import { BentoFeaturesSection } from '~/components/BentoFeaturesSection';
import { InfrastructureSection } from '~/components/InfrastructureSection';
import { CloudflareBenefitsCards } from '~/components/CloudflareBenefitsCards';
import { SpeedComparison } from '~/components/SpeedComparison';
import { TechnicalSpecs } from '~/components/TechnicalSpecs';
import { CDNExplainer } from '~/components/CDNExplainer';
import { SpeedImpact } from '~/components/SpeedImpact';
import { LiveDashboard } from '~/components/LiveDashboard';
import { InfrastructureCTA } from '~/components/InfrastructureCTA';
import { TrustSection } from '~/components/TrustSection';
import { ComparisonSection } from '~/components/ComparisonSection';
import { InteractiveStoreDemo } from '~/components/InteractiveStoreDemo';
import { PricingSection } from '~/components/PricingSection'; // Keep for reference, not rendered
import { FinalCTA } from '~/components/FinalCTA';
import { FAQSection } from '~/components/FAQSection';
import { LightFloatingOrbs, LightHeroGradient, LightShimmerText } from '~/components/LightThemeEffects';
import { MarketingHeader } from '~/components/MarketingHeader';

import { OzzylAIChatWidget } from '~/components/landing/OzzylAIChatWidget';
import type { MarketingStats } from '~/routes/api.marketing-stats';


export function MarketingLanding() {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to award-winning dark mode
  
  // Fetch real marketing stats from API
  const statsFetcher = useFetcher<MarketingStats>();
  
  useEffect(() => {
    if (statsFetcher.state === 'idle' && !statsFetcher.data) {
      statsFetcher.load('/api/marketing-stats');
    }
  }, [statsFetcher]);
  
  const marketingStats = statsFetcher.data;

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen overflow-hidden ${isDarkMode ? 'bg-[#0A0A0F]' : 'bg-[#FAFBFC]'}`}>
      {/* Shared Marketing Header */}
      <MarketingHeader />

      {/* Award-Winning Bangladesh Hero - Bangla Native */}
      <AwardWinningHero theme={isDarkMode ? 'dark' : 'light'} totalUsers={marketingStats?.totalUsers} />

      {/* AI Hero Section - New Transformation */}
      <AIHeroSection theme={isDarkMode ? 'dark' : 'light'} totalUsers={marketingStats?.totalUsers} />

      {/* Problem-Solution Section */}
      <ProblemSolutionSection />

      {/* AI Showcase Section */}
      <AIShowcaseSection />

      {/* Drag & Drop Builder Section */}
      <DragDropBuilderShowcase />
      <EditorModeComparison />
      <AIMagicSection />
      <AISocialProofSection />

      {/* Bento Grid Features Section */}
      <BentoFeaturesSection />

      {/* Infrastructure Showcase */}
      <InfrastructureSection />
      <SpeedComparison />
      <CDNExplainer />
      <SpeedImpact />
      <CloudflareBenefitsCards />
      <TechnicalSpecs />
      <LiveDashboard />
      <InfrastructureCTA />

      {/* Trust Section */}
      <TrustSection stats={marketingStats} />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* Interactive Store Demo */}
      <InteractiveStoreDemo />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <AIPoweredFinalCTA />
      <FinalCTA stats={marketingStats} />

      {/* Footer - Shared Branding */}
      <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                <img src="/brand/logo-white.png" alt="Ozzyl" className="h-10 w-auto" />
              </div>
              <p className="text-sm text-white/50">{t('footerAbout')}</p>
            </div>
            
            {/* Product Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerProduct')}</h4>
              <ul className="space-y-2">
                <li><Link to="/#features" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkFeatures')}</Link></li>
                <li><Link to="/pricing" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkPricing')}</Link></li>
                <li><Link to="/tutorials" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkTemplates')}</Link></li>
                <li><Link to="/templates" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkIntegrations')}</Link></li>
              </ul>
            </div>
            
            {/* Company Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerCompany')}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkAbout')}</Link></li>
                <li><Link to="/contact" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkContact')}</Link></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerLegal')}</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkPrivacy')}</Link></li>
                <li><Link to="/terms" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkTerms')}</Link></li>
                <li><Link to="/refund" className="text-white/50 hover:text-[#00875F] transition text-sm">{t('footerLinkRefund')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#006A4E]/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">{t('copyright')}</p>
            <div className="flex items-center gap-3">
              {[
                { icon: '💬', label: 'WhatsApp' },
                { icon: '📘', label: 'Facebook' },
                { icon: '📸', label: 'Instagram' },
              ].map((social, i) => (
                <Link 
                  key={i} 
                  to="#" 
                  className="w-10 h-10 bg-[#006A4E]/10 hover:bg-[#006A4E]/20 border border-[#006A4E]/20 rounded-xl flex items-center justify-center transition"
                  title={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA Button - FAB Style */}
      <div className="sm:hidden fixed bottom-4 left-4 z-40">
        <Link 
          to="/auth/register" 
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm shadow-xl shadow-[#006A4E]/40 active:scale-[0.95] transition-transform"
        >
          <Rocket className="w-4 h-4" />
          {t('getStarted')}
        </Link>
      </div>

      {/* Ozzyl AI Chat Widget */}
      <OzzylAIChatWidget />
    </div>
  );
}
