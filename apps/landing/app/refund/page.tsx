import { Metadata } from 'next';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { ClientOnly } from '@/components/LazySection';

export const metadata: Metadata = {
  title: 'রিফান্ড নীতি - Ozzyl',
  description: 'Ozzyl এর রিফান্ড এবং ক্যান্সেলেশন নীতি জানুন।',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-6">রিফান্ড নীতি</h1>
          <p className="text-white/60 mb-12">সর্বশেষ আপডেট: জানুয়ারি ২০২৬</p>

          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">৭ দিনের মানি-ব্যাক গ্যারান্টি</h2>
              <p className="text-white/70 leading-relaxed">
                আপনি যদি সেবায় সন্তুষ্ট না হন, প্রথম ৭ দিনের মধ্যে সম্পূর্ণ রিফান্ড পাবেন। কোনো
                প্রশ্ন করা হবে না।
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">রিফান্ডের শর্ত</h2>
              <ul className="list-disc pl-6 text-white/70 space-y-2">
                <li>প্রথম ৭ দিনের মধ্যে রিফান্ড রিকোয়েস্ট করতে হবে</li>
                <li>অ্যাকাউন্ট সক্রিয় থাকতে হবে</li>
                <li>কোনো মিথ্যা বা জালিয়াতি করা যাবে না</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">প্রক্রিয়া</h2>
              <ol className="list-decimal pl-6 text-white/70 space-y-2">
                <li>support@ozzyl.com এ ইমেইল করুন</li>
                <li>আপনার অ্যাকাউন্ট ইমেইল এবং কারণ উল্লেখ করুন</li>
                <li>৩-৫ কার্যদিবসের মধ্যে রিফান্ড প্রসেস হবে</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">যোগাযোগ</h2>
              <p className="text-white/70 leading-relaxed">
                রিফান্ড সংক্রান্ত:{' '}
                <a href="mailto:refund@ozzyl.com" className="text-[#006A4E] hover:underline">
                  refund@ozzyl.com
                </a>
              </p>
            </section>
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
