/**
 * Professional Services Theme - Testimonials Section
 * Display client testimonials with ratings
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function Testimonials({ section, context }: SectionComponentProps) {
  const { settings, blocks = [] } = section;

  return (
    <section 
      className="py-20"
      style={{ backgroundColor: settings.bg_color as string || '#F9FAFB' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {settings.heading as string || 'What Our Clients Say'}
          </h2>
          {typeof settings.description === 'string' && settings.description && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {settings.description}
            </p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blocks.map((block, index) => (
            <div
              key={block.id || index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Rating Stars */}
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < (block.settings.rating as number || 5)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 mb-6">
                "{block.settings.text as string}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                  {typeof block.settings.avatar === 'string' && block.settings.avatar && (
                    <img
                      src={block.settings.avatar}
                      alt={block.settings.name as string}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                  )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {block.settings.name as string}
                  </div>
                  {typeof block.settings.position === 'string' && block.settings.position && (
                    <div className="text-sm text-gray-600">
                      {block.settings.position}
                    </div>
                  )}
                  {typeof block.settings.company === 'string' && block.settings.company && (
                    <div className="text-sm text-gray-500">
                      {block.settings.company}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'testimonials',
  name: 'Testimonials',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Section Heading',
      default: 'What Our Clients Say',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Section Description',
      default: '',
    },
    {
      type: 'color',
      id: 'bg_color',
      label: 'Background Color',
      default: '#F9FAFB',
    },
  ],
  blocks: [
    {
      type: 'testimonial',
      name: 'Testimonial',
      settings: [
        {
          type: 'textarea',
          id: 'text',
          label: 'Testimonial Text',
          default: 'Great service! Highly recommended.',
        },
        {
          type: 'range',
          id: 'rating',
          label: 'Rating (1-5)',
          min: 1,
          max: 5,
          default: 5,
        },
        {
          type: 'text',
          id: 'name',
          label: 'Client Name',
          default: 'John Doe',
        },
        {
          type: 'text',
          id: 'position',
          label: 'Position/Role',
          default: 'CEO',
        },
        {
          type: 'text',
          id: 'company',
          label: 'Company Name',
          default: 'ABC Company',
        },
        {
          type: 'image_picker',
          id: 'avatar',
          label: 'Profile Photo',
        },
      ],
    },
  ],
  max_blocks: 6,
};
