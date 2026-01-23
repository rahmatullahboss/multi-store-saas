import type { SectionProps } from '../_core/types';

export function ModernDarkDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-2/5">
               <div className="relative">
                 <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse"></div>
                 <div className="relative w-40 h-40 bg-zinc-800 rounded-3xl flex items-center justify-center text-7xl border border-zinc-700 shadow-2xl">
                   🚀
                 </div>
               </div>
            </div>
            
            <div className="md:w-3/5 text-center md:text-left">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-6 leading-none">
                {deliveryInfo.title}
              </h2>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed mb-10">
                {deliveryInfo.description}
              </p>
              
              {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {deliveryInfo.areas.map((area, index) => (
                    <span key={index} className="bg-zinc-800 border border-zinc-700 px-5 py-2.5 rounded-xl text-xs font-black text-zinc-300 uppercase tracking-widest italic hover:bg-zinc-700 transition-colors">
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
