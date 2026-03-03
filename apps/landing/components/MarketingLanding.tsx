
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
import { ASSETS } from '@/config/assets';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { Footer } from '@/components/Footer';

// ============================================================================
// CRITICAL - Load immediately (above the fold)
// ============================================================================
import { MarketingHeader } from '@/components/MarketingHeader';

import { AwardWinningHero } from '@/components/AwardWinningHero';
import { FraudDetectionSection } from '@/components/FraudDetectionSection';
import { AIHeroSection } from '@/components/AIHeroSection';
import { ProblemSolutionSection } from '@/components/ProblemSolutionSection';
import { AIShowcaseSection } from '@/components/landing/AIShowcaseSection';
import { DragDropBuilderShowcase } from '@/components/landing/DragDropBuilderShowcase';
import { EditorModeComparison } from '@/components/landing/EditorModeComparison';
import { AIMagicSection } from '@/components/landing/AIMagicSection';
import { AISocialProofSection } from '@/components/landing/AISocialProofSection';
import { BentoFeaturesSection } from '@/components/BentoFeaturesSection';
import { InfrastructureSection } from '@/components/InfrastructureSection';
import { SpeedComparison } from '@/components/SpeedComparison';
import { CDNExplainer } from '@/components/CDNExplainer';
import { SpeedImpact } from '@/components/SpeedImpact';
import { CloudflareBenefitsCards } from '@/components/CloudflareBenefitsCards';
import { TechnicalSpecs } from '@/components/TechnicalSpecs';
import { LiveDashboard } from '@/components/LiveDashboard';
import { InfrastructureCTA } from '@/components/InfrastructureCTA';
import { TrustSection } from '@/components/TrustSection';
import { ComparisonSection } from '@/components/ComparisonSection';
import { InteractiveStoreDemo } from '@/components/InteractiveStoreDemo';
import { FAQSection } from '@/components/FAQSection';
import { FinalCTA } from '@/components/FinalCTA';
import { MarketingAutomationSection } from '@/components/landing/MarketingAutomationSection';
import { LogisticsOperationsSection } from '@/components/landing/LogisticsOperationsSection';
import { BusinessManagementSection } from '@/components/landing/BusinessManagementSection';
import { CustomerExperienceSection } from '@/components/landing/CustomerExperienceSection';
import { CustomerBenefitsSection } from '@/components/landing/CustomerBenefitsSection';
import { AnalyticsInsightsSection } from '@/components/landing/AnalyticsInsightsSection';
import { UseCaseScenariosSection } from '@/components/landing/UseCaseScenariosSection';
import { FeatureMatrixSection } from '@/components/landing/FeatureMatrixSection';
import { CourierIntegrationSection } from '@/components/landing/CourierIntegrationSection';
import { WhatsAppSMSAutomationSection } from '@/components/landing/WhatsAppSMSAutomationSection';
import { EmailMarketingSection } from '@/components/landing/EmailMarketingSection';
import { TeamManagementSection } from '@/components/landing/TeamManagementSection';
import { ActivityLogsSection } from '@/components/landing/ActivityLogsSection';
import { ProductReviewsSection } from '@/components/landing/ProductReviewsSection';
import { ReturnsRefundsSection } from '@/components/landing/ReturnsRefundsSection';
import { MessengerIntegrationSection } from '@/components/landing/MessengerIntegrationSection';
import { TaxReportsSection } from '@/components/landing/TaxReportsSection';
import { UnifiedCommunicationHub } from '@/components/landing/UnifiedCommunicationHub';
import { AIPoweredFinalCTA } from '@/components/landing/AIPoweredFinalCTA';
import { AllInOneSolution } from '@/components/landing/AllInOneSolution';
import { PaymentIntegrationSection } from '@/components/landing/PaymentIntegrationSection';
import { InventoryOrderManagement } from '@/components/landing/InventoryOrderManagement';
import { StorefrontUXShowcase } from '@/components/landing/StorefrontUXShowcase';
import { CRMMarketingGrowth } from '@/components/landing/CRMMarketingGrowth';
import { BanglaNativeLocalization } from '@/components/landing/BanglaNativeLocalization';
import { SecuritySpeedInfrastructure } from '@/components/landing/SecuritySpeedInfrastructure';
import { ScalabilityShowcase } from '@/components/landing/ScalabilityShowcase';
import { PricingSection } from '@/components/PricingSection';



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




// MEDIUM PRIORITY - Client-side only, load on demand







// Infrastructure sections









// Trust & sections



// Interactive demo


// FAQ & CTA



// New Feature sections



















// Award-Winning Extras












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
