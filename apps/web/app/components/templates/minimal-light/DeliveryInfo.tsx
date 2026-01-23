import type { SectionProps } from '../_core/types';

export function MinimalLightDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white border border-stone-200 rounded-full flex items-center justify-center text-3xl mb-12 shadow-sm">
            📦
          </div>
          
          <h2 className="text-2xl md:text-3xl font-light tracking-tight text-stone-900 mb-6">
            {deliveryInfo.title}
          </h2>
          <p className="text-stone-500 font-light text-lg mb-12 max-w-xl">
            {deliveryInfo.description}
          </p>
          
          {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {deliveryInfo.areas.map((area, index) => (
                <span key={index} className="bg-white border border-stone-200 px-4 py-1.5 rounded-full text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
