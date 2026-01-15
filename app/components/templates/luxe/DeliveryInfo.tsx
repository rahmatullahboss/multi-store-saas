import type { SectionProps } from '../_core/types';

export function LuxeDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20 border-y border-stone-800 py-20 px-4 md:px-0">
          <div className="md:w-1/3 text-center md:text-left">
             <div className="w-32 h-32 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center text-5xl shadow-2xl relative group">
               <div className="absolute inset-0 border border-amber-500/20 rounded-full animate-ping scale-75 opacity-20"></div>
               🛎️
             </div>
          </div>
          
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-8 tracking-wide italic">
              {deliveryInfo.title}
            </h2>
            <p className="text-lg text-stone-500 font-light leading-[1.8] mb-12">
              {deliveryInfo.description}
            </p>
            
            {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {deliveryInfo.areas.map((area, index) => (
                  <span key={index} className="px-6 py-2 border border-stone-800 text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em] hover:border-amber-500/30 hover:text-amber-500 transition-all cursor-crosshair">
                    {area}
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
