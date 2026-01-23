import type { SectionProps } from '../_core/types';

export function ModernPremiumBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-8">
            {config.benefitsTitle || 'নিখুঁতভাবে তৈরি।'}
          </h2>
          <p className="text-xl text-slate-500 font-medium tracking-tight">
            সেরা অভিজ্ঞতা নিশ্চিত করতে নিখুঁতভাবে তৈরি।
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="text-6xl mb-10 transition-transform duration-700 group-hover:-translate-y-3">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 tracking-tight">{benefit.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed tracking-tight">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
