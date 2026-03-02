import type { MetaFunction } from '@remix-run/cloudflare';
import { MarketingHeader } from '@/components/MarketingHeader';
import { Footer } from '@/components/Footer';
import { ClientOnly } from '@/components/LazySection';
import { OzzylAIChatWidget } from '@/components/landing/OzzylAIChatWidget';

export const meta: MetaFunction = () => [
  { title: 'গোপনীয়তা নীতি - Ozzyl' },
  { name: 'description', content: 'Ozzyl এর গোপনীয়তা নীতি এবং আপনার ডেটা সুরক্ষা সম্পর্কে জানুন।' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="text-white/70 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <MarketingHeader />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-6">গোপনীয়তা নীতি</h1>
          <p className="text-white/60 mb-12">সর্বশেষ আপডেট: জানুয়ারি ২০২৬</p>
          <div className="space-y-8 text-white/80">
            <Section title="১. তথ্য সংগ্রহ">
              <p>আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>নাম, ইমেইল এবং ফোন নম্বর</li>
                <li>ব্যবসায়িক তথ্য (স্টোরের নাম, ঠিকানা)</li>
                <li>পেমেন্ট তথ্য (নিরাপদভাবে সংরক্ষিত)</li>
                <li>ব্যবহার সংক্রান্ত ডেটা এবং অ্যানালিটিক্স</li>
              </ul>
            </Section>
            <Section title="২. তথ্য ব্যবহার">
              <p>আপনার তথ্য ব্যবহার করা হয়:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>সেবা প্রদান এবং উন্নতি করতে</li>
                <li>গ্রাহক সহায়তা প্রদান করতে</li>
                <li>নিরাপত্তা এবং জালিয়াতি প্রতিরোধে</li>
                <li>আইনি বাধ্যবাধকতা পূরণে</li>
              </ul>
            </Section>
            <Section title="৩. তথ্য সুরক্ষা">
              <p>আমরা industry-standard encryption এবং নিরাপত্তা ব্যবস্থা ব্যবহার করি। আপনার পেমেন্ট তথ্য PCI-DSS compliant সিস্টেমে সংরক্ষিত।</p>
            </Section>
            <Section title="৪. তথ্য শেয়ারিং">
              <p>আমরা আপনার তথ্য শেয়ার করি না, শুধুমাত্র:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>আপনার সম্মতিতে</li>
                <li>আইনি প্রয়োজনে</li>
                <li>সেবা প্রদানকারী (payment gateway, SMS provider) এর সাথে</li>
              </ul>
            </Section>
            <Section title="৫. কুকিজ">
              <p>আমরা আপনার অভিজ্ঞতা উন্নত করতে এবং সেবা বিশ্লেষণের জন্য কুকিজ ব্যবহার করি। আপনি ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।</p>
            </Section>
            <Section title="৬. আপনার অধিকার">
              <p>আপনার অধিকার রয়েছে:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>আপনার তথ্য দেখার</li>
                <li>তথ্য সংশোধন করার</li>
                <li>তথ্য মুছে ফেলার</li>
                <li>ডেটা পোর্টেবিলিটি</li>
              </ul>
            </Section>
            <Section title="৭. যোগাযোগ">
              <p>গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নের জন্য{' '}<a href="mailto:privacy@ozzyl.com" className="text-[#006A4E] hover:underline">privacy@ozzyl.com</a>{' '}এ যোগাযোগ করুন।</p>
            </Section>
          </div>
        </div>
      </main>
      <Footer />
      <ClientOnly><OzzylAIChatWidget /></ClientOnly>
    </div>
  );
}
