import type { SectionProps } from '../_core/types';

export function FlashSaleDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-20 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-black border-2 border-red-600/30 rounded-2xl p-10 md:p-16 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/4">
               <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(220,38,38,0.4)] animate-bounce">
                 ⚡
               </div>
            </div>
            
            <div className="md:w-3/4 text-center md:text-left">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-6">
                {deliveryInfo.title}
              </h2>
              <p className="text-xl text-zinc-400 font-bold mb-10 italic">
                {deliveryInfo.description}
              </p>
              
              {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {deliveryInfo.areas.map((area, index) => (
                    <span key={index} className="bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest italic shadow-xl">
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
