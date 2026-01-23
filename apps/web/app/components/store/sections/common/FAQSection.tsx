/**
 * FAQ Section
 * 
 * Frequently asked questions accordion.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { RenderContext } from '~/lib/template-resolver.server';

interface FAQSectionProps {
  sectionId: string;
  props: {
    heading?: string;
    subheading?: string;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
  };
  context: RenderContext;
}

export default function FAQSection({ sectionId, props, context }: FAQSectionProps) {
  const {
    heading = 'Frequently Asked Questions',
    subheading,
    faqs = [
      { question: 'Question 1?', answer: 'Answer 1' },
    ],
  } = props;

  const themeColors = context.theme;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section 
      id={sectionId}
      className="py-12 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 
            className="text-2xl md:text-3xl font-bold"
            style={{ 
              color: themeColors.textColor,
              fontFamily: themeColors.headingFont,
            }}
          >
            {heading}
          </h2>
          {subheading && (
            <p className="mt-2 text-gray-600">{subheading}</p>
          )}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span 
                  className="font-medium pr-4"
                  style={{ color: themeColors.textColor }}
                >
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  style={{ color: themeColors.accentColor }}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
