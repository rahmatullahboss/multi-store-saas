import type { SectionProps } from '../_core/types';

export function VideoFocusBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-24 bg-zinc-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4">
            Powerful <span className="text-red-600">Performance.</span>
          </h2>
          <div className="h-1.5 w-24 bg-red-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => (
            <div key={index} className="p-10 bg-black/40 rounded-[2rem] border border-zinc-800 hover:border-red-600 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="text-9xl font-black italic">{index + 1}</span>
              </div>
              <div className="text-5xl mb-8 transform group-hover:rotate-12 transition-transform">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-4 uppercase italic tracking-tight">{benefit.title}</h3>
              <p className="text-zinc-400 font-bold leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
