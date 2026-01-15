import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function LuxeFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="Features"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-16 md:py-24 bg-black border-y border-amber-500/10`}>
        <div className="max-w-6xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif-display text-white mb-4 tracking-wider uppercase">
            {config.featuresTitle || 'Exclusive Features'}
          </h2>
          <div className="w-24 h-px bg-amber-500 mx-auto" />
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-px bg-amber-500/10">
          {config.features.map((feature, i) => (
            <div key={i} className={`bg-black p-12 flex flex-col items-center text-center group`}>
              <div className="text-amber-500 text-5xl mb-8 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                {feature.icon}
              </div>
              <h4 className="text-xl font-serif-display text-white tracking-widest uppercase mb-6">
                {feature.title}
              </h4>
              {feature.description && (
                <p className="text-zinc-500 text-sm font-light leading-relaxed max-w-xs">
                  {feature.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
