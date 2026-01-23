import type { SectionProps } from '../_core/types';

export function OrganicDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16 bg-emerald-50/50 rounded-[3rem] p-12 md:p-20 border border-emerald-100">
          <div className="md:w-1/3 text-center">
             <div className="relative inline-block">
               <div className="absolute inset-0 bg-emerald-300 blur-3xl opacity-20"></div>
               <div className="relative w-48 h-48 bg-white border-2 border-emerald-100 rounded-full flex items-center justify-center text-7xl shadow-xl shadow-emerald-900/5">
                 📫
               </div>
             </div>
          </div>
          
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6 tracking-tight">
              {deliveryInfo.title}
            </h2>
            <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10">
              {deliveryInfo.description}
            </p>
            
            {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {deliveryInfo.areas.map((area, index) => (
                  <span key={index} className="bg-white border border-emerald-100 px-6 py-2.5 rounded-full text-xs font-bold text-emerald-800 shadow-sm hover:shadow-md transition-shadow">
                    🌱 {area}
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
