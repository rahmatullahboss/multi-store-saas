import type { SectionProps } from '../_core/types';

export function MobileFirstGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-sm mx-auto bg-gray-50 p-10 rounded-[2rem] border border-gray-100">
          <div className="text-5xl mb-6">🛡️</div>
          <h2 className="text-lg font-black text-gray-900 leading-relaxed mb-6">
            {guaranteeText}
          </h2>
            <div className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {config.guaranteeBadgeLabel || '১০০% নিরাপদ লেনদেন'}
            </div>
        </div>
      </div>
    </section>
  );
}
