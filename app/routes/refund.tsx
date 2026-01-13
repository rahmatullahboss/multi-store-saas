/**
 * Marketing Refund Policy Page
 * 
 * Platform-level refund policy for main marketing domain.
 */

import { lazy, Suspense } from 'react';
import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketingFooter } from '~/components/MarketingFooter';
import { MarketingHeader } from '~/components/MarketingHeader';
import { ClientOnly } from '~/components/LazySection';

// Lazy load chat widget - not needed immediately
const OzzylAIChatWidget = lazy(() => 
  import('~/components/landing/OzzylAIChatWidget').then(m => ({ default: m.OzzylAIChatWidget }))
);

export const meta: MetaFunction = () => [
  { title: 'রিফান্ড নীতি - Ozzyl SaaS' },
  { name: 'description', content: 'Ozzyl SaaS প্ল্যাটফর্মের রিফান্ড নীতি।' },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      {/* Header */}
      <MarketingHeader />

      {/* Content */}
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#006A4E]/20 rounded-xl flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-[#00875F]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">রিফান্ড নীতি</h1>
                <p className="text-sm text-white/50">সর্বশেষ আপডেট: জানুয়ারি ২০২৬</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-white/10">
              <Link
                to="/privacy"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/60 hover:bg-white/20 transition"
              >
                গোপনীয়তা নীতি
              </Link>
              <Link
                to="/terms"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/60 hover:bg-white/20 transition"
              >
                শর্তাবলী
              </Link>
              <Link
                to="/refund"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#006A4E] text-white"
              >
                রিফান্ড নীতি
              </Link>
            </nav>

            {/* Refund Content */}
            <div className="space-y-6 text-white/70">
              <section>
                <h2 className="text-xl font-bold text-white mb-3">সাবস্ক্রিপশন রিফান্ড</h2>
                <p className="leading-relaxed">
                  Ozzyl এ নিম্নলিখিত রিফান্ড নীতি প্রযোজ্য:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li><strong className="text-white">৭ দিনের মানি-ব্যাক গ্যারান্টি:</strong> প্রথম পেমেন্টের ৭ দিনের মধ্যে সম্পূর্ণ রিফান্ড</li>
                  <li><strong className="text-white">প্রো-রেটা রিফান্ড নেই:</strong> ৭ দিনের পরে আংশিক রিফান্ড দেওয়া হয় না</li>
                  <li><strong className="text-white">ক্যান্সেলেশন:</strong> যেকোনো সময় ক্যান্সেল করতে পারবেন, বর্তমান বিলিং পিরিয়ড পর্যন্ত সার্ভিস চলবে</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">রিফান্ড পাওয়ার যোগ্যতা</h2>
                <p className="leading-relaxed">
                  রিফান্ড পেতে হলে:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>প্রথম পেমেন্টের ৭ দিনের মধ্যে রিকোয়েস্ট করতে হবে</li>
                  <li>আপনার অ্যাকাউন্ট ভালো অবস্থায় থাকতে হবে</li>
                  <li>শর্তাবলী লঙ্ঘন করেননি এমন হতে হবে</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">রিফান্ড প্রক্রিয়া</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>আমাদের WhatsApp বা Email এ রিফান্ড রিকোয়েস্ট করুন</li>
                  <li>আপনার অ্যাকাউন্ট তথ্য ও পেমেন্ট প্রমাণ দিন</li>
                  <li>২-৩ কার্যদিবসের মধ্যে রিভিউ করা হবে</li>
                  <li>অনুমোদন হলে ৫-৭ কার্যদিবসে রিফান্ড পাবেন</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">যা রিফান্ড হয় না</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>ফ্রি প্ল্যান (কোনো চার্জ নেই)</li>
                  <li>৭ দিনের পরের রিকোয়েস্ট</li>
                  <li>শর্তাবলী লঙ্ঘনের কারণে সাসপেন্ড হওয়া অ্যাকাউন্ট</li>
                  <li>থার্ড-পার্টি সার্ভিস (ডোমেইন, SMS প্যাক ইত্যাদি)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">যোগাযোগ</h2>
                <p className="leading-relaxed">
                  রিফান্ড রিকোয়েস্ট বা প্রশ্নের জন্য:
                </p>
                <p className="mt-2">
                  <strong className="text-white">ইমেইল:</strong> rahmatullahzisan@gmail.com<br />
                  <strong className="text-white">WhatsApp:</strong> 01739-416661
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <MarketingFooter />
      <ClientOnly>
        <Suspense fallback={null}>
          <OzzylAIChatWidget />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
