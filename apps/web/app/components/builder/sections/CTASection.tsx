/**
 * CTASection — Bangladesh-style order form CTA
 * Shows headline, price, variants selector, and a prominent order button.
 * Full form logic is handled server-side; this is a preview/display component.
 */

import { CTAPropsSchema, type CTAProps } from '~/lib/page-builder/schemas';

interface CTASectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

export function CTASection({ props, isPreview = false }: CTASectionProps) {
  const p: CTAProps = CTAPropsSchema.parse(props);

  const savings = p.productPrice && p.discountedPrice
    ? p.productPrice - p.discountedPrice
    : 0;

  return (
    <section
      data-section-type="cta"
      className="w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-14 sm:py-20"
      id="order"
    >
      <div className="mx-auto max-w-xl px-4">
        {/* Urgency banner */}
        {p.showUrgencyBanner && p.urgencyText && (
          <div className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">
            🔥 {p.urgencyText}
          </div>
        )}

        {/* Main card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{p.headline}</h2>
            {p.subheadline && (
              <p className="mt-2 text-indigo-200">{p.subheadline}</p>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* Price */}
            <div className="mb-6 flex items-center justify-center gap-4">
              {p.productPrice && p.discountedPrice && p.productPrice > p.discountedPrice && (
                <span className="text-xl text-gray-400 line-through">৳{p.productPrice}</span>
              )}
              <span className="text-4xl font-extrabold text-indigo-700">
                ৳{p.discountedPrice ?? p.productPrice ?? 0}
              </span>
              {savings > 0 && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  ৳{savings} সেভ
                </span>
              )}
            </div>

            {/* Variants */}
            {p.variants && p.variants.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold text-gray-700">{p.variantLabel}</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {p.variants.map((v, i) => (
                    <label
                      key={v.id}
                      className={`cursor-pointer rounded-xl border-2 p-3 text-center transition ${
                        i === 0
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <input type="radio" name="variant" value={v.id} className="sr-only" defaultChecked={i === 0} />
                      <p className="font-semibold text-gray-800">{v.name}</p>
                      {v.price && (
                        <p className="text-sm font-bold text-indigo-600">৳{v.price}</p>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{p.nameLabel}</label>
                <input
                  type="text"
                  placeholder={p.namePlaceholder}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  disabled={isPreview}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  placeholder={p.phonePlaceholder}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  disabled={isPreview}
                />
              </div>
              {p.showDistrictField && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{p.districtLabel}</label>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    disabled={isPreview}
                  >
                    <option value="">{p.districtPlaceholder}</option>
                    <option>ঢাকা</option>
                    <option>চট্টগ্রাম</option>
                    <option>সিলেট</option>
                    <option>রাজশাহী</option>
                    <option>খুলনা</option>
                    <option>বরিশাল</option>
                    <option>রংপুর</option>
                    <option>ময়মনসিংহ</option>
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">{p.addressLabel}</label>
                <textarea
                  rows={2}
                  placeholder={p.addressPlaceholder}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  disabled={isPreview}
                />
              </div>
              {p.showNoteField && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{p.noteLabel}</label>
                  <input
                    type="text"
                    placeholder={p.notePlaceholder}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    disabled={isPreview}
                  />
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{p.subtotalLabel}</span>
                <span className="font-semibold">৳{p.discountedPrice ?? p.productPrice ?? 0}</span>
              </div>
              <div className="mt-1 flex justify-between text-gray-600">
                <span>{p.deliveryLabel}</span>
                <span className="font-semibold">৳{p.insideDhakaCharge}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                <span>{p.totalLabel}</span>
                <span className="text-indigo-700">৳{(p.discountedPrice ?? p.productPrice ?? 0) + (p.insideDhakaCharge ?? 60)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-lg font-extrabold text-white shadow-lg shadow-indigo-300/50 transition hover:scale-[1.02] hover:shadow-indigo-400/60 active:scale-100"
            >
              🛒 {p.buttonText}
            </button>

            {/* Trust badges */}
            {p.showTrustBadges && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">💳 {p.codLabel}</span>
                <span className="flex items-center gap-1">🔒 {p.secureLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
