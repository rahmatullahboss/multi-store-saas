/**
 * StatsSection — Animated counter statistics
 * Variants: simple | cards | highlight | minimal
 * Note: animation is CSS-only for SSR compatibility
 */

import { StatsPropsSchema, type StatsProps } from '~/lib/page-builder/schemas';

interface StatsSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function StatsSection({ props, isPreview = false }: StatsSectionProps) {
  const p: StatsProps = StatsPropsSchema.parse(props);
  const variant = p.variant ?? 'simple';
  const colsClass =
    p.columns === '2'
      ? 'sm:grid-cols-2'
      : p.columns === '3'
      ? 'sm:grid-cols-3'
      : 'sm:grid-cols-2 lg:grid-cols-4';

  const formatValue = (stat: (typeof p.stats)[0]) => {
    const v = stat.value;
    const formatted =
      v >= 1000 && !stat.suffix?.includes('K')
        ? v >= 1000000
          ? `${(v / 1000000).toFixed(1)}M`
          : `${(v / 1000).toFixed(0)}K`
        : String(v);
    return `${stat.prefix ?? ''}${formatted}${stat.suffix ?? ''}`;
  };

  // ── Simple ─────────────────────────────────────────────────────────────
  if (variant === 'simple') {
    return (
      <section
        data-section-type="stats"
        className="w-full py-12 sm:py-16"
        style={{ backgroundColor: p.bgColor, color: p.textColor }}
      >
        <div className="mx-auto max-w-5xl px-4">
          {(p.title || p.subtitle) && (
            <div className="mb-10 text-center">
              {p.title && <h2 className="text-2xl font-extrabold sm:text-3xl">{p.title}</h2>}
              {p.subtitle && <p className="mt-2 opacity-70">{p.subtitle}</p>}
            </div>
          )}
          <div className={`grid grid-cols-2 gap-6 ${colsClass}`}>
            {p.stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {p.showIcons && stat.icon && (
                  <span className="mb-2 text-3xl">{stat.icon}</span>
                )}
                <span
                  className="text-4xl font-extrabold sm:text-5xl"
                  style={{ color: p.accentColor }}
                >
                  {formatValue(stat)}
                </span>
                <span className="mt-1 text-sm font-medium opacity-70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Cards ──────────────────────────────────────────────────────────────
  if (variant === 'cards') {
    return (
      <section
        data-section-type="stats"
        className="w-full py-12 sm:py-16"
        style={{ backgroundColor: p.bgColor }}
      >
        <div className="mx-auto max-w-5xl px-4">
          {(p.title || p.subtitle) && (
            <div className="mb-10 text-center">
              {p.title && (
                <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ color: p.textColor }}>
                  {p.title}
                </h2>
              )}
              {p.subtitle && (
                <p className="mt-2 opacity-60" style={{ color: p.textColor }}>
                  {p.subtitle}
                </p>
              )}
            </div>
          )}
          <div className={`grid grid-cols-2 gap-4 ${colsClass}`}>
            {p.stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md ring-1 ring-gray-100 transition hover:shadow-lg"
              >
                {p.showIcons && stat.icon && (
                  <span className="mb-3 text-4xl">{stat.icon}</span>
                )}
                <span
                  className="text-3xl font-extrabold sm:text-4xl"
                  style={{ color: p.accentColor }}
                >
                  {formatValue(stat)}
                </span>
                <span className="mt-1.5 text-sm font-medium text-gray-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Highlight ──────────────────────────────────────────────────────────
  if (variant === 'highlight') {
    return (
      <section
        data-section-type="stats"
        className="w-full py-12 sm:py-16"
        style={{
          background: `linear-gradient(135deg, ${p.accentColor}15 0%, ${p.accentColor}05 100%)`,
          backgroundColor: p.bgColor,
        }}
      >
        <div className="mx-auto max-w-5xl px-4">
          {(p.title || p.subtitle) && (
            <div className="mb-10 text-center">
              {p.title && (
                <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ color: p.textColor }}>
                  {p.title}
                </h2>
              )}
              {p.subtitle && (
                <p className="mt-2 opacity-60" style={{ color: p.textColor }}>
                  {p.subtitle}
                </p>
              )}
            </div>
          )}
          <div className={`grid grid-cols-2 gap-5 ${colsClass}`}>
            {p.stats.map((stat, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center overflow-hidden rounded-3xl p-6 text-center shadow-lg"
                style={{ backgroundColor: p.accentColor }}
              >
                <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white opacity-10" />
                {p.showIcons && stat.icon && (
                  <span className="mb-3 text-4xl">{stat.icon}</span>
                )}
                <span className="text-4xl font-extrabold text-white sm:text-5xl">
                  {formatValue(stat)}
                </span>
                <span className="mt-1 text-sm font-medium text-white/80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Minimal ────────────────────────────────────────────────────────────
  return (
    <section
      data-section-type="stats"
      className="w-full border-y py-10"
      style={{ backgroundColor: p.bgColor, borderColor: `${p.textColor}20` }}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className={`grid grid-cols-2 divide-x ${colsClass}`} style={{ color: p.textColor }}>
          {p.stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center px-4 text-center">
              {p.showIcons && stat.icon && (
                <span className="mb-1 text-2xl">{stat.icon}</span>
              )}
              <span className="text-2xl font-extrabold sm:text-3xl" style={{ color: p.accentColor }}>
                {formatValue(stat)}
              </span>
              <span className="mt-1 text-xs font-medium opacity-60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
