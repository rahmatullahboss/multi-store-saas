
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

import { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { Rocket } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ClientOnly } from '@/components/LazySection';
import { ASSETS } from '@/config/assets';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { Footer } from '@/components/Footer';

// ============================================================================
// CRITICAL - Load immediately (above the fold)
// ============================================================================
import { MarketingHeader } from '@/components/MarketingHeader';

import { AwardWinningHero } from '@/components/AwardWinningHero';

const FraudDetectionSection = lazy(
  () => import('@/components/FraudDetectionSection').then((m) => ({ default: m.FraudDetectionSection })));

// ============================================================================
// OPTIMIZED DYNAMIC IMPORTS
// ============================================================================

// Simple skeleton - minimal animation
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

// HIGH PRIORITY - Load with SSR for better LCP
const AIHeroSection = lazy(
  () => import('@/components/AIHeroSection').then((m) => ({ default: m.AIHeroSection })));

const ProblemSolutionSection = lazy(
  () =>
    import('@/components/ProblemSolutionSection').then((m) => ({
      default: m.ProblemSolutionSection,
    })));

// MEDIUM PRIORITY - Client-side only, load on demand
const AIShowcaseSection = lazy(
  () =>
    import('@/components/landing/AIShowcaseSection').then((m) => ({
      default: m.AIShowcaseSection,
    })));
const DragDropBuilderShowcase = lazy(
  () =>
    import('@/components/landing/DragDropBuilderShowcase').then((m) => ({
      default: m.DragDropBuilderShowcase,
    })));
const EditorModeComparison = lazy(
  () =>
    import('@/components/landing/EditorModeComparison').then((m) => ({
      default: m.EditorModeComparison,
    })));
const AIMagicSection = lazy(
  () => import('@/components/landing/AIMagicSection').then((m) => ({ default: m.AIMagicSection })));
const AISocialProofSection = lazy(
  () =>
    import('@/components/landing/AISocialProofSection').then((m) => ({
      default: m.AISocialProofSection,
    })));
const BentoFeaturesSection = lazy(
  () =>
    import('@/components/BentoFeaturesSection').then((m) => ({ default: m.BentoFeaturesSection })));

// Infrastructure sections
const InfrastructureSection = lazy(
  () =>
    import('@/components/InfrastructureSection').then((m) => ({
      default: m.InfrastructureSection,
    })));
const SpeedComparison = lazy(
  () => import('@/components/SpeedComparison').then((m) => ({ default: m.SpeedComparison })));
const CDNExplainer = lazy(
  () => import('@/components/CDNExplainer').then((m) => ({ default: m.CDNExplainer })));
const SpeedImpact = lazy(
  () => import('@/components/SpeedImpact').then((m) => ({ default: m.SpeedImpact })));
const CloudflareBenefitsCards = lazy(
  () =>
    import('@/components/CloudflareBenefitsCards').then((m) => ({
      default: m.CloudflareBenefitsCards,
    })));
const TechnicalSpecs = lazy(
  () => import('@/components/TechnicalSpecs').then((m) => ({ default: m.TechnicalSpecs })));
const LiveDashboard = lazy(
  () => import('@/components/LiveDashboard').then((m) => ({ default: m.LiveDashboard })));
const InfrastructureCTA = lazy(
  () => import('@/components/InfrastructureCTA').then((m) => ({ default: m.InfrastructureCTA })));

// Trust & sections
const TrustSection = lazy(
  () => import('@/components/TrustSection').then((m) => ({ default: m.TrustSection })));
const ComparisonSection = lazy(
  () => import('@/components/ComparisonSection').then((m) => ({ default: m.ComparisonSection })));

// Interactive demo
const InteractiveStoreDemo = lazy(
  () =>
    import('@/components/InteractiveStoreDemo').then((m) => ({ default: m.InteractiveStoreDemo })));

// FAQ & CTA
const FAQSection = lazy(
  () => import('@/components/FAQSection').then((m) => ({ default: m.FAQSection })));
