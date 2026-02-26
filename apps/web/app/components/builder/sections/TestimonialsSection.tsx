/**
 * TestimonialsSection — Customer review cards with star rating, name, photo
 */

import { TestimonialsPropsSchema, type TestimonialsProps } from '~/lib/page-builder/schemas';

interface TestimonialsSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

function StarRating({ count = 5 }: { count?: number }) {
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

function Avatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-100"
      />
    );
  }
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    'bg-indigo-500',
    'bg-pink-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-purple-500',
    'bg-blue-500',
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full ${color} text-sm font-bold text-white ring-2 ring-white`}
    >
      {initials}
    </div>
  );
}

export function TestimonialsSection({ props, isPreview = false }: TestimonialsSectionProps) {
  const p: TestimonialsProps = TestimonialsPropsSchema.parse(props);

  // Placeholder testimonials when empty
  const testimonials =
    p.testimonials.length > 0
      ? p.testimonials
      : [
          {
            name: 'রহিম মিয়া',
            text: 'অসাধারণ প্রোডাক্ট! ডেলিভারি পেয়েছি মাত্র ২ দিনে। খুব খুশি হয়েছি।',
            imageUrl: undefined,
          },
          {
            name: 'সালমা বেগম',
            text: 'এত ভালো মান আশা করিনি। অবশ্যই আবার কিনব। বন্ধুদেরও বলেছি।',
            imageUrl: undefined,
          },
          {
            name: 'করিম সাহেব',
            text: 'দাম অনুযায়ী প্রোডাক্টের মান অতুলনীয়। ক্যাশ অন ডেলিভারিতে সুবিধা পেয়েছি।',
            imageUrl: undefined,
          },
        ];

  return (
    <section data-section-type="testimonials" className="w-full bg-gradient-to-b from-slate-50 to-white py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-700">
            ⭐ গ্রাহকদের অভিজ্ঞতা
          </span>
          {p.title && (
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100 transition hover:shadow-lg"
            >
              {/* Stars */}
              <StarRating count={5} />

              {/* Quote */}
              <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-700">
                &ldquo;{t.text ?? 'খুব ভালো প্রোডাক্ট!'}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
                <Avatar name={t.name} imageUrl={t.imageUrl} />
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">যাচাইকৃত ক্রেতা ✓</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 rounded-2xl bg-indigo-50 px-6 py-5">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-indigo-700">৪.৯/৫</p>
            <p className="text-sm text-gray-600">গড় রেটিং</p>
          </div>
          <div className="hidden h-10 w-px bg-indigo-200 sm:block" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-indigo-700">১০,০০০+</p>
            <p className="text-sm text-gray-600">সন্তুষ্ট গ্রাহক</p>
          </div>
          <div className="hidden h-10 w-px bg-indigo-200 sm:block" />
          <div className="text-center">
            <p className="text-2xl font-extrabold text-indigo-700">৯৮%</p>
            <p className="text-sm text-gray-600">পুনরায় কিনেছেন</p>
          </div>
        </div>
      </div>
    </section>
  );
}
