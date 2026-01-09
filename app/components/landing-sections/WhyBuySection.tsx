/**
 * Why Buy Section Component
 * 
 * Pain points vs solution comparison
 */

import { Check, X } from 'lucide-react';
import type { BaseSectionProps } from './types';

export function WhyBuySection({ storeName }: BaseSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-emerald-900 to-gray-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">কেন এই পণ্যটি আপনার প্রয়োজন?</h2>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Pain Points */}
          <div className="bg-white/10 backdrop-blur-sm p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-red-300 flex items-center gap-2">
              <X className="bg-red-500/20 p-1 rounded-full" />
              সাধারণ সমস্যা
            </h3>
            <ul className="space-y-4">
              {[
                "নিম্নমানের নকল পণ্য",
                "ব্যবহার করা কঠিন ও জটিল",
                "টাকা দিয়ে প্রতারিত হওয়ার ভয়",
                "কোনো ওয়ারেন্টি নেই"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <X size={20} className="text-red-400 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-emerald-500/20 backdrop-blur-sm p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-500/30 shadow-2xl relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              আমাদের সমাধান
            </div>
            <h3 className="text-xl font-bold mb-6 text-emerald-300 flex items-center gap-2">
              <Check className="bg-emerald-500/20 p-1 rounded-full" />
              {storeName} এর স্পেশালিটি
            </h3>
            <ul className="space-y-4">
              {[
                "১০০% অরিজিনাল এবং প্রিমিয়াম",
                "ব্যবহার করা অত্যন্ত সহজ",
                "ক্যাশ অন ডেলিভারি সুবিধা",
                "৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-white font-medium">
                  <Check size={20} className="text-emerald-400 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
