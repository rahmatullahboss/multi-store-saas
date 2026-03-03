/**
 * OrderFormSection — COD order form for Bangladesh ecommerce
 *
 * The single most important conversion element on a BD landing page.
 * Customers fill in name, phone, address and quantity then confirm their
 * Cash-on-Delivery order.  In isPreview mode the form is purely decorative
 * (inputs are disabled, submit is suppressed).  In live mode a successful
 * submit shows an inline success message instead of navigating away.
 */

'use client';

import { useState } from 'react';
import { z } from 'zod';

// ─── Schema ────────────────────────────────────────────────────────────────────

const OrderFormSchema = z.object({
  headline: z.string().default('🛒 এখনই অর্ডার করুন'),
  subheadline: z.string().optional().default('ক্যাশ অন ডেলিভারি • দ্রুত ডেলিভারি'),
  productName: z.string().default('প্রোডাক্ট'),
  price: z.number().default(999),
  originalPrice: z.number().optional().default(1499),
  maxQuantity: z.number().int().min(1).max(20).default(5),
  deliveryCharge: z.number().default(60),
  buttonText: z.string().default('✅ অর্ডার কনফার্ম করুন'),
  buttonColor: z.string().default('#16a34a'),
  accentColor: z.string().default('#f59e0b'),
  showQuantity: z.boolean().default(true),
  trustLine: z.string().default('🔒 ১০০% নিরাপদ • ক্যাশ অন ডেলিভারি'),
});

type OrderFormProps = z.infer<typeof OrderFormSchema>;

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Thin horizontal divider */
function Divider() {
  return <div className="my-4 h-px w-full bg-gray-100" />;
}

/** Single form label + input row */
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 ' +
  'placeholder-gray-400 outline-none transition ' +
  'focus:border-green-400 focus:bg-white focus:ring-2 focus:ring-green-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-70';

// ─── Component ─────────────────────────────────────────────────────────────────

