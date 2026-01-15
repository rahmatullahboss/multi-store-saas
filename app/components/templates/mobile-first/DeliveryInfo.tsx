import type { SectionProps } from '../_core/types';

export function MobileFirstDeliveryInfo({ config }: SectionProps) {
  const deliveryInfo = config.deliveryInfo;

  if (!deliveryInfo || (!deliveryInfo.title && !deliveryInfo.description)) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col items-center text-center gap-6">
             <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl">
               🚚
             </div>
            
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-2">
                {deliveryInfo.title}
              </h2>
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                {deliveryInfo.description}
              </p>
              
              {deliveryInfo.areas && deliveryInfo.areas.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {deliveryInfo.areas.map((area, index) => (
                    <span key={index} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      📍 {area}
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
