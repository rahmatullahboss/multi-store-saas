/**
 * SocialProofSection — Full configurable social proof block
 * Shows: social stats, features (why buy), testimonials, gallery
 */

import { SocialProofPropsSchema, type SocialProofProps } from '~/lib/page-builder/schemas';

interface SocialProofSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const STYLE_MAP: Record<
  string,
  { bg: string; card: string; text: string; accent: string; muted: string }
> = {
  default: {
    bg: 'bg-white',
    card: 'bg-gray-50 border border-gray-100',
    text: 'text-gray-900',
    accent: 'text-indigo-600',
    muted: 'text-gray-500',
  },
  dark: {
    bg: 'bg-gray-950',
    card: 'bg-gray-800 border border-gray-700',
    text: 'text-white',
    accent: 'text-indigo-400',
    muted: 'text-gray-400',
  },
  brand: {
    bg: 'bg-indigo-700',
    card: 'bg-indigo-600 border border-indigo-500',
    text: 'text-white',
    accent: 'text-yellow-300',
    muted: 'text-indigo-200',
  },
  green: {
    bg: 'bg-green-50',
    card: 'bg-white border border-green-100',
    text: 'text-green-900',
    accent: 'text-green-600',
    muted: 'text-green-600',
  },
  red: {
    bg: 'bg-red-50',
    card: 'bg-white border border-red-100',
    text: 'text-red-900',
    accent: 'text-red-600',
    muted: 'text-red-500',
  },
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < count ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function SocialProofSection({ props, isPreview = false }: SocialProofSectionProps) {
  const p: SocialProofProps = SocialProofPropsSchema.parse(props);
  const style = STYLE_MAP[p.style] ?? STYLE_MAP.default;

  return (
    <section data-section-type="social-proof" className={`w-full py-14 sm:py-20 ${style.bg}`}>
      <div className="mx-auto max-w-5xl space-y-16 px-4">
        {/* ── 1. Social Stats ── */}
        {p.display.social && (
          <div>
            <h2 className={`mb-8 text-center text-2xl font-extrabold sm:text-3xl ${style.text}`}>
              {p.socialTitle}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {p.socialStats.map((stat, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center rounded-2xl p-6 text-center shadow-sm ${style.card}`}
                >
                  <span className="mb-2 text-3xl">
                    {stat.icon === 'Users' ? '👥' : stat.icon === 'ShoppingBag' ? '🛍️' : '⭐'}
                  </span>
                  <span className={`text-3xl font-extrabold ${style.accent}`}>{stat.value}</span>
                  <span className={`mt-1 text-sm font-medium ${style.muted}`}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. Features / Why Buy ── */}
        {p.display.features && (
          <div>
            <h2 className={`mb-8 text-center text-2xl font-extrabold sm:text-3xl ${style.text}`}>
              {p.featuresTitle}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {p.features.map((f, i) => (
                <div key={i} className={`rounded-2xl p-6 shadow-sm ${style.card}`}>
                  <span className="mb-3 block text-3xl">
                    {f.icon === 'Award' ? '🏆' : f.icon === 'Truck' ? '🚚' : '🎧'}
                  </span>
                  <h3 className={`mb-1 font-bold ${style.text}`}>{f.title}</h3>
                  <p className={`text-sm ${style.muted}`}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Testimonials ── */}
        {p.display.testimonials && (
          <div>
            <h2 className={`mb-8 text-center text-2xl font-extrabold sm:text-3xl ${style.text}`}>
              {p.testimonialsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {p.testimonials.map((t, i) => (
                <div key={i} className={`rounded-2xl p-6 shadow-sm ${style.card}`}>
                  <StarRating count={t.rating} />
                  <p className={`mt-3 text-sm leading-relaxed ${style.muted}`}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {t.name[0]}
                    </div>
                    <span className={`text-sm font-semibold ${style.text}`}>{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Gallery ── */}
        {p.display.gallery && p.galleryImages.length > 0 && (
          <div>
            <h2 className={`mb-8 text-center text-2xl font-extrabold sm:text-3xl ${style.text}`}>
              {p.galleryTitle}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.galleryImages.slice(0, 6).map((img, i) => (
                <div key={i} className="overflow-hidden rounded-2xl">
                  <img
                    src={img}
                    alt={`Gallery ${i + 1}`}
                    className="h-40 w-full object-cover transition hover:scale-105 sm:h-52"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
