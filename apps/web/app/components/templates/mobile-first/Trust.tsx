import type { SectionProps } from '../_core/types';

export function MobileFirstTrust({ config }: SectionProps) {
  // Ensure trustBadges is an array (store config may pass an object)
  const trustBadges = Array.isArray(config.trustBadges) ? config.trustBadges : [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-6 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-8 min-w-max justify-center md:min-w-0">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-xl">{badge.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
