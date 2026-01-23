import type { SectionProps } from '../_core/types';

export function FlashSaleGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-24 bg-yellow-400 text-black relative overflow-hidden">
      {/* Dynamic striped background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(45deg,_transparent,_transparent_20px,_#000_20px,_#000_40px)]"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-10 shadow-2xl border-4 border-white rotate-12">
            🛡️
          </div>
          <h2 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-10 drop-shadow-sm">
            {guaranteeText}
          </h2>
          <div className="inline-block bg-black text-white px-8 py-4 rounded-full font-black uppercase italic tracking-widest text-xs shadow-2xl -rotate-1 border-2 border-white">
            {config.guaranteeBadgeLabel || '১০০% নিরাপদ ও নির্ভরযোগ্য'}
          </div>
        </div>
      </div>
    </section>
  );
}
