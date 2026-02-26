/**
 * HeaderSection — Sticky navigation header for landing pages
 * Variants: simple | centered | minimal
 * Client component for mobile menu toggle
 */

'use client';

import { useState } from 'react';
import { HeaderPropsSchema, type HeaderProps } from '~/lib/page-builder/schemas';

interface HeaderSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

const LOGO_SIZE_MAP = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
} as const;

export function HeaderSection({ props, isPreview = false }: HeaderSectionProps) {
  const p: HeaderProps = HeaderPropsSchema.parse(props);
  const [mobileOpen, setMobileOpen] = useState(false);

  const stickyClass = p.isSticky && !isPreview ? 'sticky top-0 z-50' : 'relative z-10';
  const logoSizeClass = LOGO_SIZE_MAP[p.logoSize ?? 'md'];

  const ctaStyleClass =
    p.ctaStyle === 'outline'
      ? 'border-2 bg-transparent font-bold transition hover:opacity-80'
      : p.ctaStyle === 'ghost'
        ? 'bg-transparent font-bold transition hover:opacity-70 underline underline-offset-2'
        : 'font-bold shadow transition hover:opacity-90';

  // ── Minimal ─────────────────────────────────────────────────────────────
  if (p.variant === 'minimal') {
    return (
      <header
        data-section-type="header"
        className={`w-full border-b border-gray-100 ${stickyClass}`}
        style={{ backgroundColor: p.bgColor, color: p.textColor }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            {p.logoUrl ? (
              <img src={p.logoUrl} alt={p.logoText || 'Logo'} className={`${logoSizeClass} w-auto object-contain`} />
            ) : (
              <span className="text-xl font-extrabold" style={{ color: p.textColor }}>
                {p.logoText || 'Brand'}
              </span>
            )}
          </a>

          {/* CTA only */}
          {p.showCta && (
            <a
              href={p.ctaLink || '#order'}
              className={`rounded-full px-5 py-2 text-sm ${ctaStyleClass}`}
              style={{
                backgroundColor: p.ctaStyle === 'solid' ? p.ctaBgColor : 'transparent',
                color: p.ctaStyle === 'solid' ? p.ctaTextColor : p.ctaBgColor,
                borderColor: p.ctaBgColor,
              }}
            >
              {p.ctaText}
            </a>
          )}
        </div>
      </header>
    );
  }

  // ── Centered ─────────────────────────────────────────────────────────────
  if (p.variant === 'centered') {
    return (
      <header
        data-section-type="header"
        className={`w-full border-b border-gray-100 ${stickyClass}`}
        style={{ backgroundColor: p.bgColor, color: p.textColor }}
      >
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* Top row: logo center */}
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <a href="#" className="flex items-center gap-2">
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.logoText || 'Logo'} className={`${logoSizeClass} w-auto object-contain`} />
              ) : (
                <span className="text-2xl font-extrabold" style={{ color: p.textColor }}>
                  {p.logoText || 'Brand'}
                </span>
              )}
            </a>

            {/* Nav links centered */}
            {p.showNavLinks && p.navLinks.length > 0 && (
              <nav className="hidden items-center gap-6 sm:flex">
                {p.navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    className="text-sm font-medium transition hover:opacity-70"
                    style={{ color: p.textColor }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            {/* CTA */}
            {p.showCta && (
              <a
                href={p.ctaLink || '#order'}
                className={`rounded-full px-6 py-2 text-sm ${ctaStyleClass}`}
                style={{
                  backgroundColor: p.ctaStyle === 'solid' ? p.ctaBgColor : 'transparent',
                  color: p.ctaStyle === 'solid' ? p.ctaTextColor : p.ctaBgColor,
                  borderColor: p.ctaBgColor,
                }}
              >
                {p.ctaText}
              </a>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── Simple (default) ─────────────────────────────────────────────────────
  return (
    <header
      data-section-type="header"
      className={`w-full border-b border-gray-100 ${stickyClass}`}
      style={{ backgroundColor: p.bgColor, color: p.textColor }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <a href="#" className="flex shrink-0 items-center gap-2">
          {p.logoUrl ? (
            <img src={p.logoUrl} alt={p.logoText || 'Logo'} className={`${logoSizeClass} w-auto object-contain`} />
          ) : (
            <span className="text-xl font-extrabold" style={{ color: p.textColor }}>
              {p.logoText || 'Brand'}
            </span>
          )}
        </a>

        {/* Desktop nav links */}
        {p.showNavLinks && p.navLinks.length > 0 && (
          <nav className="hidden items-center gap-6 lg:flex">
            {p.navLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="text-sm font-medium transition hover:opacity-70"
                style={{ color: p.textColor }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right side: CTA + hamburger */}
        <div className="flex items-center gap-3">
          {p.showCta && (
            <a
              href={p.ctaLink || '#order'}
              className={`hidden rounded-full px-5 py-2 text-sm sm:inline-block ${ctaStyleClass}`}
              style={{
                backgroundColor: p.ctaStyle === 'solid' ? p.ctaBgColor : 'transparent',
                color: p.ctaStyle === 'solid' ? p.ctaTextColor : p.ctaBgColor,
                borderColor: p.ctaBgColor,
              }}
            >
              {p.ctaText}
            </a>
          )}

          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label="মেনু"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg transition hover:bg-gray-100 lg:hidden"
          >
            <span
              className={`block h-0.5 w-5 rounded transition-all duration-300 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`}
              style={{ backgroundColor: p.textColor }}
            />
            <span
              className={`block h-0.5 w-5 rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}
              style={{ backgroundColor: p.textColor }}
            />
            <span
              className={`block h-0.5 w-5 rounded transition-all duration-300 ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`}
              style={{ backgroundColor: p.textColor }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ backgroundColor: p.mobileMenuBgColor || p.bgColor }}
      >
        <nav className="flex flex-col divide-y divide-gray-100 px-4 pb-4">
          {p.showNavLinks &&
            p.navLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm font-medium transition hover:opacity-70"
                style={{ color: p.textColor }}
              >
                {link.label}
              </a>
            ))}
          {p.showCta && (
            <div className="pt-3">
              <a
                href={p.ctaLink || '#order'}
                className={`block w-full rounded-xl py-3 text-center text-sm ${ctaStyleClass}`}
                style={{
                  backgroundColor: p.ctaStyle === 'solid' ? p.ctaBgColor : 'transparent',
                  color: p.ctaStyle === 'solid' ? p.ctaTextColor : p.ctaBgColor,
                  borderColor: p.ctaBgColor,
                }}
              >
                {p.ctaText}
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
