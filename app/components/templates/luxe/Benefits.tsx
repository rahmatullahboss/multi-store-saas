import type { SectionProps } from '../_core/types';

export function LuxeBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight mb-8">
            Exquisite <span className="text-amber-500">Excellence.</span>
          </h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-800 to-transparent mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="text-5xl mb-8 transform group-hover:-translate-y-2 transition-transform duration-700">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-serif text-white mb-4 tracking-wide">{benefit.title}</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm max-w-xs mx-auto">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
