/**
 * Professional Services Theme - Accreditations Section
 * Displays certification/membership logos in a grid
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function Accreditations({ section, context }: SectionComponentProps) {
  const { settings, blocks } = section;

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">
            {settings.heading as string || 'Accreditations & Memberships'}
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 items-center grayscale hover:grayscale-0 transition-all duration-500">
          {(blocks || []).map((block: any, index: number) => {
            if (!block.settings.image) return null;
            return (
              <div key={index} className="p-4 bg-white shadow-sm rounded-lg hover:shadow-md transition-shadow">
                <img 
                  src={block.settings.image} 
                  alt={block.settings.alt || 'Partner Logo'} 
                  className="h-12 w-auto object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'accreditations',
  name: 'Accreditations',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Section Heading',
      default: 'Our Accreditations',
    },
  ],
  blocks: [
    {
      type: 'logo',
      name: 'Logo',
      settings: [
        { type: 'image_picker', id: 'image', label: 'Logo Image' },
        { type: 'text', id: 'alt', label: 'Alt Text' },
      ],
    },
  ],
  max_blocks: 8,
};
