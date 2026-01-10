
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionSettings } from './registry';

interface FAQSectionProps {
  settings: SectionSettings;
  theme: any;
}

export default function FAQSection({ settings, theme }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const faqs = settings.faqs || [
    { question: 'What payment methods do you accept?', answer: 'We accept a variety of payment methods including credit cards and digital wallets.' },
    { question: 'How long does shipping take?', answer: 'Shipping typically takes 3-5 business days.' },
    { question: 'Do you offer returns?', answer: 'Yes, we have a 30-day return policy for all unused items.' },
  ];

  return (
    <section className="py-12 px-4 max-w-3xl mx-auto">
      {settings.heading && (
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: theme.text }}>
          {settings.heading}
        </h2>
      )}
      
      <div className="space-y-4">
        {faqs.map((faq: any, index: number) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              style={{ borderColor: isOpen ? theme.primary : '#e5e7eb' }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left font-medium transition-colors hover:bg-gray-50"
                style={{ color: theme.text }}
              >
                <span>{faq.question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              
              {isOpen && (
                <div className="px-4 pb-4 pt-0 text-gray-600 leading-relaxed text-sm animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
