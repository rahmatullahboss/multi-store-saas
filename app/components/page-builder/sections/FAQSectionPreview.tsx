/**
 * FAQ Section Preview
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQProps {
  title?: string;
  subtitle?: string;
  items?: Array<{ question: string; answer: string }>;
}

export function FAQSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'সাধারণ জিজ্ঞাসা',
    subtitle = '',
    items = [],
  } = props as FAQProps;
  
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-center text-gray-600 mb-8">{subtitle}</p>
        )}
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No FAQ items added yet
          </p>
        )}
      </div>
    </section>
  );
}
