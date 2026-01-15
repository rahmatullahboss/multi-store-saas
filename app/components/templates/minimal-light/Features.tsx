import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function MinimalLightFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="বৈশিষ্ট্যসমূহ"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-20 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            {config.features.map((feature, i) => (
              <div key={i} className={`text-center group`}>
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                  {feature.icon || '✨'}
                </div>
                <h4 className={`text-xl font-bold text-gray-900 mb-3 tracking-tight`}>{feature.title}</h4>
                {feature.description && (
                  <p className={`text-gray-500 text-sm leading-relaxed`}>{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
