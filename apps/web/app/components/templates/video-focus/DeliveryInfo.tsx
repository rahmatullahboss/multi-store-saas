import type { SectionProps } from '../_core/types';

export function VideoFocusDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-black">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 bg-zinc-950 rounded-[3rem] p-12 md:p-20 border border-zinc-800 relative group overflow-hidden">
          <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="md:w-1/3 text-center">
             <div className="w-48 h-48 bg-black rounded-full flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(220,38,38,0.1)] border border-zinc-800 relative">
               <div className="absolute -inset-2 border-2 border-red-600/20 rounded-full animate-ping opacity-20"></div>
               📦
             </div>
          </div>
          
          <div className="md:w-2/3 text-center md:text-left relative z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-6">
              {deliveryInfo.title}
            </h2>
            <p className="text-xl text-zinc-400 font-bold mb-10 leading-relaxed">
              {deliveryInfo.description}
            </p>
            
            {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {deliveryInfo.areas.map((area, index) => (
                  <span key={index} className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black italic text-zinc-500 uppercase tracking-widest hover:text-red-500 hover:border-red-600/30 transition-all">
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
