import type { SectionProps } from '../_core/types';

export function ShowcaseGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto border-t-2 border-gray-100 pt-32">
          <div className="w-20 h-20 bg-gray-950 text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-12 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
             🛡️
          </div>
          <h2 className="text-3xl md:text-6xl font-black text-gray-900 leading-none tracking-tighter mb-12 uppercase italic">
            "{guaranteeText}"
          </h2>
          <div className="flex items-center justify-center gap-4 mb-12">
             <div className="h-px w-12 bg-gray-200"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Authenticity Guarantee</p>
             <div className="h-px w-12 bg-gray-200"></div>
          </div>
          
          <div className="inline-block bg-rose-500 text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-500/30">
             Official Showcase Certificate
          </div>
        </div>
      </div>
    </section>
  );
}
