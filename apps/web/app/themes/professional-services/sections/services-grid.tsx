/**
 * Professional Services Theme - Services Grid Section
 * Showcase services/offerings in a grid layout
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function ServicesGrid({ section, context }: SectionComponentProps) {
  const { settings, blocks = [] } = section;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {settings.heading as string || 'Our Services'}
          </h2>
          {settings.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {settings.description as string}
            </p>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blocks.map((block, index) => (
            <div
              key={block.id || index}
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              {block.settings.icon && (
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <img
                    src={block.settings.icon as string}
                    alt={block.settings.title as string}
                    className="w-8 h-8"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {block.settings.title as string}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4">
                {block.settings.description as string}
              </p>

              {/* Features List */}
              {block.settings.features && (
                <ul className="space-y-2">
                  {(block.settings.features as string).split(',').map((feature, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700">
                      <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature.trim()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        {settings.show_cta && (
          <div className="text-center mt-12">
            <a
              href={settings.cta_link as string || '#contact'}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {settings.cta_text as string || 'Get Started'}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'services-grid',
  name: 'Services Grid',
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
      name: 'Service',
      settings: [
        {
          type: 'image',
          id: 'icon',
          label: 'Icon',
        },
        {
          type: 'text',
          id: 'title',
          label: 'Service Title',
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
  max_blocks: 6,
};
