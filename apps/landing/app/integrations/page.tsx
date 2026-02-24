'use client';

import { useState } from 'react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'all' | 'payment' | 'courier' | 'fraud' | 'coming-soon';
type Plan = 'free' | 'paid' | 'platform' | 'coming-soon';

interface Integration {
  id: string;
  name: string;
  category: Exclude<Category, 'all'>;
  plan: Plan;
  description: string;
  features: string[];
  icon: string;
  color: string;
  bgColor: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  // ── Payment ──────────────────────────────────────────────────────────────
  {
    id: 'bkash-gateway',
    name: 'bKash Gateway API',
    category: 'payment',
    plan: 'paid',
    description:
      'Full bKash payment gateway integration with tokenized checkout and automatic webhook verification for seamless mobile financial services.',
    features: ['Tokenized checkout', 'Webhook verification', 'Refund support', 'Transaction logs'],
    icon: 'B',
    color: '#E2136E',
    bgColor: 'rgba(226,19,110,0.1)',
  },
  {
    id: 'nagad-gateway',
    name: 'Nagad Gateway API',
    category: 'payment',
    plan: 'paid',
    description:
      'Nagad payment gateway with RSA signing, secure 3-step payment flow, and real-time transaction status updates.',
    features: ['RSA signing', '3-step payment flow', 'Real-time status', 'Auto reconciliation'],
    icon: 'N',
    color: '#F7941D',
    bgColor: 'rgba(247,148,29,0.1)',
  },
  {
    id: 'sslcommerz',
    name: 'SSLCommerz',
    category: 'payment',
    plan: 'platform',
    description:
      'Platform-default payment gateway supporting all major cards, mobile banking, and net banking. Per-store override available on paid plans.',
    features: ['Cards & MFS', 'Net banking', 'EMI support', 'Per-store override'],
    icon: 'S',
    color: '#00A651',
    bgColor: 'rgba(0,166,81,0.1)',
  },
  {
    id: 'manual-bkash',
    name: 'Manual bKash',
    category: 'payment',
    plan: 'free',
    description:
      'Accept manual bKash payments by sharing your personal bKash number. Merchants confirm transactions manually.',
    features: ['Personal number', 'Manual confirmation', 'Screenshot upload', 'Order notes'],
    icon: 'B',
    color: '#E2136E',
    bgColor: 'rgba(226,19,110,0.08)',
  },
  {
    id: 'manual-nagad',
    name: 'Manual Nagad',
    category: 'payment',
    plan: 'free',
    description:
      'Accept manual Nagad payments. Customers send money to your Nagad number and submit transaction IDs.',
    features: ['Personal number', 'Transaction ID verify', 'Manual confirmation', 'Order notes'],
    icon: 'N',
    color: '#F7941D',
    bgColor: 'rgba(247,148,29,0.08)',
  },
  {
    id: 'manual-rocket',
    name: 'Manual Rocket',
    category: 'payment',
    plan: 'free',
    description:
      'Accept manual Rocket (DBBL) mobile banking payments. Simple and accessible for all merchant tiers.',
    features: ['Personal number', 'Manual confirmation', 'Screenshot upload', 'All plans'],
    icon: 'R',
    color: '#8B2FC9',
    bgColor: 'rgba(139,47,201,0.1)',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    category: 'payment',
    plan: 'free',
    description:
      'Enable Cash on Delivery for customers who prefer to pay when their order arrives. Available on all plans with courier integration.',
    features: ['All plans', 'Courier synced', 'Auto status update', 'COD reports'],
    icon: '₳',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.1)',
  },

  // ── Courier ───────────────────────────────────────────────────────────────
  {
    id: 'steadfast',
    name: 'Steadfast Courier',
    category: 'courier',
    plan: 'free',
    description:
      'Full Steadfast integration with order creation, live tracking, and rich fraud data including delivery rate and return rate by customer phone number.',
    features: ['Order creation', 'Live tracking', 'Fraud: delivery rate %', 'Fraud: return rate %'],
    icon: 'SF',
    color: '#00D1FF',
    bgColor: 'rgba(0,209,255,0.1)',
  },
  {
    id: 'pathao',
    name: 'Pathao Courier',
    category: 'courier',
    plan: 'free',
    description:
      'Pathao courier integration with order creation, real-time tracking, price plan API, and courier history for fraud detection.',
    features: ['Order creation', 'Live tracking', 'Price plan API', 'Fraud history data'],
    icon: 'P',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.1)',
  },
  {
    id: 'redx',
    name: 'RedX Courier',
    category: 'courier',
    plan: 'free',
    description:
      'RedX courier integration supporting order creation and real-time shipment tracking directly from your Ozzyl dashboard.',
    features: ['Order creation', 'Live tracking', 'Status webhooks', 'Bulk dispatch'],
    icon: 'RX',
    color: '#FF3B30',
    bgColor: 'rgba(255,59,48,0.1)',
  },

  // ── Fraud ─────────────────────────────────────────────────────────────────
  {
    id: 'fraud-steadfast',
    name: 'Steadfast Fraud Data',
    category: 'fraud',
    plan: 'free',
    description:
      'Leverage Steadfast courier history to surface delivery rate % and return rate % per customer phone number before you dispatch.',
    features: ['Delivery rate %', 'Return rate %', 'Phone-based lookup', 'Pre-dispatch check'],
    icon: 'SF',
    color: '#00D1FF',
    bgColor: 'rgba(0,209,255,0.08)',
  },
  {
    id: 'fraud-pathao',
    name: 'Pathao Fraud Data',
    category: 'fraud',
    plan: 'free',
    description:
      'Use Pathao courier history to detect high-risk customers by analysing their historical delivery and return patterns.',
    features: ['Courier history', 'Risk scoring', 'Phone-based lookup', 'Order flagging'],
    icon: 'P',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.08)',
  },
  {
    id: 'fraud-redx',
    name: 'RedX Fraud Data',
    category: 'fraud',
    plan: 'free',
    description:
      'RedX shipment history integrated into Ozzyl\'s fraud engine to identify repeat returners and bad actors.',
    features: ['Shipment history', 'Return analysis', 'Phone-based lookup', 'Auto flagging'],
    icon: 'RX',
    color: '#FF3B30',
    bgColor: 'rgba(255,59,48,0.08)',
  },
  {
    id: 'cloudflare-ip',
    name: 'Cloudflare IP Intelligence',
    category: 'fraud',
    plan: 'platform',
    description:
      'Cloudflare edge network intelligence for real-time country detection, VPN/proxy identification, and bot detection on every storefront visit.',
    features: ['Country detection', 'Bot detection', 'VPN/proxy flag', 'Edge-native, zero latency'],
    icon: 'CF',
    color: '#F6821F',
    bgColor: 'rgba(246,130,31,0.1)',
  },

  // ── Coming Soon ───────────────────────────────────────────────────────────
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'coming-soon',
    plan: 'coming-soon',
    description:
      'International card payments via Stripe. Accept Visa, Mastercard, and American Express from customers worldwide.',
    features: ['International cards', 'Subscriptions', 'Payouts', 'Global coverage'],
    icon: 'St',
    color: '#635BFF',
    bgColor: 'rgba(99,91,255,0.1)',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'coming-soon',
    plan: 'coming-soon',
    description:
      'Accept PayPal payments from international customers. Ideal for cross-border e-commerce expansion.',
    features: ['PayPal wallet', 'Guest checkout', 'Buyer protection', 'Multi-currency'],
    icon: 'PP',
    color: '#003087',
    bgColor: 'rgba(0,48,135,0.15)',
  },
  {
    id: 'dhl',
    name: 'DHL Express',
    category: 'coming-soon',
    plan: 'coming-soon',
    description:
      'International shipping via DHL Express. Reach customers globally with reliable, tracked delivery.',
    features: ['International shipping', 'Live tracking', 'Customs docs', 'Express delivery'],
    icon: 'DH',
    color: '#FFCC00',
    bgColor: 'rgba(255,204,0,0.1)',
  },
  {
    id: 'fedex',
    name: 'FedEx',
    category: 'coming-soon',
    plan: 'coming-soon',
    description:
      'Global delivery via FedEx network. Enable cross-border logistics for international market expansion.',
    features: ['Global logistics', 'Live tracking', 'Rate calculation', 'Express & economy'],
    icon: 'FX',
    color: '#4D148C',
    bgColor: 'rgba(77,20,140,0.12)',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business API',
    category: 'coming-soon',
    plan: 'coming-soon',
    description:
      'Send order confirmations, shipping updates, and marketing messages directly via WhatsApp Business API.',
    features: ['Order notifications', 'Shipping alerts', 'Marketing messages', 'Template messages'],
    icon: 'WA',
    color: '#25D366',
    bgColor: 'rgba(37,211,102,0.1)',
  },
  {
    id: 'facebook-catalog',
    name: 'Facebook Catalog Sync',
    category: 'coming-soon',
    plan: 'coming-soon',
    description:
      'Automatically sync your Ozzyl product catalog with Facebook & Instagram for dynamic product ads and shops.',
    features: ['Auto product sync', 'Dynamic ads', 'Instagram Shop', 'Inventory updates'],
    icon: 'FB',
    color: '#1877F2',
    bgColor: 'rgba(24,119,242,0.1)',
  },
];

