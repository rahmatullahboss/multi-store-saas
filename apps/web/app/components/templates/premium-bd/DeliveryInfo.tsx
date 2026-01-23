import type { SectionProps } from '../_core/types';

export function PremiumBDDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gray-50 rounded-[3rem] p-10 md:p-16 border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/3">
             <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-orange-500/30">
               🚚
             </div>
          </div>
          
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-gray-950 mb-6 underline decoration-orange-500 decoration-4 underline-offset-4">
              {deliveryInfo.title}
            </h2>
            <p className="text-xl text-gray-700 font-bold leading-relaxed mb-8">
              {deliveryInfo.description}
            </p>
            
            {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {deliveryInfo.areas.map((area, index) => (
                  <span key={index} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-black text-gray-600 uppercase tracking-tighter italic">
                    📍 {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
