/**
 * HeroSection — Full-width hero for Bangladesh landing pages
 * Supports: centered, split, split-left, split-right, glow, modern, immersive variants
 */

import { HeroPropsSchema, type HeroProps } from '~/lib/page-builder/schemas';

interface HeroSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function HeroSection({ props, isPreview = false }: HeroSectionProps) {
  const p: HeroProps = HeroPropsSchema.parse(props);
  const variant = p.variant ?? 'centered';

  const hasImage = Boolean(p.productImage);
  const hasBg = Boolean(p.backgroundImage);

  const bgStyle = hasBg
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.65)), url(${p.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  // ── Centered (default) ─────────────────────────────────────────────────
  if (variant === 'centered') {
    return (
      <section
        data-section-type="hero"
        className="relative w-full overflow-hidden"
        style={
          hasBg
            ? bgStyle
            : { background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)' }
        }
      >
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          {p.badgeText && (
            <span className="mb-4 inline-block rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900">
              {p.badgeText}
            </span>
          )}
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            {p.headline}
          </h1>
          {p.subheadline && (
            <p className="mt-4 text-lg text-indigo-200 sm:text-xl">{p.subheadline}</p>
          )}
          {p.priceLabel && (
            <p className="mt-3 text-2xl font-bold text-yellow-300">{p.priceLabel}</p>
          )}
          {hasImage && (
            <div className="my-8 flex justify-center">
              <img
                src={p.productImage}
                alt="Product"
                className="max-h-64 w-auto rounded-2xl object-contain drop-shadow-2xl sm:max-h-80"
              />
            </div>
          )}
          {p.features && p.features.length > 0 && (
            <div className="mb-8 flex flex-wrap justify-center gap-3">
              {p.features.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
                >
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </span>
              ))}
            </div>
          )}
          <a
            href={p.ctaLink ?? '#order'}
            className="inline-block rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-10 py-4 text-xl font-extrabold text-gray-900 shadow-lg transition hover:scale-105 hover:shadow-orange-400/40"
          >
            {p.ctaText} →
          </a>
        </div>
      </section>
    );
  }

  // ── Split (right image) ─────────────────────────────────────────────────
  if (variant === 'split' || variant === 'split-right') {
    return (
      <section
        data-section-type="hero"
        className="w-full overflow-hidden"
        style={
          hasBg
            ? bgStyle
            : { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }
        }
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-14 sm:flex-row sm:py-20">
          {/* Text */}
          <div className="flex-1 text-left">
            {p.badgeText && (
              <span className="mb-3 inline-block rounded-full bg-yellow-400 px-4 py-1 text-sm font-bold text-gray-900">
                {p.badgeText}
              </span>
            )}
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {p.headline}
            </h1>
            {p.subheadline && (
              <p className="mt-4 text-lg text-slate-300">{p.subheadline}</p>
            )}
            {p.priceLabel && (
              <p className="mt-3 text-2xl font-bold text-yellow-300">{p.priceLabel}</p>
            )}
            {p.features && p.features.length > 0 && (
              <ul className="mt-5 space-y-2">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-200">
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={p.ctaLink ?? '#order'}
              className="mt-8 inline-block rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-lg font-extrabold text-gray-900 shadow-lg transition hover:scale-105"
            >
              {p.ctaText} →
            </a>
          </div>
          {/* Image */}
          {hasImage && (
            <div className="flex-1 flex justify-center">
              <img
                src={p.productImage}
                alt="Product"
                className="max-h-72 w-auto rounded-2xl object-contain drop-shadow-2xl sm:max-h-96"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // ── Split-Left (image on left) ──────────────────────────────────────────
  if (variant === 'split-left') {
    return (
      <section
        data-section-type="hero"
        className="w-full overflow-hidden"
        style={
          hasBg
            ? bgStyle
            : { background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)' }
        }
      >
        <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-8 px-4 py-14 sm:flex-row sm:py-20">
          {hasImage && (
            <div className="flex-1 flex justify-center">
              <img
                src={p.productImage}
                alt="Product"
                className="max-h-72 w-auto rounded-2xl object-contain drop-shadow-2xl sm:max-h-96"
              />
            </div>
          )}
          <div className="flex-1 text-left">
            {p.badgeText && (
              <span className="mb-3 inline-block rounded-full bg-emerald-400 px-4 py-1 text-sm font-bold text-gray-900">
                {p.badgeText}
              </span>
            )}
            <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              {p.headline}
            </h1>
            {p.subheadline && (
              <p className="mt-4 text-lg text-green-200">{p.subheadline}</p>
            )}
            {p.priceLabel && (
              <p className="mt-3 text-2xl font-bold text-yellow-300">{p.priceLabel}</p>
            )}
            {p.features && p.features.length > 0 && (
              <ul className="mt-5 space-y-2">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-green-100">
                    <span className="text-xl">{f.icon}</span>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={p.ctaLink ?? '#order'}
              className="mt-8 inline-block rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 text-lg font-extrabold text-gray-900 shadow-lg transition hover:scale-105"
            >
              {p.ctaText} →
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── Glow ───────────────────────────────────────────────────────────────
  if (variant === 'glow') {
    return (
      <section
        data-section-type="hero"
        className="relative w-full overflow-hidden bg-black"
        style={hasBg ? bgStyle : undefined}
      >
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600 opacity-30 blur-[100px]" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-pink-500 opacity-20 blur-[80px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center sm:py-28">
          {p.badgeText && (
            <span className="mb-4 inline-block rounded-full border border-purple-500/40 bg-purple-500/20 px-4 py-1 text-sm font-semibold text-purple-300">
              ✨ {p.badgeText}
            </span>
          )}
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
            {p.headline}
          </h1>
          {p.subheadline && (
            <p className="mt-5 text-lg text-gray-400">{p.subheadline}</p>
          )}
          {p.priceLabel && (
            <p className="mt-3 text-2xl font-bold text-yellow-300">{p.priceLabel}</p>
          )}
          {hasImage && (
            <div className="my-10 flex justify-center">
              <div className="rounded-3xl p-1 ring-1 ring-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
                <img
                  src={p.productImage}
                  alt="Product"
                  className="max-h-72 w-auto rounded-2xl object-contain"
                />
              </div>
            </div>
          )}
          <a
            href={p.ctaLink ?? '#order'}
            className="inline-block rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-10 py-4 text-xl font-extrabold text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] transition hover:scale-105"
          >
            {p.ctaText} →
          </a>
        </div>
      </section>
    );
  }

  // ── Modern ─────────────────────────────────────────────────────────────
  if (variant === 'modern') {
    return (
      <section
        data-section-type="hero"
        className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"
        style={hasBg ? bgStyle : undefined}
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              {p.badgeText && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-px w-8 bg-blue-400" />
                  <span className="text-sm font-semibold uppercase tracking-widest text-blue-400">
                    {p.badgeText}
                  </span>
                </div>
              )}
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {p.headline}
              </h1>
              {p.subheadline && (
                <p className="mt-5 text-lg text-slate-400">{p.subheadline}</p>
              )}
              {p.priceLabel && (
                <p className="mt-4 text-3xl font-extrabold text-yellow-300">{p.priceLabel}</p>
              )}
              {p.features && p.features.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2.5 text-sm text-slate-300">
                      <span className="text-lg">{f.icon}</span>
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              )}
              <a
                href={p.ctaLink ?? '#order'}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-400"
              >
                {p.ctaText}
                <span>→</span>
              </a>
            </div>
            {hasImage && (
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-blue-500 opacity-20 blur-3xl" />
                  <img
                    src={p.productImage}
                    alt="Product"
                    className="relative max-h-80 w-auto rounded-2xl object-contain drop-shadow-2xl lg:max-h-96"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Immersive (full-bg overlay) ─────────────────────────────────────────
  return (
    <section
      data-section-type="hero"
      className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden"
      style={
        hasBg
          ? bgStyle
          : {
              background: 'linear-gradient(160deg, #7c3aed 0%, #db2777 50%, #ea580c 100%)',
            }
      }
    >
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-20 text-center">
        {p.badgeText && (
          <span className="mb-4 inline-block rounded-full bg-white/20 px-5 py-1.5 text-sm font-bold text-white backdrop-blur">
            🔥 {p.badgeText}
          </span>
        )}
        <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-6xl">
          {p.headline}
        </h1>
        {p.subheadline && (
          <p className="mt-5 text-xl text-white/80">{p.subheadline}</p>
        )}
        {p.priceLabel && (
          <p className="mt-4 text-3xl font-extrabold text-yellow-300">{p.priceLabel}</p>
        )}
        {hasImage && (
          <div className="my-10 flex justify-center">
            <img
              src={p.productImage}
              alt="Product"
              className="max-h-64 w-auto rounded-2xl object-contain drop-shadow-2xl sm:max-h-80"
            />
          </div>
        )}
        <a
          href={p.ctaLink ?? '#order'}
          className="inline-block rounded-full bg-white px-10 py-4 text-xl font-extrabold text-purple-700 shadow-xl transition hover:scale-105"
        >
          {p.ctaText} →
        </a>
      </div>
    </section>
  );
}
