import type { MetaFunction } from '@remix-run/cloudflare';
import { MarketingHeader } from '@/components/MarketingHeader';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { ClientOnly } from '@/components/LazySection';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';

export const meta: MetaFunction = () => [
  { title: 'মূল্য তালিকা - Ozzyl | সাশ্রয়ী ই-কমার্স সমাধান' },
  {
    name: 'description',
    content:
      'Ozzyl এর মূল্য তালিকা দেখুন। ছোট ব্যবসা থেকে বড় এন্টারপ্রাইজ - সবার জন্য সাশ্রয়ী প্যাকেজ।',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}
