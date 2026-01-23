import { MagicSectionWrapper } from '~/components/editor';
import type { SectionProps } from '../_core/types';

export function ModernDarkFeatures({
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
      <section className={`py-24 bg-zinc-950`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
              Why Choose <span className="text-orange-500">Us</span>
            </h2>
            <p className="text-zinc-500 text-lg">Experience the next generation of performance and design.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.features.map((feature, i) => (
              <div key={i} className={`relative group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative h-full bg-zinc-900 rounded-3xl p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 flex flex-col items-center text-center`}>
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-4xl mb-6 ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className={`text-xl font-bold text-white mb-3 uppercase tracking-wider`}>{feature.title}</h4>
                  {feature.description && (
                    <p className={`text-zinc-400 text-sm leading-relaxed`}>{feature.description}</p>
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
