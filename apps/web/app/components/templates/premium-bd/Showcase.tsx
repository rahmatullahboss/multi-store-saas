import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';
import { PackageOpen } from 'lucide-react';

export function PremiumBDShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="বক্সে যা থাকছে"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-16 bg-sky-50/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-sky-100 p-8 md:p-10 text-center">
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-600 mb-6">
              <PackageOpen size={32} />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              বক্সের ভিতরে যা যা পাবেন
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-sky-50/50 rounded-lg border border-sky-100">
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">
                * ডেলিভারি ম্যানের সামনে প্রোডাক্ট চেক করে নিবেন
              </p>
            </div>

          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
