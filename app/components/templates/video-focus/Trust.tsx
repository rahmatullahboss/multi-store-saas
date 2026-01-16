import type { SectionProps } from '../_core/types';

export function VideoFocusTrust({ config }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-10 bg-zinc-950 border-y border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-2xl text-red-500">{badge.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
