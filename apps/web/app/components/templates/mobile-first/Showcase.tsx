import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { Package } from 'lucide-react';

export function MobileFirstShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="বক্সের বিবরণ"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <Package size={20} />
               </div>
               <h3 className="text-xl font-bold text-gray-900">ইন দ্য বক্স</h3>
            </div>

            <div className="grid gap-3">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                   <span className="text-gray-700 font-medium text-sm">{feature}</span>
                   <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold">1x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
