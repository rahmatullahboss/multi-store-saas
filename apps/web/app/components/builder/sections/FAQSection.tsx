/**
 * FAQSection — Accordion-style FAQ list
 * Client component for interactive accordion (uses React state)
 */

'use client';

import { useState } from 'react';
import { FAQPropsSchema, type FAQProps } from '~/lib/page-builder/schemas';

interface FAQSectionProps {
  props: Record<string, unknown>;
  isPreview?: boolean;
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-indigo-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-transform ${
            isOpen ? 'rotate-180 bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQSection({ props, isPreview = false }: FAQSectionProps) {
  const p: FAQProps = FAQPropsSchema.parse(props);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section data-section-type="faq" className="w-full bg-gradient-to-b from-white to-slate-50 py-14 sm:py-20">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          {p.badgeText && (
            <span className="mb-3 inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
              {p.badgeText}
            </span>
          )}
          {p.title && (
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{p.title}</h2>
          )}
          {p.subtitle && (
            <p className="mt-2 text-gray-500">{p.subtitle}</p>
          )}
        </div>

        {/* Accordion items */}
        <div className="space-y-3">
          {p.items.map((item, i) => (
            <AccordionItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="mt-10 rounded-2xl bg-indigo-50 p-6 text-center">
          <p className="text-lg font-semibold text-gray-800">আরো প্রশ্ন আছে?</p>
          <p className="mt-1 text-sm text-gray-600">আমাদের সাথে যোগাযোগ করুন, আমরা সাহায্য করতে সদা প্রস্তুত।</p>
          <a
            href="tel:"
            className="mt-4 inline-block rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-indigo-700"
          >
            📞 কল করুন
          </a>
        </div>
      </div>
    </section>
  );
}