const FinalCTA = lazy(
  () => import('@/components/FinalCTA').then((m) => ({ default: m.FinalCTA })));

// New Feature sections
const MarketingAutomationSection = lazy(
  () =>
    import('@/components/landing/MarketingAutomationSection').then((m) => ({
      default: m.MarketingAutomationSection,
    })));
const LogisticsOperationsSection = lazy(
  () =>
    import('@/components/landing/LogisticsOperationsSection').then((m) => ({
      default: m.LogisticsOperationsSection,
    })));
const BusinessManagementSection = lazy(
  () =>
    import('@/components/landing/BusinessManagementSection').then((m) => ({
      default: m.BusinessManagementSection,
    })));
const CustomerExperienceSection = lazy(
  () =>
    import('@/components/landing/CustomerExperienceSection').then((m) => ({
      default: m.CustomerExperienceSection,
    })));
const CustomerBenefitsSection = lazy(
  () =>
    import('@/components/landing/CustomerBenefitsSection').then((m) => ({
      default: m.CustomerBenefitsSection,
    })));
const AnalyticsInsightsSection = lazy(
  () =>
    import('@/components/landing/AnalyticsInsightsSection').then((m) => ({
      default: m.AnalyticsInsightsSection,
    })));
const UseCaseScenariosSection = lazy(
  () =>
    import('@/components/landing/UseCaseScenariosSection').then((m) => ({
      default: m.UseCaseScenariosSection,
    })));
const FeatureMatrixSection = lazy(
  () =>
    import('@/components/landing/FeatureMatrixSection').then((m) => ({
      default: m.FeatureMatrixSection,
    })));
const CourierIntegrationSection = lazy(
  () =>
    import('@/components/landing/CourierIntegrationSection').then((m) => ({
      default: m.CourierIntegrationSection,
    })));
const WhatsAppSMSAutomationSection = lazy(
  () =>
    import('@/components/landing/WhatsAppSMSAutomationSection').then((m) => ({
      default: m.WhatsAppSMSAutomationSection,
    })));
const EmailMarketingSection = lazy(
  () =>
    import('@/components/landing/EmailMarketingSection').then((m) => ({
      default: m.EmailMarketingSection,
    })));
const TeamManagementSection = lazy(
  () =>
    import('@/components/landing/TeamManagementSection').then((m) => ({
      default: m.TeamManagementSection,
    })));
const ActivityLogsSection = lazy(
  () =>
    import('@/components/landing/ActivityLogsSection').then((m) => ({
      default: m.ActivityLogsSection,
    })));
const ProductReviewsSection = lazy(
  () =>
    import('@/components/landing/ProductReviewsSection').then((m) => ({
      default: m.ProductReviewsSection,
    })));
const ReturnsRefundsSection = lazy(
  () =>
    import('@/components/landing/ReturnsRefundsSection').then((m) => ({
      default: m.ReturnsRefundsSection,
    })));
const MessengerIntegrationSection = lazy(
  () =>
    import('@/components/landing/MessengerIntegrationSection').then((m) => ({
      default: m.MessengerIntegrationSection,
    })));
const TaxReportsSection = lazy(
  () =>
    import('@/components/landing/TaxReportsSection').then((m) => ({
      default: m.TaxReportsSection,
    })));
const UnifiedCommunicationHub = lazy(
  () =>
    import('@/components/landing/UnifiedCommunicationHub').then((m) => ({
      default: m.UnifiedCommunicationHub,
    })));

// Award-Winning Extras
const AIPoweredFinalCTA = lazy(
  () =>
    import('@/components/landing/AIPoweredFinalCTA').then((m) => ({
      default: m.AIPoweredFinalCTA,
    })));
const AllInOneSolution = lazy(
  () =>
    import('@/components/landing/AllInOneSolution').then((m) => ({ default: m.AllInOneSolution })));
