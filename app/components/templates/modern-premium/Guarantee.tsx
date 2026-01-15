import type { SectionProps } from '../_core/types';

export function ModernPremiumGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center border-y border-slate-100 py-32 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-8">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl">✓</div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-12 italic">
            "{guaranteeText}"
          </h2>
          <div className="h-0.5 w-16 bg-indigo-600 mx-auto mb-12"></div>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-300">
             Official Quality Benchmark Certification
          </p>

          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 flex gap-2">
             {[1,2,3].map(i => (
               <div key={i} className="w-2 h-2 rounded-full bg-slate-200"></div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
