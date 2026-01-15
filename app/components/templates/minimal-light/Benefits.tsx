import type { SectionProps } from '../_core/types';

export function MinimalLightBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-stone-900 tracking-tight mb-6">
            {config.benefitsTitle || 'আপনার যা প্রয়োজন সব এখানে আছে।'}
          </h2>
          <div className="h-px w-12 bg-stone-200 mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:-translate-y-1">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-medium mb-4 text-stone-900 tracking-tight">{benefit.title}</h3>
              <p className="text-stone-500 font-light leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