const PaymentIntegrationSection = lazy(
  () =>
    import('@/components/landing/PaymentIntegrationSection').then((m) => ({
      default: m.PaymentIntegrationSection,
    })));
const InventoryOrderManagement = lazy(
  () =>
    import('@/components/landing/InventoryOrderManagement').then((m) => ({
      default: m.InventoryOrderManagement,
    })));
const StorefrontUXShowcase = lazy(
  () =>
    import('@/components/landing/StorefrontUXShowcase').then((m) => ({
      default: m.StorefrontUXShowcase,
    })));
const CRMMarketingGrowth = lazy(
  () =>
    import('@/components/landing/CRMMarketingGrowth').then((m) => ({
      default: m.CRMMarketingGrowth,
    })));
const BanglaNativeLocalization = lazy(
  () =>
    import('@/components/landing/BanglaNativeLocalization').then((m) => ({
      default: m.BanglaNativeLocalization,
    })));
const SecuritySpeedInfrastructure = lazy(
  () =>
    import('@/components/landing/SecuritySpeedInfrastructure').then((m) => ({
      default: m.SecuritySpeedInfrastructure,
    })));

const ScalabilityShowcase = lazy(
  () =>
    import('@/components/landing/ScalabilityShowcase').then((m) => ({
      default: m.ScalabilityShowcase,
    })));
const PricingSection = lazy(
  () => import('@/components/PricingSection').then((m) => ({ default: m.PricingSection })));

// ============================================================================
// LAZY SECTION WRAPPER - Optimized with Intersection Observer
// ============================================================================
interface LazySectionWrapperProps {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
}

function LazySectionWrapper({
  children,
  minHeight = '400px',
  className = '',
}: LazySectionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before viewport
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        minHeight: isVisible ? undefined : minHeight,
        contain: 'layout style',
        contentVisibility: isVisible ? 'visible' : 'auto',
      }}
      className={className}
    >
      {isVisible ? children : <SectionSkeleton />}
    </div>
  );
}

// ============================================================================
// TYPES
// ============================================================================
export interface MarketingStats {
  totalUsers: number;
  totalStores: number;
  uptime: number;
}

