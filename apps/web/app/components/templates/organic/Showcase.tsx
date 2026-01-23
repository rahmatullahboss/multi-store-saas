import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function OrganicShowcase({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.showcaseData?.features || config.showcaseData.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="showcase"
      sectionLabel="In The Box"
      data={{ showcaseData: config.showcaseData }}
      onUpdate={(data) => onUpdate?.('showcaseData', data.showcaseData)}
      isEditable={isEditMode}
    >
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-stone-50 rounded-[3rem] p-10 md:p-16 border border-stone-100">
            <div className="text-center mb-12">
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
                Included Items
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mt-6 tracking-tight">
                Everything You Get
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-y-4 gap-x-12">
              {config.showcaseData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-bold text-xs ring-4 ring-white">
                    {i + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
