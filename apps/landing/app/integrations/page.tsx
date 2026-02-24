'use client';

import dynamic from 'next/dynamic';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { FinalCTA } from '@/components/FinalCTA';
import { ArrowRight, Plug } from 'lucide-react';
import Link from 'next/link';

// ── Reuse existing homepage sections ─────────────────────────────────────────
const PaymentIntegrationSection = dynamic(
  () => import('@/components/landing/PaymentIntegrationSection').then((m) => ({ default: m.PaymentIntegrationSection })),
  { ssr: false }
);
const CourierIntegrationSection = dynamic(
  () => import('@/components/landing/CourierIntegrationSection').then((m) => ({ default: m.CourierIntegrationSection })),
  { ssr: false }
);
const FraudDetectionSection = dynamic(
  () => import('@/components/FraudDetectionSection').then((m) => ({ default: m.FraudDetectionSection })),
  { ssr: false }
);

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      {/* Hero */}
      <div className="pt-32 pb-16 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#006A4E]/20 border border-[#006A4E]/30 text-[#00D97E] text-sm font-medium mb-6">
          <Plug className="w-4 h-4" />
          ইন্টিগ্রেশন
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          বাংলাদেশের সেরা{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#006A4E] to-[#00D97E]">
            পেমেন্ট ও কুরিয়ার
          </span>
          <br />সংযুক্ত
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
          bKash, Nagad, SSLCommerz, Steadfast, Pathao, RedX — সব একটি ড্যাশবোর্ড থেকে পরিচালনা করুন।
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="https://app.ozzyl.com/auth/register"
            className="px-8 py-3 bg-[#006A4E] hover:bg-[#00875F] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            ফ্রিতে শুরু করুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Reused sections ────────────────────────────────────────────────── */}

      {/* Payment Gateways */}
      <PaymentIntegrationSection />

      {/* Courier Integrations */}
      <CourierIntegrationSection />

      {/* Fraud Detection (related to courier data) */}
      <FraudDetectionSection />

      {/* CTA */}
      <FinalCTA />

      <Footer />
    </div>
  );
}
