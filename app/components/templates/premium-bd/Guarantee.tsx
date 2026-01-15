import type { SectionProps } from '../_core/types';

export function PremiumBDGuarantee({ config }: SectionProps) {
  const guaranteeText = config.guaranteeText;

  if (!guaranteeText) return null;

  return (
    <section className="py-20 bg-orange-500">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-6xl mb-8">🛡️</div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight drop-shadow-lg">
            {guaranteeText}
          </h2>
          <div className="mt-12 inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/30 text-white font-black uppercase italic tracking-widest text-sm">
            Trusted by 5000+ Customers
          </div>
        </div>
      </div>
    </section>
  );
}
