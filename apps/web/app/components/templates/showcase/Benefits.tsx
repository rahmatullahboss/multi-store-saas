import type { SectionProps } from '../_core/types';

export function ShowcaseBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-1px bg-gray-100 border border-gray-100 rounded-[2rem] overflow-hidden">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-12 hover:bg-gray-50 transition-colors group">
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 tracking-tight">{benefit.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
