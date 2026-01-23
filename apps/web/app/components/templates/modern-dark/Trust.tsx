import type { SectionProps } from '../_core/types';

export function ModernDarkTrust({ config, theme }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-12 bg-zinc-900 border-y border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-10 md:gap-20">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">{badge.icon}</span>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
