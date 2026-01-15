import type { SectionProps } from '../_core/types';

export function ShowcaseTrust({ config }: SectionProps) {
  const trustBadges = config.trustBadges || [];

  if (trustBadges.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 items-center">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center gap-3 group">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">{badge.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
