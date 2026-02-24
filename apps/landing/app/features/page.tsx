'use client';

import dynamic from 'next/dynamic';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { FinalCTA } from '@/components/FinalCTA';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

// ── Lazy load existing homepage sections ──────────────────────────────────────
const BentoFeaturesSection = dynamic(
  () => import('@/components/BentoFeaturesSection').then((m) => ({ default: m.BentoFeaturesSection })),
  { ssr: false }
);
const FraudDetectionSection = dynamic(
  () => import('@/components/FraudDetectionSection').then((m) => ({ default: m.FraudDetectionSection })),
  { ssr: false }
);
const PaymentIntegrationSection = dynamic(
  () => import('@/components/landing/PaymentIntegrationSection').then((m) => ({ default: m.PaymentIntegrationSection })),
  { ssr: false }
);
const CourierIntegrationSection = dynamic(
  () => import('@/components/landing/CourierIntegrationSection').then((m) => ({ default: m.CourierIntegrationSection })),
  { ssr: false }
);
const InfrastructureSection = dynamic(
  () => import('@/components/InfrastructureSection').then((m) => ({ default: m.InfrastructureSection })),
  { ssr: false }
);
const ComparisonSection = dynamic(
  () => import('@/components/ComparisonSection').then((m) => ({ default: m.ComparisonSection })),
  { ssr: false }
);

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      {/* Hero */}
      <div className="pt-32 pb-16 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#006A4E]/20 border border-[#006A4E]/30 text-[#00D97E] text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          সব ফিচার একনজরে
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          আপনার ব্যবসার জন্য{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006A4E] to-[#00D97E]">
            সব কিছু এখানে
          </span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
          পেমেন্ট থেকে ফ্রড ডিটেকশন, কুরিয়ার থেকে ইনফ্রাস্ট্রাকচার — একটি প্ল্যাটফর্মে সব।
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="https://app.ozzyl.com/auth/register"
            className="px-8 py-3 bg-[#006A4E] hover:bg-[#00875F] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            ফ্রিতে শুরু করুন <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-colors"
          >
            মূল্য তালিকা দেখুন
          </Link>
        </div>
      </div>

      {/* ── All homepage sections reused here ─────────────────────────────── */}

      {/* 1. Features Overview */}
      <BentoFeaturesSection />

      {/* 2. Payment */}
      <PaymentIntegrationSection />

      {/* 3. Courier */}
      <CourierIntegrationSection />

      {/* 4. Fraud Detection */}
      <FraudDetectionSection />

      {/* 5. Infrastructure */}
      <InfrastructureSection />

      {/* 6. Comparison */}
      <ComparisonSection />

      {/* CTA */}
      <FinalCTA />

      <Footer />
    </div>
  );
}
