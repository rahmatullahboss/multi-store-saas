import { Metadata } from 'next';
import { MarketingHeader } from '@/components/MarketingHeader';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { ClientOnly } from '@/components/LazySection';

export const metadata: Metadata = {
  title: 'মূল্য তালিকা - Ozzyl | সাশ্রয়ী ই-কমার্স সমাধান',
  description:
    'Ozzyl এর মূল্য তালিকা দেখুন। ছোট ব্যবসা থেকে বড় এন্টারপ্রাইজ - সবার জন্য সাশ্রয়ী প্যাকেজ।',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />
      <div className="pt-20">
        <PricingSection />
      </div>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}
