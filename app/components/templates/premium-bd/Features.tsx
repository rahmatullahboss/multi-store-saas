import { MagicSectionWrapper } from '~/components/editor';
import { CheckCircle2 } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function PremiumBDFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="নির্ভরযোগ্য বৈশিষ্ট্যসমূহ"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-16 bg-white border-y border-gray-100`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.features.map((feature, i) => (
              <div key={i} className={`flex gap-5 p-6 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-orange-200 transition-all group`}>
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex-shrink-0 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">
                  {feature.icon || <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h4 className={`text-xl font-bold text-gray-950 mb-1`}>{feature.title}</h4>
                  {feature.description && (
                    <p className={`text-gray-600 text-sm leading-relaxed font-medium`}>{feature.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
