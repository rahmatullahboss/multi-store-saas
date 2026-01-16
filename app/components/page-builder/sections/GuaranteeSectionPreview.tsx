/**
 * Guarantee Section Preview
 */

import { ShieldCheck } from 'lucide-react';

interface GuaranteeProps {
  title?: string;
  text?: string;
  badgeLabel?: string;
}

export function GuaranteeSectionPreview({ props }: { props: Record<string, unknown> }) {
  const {
    title = 'আমাদের গ্যারান্টি',
    text = '১০০% সন্তুষ্টির গ্যারান্টি। পছন্দ না হলে ৭ দিনের মধ্যে ফেরত।',
    badgeLabel = '',
  } = props as GuaranteeProps;
  
  return (
    <section className="py-12 px-6 bg-green-50">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <ShieldCheck size={32} className="text-green-600" />
        </div>
        
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
        )}
        
        {text && (
          <p className="text-gray-700 text-lg mb-4">
            {text}
          </p>
        )}
        
        {badgeLabel && (
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-medium rounded-full text-sm">
            {badgeLabel}
          </span>
        )}
      </div>
    </section>
  );
}
