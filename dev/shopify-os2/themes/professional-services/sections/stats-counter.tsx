/**
 * Professional Services Theme - Stats Counter Section
 * Displays key metrics like "150,000+ Students"
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function StatsCounter({ section, context }: SectionComponentProps) {
  const { settings, blocks } = section;

  return (
    <section className="py-16 bg-[var(--color-primary)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-white/20">
          {(blocks || []).map((block: any, index: number) => (
            <div key={index} className="px-4">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-[var(--color-accent)] font-heading">
                {block.settings.number}
              </div>
              <div className="text-sm lg:text-base opacity-90 font-medium uppercase tracking-wide">
                {block.settings.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'stats-counter',
  name: 'Stats Counter',
  settings: [],
  blocks: [
    {
      type: 'stat',
      name: 'Statistic',
      limit: 4,
      settings: [
        { type: 'text', id: 'number', label: 'Number', default: '150k+' },
        { type: 'text', id: 'label', label: 'Label', default: 'Students' },
      ],
    },
  ],
  max_blocks: 4,
};