// ─── Filter Tab config ────────────────────────────────────────────────────────

const TABS: { id: Category; label: string; emoji: string }[] = [
  { id: 'all',          label: 'All',          emoji: '⚡' },
  { id: 'payment',      label: 'Payment',      emoji: '💳' },
  { id: 'courier',      label: 'Courier',      emoji: '📦' },
  { id: 'fraud',        label: 'Fraud Shield', emoji: '🛡️' },
  { id: 'coming-soon',  label: 'Coming Soon',  emoji: '🚀' },
];

// ─── Plan Badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: Plan }) {
  const styles: Record<Plan, { label: string; className: string }> = {
    free: {
      label: 'All Plans',
      className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    },
    paid: {
      label: 'Paid Plan',
      className: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    },
    platform: {
      label: 'Platform',
      className: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    },
    'coming-soon': {
      label: 'Coming Soon',
      className: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    },
  };

  const { label, className } = styles[plan];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${className}`}>
      {label}
    </span>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Exclude<Category, 'all'> }) {
  const styles: Record<Exclude<Category, 'all'>, { label: string; className: string }> = {
    payment:      { label: '💳 Payment',      className: 'text-pink-400/80 bg-pink-500/8' },
    courier:      { label: '📦 Courier',      className: 'text-cyan-400/80 bg-cyan-500/8' },
    fraud:        { label: '🛡️ Fraud Shield', className: 'text-orange-400/80 bg-orange-500/8' },
    'coming-soon':{ label: '🚀 Coming Soon',  className: 'text-purple-400/80 bg-purple-500/8' },
  };

  const { label, className } = styles[category];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Integration Card ─────────────────────────────────────────────────────────

function IntegrationCard({ integration, index }: { integration: Integration; index: number }) {
  const isComingSoon = integration.plan === 'coming-soon';
  const delay = `${(index % 6) * 60}ms`;

  return (
    <div
      className="group relative rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm overflow-hidden
                 transition-all duration-300 ease-out
                 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl
                 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      {/* Top glow line on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${integration.color}, transparent)` }}
      />

      {/* Coming-soon overlay shimmer */}
      {isComingSoon && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: `repeating-linear-gradient(
                -45deg,
                ${integration.color} 0px,
                ${integration.color} 1px,
                transparent 1px,
                transparent 12px
              )`,
            }}
          />
        </div>
      )}

      <div className="relative p-6 flex flex-col gap-4 h-full">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold
                       transition-transform duration-300 group-hover:scale-110"
            style={{ background: integration.bgColor, color: integration.color, border: `1px solid ${integration.color}22` }}
          >
            {integration.icon}
          </div>

          {/* Plan badge top-right */}
          <PlanBadge plan={integration.plan} />
        </div>

        {/* Name & category */}
        <div>
          <h3 className="text-white font-semibold text-base leading-tight mb-1.5 group-hover:text-white transition-colors">
            {integration.name}
          </h3>
          <CategoryBadge category={integration.category} />
        </div>

        {/* Description */}
        <p className="text-white/50 text-sm leading-relaxed flex-1">
          {integration.description}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {integration.features.map((f) => (
            <span
              key={f}
              className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-white/40 border border-white/5
                         group-hover:text-white/60 group-hover:border-white/10 transition-colors duration-300"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: '7+',  label: 'Payment Methods' },
    { value: '3',   label: 'Courier Partners' },
    { value: '4',   label: 'Fraud Data Sources' },
    { value: '6',   label: 'Coming Soon' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="text-center p-5 rounded-2xl bg-white/[0.03] border border-white/8 animate-fade-in-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="text-3xl font-bold font-display text-white mb-1">{s.value}</div>
          <div className="text-xs text-white/40 uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [activeFilter, setActiveFilter] = useState<Category>('all');
  const { t } = useTranslation();

  const filtered =
    activeFilter === 'all'
      ? INTEGRATIONS
      : INTEGRATIONS.filter((i) => i.category === activeFilter);

  const counts: Record<Category, number> = {
    all:          INTEGRATIONS.length,
    payment:      INTEGRATIONS.filter((i) => i.category === 'payment').length,
    courier:      INTEGRATIONS.filter((i) => i.category === 'courier').length,
    fraud:        INTEGRATIONS.filter((i) => i.category === 'fraud').length,
    'coming-soon':INTEGRATIONS.filter((i) => i.category === 'coming-soon').length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      <main className="relative pt-32 pb-24 overflow-hidden">

        {/* ── Background grid pattern ───────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* ── Ambient glows ─────────────────────────────────────────────── */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20 pointer-events-none blur-[120px] animate-pulse-soft"
          style={{ background: 'radial-gradient(ellipse, #006A4E 0%, transparent 70%)' }}
        />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, #E2136E 0%, transparent 70%)' }}
        />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, #635BFF 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Hero header ───────────────────────────────────────────────── */}
          <div className="text-center mb-14 animate-fade-in-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006A4E]/15 border border-[#006A4E]/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D17A] animate-pulse-soft" />
              <span className="text-[#00D17A] text-xs font-semibold tracking-wider uppercase">
                {t('intHeroBadge')}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-white mb-5 leading-tight">
              {t('intHeroTitle')}{' '}
              <span
                className="animate-shimmer"
                style={{
                  background: 'linear-gradient(90deg, #00D17A, #006A4E, #00D17A)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('intHeroTitleAccent')}
              </span>
            </h1>

            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              {t('intHeroSubtitle')}
            </p>
          </div>

          {/* ── Stats ─────────────────────────────────────────────────────── */}
          <StatsBar />

          {/* ── Filter tabs ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 active:scale-95
                    ${isActive
                      ? 'bg-[#006A4E] text-white shadow-lg shadow-[#006A4E]/30 border border-[#00875F]/50'
                      : 'bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/80 hover:border-white/15'
                    }
                  `}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold
                      ${isActive ? 'bg-white/20 text-white' : 'bg-white/8 text-white/40'}
                    `}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Grid ──────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((integration, index) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                index={index}
              />
            ))}
          </div>

          {/* ── Empty state (shouldn't happen but just in case) ─────────── */}
          {filtered.length === 0 && (
            <div className="text-center py-24 text-white/30">
              <div className="text-5xl mb-4">🔌</div>
              <p className="text-lg">{t('intEmptyState')}</p>
            </div>
          )}

          {/* ── Bottom CTA ────────────────────────────────────────────────── */}
          <div className="mt-20 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#006A4E]/20 via-[#0A0A0F] to-[#006A4E]/10 p-12 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {/* Decorative orb */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-[60px] opacity-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, #006A4E, transparent)' }}
            />
            <div className="relative">
              <p className="text-[#00D17A] text-sm font-semibold uppercase tracking-widest mb-3">
                {t('intBottomCTABadge')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mb-4">
                {t('intBottomCTATitle')}
              </h2>
              <p className="text-white/50 max-w-lg mx-auto mb-8 text-base">
                {t('intBottomCTASubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://app.ozzyl.com/auth/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#006A4E] to-[#00875F]
                             hover:from-[#005740] hover:to-[#006A4E] text-white font-bold rounded-xl text-sm
                             transition-all duration-200 shadow-lg shadow-[#006A4E]/30
                             hover:shadow-[#006A4E]/50 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {t('intBottomCTAButton')}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-white/5 hover:bg-white/10
                             border border-white/10 hover:border-white/20 text-white/80 hover:text-white
                             font-semibold rounded-xl text-sm transition-all duration-200 active:scale-[0.98]"
                >
                  {t('intBottomCTASecondary')}
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
