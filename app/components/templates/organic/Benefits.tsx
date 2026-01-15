import type { SectionProps } from '../_core/types';

export function OrganicBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block">Our Promise</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight mb-6">
            {config.benefitsTitle || 'বিশুদ্ধ উপাদান, সেরা ফলাফল।'}
          </h2>
          <div className="h-1 w-16 bg-emerald-200 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group bg-emerald-50/30 p-10 rounded-[2rem] border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
              <div className="text-5xl mb-8 transform group-hover:scale-110 transition-transform duration-500">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold mb-4 text-slate-800">{benefit.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
