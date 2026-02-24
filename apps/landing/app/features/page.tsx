'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import {
  type LucideIcon,
  ShoppingBag,
  CreditCard,
  Truck,
  ShieldAlert,
  Palette,
  BarChart3,
  Building2,
  Smartphone,
  Package,
  ClipboardList,
  Layers,
  Tag,
  Repeat,
  Banknote,
  Globe,
  MapPin,
  AlertTriangle,
  UserX,
  BadgeCheck,
  Layout,
  PaintBucket,
  ImagePlus,
  TrendingUp,
  DollarSign,
  Star,
  Lock,
  LinkIcon,
  TabletSmartphone,
  CheckCircle2,
  Zap,
  ArrowRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubFeature {
  label: string;
  icon: LucideIcon;
}

interface FeatureCategory {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor: string;
  glowColor: string;
  subFeatures: SubFeature[];
  badge?: string;
}

// ─── useInView hook ────────────────────────────────────────────────────────────

function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ─── Feature Data ─────────────────────────────────────────────────────────────

// ─── Animated Feature Card ────────────────────────────────────────────────────

function FeatureCard({ category, index }: { category: FeatureCategory; index: number }) {
  const [ref, inView] = useInView(0.1);
  const Icon = category.icon;

  const delayMs = (index % 4) * 80;

  return (
    <div
      ref={ref}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 flex flex-col gap-5 overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.06]"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0px)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delayMs}ms, transform 0.55s ease ${delayMs}ms, border-color 0.3s ease, background-color 0.3s ease`,
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: category.glowColor }}
      />

      {/* Top shine line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${category.accentColor}60, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${category.accentColor}18`, border: `1px solid ${category.accentColor}30` }}
        >
          <Icon className="w-6 h-6" style={{ color: category.accentColor }} />
        </div>

        {category.badge && (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 tracking-wide uppercase"
            style={{
              background: `${category.accentColor}15`,
              color: category.accentColor,
              border: `1px solid ${category.accentColor}30`,
            }}
          >
            {category.badge}
          </span>
        )}
      </div>

      {/* Title & Description */}
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white mb-2 font-display leading-snug">{category.title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{category.description}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06] relative z-10" />

      {/* Sub-features list */}
      <ul className="flex flex-col gap-2.5 relative z-10">
        {category.subFeatures.map((sf) => (
          <li key={sf.label} className="flex items-center gap-2.5 group/item">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors duration-200"
              style={{ background: `${category.accentColor}12` }}
            >
              <CheckCircle2 className="w-3 h-3" style={{ color: category.accentColor }} />
            </div>
            <span className="text-sm text-white/60 group-hover/item:text-white/85 transition-colors duration-200">
              {sf.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

function FeaturesHero() {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Tiny delay to ensure CSS transition fires after mount
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="relative pt-36 pb-20 px-4 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,106,78,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#006A4E]/30 bg-[#006A4E]/10 mb-6"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s',
          }}
        >
          <Zap className="w-3.5 h-3.5 text-[#00875F]" />
          <span className="text-xs font-semibold text-[#00875F] tracking-widest uppercase">
            {t('featuresHeroBadge')}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 font-display leading-[1.1] tracking-tight"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
          }}
        >
          {t('featuresHeroTitle')}{' '}
          <span
            className="relative inline-block"
            style={{
              background: 'linear-gradient(135deg, #006A4E 0%, #00C07A 50%, #00875F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('featuresHeroTitleAccent')}
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.55s ease 0.18s, transform 0.55s ease 0.18s',
          }}
        >
          {t('featuresHeroSubtitle')}
        </p>

        {/* CTA row */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.55s ease 0.26s, transform 0.55s ease 0.26s',
          }}
        >
          <a
            href="https://app.ozzyl.com/auth/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition-all shadow-[0_4px_24px_rgba(0,106,78,0.35)] hover:shadow-[0_6px_30px_rgba(0,106,78,0.5)] active:scale-[0.98]"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-medium rounded-xl text-sm transition-all"
          >
            View pricing
          </a>
        </div>

        {/* Stats strip */}
        <div
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.6s ease 0.38s',
          }}
        >
          {[
            { value: '8', label: t('featuresStatCategories') },
            { value: '3', label: t('featuresStatThemes') },
            { value: '5+', label: t('featuresStatPayments') },
            { value: '3', label: t('featuresStatCouriers') },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-extrabold text-white font-display">{stat.value}</span>
              <span className="text-xs text-white/40 tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader() {
  const [ref, inView] = useInView(0.2);

  return (
    <div
      ref={ref}
      className="text-center mb-14"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-4 tracking-tight">
        Built for every aspect of your business
      </h2>
      <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
        One platform. No integrations to juggle. No plugins to maintain.
      </p>
    </div>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

function BottomCTA() {
  const [ref, inView] = useInView(0.15);
  const { t } = useTranslation();

  return (
    <section
      ref={ref}
      className="relative mx-4 mb-20 rounded-3xl overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#006A4E] via-[#005740] to-[#003D2E]" />

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto text-center py-20 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white tracking-widest uppercase">
            {t('featBottomCTABadge')}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mb-4 leading-tight">
          {t('featBottomCTATitle')}
        </h2>
        <p className="text-white/75 text-base sm:text-lg mb-10 leading-relaxed">
          {t('featBottomCTASubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://app.ozzyl.com/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#006A4E] font-bold rounded-xl text-sm hover:bg-white/90 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] active:scale-[0.98]"
          >
            {t('featBottomCTAButton')}
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-sm transition-all"
          >
            {t('featBottomCTASecondary')}
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function useFeatures() {
  const { t } = useTranslation();
  const FEATURES: FeatureCategory[] = [
    {
      id: 'store-management',
      icon: ShoppingBag,
      title: t('featCatStoreManagement'),
      description: t('featCatStoreDesc'),
      accentColor: '#006A4E',
      glowColor: 'rgba(0, 106, 78, 0.15)',
      badge: 'Core',
      subFeatures: [
        { label: t('featSubProductCatalog'), icon: Package },
        { label: t('featSubOrderMgmt'), icon: ClipboardList },
        { label: t('featSubInventory'), icon: Layers },
        { label: t('featSubCategories'), icon: Tag },
        { label: t('featSubVariants'), icon: Repeat },
        { label: t('featSubDiscounts'), icon: BadgeCheck },
      ],
    },
    {
      id: 'payment-gateways',
      icon: CreditCard,
      title: t('featCatPayments'),
      description: t('featCatPaymentsDesc'),
      accentColor: '#F59E0B',
      glowColor: 'rgba(245, 158, 11, 0.12)',
      badge: 'BD-Native',
      subFeatures: [
        { label: 'bKash Gateway API', icon: Banknote },
        { label: t('featSubNagadGateway'), icon: Banknote },
        { label: t('featSubSSLCommerz'), icon: CreditCard },
        { label: t('featSubManualMFS'), icon: Repeat },
        { label: t('featSubCOD'), icon: Package },
        { label: t('featSubMultiGateway'), icon: Globe },
      ],
    },
    {
      id: 'courier-integration',
      icon: Truck,
      title: t('featCatCourier'),
      description: t('featCatCourierDesc'),
      accentColor: '#3B82F6',
      glowColor: 'rgba(59, 130, 246, 0.12)',
      subFeatures: [
        { label: t('featSubSteadfast'), icon: MapPin },
        { label: t('featSubPathao'), icon: MapPin },
        { label: t('featSubRedX'), icon: MapPin },
        { label: t('featSubBulkParcel'), icon: Layers },
        { label: t('featSubLiveStatus'), icon: TrendingUp },
        { label: t('featSubCourierCost'), icon: DollarSign },
      ],
    },
    {
      id: 'fraud-detection',
      icon: ShieldAlert,
      title: t('featCatFraud'),
      description: t('featCatFraudDesc'),
      accentColor: '#EF4444',
      glowColor: 'rgba(239, 68, 68, 0.12)',
      badge: 'Smart',
      subFeatures: [
        { label: t('featSubDeliveryScore'), icon: BarChart3 },
        { label: 'Return rate analysis per customer', icon: Repeat },
        { label: t('featSubIPFlag'), icon: AlertTriangle },
        { label: t('featSubBlacklist'), icon: UserX },
        { label: t('featSubCODAutoConfirm'), icon: BadgeCheck },
        { label: 'Risk level dashboard', icon: ShieldAlert },
      ],
    },
    {
      id: 'theme-system',
      icon: Palette,
      title: t('featCatThemes'),
      description: t('featCatThemesDesc'),
      accentColor: '#8B5CF6',
      glowColor: 'rgba(139, 92, 246, 0.12)',
      badge: '3 Active Themes',
      subFeatures: [
        { label: 'starter-store — clean & minimal', icon: Layout },
        { label: 'luxe-boutique — luxury fashion', icon: Star },
        { label: 'nova-lux — premium lifestyle', icon: Zap },
        { label: t('featSubColors'), icon: PaintBucket },
        { label: t('featSubLogo'), icon: ImagePlus },
        { label: t('featSubAnnouncement'), icon: Tag },
      ],
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: t('featCatAnalytics'),
      description: t('featCatAnalyticsDesc'),
      accentColor: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.12)',
      subFeatures: [
        { label: t('featSubRealtimeCharts'), icon: TrendingUp },
        { label: 'Revenue & GMV tracking', icon: DollarSign },
        { label: 'Top products by sales', icon: Star },
        { label: t('featSubOrderBreakdown'), icon: ClipboardList },
        { label: t('featSubAcquisition'), icon: BarChart3 },
        { label: t('featSubCourierStats'), icon: Truck },
      ],
    },
    {
      id: 'multi-tenant',
      icon: Building2,
      title: t('featCatMultiTenant'),
      description: t('featCatMultiTenantDesc'),
      accentColor: '#06B6D4',
      glowColor: 'rgba(6, 182, 212, 0.12)',
      badge: 'Enterprise-Grade',
      subFeatures: [
        { label: t('featSubPerStoreIsolation'), icon: Lock },
        { label: t('featSubCustomDomain'), icon: Globe },
        { label: t('featSubEdgeCDN'), icon: Zap },
        { label: 'Sub-100ms TTFB globally', icon: TrendingUp },
        { label: 'Unlimited store creation', icon: Building2 },
        { label: t('featSubDomainSSL'), icon: LinkIcon },
      ],
    },
    {
      id: 'mobile-app',
      icon: Smartphone,
      title: t('featCatMobile'),
      description: t('featCatMobileDesc'),
      accentColor: '#F97316',
      glowColor: 'rgba(249, 115, 22, 0.12)',
      badge: 'Android & iOS',
      subFeatures: [
        { label: t('featSubCapacitor'), icon: TabletSmartphone },
        { label: t('featSubAndroidIOS'), icon: Smartphone },
        { label: t('featSubPushNotif'), icon: Zap },
        { label: t('featSubMobileOrders'), icon: ClipboardList },
        { label: 'Dashboard & analytics view', icon: BarChart3 },
        { label: t('featSubInventoryMobile'), icon: Package },
      ],
    },
  ];
  return FEATURES;
}

// ─── Category Nav ─────────────────────────────────────────────────────────────

function CategoryNav() {
  const [activeId, setActiveId] = useState<string>('store-management');
  const FEATURES = useFeatures();

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    FEATURES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-24 z-30 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/[0.06] mb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            const isActive = activeId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => scrollTo(f.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0"
                style={{
                  color: isActive ? f.accentColor : 'rgba(255,255,255,0.45)',
                  background: isActive ? `${f.accentColor}12` : 'transparent',
                  border: `1px solid ${isActive ? f.accentColor + '30' : 'transparent'}`,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ─── Feature Section (anchor + card) ─────────────────────────────────────────

function FeatureSection({ category, index }: { category: FeatureCategory; index: number }) {
  return (
    <div id={category.id} className="scroll-mt-28">
      <FeatureCard category={category} index={index} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const FEATURES = useFeatures();
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      {/* Hero */}
      <FeaturesHero />

      {/* Sticky category nav */}
      <CategoryNav />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 pb-8">
        <SectionHeader />

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-24">
          {FEATURES.map((category, index) => (
            <FeatureSection key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Comparison strip */}
        <ComparisonStrip />
      </main>

      {/* Bottom CTA */}
      <BottomCTA />

      <Footer />
    </div>
  );
}

// ─── Comparison Strip ─────────────────────────────────────────────────────────

function ComparisonStrip() {
  const [ref, inView] = useInView(0.1);
  const { t } = useTranslation();

  const rows = [
    { feature: t('featCompareBkashNagad'), ozzyl: true, others: false },
    { feature: t('featCompareFraud'), ozzyl: true, others: false },
    { feature: t('featCompareCouriers'), ozzyl: true, others: false },
    { feature: t('featCompareEdge'), ozzyl: true, others: false },
    { feature: t('featCompareMultiTenant'), ozzyl: true, others: false },
    { feature: t('featCompareMobile'), ozzyl: true, others: false },
    { feature: t('featCompareNoFees'), ozzyl: true, others: false },
    { feature: t('featCompareBangla'), ozzyl: true, others: false },
  ];

  return (
    <div
      ref={ref}
      className="mb-24"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display mb-3 tracking-tight">
          {t('featCompareTitle')}
        </h2>
        <p className="text-white/45 text-sm sm:text-base">
          {t('featCompareSubtitle')}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left px-6 py-4 text-sm font-semibold text-white/40 w-full">
                {t('featCompareFeature')}
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-[#00875F] whitespace-nowrap">
                Ozzyl
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-white/30 whitespace-nowrap">
                {t('featCompareOthers')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.feature}
                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                style={{
                  opacity: inView ? 1 : 0,
                  transition: `opacity 0.4s ease ${i * 50 + 200}ms`,
                }}
              >
                <td className="px-6 py-3.5 text-sm text-white/65">{row.feature}</td>
                <td className="px-6 py-3.5 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#006A4E]/20">
                    <CheckCircle2 className="w-4 h-4 text-[#00875F]" />
                  </span>
                </td>
                <td className="px-6 py-3.5 text-center">
                  <span className="inline-block w-4 h-0.5 bg-white/20 rounded-full mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
