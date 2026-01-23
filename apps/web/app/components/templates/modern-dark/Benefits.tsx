import type { SectionProps } from '../_core/types';

export function ModernDarkBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 italic">
            {config.benefitsTitle || 'কেন আমাদের পছন্দ করবেন?'}
          </h2>
          <div className="h-1.5 w-24 bg-orange-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-zinc-800/50 p-10 rounded-3xl border border-zinc-700/50 hover:border-orange-500/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="text-8xl font-black">{index + 1}</span>
              </div>
              <div className="text-5xl mb-8 transform group-hover:-rotate-12 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-black mb-4 text-white uppercase tracking-tight italic">{benefit.title}</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
