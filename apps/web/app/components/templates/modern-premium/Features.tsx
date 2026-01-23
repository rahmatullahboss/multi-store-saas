import { MagicSectionWrapper } from '~/components/editor';
import { Star, ShieldCheck, Zap } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function ModernPremiumFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="নির্ভরযোগ্য বৈশিষ্ট্য"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-20 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {config.features.map((feature, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:border-black transition-all group`}>
                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform">
                  {feature.icon || <Zap size={28} className="fill-white" />}
                </div>
                <h4 className={`text-2xl font-black text-gray-950 mb-4 tracking-tighter uppercase italic`}>{feature.title}</h4>
                {feature.description && (
                  <p className={`text-gray-500 text-base leading-relaxed font-medium`}>{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
