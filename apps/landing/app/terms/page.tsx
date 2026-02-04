import { Metadata } from 'next';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';
import { ClientOnly } from '@/components/LazySection';

export const metadata: Metadata = {
  title: 'শর্তাবলী - Ozzyl',
  description: 'Ozzyl ব্যবহারের শর্তাবলী পড়ুন।',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-6">শর্তাবলী</h1>
          <p className="text-white/60 mb-12">সর্বশেষ আপডেট: জানুয়ারি ২০২৬</p>

          <div className="space-y-8 text-white/80">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">১. সেবা ব্যবহারের শর্ত</h2>
              <p className="text-white/70 leading-relaxed">
                Ozzyl ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। যেকোনো সময় এই শর্ত পরিবর্তন হতে
                পারে।
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">২. অ্যাকাউন্ট দায়িত্ব</h2>
              <p className="text-white/70 leading-relaxed">
                আপনার অ্যাকাউন্টের নিরাপত্তা এবং সকল কার্যক্রমের জন্য আপনি দায়ী। পাসওয়ার্ড নিরাপদ
                রাখুন এবং কাউকে শেয়ার করবেন না।
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">৩. নিষিদ্ধ কার্যক্রম</h2>
              <ul className="list-disc pl-6 text-white/70 space-y-2">
                <li>অবৈধ পণ্য বিক্রয়</li>
                <li>জাল বা নকল পণ্য</li>
                <li>spam বা জালিয়াতি</li>
                <li>অন্যের তথ্য চুরি</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">৪. পেমেন্ট এবং রিফান্ড</h2>
              <p className="text-white/70 leading-relaxed">
                সাবস্ক্রিপশন ফি মাসিক/বার্ষিক ভিত্তিতে চার্জ হবে। রিফান্ড নীতি আলাদা পেজে দেখুন।
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">৫. সেবা পরিবর্তন</h2>
              <p className="text-white/70 leading-relaxed">
                আমরা যেকোনো সময় সেবা পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার সংরক্ষণ করি।
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">৬. যোগাযোগ</h2>
              <p className="text-white/70 leading-relaxed">
                প্রশ্নের জন্য{' '}
                <a href="mailto:legal@ozzyl.com" className="text-[#006A4E] hover:underline">
                  legal@ozzyl.com
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
