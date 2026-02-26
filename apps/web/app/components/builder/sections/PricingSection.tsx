/**
 * PricingSection — Pricing tiers / packages display
 * Reads from PricingPropsSchema; also accepts CTA props for price data
 */

import { PricingPropsSchema, type PricingProps, CTAPropsSchema } from '~/lib/page-builder/schemas';

interface PricingSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const DEFAULT_TIERS = [
  {
    name: '১ পিস',
    price: 1490,
    originalPrice: 1990,
    badge: null as string | null,
    features: ['১টি পণ্য', 'স্ট্যান্ডার্ড প্যাকেজিং', 'ক্যাশ অন ডেলিভারি'],
    highlighted: false,
  },
  {
    name: '২ পিস',
    price: 2780,
    originalPrice: 3980,
    badge: '🔥 বেস্ট ভ্যালু',
    features: ['২টি পণ্য', 'প্রিমিয়াম প্যাকেজিং', 'ক্যাশ অন ডেলিভারি', '৳২০০ সেভ করুন'],
    highlighted: true,
  },
  {
    name: '৩ পিস',
    price: 3970,
    originalPrice: 5970,
    badge: '💎 মেগা সেভার',
    features: ['৩টি পণ্য', 'গিফট প্যাকেজিং', 'ক্যাশ অন ডেলিভারি', '৳৫০০ সেভ করুন', 'ফ্রি ডেলিভারি'],
    highlighted: false,
  },
];

export function PricingSection({ props, isPreview = false }: PricingSectionProps) {
  const p: PricingProps = PricingPropsSchema.parse(props);

  // Also try to parse CTA props in case variants/pricing data is passed
  let ctaProps: ReturnType<typeof CTAPropsSchema.parse> | null = null;
  try {
    ctaProps = CTAPropsSchema.parse(props);
  } catch {
    // ignore — use defaults
  }

  // Build tiers from CTA variants if available, otherwise use defaults
  const tiers =
    ctaProps && ctaProps.variants && ctaProps.variants.length > 0
      ? ctaProps.variants.map((v, i) => ({
          name: v.name,
          price: v.price ?? (ctaProps!.discountedPrice ?? 1490),
          originalPrice: ctaProps!.productPrice,
          badge: i === 1 ? '🔥 বেস্ট ভ্যালু' : null,
          features: p.features,
          highlighted: i === 1,
        }))
      : DEFAULT_TIERS;

  return (
    <section data-section-type="pricing" className="w-full bg-gradient-to-b from-slate-50 to-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-semibold text-indigo-700">
            💰 সেরা দামে সেরা পণ্য
          </span>
          {p.title && (
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative flex flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1 ${
                tier.highlighted
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-300/50 ring-4 ring-indigo-400/30 scale-[1.03]'
                  : 'bg-white text-gray-900 shadow-lg ring-1 ring-gray-100'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className={`px-5 py-2 text-center text-xs font-extrabold ${
                    tier.highlighted ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tier.badge}
                </div>
              )}

              <div className="flex flex-1 flex-col p-6">
                {/* Tier name */}
                <h3
                  className={`text-lg font-extrabold ${
                    tier.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="mt-4">
                  {tier.originalPrice && tier.originalPrice > tier.price && (
                    <span
                      className={`text-sm line-through ${
                        tier.highlighted ? 'text-indigo-300' : 'text-gray-400'
                      }`}
                    >
                      ৳{tier.originalPrice}
                    </span>
                  )}
                  <div
                    className={`text-4xl font-extrabold ${
                      tier.highlighted ? 'text-white' : 'text-indigo-700'
                    }`}
                  >
                    ৳{tier.price}
                  </div>
                  {tier.originalPrice && tier.originalPrice > tier.price && (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        tier.highlighted
                          ? 'bg-white/20 text-white'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      ৳{tier.originalPrice - tier.price} সেভ
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm">
                      <svg
                        className={`h-4 w-4 flex-shrink-0 ${
                          tier.highlighted ? 'text-green-300' : 'text-green-500'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={tier.highlighted ? 'text-indigo-100' : 'text-gray-600'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="#order"
                  className={`mt-6 block rounded-2xl py-3.5 text-center text-base font-extrabold transition hover:scale-[1.02] ${
                    tier.highlighted
                      ? 'bg-white text-indigo-700 shadow-lg hover:bg-indigo-50'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {p.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded-2xl bg-green-50 px-6 py-5 text-sm text-green-800">
          <span className="flex items-center gap-2 font-semibold">
            🔒 ১০০% নিরাপদ পেমেন্ট
          </span>
          <span className="flex items-center gap-2 font-semibold">
            🚚 ক্যাশ অন ডেলিভারি
          </span>
          <span className="flex items-center gap-2 font-semibold">
            🔄 ৭ দিনের রিটার্ন গ্যারান্টি
          </span>
        </div>
      </div>
    </section>
  );
}
