/**
 * Fair Usage Policy Page
 * 
 * Route: /policies/fair-usage
 * 
 * Explains the platform's fair usage limits in Bengali
 */

import type { MetaFunction } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { Store, ArrowLeft, Shield, AlertTriangle, Check, HelpCircle } from 'lucide-react';

export const meta: MetaFunction = () => {
  return [
    { title: 'ফেয়ার ইউজেজ পলিসি - Ozzyl' },
    { name: 'description', content: 'Ozzyl প্ল্যাটফর্মের ব্যবহারের সীমা এবং নীতিমালা সম্পর্কে জানুন।' },
  ];
};

export default function FairUsagePolicy() {
  return (
    <div className="min-h-screen bg-[#0A0F0D]">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white hidden sm:block">
                Ozzyl
              </span>
            </Link>
            
            <Link 
              to="/pricing"
              className="flex items-center gap-2 text-white/60 hover:text-white transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              প্রাইসিং এ ফিরুন
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#F9A825]" />
              <span className="text-[#F9A825] text-sm">ব্যবহার নীতিমালা</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ফেয়ার ইউজেজ পলিসি
            </h1>
            <p className="text-white/60">
              সর্বশেষ আপডেট: জানুয়ারি ২০২৬
            </p>
          </div>

          {/* Policy Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">পরিচিতি</h2>
              <p className="text-white/70 leading-relaxed">
                Ozzyl সকল ব্যবহারকারীর জন্য একটি নির্ভরযোগ্য ও দ্রুত সেবা প্রদান করতে প্রতিশ্রুতিবদ্ধ। 
                এই ফেয়ার ইউজেজ পলিসি নিশ্চিত করে যে প্ল্যাটফর্মের সম্পদ সুষম ভাবে বন্টিত হয় এবং কোনো 
                একক ব্যবহারকারী অন্যদের অভিজ্ঞতাকে প্রভাবিত করতে না পারে।
              </p>
            </section>

            {/* Usage Limits */}
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F9A825]" />
                ব্যবহার সীমা
              </h2>
              <div className="space-y-4 text-white/70">
                <p className="leading-relaxed">
                  প্রতিটি প্ল্যানে নির্দিষ্ট সীমা রয়েছে যা মাসিক ভিত্তিতে রিসেট হয়:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 text-white font-medium">সীমা</th>
                        <th className="text-center py-3 text-white font-medium">Free</th>
                        <th className="text-center py-3 text-white font-medium">Starter</th>
                        <th className="text-center py-3 text-white font-medium">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-3">প্রোডাক্ট</td>
                        <td className="text-center py-3">২০</td>
                        <td className="text-center py-3">১০০</td>
                        <td className="text-center py-3">২০০</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3">মাসিক অর্ডার</td>
                        <td className="text-center py-3">৫০</td>
                        <td className="text-center py-3">৫০০</td>
                        <td className="text-center py-3">৩,০০০</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3">মাসিক ভিজিটর</td>
                        <td className="text-center py-3">৫,০০০</td>
                        <td className="text-center py-3">২৫,০০০</td>
                        <td className="text-center py-3">৩,০০,০০০</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3">স্টোরেজ</td>
                        <td className="text-center py-3">১০০ MB</td>
                        <td className="text-center py-3">৫০০ MB</td>
                        <td className="text-center py-3">২ GB</td>
                      </tr>
                      <tr>
                        <td className="py-3">টিম মেম্বার</td>
                        <td className="text-center py-3">১</td>
                        <td className="text-center py-3">২</td>
                        <td className="text-center py-3">৫</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* What happens when limit reached */}
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">সীমা শেষ হলে কী হয়?</h2>
              <div className="space-y-3">
                {[
                  'আপনাকে আগেই সতর্কতা দেওয়া হবে (৮০% ব্যবহারে)',
                  'সীমা শেষ হলে নতুন অর্ডার গ্রহণ সাময়িকভাবে বন্ধ হবে',
                  'বিদ্যমান ডেটা অক্ষত থাকবে',
                  'আপগ্রেড করলে সাথে সাথে সব কিছু স্বাভাবিক হবে',
                  'ডাউনগ্রেড করলে অতিরিক্ত ডেটা মুছে যাবে না, শুধু নতুন যোগ করা যাবে না',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#006A4E] flex-shrink-0 mt-0.5" />
                    <span className="text-white/70">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Prohibited Activities */}
            <section className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">নিষিদ্ধ কার্যক্রম</h2>
              <p className="text-white/70 mb-4">নিম্নলিখিত কার্যক্রম কঠোরভাবে নিষিদ্ধ:</p>
              <ul className="space-y-2 text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>অবৈধ পণ্য বিক্রি (অস্ত্র, মাদক, চোরাই পণ্য ইত্যাদি)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>কপিরাইট লঙ্ঘনকারী পণ্য বিক্রি</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>প্ল্যাটফর্মের নিরাপত্তা ব্যবস্থা বাইপাস করার চেষ্টা</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>অত্যধিক API কল দিয়ে সার্ভারে লোড তৈরি</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400">✕</span>
                  <span>একাধিক ফ্রি অ্যাকাউন্ট খুলে সীমা বাড়ানোর চেষ্টা</span>
                </li>
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-[#006A4E]/10 border border-[#006A4E]/30 rounded-2xl p-6 text-center">
              <HelpCircle className="w-10 h-10 text-[#006A4E] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">প্রশ্ন আছে?</h2>
              <p className="text-white/60 mb-4">
                এই নীতিমালা সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন।
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#006A4E] hover:bg-[#005740] text-white font-semibold rounded-xl transition"
              >
                যোগাযোগ করুন
              </Link>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            © ২০২৬ Ozzyl। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </footer>
    </div>
  );
}
