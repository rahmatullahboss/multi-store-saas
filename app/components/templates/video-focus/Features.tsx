import { MagicSectionWrapper } from '~/components/editor';
import { PlayCircle, Tv, Zap } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function VideoFocusFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="মূল বৈশিষ্ট্য"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-16 bg-black border-y border-white/5`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.features.map((feature, i) => (
              <div key={i} className={`p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group cursor-default`}>
                <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-red-900/20 group-hover:scale-110 transition-transform">
                   {feature.icon || <PlayCircle size={28} />}
                </div>
                <h4 className={`text-xl font-bold text-white mb-3`}>{feature.title}</h4>
                {feature.description && (
                  <p className={`text-gray-400 text-sm leading-relaxed font-medium`}>{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
