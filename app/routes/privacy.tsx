/**
 * Marketing Privacy Policy Page
 * 
 * Platform-level privacy policy for main marketing domain.
 * Different from store-level policies.$type.tsx which requires store context.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketingFooter } from '~/components/MarketingFooter';
import { OzzylAIChatWidget } from '~/components/landing/OzzylAIChatWidget';

export const meta: MetaFunction = () => [
  { title: 'গোপনীয়তা নীতি - Multi-Store SaaS' },
  { name: 'description', content: 'Multi-Store SaaS প্ল্যাটফর্মের গোপনীয়তা নীতি।' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] overflow-hidden">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white hidden sm:block">
                Multi-Store
              </span>
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              হোমে ফিরে যান
            </Link>
          </div>
        </div>
      </header>

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
                <Shield className="w-6 h-6 text-[#00875F]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">গোপনীয়তা নীতি</h1>
                <p className="text-sm text-white/50">সর্বশেষ আপডেট: জানুয়ারি ২০২৬</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-white/10">
              <Link
                to="/privacy"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#006A4E] text-white"
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/60 hover:bg-white/20 transition"
              >
                রিফান্ড নীতি
              </Link>
            </nav>

            {/* Policy Content */}
            <div className="space-y-6 text-white/70">
              <section>
                <h2 className="text-xl font-bold text-white mb-3">তথ্য সংগ্রহ</h2>
                <p className="leading-relaxed">
                  Multi-Store প্ল্যাটফর্ম ব্যবহার করার সময় আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>নাম, ইমেইল, ফোন নম্বর (অ্যাকাউন্ট তৈরির জন্য)</li>
                  <li>স্টোর সম্পর্কিত তথ্য (স্টোরের নাম, লোগো, প্রোডাক্ট)</li>
                  <li>পেমেন্ট সম্পর্কিত তথ্য (বিকাশ/নগদ অ্যাকাউন্ট)</li>
                  <li>ব্রাউজিং ডেটা (অ্যানালিটিক্সের জন্য)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">তথ্যের ব্যবহার</h2>
                <p className="leading-relaxed">
                  আমরা আপনার তথ্য ব্যবহার করি:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>আপনার স্টোর পরিচালনা ও সার্ভিস প্রদান করতে</li>
                  <li>পেমেন্ট প্রক্রিয়াকরণ করতে</li>
                  <li>গ্রাহক সাপোর্ট প্রদান করতে</li>
                  <li>প্ল্যাটফর্ম উন্নয়ন ও নিরাপত্তা নিশ্চিত করতে</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">তথ্যের নিরাপত্তা</h2>
                <p className="leading-relaxed">
                  আমরা আপনার তথ্যের নিরাপত্তা অত্যন্ত গুরুত্বের সাথে নিই। আমাদের প্ল্যাটফর্ম 
                  Cloudflare এর মাধ্যমে সুরক্ষিত এবং সমস্ত ডেটা এনক্রিপ্টেড অবস্থায় সংরক্ষিত হয়।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">তৃতীয় পক্ষ</h2>
                <p className="leading-relaxed">
                  আমরা আপনার অনুমতি ছাড়া তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি বা শেয়ার করি না। 
                  শুধুমাত্র পেমেন্ট প্রক্রিয়াকরণ ও কুরিয়ার সার্ভিসের জন্য প্রয়োজনীয় তথ্য শেয়ার করা হয়।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">যোগাযোগ</h2>
                <p className="leading-relaxed">
                  গোপনীয়তা সম্পর্কিত যেকোনো প্রশ্নের জন্য যোগাযোগ করুন:
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
      <OzzylAIChatWidget />
    </div>
  );
}
