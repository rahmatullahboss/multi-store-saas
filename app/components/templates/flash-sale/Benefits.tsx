import type { SectionProps } from '../_core/types';

export function FlashSaleBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
            Don't Wait! <span className="text-red-600">Buy Original.</span>
          </h2>
          <div className="h-1 w-20 bg-yellow-400 mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 hover:border-red-600 transition-all group relative overflow-hidden">
               <div className="absolute -right-4 -top-4 text-8xl font-black text-red-600 opacity-5 group-hover:opacity-10 transition-opacity">
                {index + 1}
              </div>
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-black mb-3 text-white uppercase italic tracking-tight">{benefit.title}</h3>
              <p className="text-zinc-400 font-bold text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
