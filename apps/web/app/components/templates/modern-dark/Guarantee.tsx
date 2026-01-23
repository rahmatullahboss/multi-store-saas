import type { SectionProps } from '../_core/types';

export function ModernDarkGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,_white_1px,_transparent_1px)] bg-[length:40px_40px]"></div>
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl">
            🔒
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-12 drop-shadow-2xl">
            {guaranteeText}
          </h2>
          <div className="inline-flex items-center gap-4 bg-zinc-950 px-10 py-5 rounded-2xl text-white font-black uppercase italic tracking-[0.2em] text-xs shadow-2xl border border-white/5">
            {config.guaranteeBadgeLabel || 'সম্পূর্ণ মূল্য ফেরত গ্যারান্টি'}
          </div>
        </div>
      </div>
    </section>
  );
}
