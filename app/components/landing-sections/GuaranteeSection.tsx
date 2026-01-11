/**
 * Guarantee Section Component
 * 
 * Money-back guarantee display
 */

import { ShieldCheck } from 'lucide-react';
import type { BaseSectionProps } from './types';

export function GuaranteeSection({ config }: BaseSectionProps) {
  if (!config.guaranteeText) return null;

  return (
    <section className="py-12 bg-gradient-to-r from-emerald-50 to-teal-50 border-y border-emerald-100">
      <div className="container max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-lg border border-emerald-200">
          <ShieldCheck className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">আমাদের গ্যারান্টি</h3>
        <p className="text-gray-600 text-lg">{config.guaranteeText}</p>
      </div>
    </section>
  );
}
