'use client';

/**
 * SaaS Marketing Landing Page - NEXT.JS 16 OPTIMIZED VERSION
 *
 * Performance optimizations:
 * - Next.js 16 dynamic() for automatic code splitting
 * - Suspense boundaries for streaming
 * - Partial Pre-Rendering (PPR) ready
 * - Reduced initial JS bundle
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Rocket } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ClientOnly, LazySection } from '@/components/LazySection';
import { ASSETS } from '@/config/assets';

// ============================================================================
// CRITICAL - Load immediately (above the fold)
// ============================================================================
import { MarketingHeader } from '@/components/MarketingHeader';
import { AwardWinningHero } from '@/components/AwardWinningHero';

// ============================================================================
// DYNAMIC IMPORTS - Next.js 16 automatic code splitting
// ============================================================================

// Simple skeleton for dynamic components
const SectionSkeleton = () => (
  <div className="w-full py-16 animate-pulse">
    <div className="max-w-6xl mx-auto px-4">
      <div className="h-8 bg-gray-800/20 rounded-lg w-1/3 mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-800/10 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

// Hero sections (HIGH PRIORITY - early loading)
const AIHeroSection = dynamic(
  () => import('@/components/AIHeroSection').then((m) => ({ default: m.AIHeroSection })),
  { loading: () => <SectionSkeleton /> }
);

// Problem/Solution (HIGH PRIORITY)
const ProblemSolutionSection = dynamic(
  () =>
    import('@/components/ProblemSolutionSection').then((m) => ({
      default: m.ProblemSolutionSection,
    })),
  { loading: () => <SectionSkeleton /> }
);

// AI Showcase sections (MEDIUM PRIORITY - heavy section)
const AIShowcaseSection = dynamic(
  () =>
    import('@/components/landing/AIShowcaseSection').then((m) => ({
      default: m.AIShowcaseSection,
    })),
  { loading: () => <SectionSkeleton /> }
);

// Builder sections (MEDIUM PRIORITY)
const DragDropBuilderShowcase = dynamic(
  () =>
    import('@/components/landing/DragDropBuilderShowcase').then((m) => ({
      default: m.DragDropBuilderShowcase,
    })),
  { loading: () => <SectionSkeleton /> }
);
const EditorModeComparison = dynamic(
  () =>
    import('@/components/landing/EditorModeComparison').then((m) => ({
      default: m.EditorModeComparison,
    })),
  { loading: () => <SectionSkeleton /> }
);
const AIMagicSection = dynamic(
  () => import('@/components/landing/AIMagicSection').then((m) => ({ default: m.AIMagicSection })),
  { loading: () => <SectionSkeleton /> }
);
const AISocialProofSection = dynamic(
  () =>
    import('@/components/landing/AISocialProofSection').then((m) => ({
      default: m.AISocialProofSection,
    })),
  { loading: () => <SectionSkeleton /> }
);

// Features (MEDIUM PRIORITY)
const BentoFeaturesSection = dynamic(
  () =>
    import('@/components/BentoFeaturesSection').then((m) => ({ default: m.BentoFeaturesSection })),
  { loading: () => <SectionSkeleton /> }
);

// Infrastructure sections (MEDIUM PRIORITY)
const InfrastructureSection = dynamic(
  () =>
    import('@/components/InfrastructureSection').then((m) => ({
      default: m.InfrastructureSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const SpeedComparison = dynamic(
  () => import('@/components/SpeedComparison').then((m) => ({ default: m.SpeedComparison })),
  { loading: () => <SectionSkeleton /> }
);
const CDNExplainer = dynamic(
  () => import('@/components/CDNExplainer').then((m) => ({ default: m.CDNExplainer })),
  { loading: () => <SectionSkeleton /> }
);
const SpeedImpact = dynamic(
  () => import('@/components/SpeedImpact').then((m) => ({ default: m.SpeedImpact })),
  { loading: () => <SectionSkeleton /> }
);
const CloudflareBenefitsCards = dynamic(
  () =>
    import('@/components/CloudflareBenefitsCards').then((m) => ({
      default: m.CloudflareBenefitsCards,
    })),
  { loading: () => <SectionSkeleton /> }
);
const TechnicalSpecs = dynamic(
  () => import('@/components/TechnicalSpecs').then((m) => ({ default: m.TechnicalSpecs })),
  { loading: () => <SectionSkeleton /> }
);
const LiveDashboard = dynamic(
  () => import('@/components/LiveDashboard').then((m) => ({ default: m.LiveDashboard })),
  { loading: () => <SectionSkeleton /> }
);
const InfrastructureCTA = dynamic(
  () => import('@/components/InfrastructureCTA').then((m) => ({ default: m.InfrastructureCTA })),
  { loading: () => <SectionSkeleton /> }
);

// Trust & Comparison (MEDIUM PRIORITY)
const TrustSection = dynamic(
  () => import('@/components/TrustSection').then((m) => ({ default: m.TrustSection })),
  { loading: () => <SectionSkeleton /> }
);
const ComparisonSection = dynamic(
  () => import('@/components/ComparisonSection').then((m) => ({ default: m.ComparisonSection })),
  { loading: () => <SectionSkeleton /> }
);

// Interactive demo (MEDIUM PRIORITY)
const InteractiveStoreDemo = dynamic(
  () =>
    import('@/components/InteractiveStoreDemo').then((m) => ({ default: m.InteractiveStoreDemo })),
  { loading: () => <SectionSkeleton /> }
);

// FAQ & CTA (MEDIUM to LOW PRIORITY)
const FAQSection = dynamic(
  () => import('@/components/FAQSection').then((m) => ({ default: m.FAQSection })),
  { loading: () => <SectionSkeleton /> }
);
const AIPoweredFinalCTA = dynamic(
  () =>
    import('@/components/landing/AIPoweredFinalCTA').then((m) => ({
      default: m.AIPoweredFinalCTA,
    })),
  { loading: () => <SectionSkeleton /> }
);
const FinalCTA = dynamic(
  () => import('@/components/FinalCTA').then((m) => ({ default: m.FinalCTA })),
  { loading: () => <SectionSkeleton /> }
);

// AI Chat Widget - CLIENT ONLY (very heavy - load only on interaction)
const OzzylAIChatWidget = dynamic(
  () =>
    import('@/components/landing/OzzylAIChatWidget').then((m) => ({
      default: m.OzzylAIChatWidget,
    })),
  { ssr: false, loading: () => null }
);

// New Award-Winning Sections (Extra Features)
const AllInOneSolution = dynamic(
  () =>
    import('@/components/landing/AllInOneSolution').then((m) => ({ default: m.AllInOneSolution })),
  { loading: () => <SectionSkeleton /> }
);
const PaymentIntegrationSection = dynamic(
  () =>
    import('@/components/landing/PaymentIntegrationSection').then((m) => ({
      default: m.PaymentIntegrationSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const InventoryOrderManagement = dynamic(
  () =>
    import('@/components/landing/InventoryOrderManagement').then((m) => ({
      default: m.InventoryOrderManagement,
    })),
  { loading: () => <SectionSkeleton /> }
);
const StorefrontUXShowcase = dynamic(
  () =>
    import('@/components/landing/StorefrontUXShowcase').then((m) => ({
      default: m.StorefrontUXShowcase,
    })),
  { loading: () => <SectionSkeleton /> }
);
const CRMMarketingGrowth = dynamic(
  () =>
    import('@/components/landing/CRMMarketingGrowth').then((m) => ({
      default: m.CRMMarketingGrowth,
    })),
  { loading: () => <SectionSkeleton /> }
);
const BanglaNativeLocalization = dynamic(
  () =>
    import('@/components/landing/BanglaNativeLocalization').then((m) => ({
      default: m.BanglaNativeLocalization,
    })),
  { loading: () => <SectionSkeleton /> }
);
const SecuritySpeedInfrastructure = dynamic(
  () =>
    import('@/components/landing/SecuritySpeedInfrastructure').then((m) => ({
      default: m.SecuritySpeedInfrastructure,
    })),
  { loading: () => <SectionSkeleton /> }
);
const PricingSection = dynamic(
  () => import('@/components/PricingSection').then((m) => ({ default: m.PricingSection })),
  { loading: () => <SectionSkeleton /> }
);

// New Feature Sections (Project 10 Features)
const MarketingAutomationSection = dynamic(
  () =>
    import('@/components/landing/MarketingAutomationSection').then((m) => ({
      default: m.MarketingAutomationSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const LogisticsOperationsSection = dynamic(
  () =>
    import('@/components/landing/LogisticsOperationsSection').then((m) => ({
      default: m.LogisticsOperationsSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const BusinessManagementSection = dynamic(
  () =>
    import('@/components/landing/BusinessManagementSection').then((m) => ({
      default: m.BusinessManagementSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const CustomerExperienceSection = dynamic(
  () =>
    import('@/components/landing/CustomerExperienceSection').then((m) => ({
      default: m.CustomerExperienceSection,
    })),
  { loading: () => <SectionSkeleton /> }
);

// NEW EXTRA SECTIONS (From Prompts 16, 21, 22)
const AnalyticsInsightsSection = dynamic(
  () =>
    import('@/components/landing/AnalyticsInsightsSection').then((m) => ({
      default: m.AnalyticsInsightsSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const UseCaseScenariosSection = dynamic(
  () =>
    import('@/components/landing/UseCaseScenariosSection').then((m) => ({
      default: m.UseCaseScenariosSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const FeatureMatrixSection = dynamic(
  () =>
    import('@/components/landing/FeatureMatrixSection').then((m) => ({
      default: m.FeatureMatrixSection,
    })),
  { loading: () => <SectionSkeleton /> }
);

// POWER FEATURES (Project 10+ Features from Prompt 23-32)
const CourierIntegrationSection = dynamic(
  () =>
    import('@/components/landing/CourierIntegrationSection').then((m) => ({
      default: m.CourierIntegrationSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const WhatsAppSMSAutomationSection = dynamic(
  () =>
    import('@/components/landing/WhatsAppSMSAutomationSection').then((m) => ({
      default: m.WhatsAppSMSAutomationSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const EmailMarketingSection = dynamic(
  () =>
    import('@/components/landing/EmailMarketingSection').then((m) => ({
      default: m.EmailMarketingSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const TeamManagementSection = dynamic(
  () =>
    import('@/components/landing/TeamManagementSection').then((m) => ({
      default: m.TeamManagementSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const ActivityLogsSection = dynamic(
  () =>
    import('@/components/landing/ActivityLogsSection').then((m) => ({
      default: m.ActivityLogsSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const ProductReviewsSection = dynamic(
  () =>
    import('@/components/landing/ProductReviewsSection').then((m) => ({
      default: m.ProductReviewsSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const ReturnsRefundsSection = dynamic(
  () =>
    import('@/components/landing/ReturnsRefundsSection').then((m) => ({
      default: m.ReturnsRefundsSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const MessengerIntegrationSection = dynamic(
  () =>
    import('@/components/landing/MessengerIntegrationSection').then((m) => ({
      default: m.MessengerIntegrationSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const TaxReportsSection = dynamic(
  () =>
    import('@/components/landing/TaxReportsSection').then((m) => ({
      default: m.TaxReportsSection,
    })),
  { loading: () => <SectionSkeleton /> }
);
const UnifiedCommunicationHub = dynamic(
  () =>
    import('@/components/landing/UnifiedCommunicationHub').then((m) => ({
      default: m.UnifiedCommunicationHub,
    })),
  { loading: () => <SectionSkeleton /> }
);

// ============================================================================
// Main Component
// ============================================================================
export interface MarketingStats {
  totalUsers: number;
  totalStores: number;
  uptime: number;
}

export function MarketingLanding({ stats }: { stats?: MarketingStats }) {
  const { t } = useTranslation();

  // Use live stats or fallback to mock if undefined
  const marketingStats = stats || {
    totalUsers: 15420,
    totalStores: 850,
    uptime: 99.99,
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0A0A0F]">
      {/* ================================================================
          CRITICAL PATH - Renders immediately
          ================================================================ */}
      <MarketingHeader />
      <AwardWinningHero theme="dark" totalUsers={marketingStats?.totalUsers} />

      {/* ================================================================
          LAZY LOADED SECTIONS - Render on scroll
          Each LazySection only renders its children when in viewport
          ================================================================ */}

      {/* AI Hero - First lazy section (HIGH PRIORITY - early preload) */}
      <LazySection minHeight="600px" priority="high">
        <AIHeroSection theme="dark" totalUsers={marketingStats?.totalUsers} />
      </LazySection>

      {/* Problem-Solution (HIGH PRIORITY - early preload) */}
      <LazySection minHeight="500px" priority="high">
        <ProblemSolutionSection />
      </LazySection>

      {/* AI Showcase - Heavy section (MEDIUM PRIORITY) */}
      <LazySection minHeight="800px" priority="medium">
        <AIShowcaseSection />
      </LazySection>

      {/* Builder sections (MEDIUM - core features) */}
      <LazySection minHeight="600px" priority="medium">
        <DragDropBuilderShowcase />
      </LazySection>

      <LazySection minHeight="500px" priority="medium">
        <EditorModeComparison />
      </LazySection>

      <LazySection minHeight="500px" priority="medium">
        <AIMagicSection />
      </LazySection>

      <LazySection minHeight="400px" priority="medium">
        <AISocialProofSection />
      </LazySection>

      {/* Features (MEDIUM - important showcase) */}
      <LazySection minHeight="600px" priority="medium">
        <BentoFeaturesSection />
      </LazySection>

      {/* NEW FEATURES: Marketing Automation (Sales/Growth) - MEDIUM */}
      <LazySection minHeight="600px" priority="medium">
        <MarketingAutomationSection />
      </LazySection>

      {/* NEW FEATURES: Logistics (Operations) - MEDIUM */}
      <LazySection minHeight="600px" priority="medium">
        <LogisticsOperationsSection />
      </LazySection>

      {/* NEW FEATURES: Customer Experience (Social Proof) - MEDIUM */}
      <LazySection minHeight="600px" priority="medium">
        <CustomerExperienceSection />
      </LazySection>

      {/* NEW FEATURES: Business Management (Control/Admin) - MEDIUM */}
      <LazySection minHeight="600px" priority="medium">
        <BusinessManagementSection />
      </LazySection>

      {/* NEW FEATURES: Analytics & Data (Prompt 16) */}
      <LazySection minHeight="600px">
        <AnalyticsInsightsSection />
      </LazySection>

      {/* Infrastructure - Multiple sections */}
      <LazySection minHeight="500px">
        <InfrastructureSection />
      </LazySection>

      <LazySection minHeight="400px">
        <SpeedComparison />
      </LazySection>

      <LazySection minHeight="400px">
        <CDNExplainer />
      </LazySection>

      <LazySection minHeight="400px">
        <SpeedImpact />
      </LazySection>

      <LazySection minHeight="400px">
        <CloudflareBenefitsCards />
      </LazySection>

      <LazySection minHeight="400px">
        <TechnicalSpecs />
      </LazySection>

      <LazySection minHeight="500px">
        <LiveDashboard />
      </LazySection>

      <LazySection minHeight="300px">
        <InfrastructureCTA />
      </LazySection>

      {/* Trust & Comparison */}
      <LazySection minHeight="400px">
        <TrustSection stats={marketingStats} />
      </LazySection>

      <LazySection minHeight="500px">
        <ComparisonSection />
      </LazySection>

      {/* NEW FEATURES: Feature Matrix (Prompt 21) */}
      <LazySection minHeight="800px">
        <FeatureMatrixSection />
      </LazySection>

      {/* Interactive Demo */}
      <LazySection minHeight="600px">
        <InteractiveStoreDemo />
      </LazySection>

      {/* ================================================================
          NEW FEATURES (Award-Winning Extras)
          ================================================================ */}
      <LazySection minHeight="600px">
        <AllInOneSolution />
      </LazySection>

      <LazySection minHeight="600px">
        <PaymentIntegrationSection />
      </LazySection>

      {/* 5. Courier Integration [NEW #23] */}
      <LazySection minHeight="800px">
        <CourierIntegrationSection />
      </LazySection>

      <LazySection minHeight="600px">
        <InventoryOrderManagement />
      </LazySection>

      {/* 6. WhatsApp/SMS Automation [NEW #24] */}
      <LazySection minHeight="800px">
        <WhatsAppSMSAutomationSection />
      </LazySection>

      {/* 7. Email Marketing [NEW #25] */}
      <LazySection minHeight="800px">
        <EmailMarketingSection />
      </LazySection>

      <LazySection minHeight="700px">
        <StorefrontUXShowcase />
      </LazySection>

      <LazySection minHeight="600px">
        <CRMMarketingGrowth />
      </LazySection>

      {/* 15. Team Management [NEW #26] */}
      <LazySection minHeight="700px">
        <TeamManagementSection />
      </LazySection>

      {/* 16. Activity Logs [NEW #27] */}
      <LazySection minHeight="600px">
        <ActivityLogsSection />
      </LazySection>

      {/* 17. Product Reviews [NEW #28] */}
      <LazySection minHeight="600px">
        <ProductReviewsSection />
      </LazySection>

      {/* 18. Returns & Refunds [NEW #29] */}
      <LazySection minHeight="600px">
        <ReturnsRefundsSection />
      </LazySection>

      {/* 19. Messenger Integration [NEW #30] */}
      <LazySection minHeight="600px">
        <MessengerIntegrationSection />
      </LazySection>

      {/* 20. Tax Reports [NEW #31] */}
      <LazySection minHeight="600px">
        <TaxReportsSection />
      </LazySection>

      {/* 21. Unified Communication [NEW #32] */}
      <LazySection minHeight="700px">
        <UnifiedCommunicationHub />
      </LazySection>

      <LazySection minHeight="600px">
        <BanglaNativeLocalization />
      </LazySection>

      <LazySection minHeight="600px">
        <SecuritySpeedInfrastructure />
      </LazySection>

      {/* NEW FEATURES: Use Cases (Prompt 22) */}
      <LazySection minHeight="700px">
        <UseCaseScenariosSection />
      </LazySection>

      <LazySection minHeight="800px">
        <PricingSection />
      </LazySection>

      {/* FAQ */}
      <LazySection minHeight="500px">
        <FAQSection />
      </LazySection>

      {/* Final CTAs */}
      <LazySection minHeight="400px">
        <AIPoweredFinalCTA />
      </LazySection>

      <LazySection minHeight="400px">
        <FinalCTA stats={marketingStats} />
      </LazySection>

      {/* Footer - Static, no lazy needed */}
      <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                {/* Optimized: Use smaller logo size */}
                <Image
                  src={ASSETS.brand.logoWhite}
                  alt="Ozzyl"
                  className="h-10 w-auto"
                  width={103}
                  height={40}
                  loading="lazy"
                />
              </div>
              <p className="text-sm text-white/50">{t('footerAbout')}</p>
            </div>

            {/* Product Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerProduct')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/#features"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkFeatures')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkPricing')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorials"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkTemplates')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkIntegrations')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">যোগাযোগ</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="tel:+8801570260118"
                    className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2"
                  >
                    <span>📞</span> 01570-260118
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/8801739416661"
                    className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2"
                  >
                    <span>💬</span> WhatsApp: 01739-416661
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@ozzyl.com"
                    className="text-white/50 hover:text-[#00875F] transition text-sm flex items-center gap-2"
                  >
                    <span>📧</span> contact@ozzyl.com
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkContact')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="text-center sm:text-left">
              <h4 className="text-[#006A4E] font-semibold mb-4">{t('footerLegal')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkPrivacy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkTerms')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/refund"
                    className="text-white/50 hover:text-[#00875F] transition text-sm"
                  >
                    {t('footerLinkRefund')}
                  </Link>
                </li>
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
                  href="#"
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
          href="https://app.ozzyl.com/auth/register"
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm shadow-xl shadow-[#006A4E]/40 active:scale-[0.95] transition-transform"
        >
          <Rocket className="w-4 h-4" />
          {t('getStarted')}
        </Link>
      </div>

      {/* AI Chat Widget - Lazy loaded, only renders when user wants to interact */}
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}
