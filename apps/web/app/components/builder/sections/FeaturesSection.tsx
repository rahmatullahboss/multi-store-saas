/**
 * FeaturesSection — Feature grid (3-col) with icon, title, description
 * Variants: grid | bento | cards
 */

import { FeaturesPropsSchema, type FeaturesProps } from '~/lib/page-builder/schemas';

interface FeaturesSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function FeaturesSection({ props, isPreview = false }: FeaturesSectionProps) {
  const p: FeaturesProps = FeaturesPropsSchema.parse(props);
  const variant = p.variant ?? 'grid';

  // ── Grid (default) ─────────────────────────────────────────────────────
  if (variant === 'grid') {
    return (
      <section data-section-type="features" className="w-full bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          {p.title && (
            <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {p.title}
            </h2>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {p.features.map((feature, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-4xl">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Bento ──────────────────────────────────────────────────────────────
  if (variant === 'bento') {
    const colors = [
      'bg-indigo-600 text-white',
      'bg-yellow-400 text-gray-900',
      'bg-emerald-500 text-white',
      'bg-pink-500 text-white',
      'bg-orange-400 text-white',
      'bg-blue-600 text-white',
    ];
    return (
      <section data-section-type="features" className="w-full bg-gray-950 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          {p.title && (
            <h2 className="mb-10 text-center text-2xl font-extrabold text-white sm:text-3xl">
              {p.title}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {p.features.map((feature, i) => (
              <div
                key={i}
                className={`flex flex-col rounded-3xl p-6 ${colors[i % colors.length]} ${i === 0 ? 'sm:col-span-2' : ''}`}
              >
                <span className="mb-3 text-4xl">{feature.icon}</span>
                <h3 className="mb-1 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Cards ──────────────────────────────────────────────────────────────
  return (
    <section data-section-type="features" className="w-full bg-gradient-to-b from-indigo-50 to-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {p.title && (
          <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {p.title}
          </h2>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {p.features.map((feature, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-md ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-indigo-50 transition group-hover:bg-indigo-100" />
              <span className="relative mb-4 block text-4xl">{feature.icon}</span>
              <h3 className="relative mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
              <p className="relative text-sm leading-relaxed text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
