import type { SectionProps } from '../_core/types';

export function PremiumBDBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4 underline decoration-orange-500 decoration-4 underline-offset-8">
            {config.benefitsTitle || 'কেন আমাদের থেকে কিনবেন?'}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform inline-block">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-950 uppercase italic tracking-tight">{benefit.title}</h3>
              <p className="text-gray-600 font-medium leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
