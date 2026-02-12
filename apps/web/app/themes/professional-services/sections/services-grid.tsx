/**
 * Professional Services Theme - Services/Destinations Grid
 * Showcase study destinations with images and features
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function ServicesGrid({ section, context: _context }: SectionComponentProps) {
  const { settings, blocks = [] } = section;
  const showCta = Boolean(settings.show_cta);

  return (
    <section id="destinations" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-primary)] mb-4 font-heading">
            {settings.heading as string || 'Our Services'}
          </h2>
          {typeof settings.description === 'string' && settings.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {settings.description}
            </p>
          )}
        </div>

        {/* destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {blocks.map((block, index) => (
            <div
              key={block.id || index}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                {typeof block.settings.image === 'string' && block.settings.image ? (
                  <img
                    src={block.settings.image}
                    alt={block.settings.title as string}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-medium text-sm">View Details →</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-xl font-bold text-[var(--color-primary)] mb-3 group-hover:text-[var(--color-secondary)] transition-colors">
                  {block.settings.title as string}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 text-sm flex-1">
                  {block.settings.description as string}
                </p>

                {/* Features List */}
                {typeof block.settings.features === 'string' && block.settings.features && (
                  <ul className="space-y-2 mt-auto pt-4 border-t border-gray-100">
                    {block.settings.features.split(',').slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start text-xs text-gray-500">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature.trim()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {showCta && (
          <div className="text-center mt-12">
            <a
              href={settings.cta_link as string || '#contact'}
              className="inline-flex items-center px-8 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold rounded hover:bg-[var(--color-primary)] hover:text-white transition-colors uppercase tracking-wide text-sm"
            >
              {settings.cta_text as string || 'View All Destinations'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'services-grid',
  name: 'Services/Destinations',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Section Heading',
      default: 'Our Services',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Section Description',
      default: '',
    },
    {
      type: 'checkbox',
      id: 'show_cta',
      label: 'Show CTA Button',
      default: true,
    },
    {
      type: 'text',
      id: 'cta_text',
      label: 'CTA Button Text',
      default: 'Get Started',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'CTA Button Link',
      default: '#contact',
    },
  ],
  blocks: [
    {
      type: 'service',
      name: 'Destination/Service',
      settings: [
        {
          type: 'image_picker',
          id: 'image',
          label: 'Card Image',
        },
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Service Name',
        },
        {
          type: 'textarea',
          id: 'description',
          label: 'Description',
          default: 'Service description goes here',
        },
        {
          type: 'textarea',
          id: 'features',
          label: 'Features (comma-separated)',
          default: '',
        },
      ],
    },
  ],
  max_blocks: 8,
};
