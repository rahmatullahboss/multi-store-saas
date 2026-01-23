import { MagicSectionWrapper } from '~/components/editor';
import { Smartphone, Zap, ShieldCheck } from 'lucide-react';
import type { SectionProps } from '../_core/types';

export function MobileFirstFeatures({
  config,
  isEditMode,
  onUpdate,
  theme,
}: SectionProps) {
  if (!config.features || config.features.length === 0) return null;

  const icons = [Smartphone, Zap, ShieldCheck];

  return (
    <MagicSectionWrapper
      sectionId="features"
      sectionLabel="নির্ভরযোগ্য বৈশিষ্ট্য"
      data={{ features: config.features }}
      onUpdate={(data) => onUpdate?.('features', data)}
      isEditable={isEditMode}
    >
      <section className={`py-12 bg-white`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-4">
            {config.features.map((feature, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div key={i} className={`flex items-center gap-5 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:scale-[1.02] transition-transform`}>
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white">
                    {feature.icon || <Icon size={24} />}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold text-gray-950`}>{feature.title}</h4>
                    {feature.description && (
                      <p className={`text-gray-500 text-sm font-medium mt-0.5`}>{feature.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MagicSectionWrapper>
  );
}
