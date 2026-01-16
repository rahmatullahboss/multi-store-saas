import type { SectionProps } from '../_core/types';

export function PremiumBDTrust({ config, theme }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-3xl">{badge.icon}</span>
              <span className="text-sm font-black uppercase tracking-wider text-gray-800">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
