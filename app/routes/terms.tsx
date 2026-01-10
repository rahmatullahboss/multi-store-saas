/**
 * Marketing Terms of Service Page
 * 
 * Platform-level terms for main marketing domain.
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, ArrowLeft, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { MarketingFooter } from '~/components/MarketingFooter';
import { MarketingHeader } from '~/components/MarketingHeader';
import { OzzylAIChatWidget } from '~/components/landing/OzzylAIChatWidget';

export const meta: MetaFunction = () => [
  { title: 'শর্তাবলী - Multi-Store SaaS' },
  { name: 'description', content: 'Multi-Store SaaS প্ল্যাটফর্মের ব্যবহারের শর্তাবলী।' },
];

export default function TermsPage() {
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
                <FileText className="w-6 h-6 text-[#00875F]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">শর্তাবলী</h1>
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#006A4E] text-white"
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

            {/* Terms Content */}
            <div className="space-y-6 text-white/70">
              <section>
                <h2 className="text-xl font-bold text-white mb-3">সার্ভিস ব্যবহার</h2>
                <p className="leading-relaxed">
                  Multi-Store প্ল্যাটফর্ম ব্যবহার করে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন:
                </p>
                <ul className="list-disc list-inside mt-3 space-y-2">
                  <li>আপনি সঠিক ও সত্য তথ্য প্রদান করবেন</li>
                  <li>আপনার অ্যাকাউন্ট ও পাসওয়ার্ড সুরক্ষিত রাখবেন</li>
                  <li>বেআইনি কার্যকলাপে প্ল্যাটফর্ম ব্যবহার করবেন না</li>
                  <li>অন্যের বুদ্ধিবৃত্তিক সম্পদ লঙ্ঘন করবেন না</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">স্টোর কনটেন্ট</h2>
                <p className="leading-relaxed">
                  আপনার স্টোরে আপলোড করা সমস্ত প্রোডাক্ট, ছবি ও কনটেন্টের জন্য আপনি দায়ী। 
                  নিষিদ্ধ বা বেআইনি পণ্য বিক্রি করলে অ্যাকাউন্ট সাসপেন্ড হতে পারে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">প্ল্যান ও বিলিং</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>ফ্রি প্ল্যান চিরকালের জন্য বিনামূল্যে</li>
                  <li>পেইড প্ল্যানের বিল মাসিক ভিত্তিতে</li>
                  <li>প্ল্যান ডাউনগ্রেড করলে বর্তমান বিলিং সাইকেলের শেষে কার্যকর হবে</li>
                  <li>অতিরিক্ত অর্ডার চার্জ প্রযোজ্য হতে পারে</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">সীমাহীন ভিজিটর* (Fair Use Policy)</h2>
                <p className="leading-relaxed mb-3">
                  সকল প্ল্যানে "সীমাহীন ভিজিটর*" নিম্নলিখিত শর্ত সাপেক্ষে:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>স্বাভাবিক অনলাইন স্টোর ভিজিটর - কোনো সংখ্যা সীমা নেই</li>
                  <li>অস্বাভাবিক ট্রাফিক প্যাটার্ন (যেমন: বট, স্প্যাম, অতিরিক্ত অটোমেটেড রিকোয়েস্ট) মনিটর করা হয়</li>
                  <li>অর্ডার অনুপাতে অস্বাভাবিক বেশি ভিজিটর হলে আমরা যোগাযোগ করব</li>
                  <li>আমাদের সার্ভার ও অন্যান্য ব্যবহারকারীদের সুরক্ষার জন্য অতিরিক্ত ব্যবস্থা নেওয়া হতে পারে</li>
                  <li>Fair Use Policy লঙ্ঘন হলে স্টোর সাময়িকভাবে বন্ধ করা হতে পারে</li>
                </ul>
                <p className="mt-3 text-sm text-white/50">
                  * স্বাভাবিক ই-কমার্স ব্যবহারের জন্য কোনো সীমাবদ্ধতা নেই। শর্ত প্রযোজ্য।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">সার্ভিস পরিবর্তন</h2>
                <p className="leading-relaxed">
                  আমরা যেকোনো সময় প্ল্যাটফর্মের ফিচার, প্রাইসিং বা শর্তাবলী পরিবর্তন করার অধিকার রাখি। 
                  গুরুত্বপূর্ণ পরিবর্তনের ক্ষেত্রে আগাম নোটিশ দেওয়া হবে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">দায়বদ্ধতা সীমাবদ্ধতা</h2>
                <p className="leading-relaxed">
                  Multi-Store "যেমন আছে" ভিত্তিতে সার্ভিস প্রদান করে। আমরা আপনার ব্যবসায়িক ক্ষতি, 
                  ডেটা হারানো বা অন্যান্য পরোক্ষ ক্ষতির জন্য দায়ী নই।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">যোগাযোগ</h2>
                <p className="leading-relaxed">
                  শর্তাবলী সম্পর্কিত প্রশ্নের জন্য যোগাযোগ করুন:
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
