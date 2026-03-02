import type { MetaFunction } from '@remix-run/cloudflare';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { ClientOnly } from '@/components/LazySection';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { Store, Heart, Rocket, Users, Globe, Target } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'আমাদের সম্পর্কে - Ozzyl | বাংলাদেশী ই-কমার্স প্ল্যাটফর্ম' },
  {
    name: 'description',
    content:
      'Ozzyl - বাংলাদেশী উদ্যোক্তাদের জন্য তৈরি সম্পূর্ণ ই-কমার্স প্ল্যাটফর্ম। আমাদের মিশন ও ভিশন জানুন।',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">আমাদের সম্পর্কে</h1>
            <p className="text-xl text-white/60">
              বাংলাদেশী উদ্যোক্তাদের ডিজিটাল স্বপ্ন বাস্তবায়নে Ozzyl
            </p>
          </div>

          {/* Mission */}
          <section className="mb-16 p-8 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-[#006A4E]" />
              <h2 className="text-3xl font-bold text-white">আমাদের মিশন</h2>
            </div>
            <p className="text-lg text-white/70 leading-relaxed">
              প্রতিটি বাংলাদেশী উদ্যোক্তা যেন সহজেই অনলাইন ব্যবসা শুরু করতে পারে - এটাই আমাদের
              লক্ষ্য। আমরা বিশ্বমানের টেকনোলজি বাংলাদেশের উদ্যোক্তাদের হাতে তুলে দিতে চাই, যেন তারা
              বিদেশি প্ল্যাটফর্মের উপর নির্ভর না করে নিজেদের ব্র্যান্ড তৈরি করতে পারে।
            </p>
          </section>

          {/* Vision */}
          <section className="mb-16 p-8 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="w-8 h-8 text-[#F9A825]" />
              <h2 className="text-3xl font-bold text-white">আমাদের ভিশন</h2>
            </div>
            <p className="text-lg text-white/70 leading-relaxed">
              ২০৩০ সালের মধ্যে বাংলাদেশের সবচেয়ে বড় এবং সবচেয়ে বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম
              হওয়া। আমরা চাই প্রতিটি ছোট ব্যবসায়ী, উদ্যোক্তা এবং ব্র্যান্ড Ozzyl ব্যবহার করে তাদের
              ডিজিটাল উপস্থিতি তৈরি করুক এবং সফল হোক।
            </p>
          </section>

          {/* Values */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">আমাদের মূল্যবোধ</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ValueCard
                icon={<Heart className="w-10 h-10" />}
                title="গ্রাহক প্রথম"
                description="গ্রাহকের সফলতাই আমাদের সফলতা"
              />
              <ValueCard
                icon={<Users className="w-10 h-10" />}
                title="স্বচ্ছতা"
                description="সব কিছুতে স্বচ্ছতা এবং সততা"
              />
              <ValueCard
                icon={<Globe className="w-10 h-10" />}
                title="উদ্ভাবন"
                description="নতুন এবং উন্নত সমাধান"
              />
            </div>
          </section>

          {/* CTA */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-[#006A4E] to-[#00875F]">
            <h2 className="text-3xl font-bold text-white mb-4">আমাদের সাথে যুক্ত হন</h2>
            <p className="text-white/90 mb-6">আজই আপনার অনলাইন স্টোর শুরু করুন</p>
            <a
              href="https://app.ozzyl.com/auth/register"
              className="inline-block px-8 py-3 bg-white text-[#006A4E] rounded-lg font-semibold hover:bg-white/90 transition"
            >
              ফ্রি একাউন্ট খুলুন
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <ClientOnly>
        <OzzylAIChatWidget />
      </ClientOnly>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#006A4E]/50 transition">
      <div className="text-[#006A4E] mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </div>
  );
}