interface OrderFormSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function OrderFormSection({
  props,
  isPreview = false,
}: OrderFormSectionProps) {
  const p: OrderFormProps = OrderFormSchema.parse(props);

  // ── local state (quantity + submission) ──────────────────────────────────
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const subtotal = p.price * quantity;
  const total = subtotal + p.deliveryCharge;

  const discountPct =
    p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : 0;

  const savings =
    p.originalPrice && p.originalPrice > p.price
      ? (p.originalPrice - p.price) * quantity
      : 0;

  // ── handlers ─────────────────────────────────────────────────────────────
  function decQty() {
    setQuantity((q) => Math.max(1, q - 1));
  }
  function incQty() {
    setQuantity((q) => Math.min(p.maxQuantity, q + 1));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPreview) return;
    setLoading(true);
    // Simulate async order submission (replace with real API call)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  // ── success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <section
        data-section-type="order-form"
        className="w-full bg-gradient-to-b from-green-50 to-white py-14 sm:py-20"
        id="order"
      >
        <div className="mx-auto max-w-lg px-4">
          <div className="flex flex-col items-center rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-green-100">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
              ✅
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-gray-900">
              অর্ডার নিশ্চিত হয়েছে!
            </h2>
            <p className="mb-1 text-base text-gray-600">
              শীঘ্রই আমাদের টিম আপনাকে কল করবে।
            </p>
            <p className="text-sm text-gray-400">
              অর্ডারের জন্য ধন্যবাদ 🎉
            </p>
            <div className="mt-6 rounded-xl bg-green-50 px-6 py-4 text-left text-sm text-green-800 ring-1 ring-green-200">
              <p className="font-semibold">অর্ডার সারাংশ:</p>
              <p className="mt-1">
                {p.productName} × {quantity} — ৳{total.toLocaleString('bn-BD')}
              </p>
              <p className="mt-0.5 text-green-600">
                ক্যাশ অন ডেলিভারি · ডেলিভারি চার্জ: ৳{p.deliveryCharge}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── main form ────────────────────────────────────────────────────────────
  return (
    <section
      data-section-type="order-form"
      className="w-full bg-gradient-to-b from-gray-50 to-white py-14 sm:py-20"
      id="order"
    >
      <div className="mx-auto max-w-lg px-4">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100">

          {/* ── Header banner ─────────────────────────────────────────────── */}
          <div
            className="relative overflow-hidden px-6 py-7 text-center"
            style={{
              background: `linear-gradient(135deg, ${p.buttonColor} 0%, #0d9488 100%)`,
            }}
          >
            {/* decorative circles */}
            <span className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <span className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10" />

            <h2 className="relative text-2xl font-extrabold text-white sm:text-3xl">
              {p.headline}
            </h2>
            {p.subheadline && (
              <p className="relative mt-1.5 text-sm font-medium text-green-100">
                {p.subheadline}
              </p>
            )}
          </div>

          <div className="p-6 sm:p-8">

            {/* ── Product summary ─────────────────────────────────────────── */}
            <div
              className="mb-6 flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: `${p.accentColor}10`,
                border: `1.5px solid ${p.accentColor}30`,
              }}
            >
              {/* Product icon placeholder */}
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: `${p.accentColor}20` }}
              >
                🛍️
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {p.productName}
                </p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                  <span
                    className="text-xl font-extrabold"
                    style={{ color: p.buttonColor }}
                  >
                    ৳{p.price.toLocaleString('bn-BD')}
                  </span>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="text-sm text-gray-400 line-through">
                      ৳{p.originalPrice.toLocaleString('bn-BD')}
                    </span>
                  )}
                </div>
              </div>

              {discountPct > 0 && (
                <div className="flex-shrink-0 rounded-xl bg-red-500 px-2.5 py-1.5 text-center text-xs font-extrabold leading-tight text-white">
                  {discountPct}%<br />
                  <span className="text-[10px] font-semibold">ছাড়</span>
                </div>
              )}
            </div>

            {/* ── Form ────────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">

                {/* Name */}
                <FormField label="আপনার নাম" required>
                  <input
                    type="text"
                    name="name"
                    placeholder="আপনার নাম লিখুন"
                    autoComplete="name"
                    required
                    disabled={isPreview}
                    className={inputCls}
                  />
                </FormField>

                {/* Phone */}
                <FormField label="মোবাইল নম্বর" required>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="01XXXXXXXXX"
                      autoComplete="tel"
                      required
                      pattern="^(01)[3-9]\d{8}$"
                      title="সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)"
                      disabled={isPreview}
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    উদাহরণ: 01712345678
                  </p>
                </FormField>

                {/* Address */}
                <FormField label="সম্পূর্ণ ঠিকানা" required>
                  <textarea
                    name="address"
                    rows={3}
                    placeholder="বিস্তারিত ঠিকানা (জেলা, উপজেলা সহ)"
                    required
                    disabled={isPreview}
                    className={inputCls}
                  />
                </FormField>

                {/* Quantity selector */}
                {p.showQuantity && (
                  <FormField label="পরিমাণ">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={decQty}
                        disabled={isPreview || quantity <= 1}
                        aria-label="কমান"
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-xl font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>

                      <div className="flex h-11 flex-1 items-center justify-center rounded-xl border-2 bg-gray-50 text-lg font-extrabold text-gray-900"
                        style={{ borderColor: `${p.accentColor}50` }}
                      >
                        {quantity}
                      </div>

                      <button
                        type="button"
                        onClick={incQty}
                        disabled={isPreview || quantity >= p.maxQuantity}
                        aria-label="বাড়ান"
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-gray-200 bg-white text-xl font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>

                      <span className="text-xs text-gray-400">
                        সর্বোচ্চ {p.maxQuantity}টি
                      </span>
                    </div>
                  </FormField>
                )}

              </div>

              <Divider />

              {/* ── Order summary ──────────────────────────────────────────── */}
              <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                  অর্ডার সারাংশ
                </p>

                <div className="space-y-2 text-sm">
                  {/* Product line */}
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="truncate pr-2">
                      {p.productName}
                      {p.showQuantity && quantity > 1 ? ` × ${quantity}` : ''}
                    </span>
                    <span className="flex-shrink-0 font-semibold text-gray-800">
                      ৳{subtotal.toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {/* Savings line */}
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>সাশ্রয় হচ্ছে</span>
                      <span className="font-semibold">
                        − ৳{savings.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  )}

                  {/* Delivery */}
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4" />
                      </svg>
                      ডেলিভারি চার্জ
                    </span>
                    <span className="font-semibold">
                      ৳{p.deliveryCharge.toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {/* Total */}
                  <div
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-base font-extrabold"
                    style={{
                      backgroundColor: `${p.buttonColor}12`,
                      color: p.buttonColor,
                    }}
                  >
                    <span>সর্বমোট</span>
                    <span className="text-xl">
                      ৳{total.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* ── Submit button ──────────────────────────────────────────── */}
              <button
                type={isPreview ? 'button' : 'submit'}
                disabled={loading}
                className="relative w-full overflow-hidden rounded-2xl py-4 text-lg font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
                style={{
                  background: loading
                    ? '#6b7280'
                    : `linear-gradient(135deg, ${p.buttonColor} 0%, #0d9488 100%)`,
                  boxShadow: loading ? 'none' : `0 6px 20px ${p.buttonColor}40`,
                }}
              >
                {/* Shine overlay */}
                <span
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg,rgba(255,255,255,0.15) 0%,rgba(255,255,255,0) 55%)',
                  }}
                />

                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    {/* Spinner */}
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    অর্ডার প্রক্রিয়া চলছে…
                  </span>
                ) : (
                  <span className="relative">{p.buttonText}</span>
                )}
              </button>

              {/* Trust line */}
              {p.trustLine && (
                <p className="mt-4 text-center text-xs font-medium text-gray-500">
                  {p.trustLine}
                </p>
              )}

              {/* COD badge row */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">💵</span> ক্যাশ অন ডেলিভারি
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🚚</span> দ্রুত ডেলিভারি
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🔄</span> রিটার্ন গ্যারান্টি
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
