import type { SectionProps } from '../_core/types';

export function OrganicTrust({ config }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-12 bg-emerald-50/50 border-y border-emerald-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-2xl opacity-80">{badge.icon}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
