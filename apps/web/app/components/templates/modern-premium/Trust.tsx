import type { SectionProps } from '../_core/types';

export function ModernPremiumTrust({ config }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <span className="text-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-110">{badge.icon}</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-900 transition-colors">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
