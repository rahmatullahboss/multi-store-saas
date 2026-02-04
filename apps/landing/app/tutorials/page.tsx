import { Metadata } from 'next';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { ClientOnly } from '@/components/LazySection';
import { BookOpen, Video, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'টিউটোরিয়াল - Ozzyl | শিখুন এবং শুরু করুন',
  description: 'Ozzyl ব্যবহার করে কিভাবে অনলাইন স্টোর তৈরি করবেন - সম্পূর্ণ গাইড এবং টিউটোরিয়াল।',
};

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">টিউটোরিয়াল এবং গাইড</h1>
            <p className="text-xl text-white/60">
              স্টেপ-বাই-স্টেপ শিখুন কিভাবে Ozzyl দিয়ে সফল অনলাইন ব্যবসা তৈরি করবেন
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TutorialCard
              icon={<Video className="w-12 h-12" />}
              title="ভিডিও টিউটোরিয়াল"
              description="বাংলা ভিডিও গাইড দেখুন"
              badge="আসছে শীঘ্রই"
            />
            <TutorialCard
              icon={<BookOpen className="w-12 h-12" />}
              title="ডকুমেন্টেশন"
              description="বিস্তারিত ডকুমেন্টেশন পড়ুন"
              badge="আসছে শীঘ্রই"
            />
            <TutorialCard
              icon={<FileText className="w-12 h-12" />}
              title="ব্লগ পোস্ট"
              description="টিপস এবং ট্রিকস জানুন"
              badge="আসছে শীঘ্রই"
            />
          </div>

          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#006A4E] to-[#00875F] text-center">
            <h2 className="text-3xl font-bold text-white mb-4">আপনার ব্যবসা শুরু করতে প্রস্তুত?</h2>
            <p className="text-white/90 mb-6">মাত্র ৫ মিনিটে আপনার অনলাইন স্টোর তৈরি করুন</p>
            <a
              href="https://app.ozzyl.com/auth/register"
              className="inline-block px-8 py-3 bg-white text-[#006A4E] rounded-lg font-semibold hover:bg-white/90 transition"
            >
              ফ্রি শুরু করুন
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Chat Widget */}
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}

function TutorialCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="p-8 rounded-xl bg-white/5 border border-white/10 hover:border-[#006A4E]/50 transition">
      <div className="text-[#006A4E] mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 mb-4">{description}</p>
      {badge && (
        <span className="inline-block px-3 py-1 bg-[#F9A825]/20 text-[#F9A825] rounded-full text-sm">
          {badge}
        </span>
      )}
    </div>
  );
}
