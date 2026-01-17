import type { SectionProps } from '../_core/types';

export function LuxeTrust({ config }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-12 bg-black border-y border-stone-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-10 md:gap-20">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-700">{badge.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-500 group-hover:text-amber-400 transition-colors">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
