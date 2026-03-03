/**
 * StickyOrderCTASection — Fixed bottom conversion bar for Bangladesh ecommerce
 *
 * Stays pinned to the bottom of the viewport (or sticky in preview mode).
 * Shows product name, price with strikethrough original, discount badge,
 * a prominent gradient CTA button, and an optional phone icon button.
 *
 * This is one of the highest-converting UI patterns in BD ecommerce — keeps
 * the order action always visible as the user scrolls through the landing page.
 */

import { z } from 'zod';

// ─── Schema ────────────────────────────────────────────────────────────────────

const StickyOrderCTASchema = z.object({
  productName: z.string().default('এখনই অর্ডার করুন'),
  price: z.string().default('৳৯৯৯'),
  originalPrice: z.string().optional().default('৳১৪৯৯'),
  ctaText: z.string().default('অর্ডার করুন'),
  ctaLink: z.string().default('#order'),
  phoneNumber: z.string().optional().default('01700-000000'),
  backgroundColor: z.string().default('#1e1b4b'),
  ctaColor: z.string().default('#f59e0b'),
  showPhoneButton: z.boolean().default(true),
});

type StickyOrderCTAProps = z.infer<typeof StickyOrderCTASchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Extract numeric value from a price string like '৳১৪৯৯' or '1499' */
function extractNumeric(price: string): number {
  // Strip currency symbols and Bangla/Arabic numerals → convert to ASCII digits
  const ascii = price.replace(/[^\d.]/g, '');
  return parseFloat(ascii) || 0;
}

/** Convert Bangla numerals to ASCII so we can do math */
function bnToAscii(str: string): string {
  const map: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => map[d] ?? d);
}

function calcDiscountPct(original: string, current: string): number {
  const orig = extractNumeric(bnToAscii(original));
  const curr = extractNumeric(bnToAscii(current));
  if (!orig || !curr || orig <= curr) return 0;
  return Math.round(((orig - curr) / orig) * 100);
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface StickyOrderCTASectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function StickyOrderCTASection({
  props,
  isPreview = false,
}: StickyOrderCTASectionProps) {
  const p: StickyOrderCTAProps = StickyOrderCTASchema.parse(props);

  const discountPct =
    p.originalPrice ? calcDiscountPct(p.originalPrice, p.price) : 0;

  // In preview (iframe) use sticky so the bar is visible inside the canvas.
  // In live storefront use fixed so it pins to the bottom of the viewport.
  const positionClass = isPreview ? 'sticky' : 'fixed';

  return (
    <div
      data-section-type="sticky-order-cta"
      className={`${positionClass} bottom-0 left-0 right-0 z-50 w-full`}
      style={{
        backgroundColor: p.backgroundColor,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.18)',
      }}
    >
      {/* Discount ribbon — thin accent line at very top */}
      {discountPct > 0 && (
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500" />
      )}

      <div className="mx-auto flex max-w-5xl flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-3.5">

        {/* ── Left: product info ─────────────────────────────────────────── */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          {/* Discount badge */}
          {discountPct > 0 && (
            <span className="flex-shrink-0 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-extrabold leading-none text-white sm:text-sm">
              {discountPct}%<br />
              <span className="text-[10px] font-semibold leading-none">ছাড়</span>
            </span>
          )}

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-indigo-200 sm:text-sm">
              {p.productName}
            </p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xl font-extrabold text-white sm:text-2xl">
                {p.price}
              </span>
              {p.originalPrice && (
                <span className="text-sm text-gray-400 line-through sm:text-base">
                  {p.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: action buttons ──────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Phone button */}
          {p.showPhoneButton && p.phoneNumber && (
            <a
              href={isPreview ? undefined : `tel:${p.phoneNumber.replace(/[^+\d]/g, '')}`}
              aria-label={`কল করুন: ${p.phoneNumber}`}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 text-white transition hover:bg-white/20 active:scale-95 sm:h-13 sm:w-13"
              onClick={isPreview ? (e) => e.preventDefault() : undefined}
            >
              {/* Phone SVG */}
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </a>
          )}

          {/* Main CTA button */}
          <a
            href={isPreview ? undefined : p.ctaLink}
            onClick={isPreview ? (e) => e.preventDefault() : undefined}
            className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-base font-extrabold text-gray-900 shadow-lg transition hover:brightness-110 active:scale-95 sm:flex-none sm:px-8 sm:py-3.5 sm:text-lg"
            style={{
              background: `linear-gradient(135deg, ${p.ctaColor} 0%, #f97316 100%)`,
              boxShadow: `0 4px 16px ${p.ctaColor}55`,
            }}
          >
            {/* Subtle shine overlay */}
            <span
              className="pointer-events-none absolute inset-0 rounded-xl"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
              }}
            />
            {/* Cart icon */}
            <svg
              className="h-5 w-5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13h10M10 21a1 1 0 100-2 1 1 0 000 2zm7 0a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
            <span className="relative">{p.ctaText}</span>
          </a>
        </div>
      </div>

      {/* Bottom safe-area spacer for mobile notch / home indicator */}
      <div className="h-safe-area-inset-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
}
