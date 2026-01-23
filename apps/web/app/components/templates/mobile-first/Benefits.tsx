import type { SectionProps } from '../_core/types';

export function MobileFirstBenefits({ config }: SectionProps) {
  const benefits = config.benefits || [];

  if (benefits.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
            {config.benefitsTitle || 'কেন আমাদের পছন্দ করবেন?'}
          </h2>
          <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
              <div className="text-4xl mb-6 shadow-lg bg-white w-16 h-16 flex items-center justify-center rounded-2xl">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">{benefit.title}</h3>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
