import { MagicSectionWrapper } from '~/components/editor';
import { CheckCircle2 } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function OrganicFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="Why Organic"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-20 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.features.map((feature, i) => (
              <div key={i} className={`flex gap-6 p-8 rounded-3xl bg-green-50/50 hover:bg-green-50 transition-colors group`}>
                <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200 group-hover:rotate-12 transition-transform">
                  {feature.icon || <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h4 className={`text-xl font-bold text-gray-900 mb-2`}>{feature.title}</h4>
                  {feature.description && (
                    <p className={`text-gray-600 text-sm leading-relaxed`}>{feature.description}</p>
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
