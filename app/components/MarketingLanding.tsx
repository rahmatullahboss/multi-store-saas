/**
 * SaaS Marketing Landing Page - PERFORMANCE OPTIMIZED VERSION
 * 
 * Performance optimizations:
 * - Lazy loading for below-the-fold sections
 * - React.lazy() for heavy components
 * - Intersection Observer based rendering
 * - Reduced initial JS bundle
 */

import { lazy, Suspense, useState, useEffect } from 'react';
import { Link, useFetcher } from '@remix-run/react';
import { Rocket } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { LazySection, ClientOnly } from '~/components/LazySection';
import type { MarketingStats } from '~/routes/api.marketing-stats';

// ============================================================================
// CRITICAL - Load immediately (above the fold)
// ============================================================================
import { MarketingHeader } from '~/components/MarketingHeader';
import { AwardWinningHero } from '~/components/AwardWinningHero';

// ============================================================================
// LAZY - Load when user scrolls (below the fold)
// These components are heavy and not needed immediately
// ============================================================================

// Hero sections (loaded after first hero)
const AIHeroSection = lazy(() => 
  import('~/components/AIHeroSection').then(m => ({ default: m.AIHeroSection }))
);

// Problem/Solution
const ProblemSolutionSection = lazy(() => 
  import('~/components/ProblemSolutionSection').then(m => ({ default: m.ProblemSolutionSection }))
);

// AI Showcase sections (heavy - 31KB+)
const AIShowcaseSection = lazy(() => 
  import('~/components/landing/AIShowcaseSection').then(m => ({ default: m.AIShowcaseSection }))
);

// Builder sections
const DragDropBuilderShowcase = lazy(() => 
  import('~/components/landing/DragDropBuilderShowcase').then(m => ({ default: m.DragDropBuilderShowcase }))
);
const EditorModeComparison = lazy(() => 
  import('~/components/landing/EditorModeComparison').then(m => ({ default: m.EditorModeComparison }))
);
const AIMagicSection = lazy(() => 
  import('~/components/landing/AIMagicSection').then(m => ({ default: m.AIMagicSection }))
);
const AISocialProofSection = lazy(() => 
  import('~/components/landing/AISocialProofSection').then(m => ({ default: m.AISocialProofSection }))
);

// Features
const BentoFeaturesSection = lazy(() => 
  import('~/components/BentoFeaturesSection').then(m => ({ default: m.BentoFeaturesSection }))
);

// Infrastructure sections
const InfrastructureSection = lazy(() => 
  import('~/components/InfrastructureSection').then(m => ({ default: m.InfrastructureSection }))
);
const SpeedComparison = lazy(() => 
  import('~/components/SpeedComparison').then(m => ({ default: m.SpeedComparison }))
);
const CDNExplainer = lazy(() => 
  import('~/components/CDNExplainer').then(m => ({ default: m.CDNExplainer }))
);
const SpeedImpact = lazy(() => 
  import('~/components/SpeedImpact').then(m => ({ default: m.SpeedImpact }))
);
const CloudflareBenefitsCards = lazy(() => 
  import('~/components/CloudflareBenefitsCards').then(m => ({ default: m.CloudflareBenefitsCards }))
);
const TechnicalSpecs = lazy(() => 
  import('~/components/TechnicalSpecs').then(m => ({ default: m.TechnicalSpecs }))
);
const LiveDashboard = lazy(() => 
  import('~/components/LiveDashboard').then(m => ({ default: m.LiveDashboard }))
);
const InfrastructureCTA = lazy(() => 
  import('~/components/InfrastructureCTA').then(m => ({ default: m.InfrastructureCTA }))
);

// Trust & Comparison
const TrustSection = lazy(() => 
  import('~/components/TrustSection').then(m => ({ default: m.TrustSection }))
);
const ComparisonSection = lazy(() => 
  import('~/components/ComparisonSection').then(m => ({ default: m.ComparisonSection }))
);

// Interactive demo
const InteractiveStoreDemo = lazy(() => 
  import('~/components/InteractiveStoreDemo').then(m => ({ default: m.InteractiveStoreDemo }))
);

