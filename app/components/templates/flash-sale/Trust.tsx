import type { SectionProps } from '../_core/types';

export function FlashSaleTrust({ config }: SectionProps) {
  const trustBadges = config.trustBadges || [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-8 bg-zinc-950 border-y border-red-600/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">{badge.icon}</span>
              <span className="text-xs font-black uppercase tracking-tighter text-white">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
