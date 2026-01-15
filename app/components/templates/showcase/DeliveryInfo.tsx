import type { SectionProps } from '../_core/types';

export function ShowcaseDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16 bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-gray-100 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="md:w-1/3">
             <div className="w-40 h-40 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-7xl shadow-inner border border-gray-100">
               📫
             </div>
          </div>
          
          <div className="md:w-2/3 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              {deliveryInfo.title}
            </h2>
            <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10">
              {deliveryInfo.description}
            </p>
            
            {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {deliveryInfo.areas.map((area, index) => (
                  <span key={index} className="px-6 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-rose-500/30 hover:text-rose-500 transition-colors">
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
