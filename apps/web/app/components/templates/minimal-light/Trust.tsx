import type { SectionProps } from '../_core/types';

export function MinimalLightTrust({ config }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-12 bg-white border-y border-stone-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
