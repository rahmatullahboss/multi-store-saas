import type { SectionProps } from './types';

export function SocialProofSection({
  config,
  theme,
}: SectionProps) {
  if (!config.socialProof || (!config.socialProof.count && !config.socialProof.text)) return null;

  return (
    <section className={`${theme.urgencyBg} text-white py-4`}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl md:text-4xl font-black">{config.socialProof.count}+</span>
          <span className="text-xl md:text-2xl font-bold">{config.socialProof.text}</span>
        </div>
      </div>
    </section>
  );
}
