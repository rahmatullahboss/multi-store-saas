import type { SectionProps } from '../_core/types';

export function OrganicGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center border-t border-emerald-100 pt-24 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] bg-fixed">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center text-4xl mx-auto mb-12 shadow-sm border border-emerald-100 rotate-3">
            🌿
          </div>
          <h2 className="text-3xl md:text-5xl font-serif italic text-slate-800 leading-tight mb-12">
            "{guaranteeText}"
          </h2>
          <div className="h-0.5 w-12 bg-emerald-100 mx-auto mb-12"></div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-700">
            Our Earth Integrity Seal
          </p>
        </div>
      </div>
    </section>
  );
}
