/**
 * HowToOrderSection — Step-by-step ordering guide
 * Critical for BD e-commerce landing pages
 * Uses HowToOrderPropsSchema: title + steps[]
 */

import { HowToOrderPropsSchema, type HowToOrderProps } from '~/lib/page-builder/schemas';

interface HowToOrderSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const STEP_ICONS = ['🛒', '📞', '💳', '🏠'];
const STEP_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600' },
  { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-600' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-500' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-600' },
];

const DEFAULT_STEPS = [
  { title: 'পণ্য বেছে নিন', description: 'আপনার পছন্দের পণ্য ও পরিমাণ নির্বাচন করুন' },
  { title: 'হোয়াটসঅ্যাপ / কল করুন', description: 'আমাদের নম্বরে কল বা মেসেজ করে অর্ডার দিন' },
  { title: 'বিকাশ / COD পেমেন্ট করুন', description: 'অগ্রিম বিকাশ অথবা ডেলিভারিতে ক্যাশ পেমেন্ট করুন' },
  { title: 'হোম ডেলিভারি পান', description: 'ঢাকায় ১-২ দিন, সারাদেশে ২-৩ দিনের মধ্যে পৌঁছে যাবে' },
];

export function HowToOrderSection({ props, isPreview = false }: HowToOrderSectionProps) {
  const p: HowToOrderProps = HowToOrderPropsSchema.parse(props);
  const steps = p.steps.length > 0 ? p.steps : DEFAULT_STEPS;

  return (
    <section data-section-type="how-to-order" className="w-full bg-gradient-to-b from-white to-blue-50 py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            📋 অর্ডার প্রক্রিয়া
          </span>
          {p.title && (
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          )}
          <p className="mt-2 text-gray-500">মাত্র কয়েকটি সহজ ধাপে আপনার পণ্য অর্ডার করুন</p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.slice(0, 4).map((step, i) => {
            const color = STEP_COLORS[i % STEP_COLORS.length];
            const icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <div
                key={i}
                className={`relative flex flex-col items-center rounded-2xl border-2 ${color.border} bg-white p-6 text-center shadow-sm transition hover:shadow-md`}
              >
                {/* Step number badge */}
                <div
                  className={`absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full ${color.badge} text-sm font-extrabold text-white shadow`}
                >
                  {i + 1}
                </div>

                {/* Icon */}
                <div className={`mb-4 mt-2 flex h-16 w-16 items-center justify-center rounded-2xl ${color.bg} text-4xl`}>
                  {icon}
                </div>

                {/* Content */}
                <h3 className={`mb-2 text-base font-extrabold ${color.text}`}>{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{step.description}</p>

                {/* Connector arrow for desktop (right side, except last) */}
                {i < steps.slice(0, 4).length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
                    <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* WhatsApp */}
          <a
            href="https://wa.me/8801XXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-green-500 px-7 py-4 text-base font-extrabold text-white shadow-lg shadow-green-200 transition hover:bg-green-600 hover:shadow-xl"
          >
            <svg className="h-6 w-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.109 1.523 5.837L.057 23.52a.75.75 0 00.92.921l5.803-1.448A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.895 0-3.67-.512-5.19-1.406l-.371-.218-3.846.959.977-3.768-.239-.389A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            WhatsApp-এ অর্ডার করুন
          </a>

          {/* Call */}
          <a
            href="tel:+8801XXXXXXXXX"
            className="flex items-center gap-3 rounded-2xl bg-blue-600 px-7 py-4 text-base font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl"
          >
            <svg className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            এখনই কল করুন
          </a>
        </div>

        {/* Trust note */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><span className="text-base">🔒</span> নিরাপদ অর্ডার</span>
          <span className="flex items-center gap-1.5"><span className="text-base">🚚</span> হোম ডেলিভারি</span>
          <span className="flex items-center gap-1.5"><span className="text-base">💵</span> ক্যাশ অন ডেলিভারি</span>
          <span className="flex items-center gap-1.5"><span className="text-base">🔄</span> রিটার্ন গ্যারান্টি</span>
        </div>
      </div>
    </section>
  );
}
