import type { SectionProps } from '../_core/types';

export function ModernPremiumDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20 bg-white rounded-[4rem] p-16 md:p-24 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
          
          <div className="md:w-1/3">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-10"></div>
               <div className="relative w-48 h-48 bg-slate-50 rounded-[3rem] flex items-center justify-center text-7xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-700">
                 🚢
               </div>
             </div>
          </div>
          
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-none">
              {deliveryInfo.title}
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed tracking-tight mb-12">
              {deliveryInfo.description}
            </p>
            
            {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {deliveryInfo.areas.map((area, index) => (
                  <span key={index} className="px-8 py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm">
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
