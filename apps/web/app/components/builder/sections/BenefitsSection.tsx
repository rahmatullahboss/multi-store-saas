/**
 * BenefitsSection — "Why buy from us?" with checkmark list and benefit cards
 */

import { BenefitsPropsSchema, type BenefitsProps } from '~/lib/page-builder/schemas';

interface BenefitsSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function BenefitsSection({ props, isPreview = false }: BenefitsSectionProps) {
  const p: BenefitsProps = BenefitsPropsSchema.parse(props);

  const benefits =
    p.benefits.length > 0
      ? p.benefits
      : [
          { icon: '💎', title: 'সেরা মান', description: 'আমরা দিচ্ছি সেরা মানের নিশ্চয়তা' },
          { icon: '💰', title: 'সাশ্রয়ী মূল্য', description: 'বাজেটের মধ্যে সেরা পণ্য' },
          { icon: '🚚', title: 'দ্রুত ডেলিভারি', description: '২-৩ দিনের মধ্যে পৌঁছে দিই' },
          { icon: '🔄', title: 'সহজ রিটার্ন', description: 'পছন্দ না হলে ৭ দিনের মধ্যে ফেরত' },
        ];

  return (
    <section data-section-type="benefits" className="w-full bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
            ✅ আমাদের সুবিধা
          </span>
          {p.title && (
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          )}
        </div>

        {/* Two-column layout: left checklist, right highlight card */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left: visual checklist */}
          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-green-100 bg-green-50 p-4 transition hover:border-green-300 hover:bg-green-100"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                  {b.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{b.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-600">{b.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: big highlight card */}
          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-xl">
            <div className="mb-6 text-5xl">🏆</div>
            <h3 className="text-2xl font-extrabold">কেন আমরা সেরা?</h3>
            <p className="mt-3 leading-relaxed text-indigo-200">
              আমরা বিশ্বাস করি প্রতিটি কাস্টমার সেরা পণ্য ও সেবা পাওয়ার যোগ্য। তাই আমরা
              কোয়ালিটি থেকে কোনো আপোষ করি না।
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                '১০০% অরিজিনাল প্রোডাক্ট',
                'ক্যাশ অন ডেলিভারি সুবিধা',
                '২৪/৭ কাস্টমার সাপোর্ট',
                'সহজ রিটার্ন পলিসি',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#order"
              className="mt-8 inline-block rounded-xl bg-white py-3 text-center font-bold text-indigo-700 shadow transition hover:bg-indigo-50"
            >
              এখনই অর্ডার করুন →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
