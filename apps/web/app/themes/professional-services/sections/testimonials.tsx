/**
 * Professional Services Theme - Testimonials Section
 * Display client testimonials with ratings
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function Testimonials({ section, context: _context }: SectionComponentProps) {
  const { settings, blocks = [] } = section;

  return (
    <section 
      className="py-20 relative overflow-hidden"
      style={{ backgroundColor: settings.bg_color as string || '#F9FAFB' }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-[var(--color-secondary)] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[var(--color-primary)] mb-4 font-heading">
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
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border-b-4 border-transparent hover:border-[var(--color-secondary)] group"
            >
              {/* Rating Stars */}
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < (block.settings.rating as number || 5)
                        ? 'text-[var(--color-accent)]'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote Icon */}
              <div className="mb-4 text-gray-200">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                </svg>
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-600 mb-6 italic text-lg leading-relaxed">
                "{block.settings.text as string}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                  {typeof block.settings.avatar === 'string' && block.settings.avatar ? (
                    <img
                      src={block.settings.avatar}
                      alt={block.settings.name as string}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full mr-4 bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">
                      {(block.settings.name as string).charAt(0)}
                    </div>
                  )}
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                    {block.settings.name as string}
                  </div>
                  {(typeof block.settings.position === 'string' && block.settings.position) || (typeof block.settings.company === 'string' && block.settings.company) ? (
                    <div className="text-sm text-[var(--color-secondary)] font-medium">
                       {[block.settings.position, block.settings.company].filter(Boolean).join(', ')}
                    </div>
                  ) : null}
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
          default: 'Student',
        },
        {
          type: 'text',
          id: 'company',
          label: 'University/Institution',
          default: 'University of Sydney',
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
