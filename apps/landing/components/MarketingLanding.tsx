'use client';

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
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
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

const FraudDetectionSection = dynamic(
  () => import('@/components/FraudDetectionSection').then((m) => ({ default: m.FraudDetectionSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

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
const AIHeroSection = dynamic(
  () => import('@/components/AIHeroSection').then((m) => ({ default: m.AIHeroSection })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

const ProblemSolutionSection = dynamic(
  () =>
    import('@/components/ProblemSolutionSection').then((m) => ({
      default: m.ProblemSolutionSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: true }
);

// MEDIUM PRIORITY - Client-side only, load on demand
const AIShowcaseSection = dynamic(
  () =>
    import('@/components/landing/AIShowcaseSection').then((m) => ({
      default: m.AIShowcaseSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const DragDropBuilderShowcase = dynamic(
  () =>
    import('@/components/landing/DragDropBuilderShowcase').then((m) => ({
      default: m.DragDropBuilderShowcase,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const EditorModeComparison = dynamic(
  () =>
    import('@/components/landing/EditorModeComparison').then((m) => ({
      default: m.EditorModeComparison,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const AIMagicSection = dynamic(
  () => import('@/components/landing/AIMagicSection').then((m) => ({ default: m.AIMagicSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const AISocialProofSection = dynamic(
  () =>
    import('@/components/landing/AISocialProofSection').then((m) => ({
      default: m.AISocialProofSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const BentoFeaturesSection = dynamic(
  () =>
    import('@/components/BentoFeaturesSection').then((m) => ({ default: m.BentoFeaturesSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

// Infrastructure sections
const InfrastructureSection = dynamic(
  () =>
    import('@/components/InfrastructureSection').then((m) => ({
      default: m.InfrastructureSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const SpeedComparison = dynamic(
  () => import('@/components/SpeedComparison').then((m) => ({ default: m.SpeedComparison })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const CDNExplainer = dynamic(
  () => import('@/components/CDNExplainer').then((m) => ({ default: m.CDNExplainer })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const SpeedImpact = dynamic(
  () => import('@/components/SpeedImpact').then((m) => ({ default: m.SpeedImpact })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const CloudflareBenefitsCards = dynamic(
  () =>
    import('@/components/CloudflareBenefitsCards').then((m) => ({
      default: m.CloudflareBenefitsCards,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const TechnicalSpecs = dynamic(
  () => import('@/components/TechnicalSpecs').then((m) => ({ default: m.TechnicalSpecs })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const LiveDashboard = dynamic(
  () => import('@/components/LiveDashboard').then((m) => ({ default: m.LiveDashboard })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const InfrastructureCTA = dynamic(
  () => import('@/components/InfrastructureCTA').then((m) => ({ default: m.InfrastructureCTA })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

// Trust & sections
const TrustSection = dynamic(
  () => import('@/components/TrustSection').then((m) => ({ default: m.TrustSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const ComparisonSection = dynamic(
  () => import('@/components/ComparisonSection').then((m) => ({ default: m.ComparisonSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

// Interactive demo
const InteractiveStoreDemo = dynamic(
  () =>
    import('@/components/InteractiveStoreDemo').then((m) => ({ default: m.InteractiveStoreDemo })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

// FAQ & CTA
const FAQSection = dynamic(
  () => import('@/components/FAQSection').then((m) => ({ default: m.FAQSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const FinalCTA = dynamic(
  () => import('@/components/FinalCTA').then((m) => ({ default: m.FinalCTA })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

// New Feature sections
const MarketingAutomationSection = dynamic(
  () =>
    import('@/components/landing/MarketingAutomationSection').then((m) => ({
      default: m.MarketingAutomationSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const LogisticsOperationsSection = dynamic(
  () =>
    import('@/components/landing/LogisticsOperationsSection').then((m) => ({
      default: m.LogisticsOperationsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const BusinessManagementSection = dynamic(
  () =>
    import('@/components/landing/BusinessManagementSection').then((m) => ({
      default: m.BusinessManagementSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const CustomerExperienceSection = dynamic(
  () =>
    import('@/components/landing/CustomerExperienceSection').then((m) => ({
      default: m.CustomerExperienceSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const CustomerBenefitsSection = dynamic(
  () =>
    import('@/components/landing/CustomerBenefitsSection').then((m) => ({
      default: m.CustomerBenefitsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const AnalyticsInsightsSection = dynamic(
  () =>
    import('@/components/landing/AnalyticsInsightsSection').then((m) => ({
      default: m.AnalyticsInsightsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const ServerSideTrackingSection = dynamic(
  () =>
    import('@/components/landing/ServerSideTrackingSection').then((m) => ({
      default: m.ServerSideTrackingSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const UseCaseScenariosSection = dynamic(
  () =>
    import('@/components/landing/UseCaseScenariosSection').then((m) => ({
      default: m.UseCaseScenariosSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const FeatureMatrixSection = dynamic(
  () =>
    import('@/components/landing/FeatureMatrixSection').then((m) => ({
      default: m.FeatureMatrixSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const CourierIntegrationSection = dynamic(
  () =>
    import('@/components/landing/CourierIntegrationSection').then((m) => ({
      default: m.CourierIntegrationSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const WhatsAppSMSAutomationSection = dynamic(
  () =>
    import('@/components/landing/WhatsAppSMSAutomationSection').then((m) => ({
      default: m.WhatsAppSMSAutomationSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const EmailMarketingSection = dynamic(
  () =>
    import('@/components/landing/EmailMarketingSection').then((m) => ({
      default: m.EmailMarketingSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const TeamManagementSection = dynamic(
  () =>
    import('@/components/landing/TeamManagementSection').then((m) => ({
      default: m.TeamManagementSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const ActivityLogsSection = dynamic(
  () =>
    import('@/components/landing/ActivityLogsSection').then((m) => ({
      default: m.ActivityLogsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const ProductReviewsSection = dynamic(
  () =>
    import('@/components/landing/ProductReviewsSection').then((m) => ({
      default: m.ProductReviewsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const ReturnsRefundsSection = dynamic(
  () =>
    import('@/components/landing/ReturnsRefundsSection').then((m) => ({
      default: m.ReturnsRefundsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const MessengerIntegrationSection = dynamic(
  () =>
    import('@/components/landing/MessengerIntegrationSection').then((m) => ({
      default: m.MessengerIntegrationSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const TaxReportsSection = dynamic(
  () =>
    import('@/components/landing/TaxReportsSection').then((m) => ({
      default: m.TaxReportsSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const UnifiedCommunicationHub = dynamic(
  () =>
    import('@/components/landing/UnifiedCommunicationHub').then((m) => ({
      default: m.UnifiedCommunicationHub,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

// Award-Winning Extras
const AIPoweredFinalCTA = dynamic(
  () =>
    import('@/components/landing/AIPoweredFinalCTA').then((m) => ({
      default: m.AIPoweredFinalCTA,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const AllInOneSolution = dynamic(
  () =>
    import('@/components/landing/AllInOneSolution').then((m) => ({ default: m.AllInOneSolution })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const PaymentIntegrationSection = dynamic(
  () =>
    import('@/components/landing/PaymentIntegrationSection').then((m) => ({
      default: m.PaymentIntegrationSection,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const InventoryOrderManagement = dynamic(
  () =>
    import('@/components/landing/InventoryOrderManagement').then((m) => ({
      default: m.InventoryOrderManagement,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const StorefrontUXShowcase = dynamic(
  () =>
    import('@/components/landing/StorefrontUXShowcase').then((m) => ({
      default: m.StorefrontUXShowcase,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const CRMMarketingGrowth = dynamic(
  () =>
    import('@/components/landing/CRMMarketingGrowth').then((m) => ({
      default: m.CRMMarketingGrowth,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const BanglaNativeLocalization = dynamic(
  () =>
    import('@/components/landing/BanglaNativeLocalization').then((m) => ({
      default: m.BanglaNativeLocalization,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const SecuritySpeedInfrastructure = dynamic(
  () =>
    import('@/components/landing/SecuritySpeedInfrastructure').then((m) => ({
      default: m.SecuritySpeedInfrastructure,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

const ScalabilityShowcase = dynamic(
  () =>
    import('@/components/landing/ScalabilityShowcase').then((m) => ({
      default: m.ScalabilityShowcase,
    })),
  { loading: () => <SectionSkeleton />, ssr: false }
);
const PricingSection = dynamic(
  () => import('@/components/PricingSection').then((m) => ({ default: m.PricingSection })),
  { loading: () => <SectionSkeleton />, ssr: false }
);

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
      <AwardWinningHero theme="dark" totalUsers={marketingStats?.totalUsers} />

      {/* ================================================================
          LAZY LOADED SECTIONS - Optimized with Intersection Observer
          ================================================================ */}

      {/* AI Hero - First lazy section (HIGH PRIORITY) */}
      <LazySectionWrapper minHeight="400px">
        <AIHeroSection theme="dark" totalUsers={marketingStats?.totalUsers} />
      </LazySectionWrapper>

      {/* Problem-Solution (HIGH PRIORITY) */}
      <LazySectionWrapper minHeight="300px">
        <ProblemSolutionSection />
      </LazySectionWrapper>

      {/* AI Showcase */}
      <LazySectionWrapper minHeight="600px">
        <AIShowcaseSection />
      </LazySectionWrapper>

      {/* Builder sections — hidden until ready
      <LazySectionWrapper minHeight="400px">
        <DragDropBuilderShowcase />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <EditorModeComparison />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <AIMagicSection />
      </LazySectionWrapper>
      */}

      <LazySectionWrapper minHeight="250px">
        <AISocialProofSection />
      </LazySectionWrapper>

      {/* Features */}
      <LazySectionWrapper minHeight="400px">
        <BentoFeaturesSection />
      </LazySectionWrapper>

      {/* NEW FEATURES */}
      <LazySectionWrapper minHeight="400px">
        <MarketingAutomationSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <LogisticsOperationsSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <CustomerExperienceSection />
      </LazySectionWrapper>

      {/* FRAUD DETECTION - HIGH PRIORITY FEATURE */}
      <LazySectionWrapper minHeight="500px">
        <FraudDetectionSection />
      </LazySectionWrapper>

      {/* Customer Benefits Section - Google Sign-in Focus */}
      <LazySectionWrapper minHeight="600px">
        <CustomerBenefitsSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <BusinessManagementSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <AnalyticsInsightsSection />
      </LazySectionWrapper>

      {/* Server-Side Tracking & Facebook CAPI */}
      <LazySectionWrapper minHeight="500px">
        <ServerSideTrackingSection />
      </LazySectionWrapper>

      {/* Infrastructure */}
      <LazySectionWrapper minHeight="300px">
        <InfrastructureSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="250px">
        <SpeedComparison />
      </LazySectionWrapper>

      {/* Scalability Showcase - NEW */}
      <LazySectionWrapper minHeight="500px">
        <ScalabilityShowcase />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="250px">
        <CDNExplainer />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="250px">
        <SpeedImpact />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="250px">
        <CloudflareBenefitsCards />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="250px">
        <TechnicalSpecs />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <LiveDashboard />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="200px">
        <InfrastructureCTA />
      </LazySectionWrapper>

      {/* Trust & Comparison */}
      <LazySectionWrapper minHeight="250px">
        <TrustSection stats={marketingStats} />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <ComparisonSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="600px">
        <FeatureMatrixSection />
      </LazySectionWrapper>

      {/* Interactive Demo */}
      <LazySectionWrapper minHeight="400px">
        <InteractiveStoreDemo />
      </LazySectionWrapper>

      {/* ================================================================
          NEW FEATURES (Award-Winning Extras)
          ================================================================ */}
      <LazySectionWrapper minHeight="400px">
        <AllInOneSolution />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <PaymentIntegrationSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="600px">
        <CourierIntegrationSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <InventoryOrderManagement />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="600px">
        <WhatsAppSMSAutomationSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="600px">
        <EmailMarketingSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <StorefrontUXShowcase />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <CRMMarketingGrowth />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <TeamManagementSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <ActivityLogsSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <ProductReviewsSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <ReturnsRefundsSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <MessengerIntegrationSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <TaxReportsSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <UnifiedCommunicationHub />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <BanglaNativeLocalization />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="400px">
        <SecuritySpeedInfrastructure />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="500px">
        <UseCaseScenariosSection />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="600px">
        <PricingSection />
      </LazySectionWrapper>

      {/* FAQ */}
      <LazySectionWrapper minHeight="400px">
        <FAQSection />
      </LazySectionWrapper>

      {/* Final CTAs */}
      <LazySectionWrapper minHeight="300px">
        <AIPoweredFinalCTA />
      </LazySectionWrapper>

      <LazySectionWrapper minHeight="300px">
        <FinalCTA stats={marketingStats} />
      </LazySectionWrapper>

      {/* Footer - Shared Component */}
      <Footer />

      {/* Sticky CTA Button - FAB Style (All Screens) */}
      <div className="fixed bottom-4 left-4 z-40">
        <Link
          href="https://app.ozzyl.com/auth/register"
          className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-full text-sm sm:text-base shadow-xl shadow-[#006A4E]/40 hover:shadow-2xl hover:shadow-[#006A4E]/50 active:scale-[0.95] hover:scale-[1.05] transition-all duration-200"
        >
          <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
          {t('getStarted')}
        </Link>
      </div>

      {/* Visitor AI Chat Widget */}
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}
