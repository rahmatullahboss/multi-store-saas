/**
 * TrustBadgesSection — Trust icons: bKash, COD, guarantee, fast delivery
 * Variants: grid | marquee
 */

import { TrustBadgesPropsSchema, type TrustBadgesProps } from '~/lib/page-builder/schemas';

interface TrustBadgesSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const DEFAULT_BADGES = [
  { icon: '💳', text: 'বিকাশ / নগদ পেমেন্ট' },
  { icon: '🚚', text: 'দ্রুত হোম ডেলিভারি' },
  { icon: '🔒', text: '১০০% নিরাপদ অর্ডার' },
  { icon: '✅', text: 'ক্যাশ অন ডেলিভারি' },
  { icon: '🔄', text: '৭ দিনের রিটার্ন' },
  { icon: '🏆', text: 'অরিজিনাল প্রোডাক্ট' },
];

export function TrustBadgesSection({ props, isPreview = false }: TrustBadgesSectionProps) {
  const p: TrustBadgesProps = TrustBadgesPropsSchema.parse(props);
  const badges = p.badges.length > 0 ? p.badges : DEFAULT_BADGES;
  const variant = p.variant ?? 'grid';

  if (variant === 'marquee') {
    // Duplicate list for seamless loop
    const doubled = [...badges, ...badges];
    return (
      <section data-section-type="trust-badges" className="w-full overflow-hidden border-y border-gray-100 bg-white py-4">
        {p.title && (
          <p className="mb-3 text-center text-sm font-semibold uppercase tracking-widest text-gray-500">
            {p.title}
          </p>
        )}
        <div className="flex w-full overflow-hidden">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{
              animation: 'marquee 20s linear infinite',
            }}
          >
            {doubled.map((b, i) => (
              <span
                key={i}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
              >
                <span className="text-xl">{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>
    );
  }

  // Grid variant (default)
  return (
    <section data-section-type="trust-badges" className="w-full bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4">
        {p.title && (
          <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-gray-500">
            {p.title}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {badges.map((b, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-3 py-5 text-center shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <span className="text-3xl">{b.icon}</span>
              <span className="text-xs font-semibold leading-tight text-gray-700">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Payment logos row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { label: 'বিকাশ', bg: 'bg-pink-600', text: 'text-white' },
            { label: 'নগদ', bg: 'bg-orange-500', text: 'text-white' },
            { label: 'রকেট', bg: 'bg-purple-600', text: 'text-white' },
            { label: 'COD', bg: 'bg-green-600', text: 'text-white' },
            { label: 'Visa', bg: 'bg-blue-700', text: 'text-white' },
          ].map((pm) => (
            <span
              key={pm.label}
              className={`rounded-lg ${pm.bg} ${pm.text} px-4 py-1.5 text-xs font-bold shadow-sm`}
            >
              {pm.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