// FAQ & CTA
const FAQSection = lazy(() => 
  import('~/components/FAQSection').then(m => ({ default: m.FAQSection }))
);
const AIPoweredFinalCTA = lazy(() => 
  import('~/components/landing/AIPoweredFinalCTA').then(m => ({ default: m.AIPoweredFinalCTA }))
);
const FinalCTA = lazy(() => 
  import('~/components/FinalCTA').then(m => ({ default: m.FinalCTA }))
);

// AI Chat Widget - Only load on user interaction (very heavy - 25KB)
const OzzylAIChatWidget = lazy(() => 
  import('~/components/landing/OzzylAIChatWidget').then(m => ({ default: m.OzzylAIChatWidget }))
);


// ============================================================================
// Simple Section Skeleton
// ============================================================================
function SectionSkeleton() {
  return (
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
}


// ============================================================================
// Main Component
// ============================================================================
export function MarketingLanding() {
  const { t } = useTranslation();
  const isDarkMode = true; // Always dark mode for landing
  
  // Fetch real marketing stats from API
  const statsFetcher = useFetcher<MarketingStats>();
  
  useEffect(() => {
    if (statsFetcher.state === 'idle' && !statsFetcher.data) {
      statsFetcher.load('/api/marketing-stats');
    }
  }, [statsFetcher]);
  
  const marketingStats = statsFetcher.data;

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
      
      {/* AI Hero - First lazy section */}
      <LazySection minHeight="600px">
        <Suspense fallback={<SectionSkeleton />}>
          <AIHeroSection theme="dark" totalUsers={marketingStats?.totalUsers} />
        </Suspense>
      </LazySection>

      {/* Problem-Solution */}
      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <ProblemSolutionSection />
        </Suspense>
      </LazySection>

      {/* AI Showcase - Heavy section */}
      <LazySection minHeight="800px">
        <Suspense fallback={<SectionSkeleton />}>
          <AIShowcaseSection />
        </Suspense>
      </LazySection>

      {/* Builder sections */}
      <LazySection minHeight="600px">
        <Suspense fallback={<SectionSkeleton />}>
          <DragDropBuilderShowcase />
        </Suspense>
      </LazySection>

      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <EditorModeComparison />
        </Suspense>
      </LazySection>

      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <AIMagicSection />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <AISocialProofSection />
        </Suspense>
      </LazySection>

      {/* Features */}
      <LazySection minHeight="600px">
        <Suspense fallback={<SectionSkeleton />}>
          <BentoFeaturesSection />
        </Suspense>
      </LazySection>

      {/* Infrastructure - Multiple sections */}
      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <InfrastructureSection />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <SpeedComparison />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <CDNExplainer />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <SpeedImpact />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <CloudflareBenefitsCards />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <TechnicalSpecs />
        </Suspense>
      </LazySection>

      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <LiveDashboard />
        </Suspense>
      </LazySection>

      <LazySection minHeight="300px">
        <Suspense fallback={<SectionSkeleton />}>
          <InfrastructureCTA />
        </Suspense>
      </LazySection>

      {/* Trust & Comparison */}
      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <TrustSection stats={marketingStats} />
        </Suspense>
      </LazySection>

      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <ComparisonSection />
        </Suspense>
      </LazySection>

      {/* Interactive Demo */}
      <LazySection minHeight="600px">
        <Suspense fallback={<SectionSkeleton />}>
          <InteractiveStoreDemo />
        </Suspense>
      </LazySection>

      {/* FAQ */}
      <LazySection minHeight="500px">
        <Suspense fallback={<SectionSkeleton />}>
          <FAQSection />
        </Suspense>
      </LazySection>

      {/* Final CTAs */}
      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <AIPoweredFinalCTA />
        </Suspense>
      </LazySection>

      <LazySection minHeight="400px">
        <Suspense fallback={<SectionSkeleton />}>
          <FinalCTA stats={marketingStats} />
        </Suspense>
      </LazySection>

      {/* Footer - Static, no lazy needed */}
      <footer className="py-12 md:py-16 px-4 bg-[#0A0F0D] text-white/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="sm:col-span-2 md:col-span-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
                {/* Optimized: Use smaller logo size */}
                <img 
                  src="/brand/logo-white-xs.webp" 
                  alt="Ozzyl" 
                  className="h-10 w-auto"
                  width="103"
                  height="40"
                  loading="lazy"
                />
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

      {/* AI Chat Widget - Lazy loaded, only renders when user wants to interact */}
      <ClientOnly>
        <Suspense fallback={null}>
          <OzzylAIChatWidget />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
