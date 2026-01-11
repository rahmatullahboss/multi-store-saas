/**
 * Delivery Section Component
 * 
 * Delivery information for Dhaka and outside Dhaka
 */

import { Check } from 'lucide-react';
import type { BaseSectionProps } from './types';

export function DeliverySection({}: BaseSectionProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">ডেলিভারি তথ্য</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-emerald-100 shadow-sm hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🏙️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">ঢাকা সিটির ভিতরে</h3>
                <p className="text-emerald-600 font-medium">২৪-৪৮ ঘণ্টায় ডেলিভারি</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> ডেলিভারি চার্জ: ৳৬০</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> সেম-ডে ডেলিভারি উপলব্ধ</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> ক্যাশ অন ডেলিভারি</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🌍</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">ঢাকা সিটির বাইরে</h3>
                <p className="text-blue-600 font-medium">২-৩ দিনে ডেলিভারি</p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> ডেলিভারি চার্জ: ৳১২০</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> সারা বাংলাদেশে ডেলিভারি</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-blue-500" /> কুরিয়ার সার্ভিস</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
