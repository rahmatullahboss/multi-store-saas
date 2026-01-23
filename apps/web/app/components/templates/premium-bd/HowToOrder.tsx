import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { ShoppingCart, PhoneCall, Truck } from 'lucide-react';

export function PremiumBDHowToOrder({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.howToOrderData?.steps || config.howToOrderData.steps.length === 0) return null;

  // Manual icon mapping for common steps if needed, or generic number
  const getIcon = (index: number) => {
    if (index === 0) return <ShoppingCart className="w-6 h-6" />;
    if (index === 1) return <PhoneCall className="w-6 h-6" />;
    return <Truck className="w-6 h-6" />;
  }

  return (
    <MagicSectionWrapper
      sectionId="how-to-order"
      sectionLabel="অর্ডার প্রক্রিয়া"
      data={{ howToOrderData: config.howToOrderData }}
      onUpdate={(data) => onUpdate?.('howToOrderData', data.howToOrderData)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              কিভাবে অর্ডার করবেন?
            </h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {config.howToOrderData.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center relative overflow-hidden group">
                 {/* Step Number Bg */}
                 <span className="absolute -right-4 -bottom-4 text-[5rem] font-bold text-gray-50 opacity-50 group-hover:text-orange-50 transition-colors pointer-events-none select-none">
                   {i + 1}
                 </span>

                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  {getIcon(i)}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
