import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ShowcaseFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="Product Benefits"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-24 bg-[#0a0a0a]`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800/10 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl">
            {config.features.map((feature, i) => (
              <div key={i} className={`bg-zinc-950 p-12 hover:bg-zinc-900 transition-colors duration-500 flex flex-col items-center text-center group`}>
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-125 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h4 className={`text-xl font-bold text-white mb-4 tracking-tight`}>{feature.title}</h4>
                {feature.description && (
                  <p className={`text-zinc-500 text-sm leading-relaxed font-medium`}>{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
