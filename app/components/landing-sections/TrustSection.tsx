/**
 * Trust Section Component
 * 
 * Trust badges showing delivery, COD, guarantee, etc.
 */

import { Truck, Banknote, ShieldCheck, RefreshCw } from 'lucide-react';
import type { BaseSectionProps } from './types';

export function TrustSection({}: BaseSectionProps) {
  const trustItems = [
    { icon: <Truck size={24} />, title: "দ্রুত ডেলিভারি", sub: "সারা বাংলাদেশে" },
    { icon: <Banknote size={24} />, title: "ক্যাশ অন ডেলিভারি", sub: "পণ্য হাতে পেয়ে পেমেন্ট" },
    { icon: <ShieldCheck size={24} />, title: "১০০% অরিজিনাল", sub: "গ্যারান্টিযুক্ত পণ্য" },
    { icon: <RefreshCw size={24} />, title: "৭ দিনের গ্যারান্টি", sub: "সহজ রিটার্ন পলিসি" }
  ];

  return (
    <section className="py-10 container max-w-6xl mx-auto px-4 -mt-8 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {trustItems.map((item, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-md border border-white/50 p-3 sm:p-4 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-1 sm:gap-2 hover:bg-white transition duration-300 min-w-0 overflow-hidden">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
              {item.icon}
            </div>
            <h3 className="font-bold text-gray-800 text-[11px] sm:text-base leading-tight break-words w-full">{item.title}</h3>
            <p className="text-[9px] sm:text-sm text-gray-500 leading-tight break-words w-full">{item.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