// ============================================================================
// MAIN COMPONENT - Optimized
// ============================================================================
export function MarketingLanding({ stats }: { stats?: MarketingStats }) {
  const { t } = useTranslation();

  // Memoize stats to prevent unnecessary re-renders
  const marketingStats = useMemo(
    () =>
      stats || {
        totalUsers: 15420,
        totalStores: 850,
        uptime: 99.99,
      },
    [stats]
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#0A0A0F]">
      {/* ================================================================
          CRITICAL PATH - Renders immediately
          ================================================================ */}
      <MarketingHeader />

      {/* 1. HOOK — Attention (AIDA) */}
      <AwardWinningHero theme="dark" totalUsers={marketingStats?.totalUsers} />

      {/* ================================================================
          CONVERSION-OPTIMIZED SECTIONS (PAS + AIDA Framework)
          13 sections total — trimmed from 35+ for performance & conversion
          ================================================================ */}

      {/* 2. PAIN — Problem + Agitate (PAS) */}
      <LazySectionWrapper minHeight="300px">
        <ProblemSolutionSection />
      </LazySectionWrapper>

      {/* 3. WOW — Interest (AIDA) */}
      <LazySectionWrapper minHeight="600px">
        <AIShowcaseSection />
      </LazySectionWrapper>

      {/* 4. FEATURES — Solution (PAS) */}
      <LazySectionWrapper minHeight="400px">
        <BentoFeaturesSection />
      </LazySectionWrapper>

      {/* 5. TRUST — Desire (AIDA) — BD-specific: Fraud */}
      <LazySectionWrapper minHeight="500px">
        <FraudDetectionSection />
      </LazySectionWrapper>

      {/* 6. TRUST — Desire (AIDA) — BD-specific: bKash/Nagad */}
      <LazySectionWrapper minHeight="400px">
        <PaymentIntegrationSection />
      </LazySectionWrapper>

      {/* 7. TRUST — Desire (AIDA) — BD-specific: Pathao/Steadfast/RedX */}
      <LazySectionWrapper minHeight="600px">
        <CourierIntegrationSection />
      </LazySectionWrapper>

      {/* 8. SOCIAL PROOF — Customer Experience */}
      <LazySectionWrapper minHeight="600px">
        <CustomerBenefitsSection />
      </LazySectionWrapper>

      {/* 9. COMPARE — vs Shopify/competitors */}
      <LazySectionWrapper minHeight="400px">
        <ComparisonSection />
      </LazySectionWrapper>

      {/* 10. DECIDE — Pricing */}
      <LazySectionWrapper minHeight="600px">
        <PricingSection />
      </LazySectionWrapper>

      {/* 11. OBJECTIONS — FAQ */}
      <LazySectionWrapper minHeight="400px">
        <FAQSection />
      </LazySectionWrapper>

      {/* 12. FINAL PUSH — AI CTA */}
      <LazySectionWrapper minHeight="300px">
        <AIPoweredFinalCTA />
      </LazySectionWrapper>

      {/* 13. CONVERT — Last chance CTA */}
      <LazySectionWrapper minHeight="300px">
        <FinalCTA stats={marketingStats} />
      </LazySectionWrapper>

      {/* ================================================================
          REMOVED SECTIONS (commented out, not deleted — rollback সহজ)
          These live at /features and /integrations pages
          ================================================================ */}
      {/*
        <LazySectionWrapper minHeight="400px"><AIHeroSection theme="dark" totalUsers={marketingStats?.totalUsers} /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><DragDropBuilderShowcase /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><EditorModeComparison /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><AIMagicSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="250px"><AISocialProofSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><MarketingAutomationSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><LogisticsOperationsSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><CustomerExperienceSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><BusinessManagementSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><AnalyticsInsightsSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><InfrastructureSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="250px"><SpeedComparison /></LazySectionWrapper>
        <LazySectionWrapper minHeight="500px"><ScalabilityShowcase /></LazySectionWrapper>
        <LazySectionWrapper minHeight="250px"><CDNExplainer /></LazySectionWrapper>
        <LazySectionWrapper minHeight="250px"><SpeedImpact /></LazySectionWrapper>
        <LazySectionWrapper minHeight="250px"><CloudflareBenefitsCards /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><LiveDashboard /></LazySectionWrapper>
        <LazySectionWrapper minHeight="200px"><InfrastructureCTA /></LazySectionWrapper>
        <LazySectionWrapper minHeight="250px"><TrustSection stats={marketingStats} /></LazySectionWrapper>
        <LazySectionWrapper minHeight="600px"><FeatureMatrixSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><InteractiveStoreDemo /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><AllInOneSolution /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><InventoryOrderManagement /></LazySectionWrapper>
        <LazySectionWrapper minHeight="600px"><WhatsAppSMSAutomationSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="600px"><EmailMarketingSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><StorefrontUXShowcase /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><CRMMarketingGrowth /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><TeamManagementSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><ProductReviewsSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><ReturnsRefundsSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="300px"><MessengerIntegrationSection /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><BanglaNativeLocalization /></LazySectionWrapper>
        <LazySectionWrapper minHeight="400px"><SecuritySpeedInfrastructure /></LazySectionWrapper>
        <LazySectionWrapper minHeight="500px"><UseCaseScenariosSection /></LazySectionWrapper>
      */}

      {/* Footer */}
      <Footer />

      {/* Sticky CTA FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <a href="https://app.ozzyl.com/auth/register"
          className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm sm:text-base shadow-xl shadow-[#006A4E]/40 hover:shadow-2xl hover:shadow-[#006A4E]/50 active:scale-[0.95] hover:scale-[1.05] transition-all duration-200"
        >
          <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
          {t('getStarted')}
        </a>
      </div>

      {/* Visitor AI Chat Widget */}
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}
