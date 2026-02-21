/**
 * Daraz Rich Text Section
 *
 * Shopify OS 2.0 Compatible Section
 * General purpose rich text section with Daraz-style design:
 * - Clean white background
 * - Flexible content area
 * - Custom heading styles
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'rich-text',
  name: 'Rich Text (Daraz)',
  tag: 'section',
  class: 'daraz-rich-text',

  enabled_on: {
    templates: ['page', 'index', 'product', 'collection'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: '',
    },
    {
      type: 'select',
      id: 'heading_size',
      label: 'Heading size',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
      ],
      default: 'md',
    },
    {
      type: 'richtext',
      id: 'content',
      label: 'Content',
      default: '<p>Add your content here. You can use rich text formatting.</p>',
    },
    {
      type: 'select',
      id: 'text_alignment',
      label: 'Text alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'left',
    },
    {
      type: 'select',
      id: 'content_width',
      label: 'Content width',
      options: [
        { value: 'narrow', label: 'Narrow' },
        { value: 'medium', label: 'Medium' },
        { value: 'wide', label: 'Wide' },
        { value: 'full', label: 'Full' },
      ],
      default: 'medium',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#ffffff',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text color',
      default: '#212121',
    },
    {
      type: 'color',
      id: 'heading_color',
      label: 'Heading color',
      default: '#F85606',
    },
    {
      type: 'range',
      id: 'padding_top',
      min: 0,
      max: 100,
      step: 4,
      default: 32,
      unit: 'px',
      label: 'Padding top',
    },
    {
      type: 'range',
      id: 'padding_bottom',
      min: 0,
      max: 100,
      step: 4,
      default: 32,
      unit: 'px',
      label: 'Padding bottom',
    },
  ],

  blocks: [
    {
      type: 'button',
      name: 'Button',
      limit: 2,
      settings: [
        {
          type: 'text',
          id: 'text',
          label: 'Button text',
          default: 'Learn More',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Button link',
        },
        {
          type: 'select',
          id: 'style',
          label: 'Button style',
          options: [
            { value: 'primary', label: 'Primary (Orange)' },
            { value: 'secondary', label: 'Secondary (Outline)' },
          ],
          default: 'primary',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Daraz Rich Text',
      category: 'Content',
      settings: {
        heading: 'About Us',
        content:
          '<p>Welcome to our store. We are committed to providing quality products at great prices.</p>',
        text_alignment: 'center',
        content_width: 'medium',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface DarazRichTextSettings {
  heading: string;
  heading_size: 'sm' | 'md' | 'lg';
  content: string;
  text_alignment: 'left' | 'center' | 'right';
  content_width: 'narrow' | 'medium' | 'wide' | 'full';
  background_color: string;
  text_color: string;
  heading_color: string;
  padding_top: number;
  padding_bottom: number;
}

const headingSizeMap = {
  sm: 'text-lg md:text-xl',
  md: 'text-xl md:text-2xl',
  lg: 'text-2xl md:text-3xl',
};

const contentWidthMap = {
  narrow: 'max-w-xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
  full: 'max-w-7xl',
};

export default function DarazRichText({
  section,
  context,
  settings,
  blocks,
}: SectionComponentProps) {
  const {
    heading = '',
    heading_size = 'md',
    content = '<p>Add your content here.</p>',
    text_alignment = 'left',
    content_width = 'medium',
    background_color = '#ffffff',
    text_color = '#212121',
    heading_color = '#F85606',
    padding_top = 32,
    padding_bottom = 32,
  } = settings as unknown as DarazRichTextSettings;

  const primary_color = '#F85606';

  return (
    <section
      className="rounded-lg shadow-sm mb-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="daraz-rich-text"
    >
      <div
        className={`mx-auto px-4 md:px-6 ${contentWidthMap[content_width]}`}
        style={{ textAlign: text_alignment }}
      >
        {/* Heading */}
        {heading && (
          <h2
            className={`font-medium mb-4 ${headingSizeMap[heading_size]}`}
            style={{ color: heading_color }}
          >
            {heading}
          </h2>
        )}

        {/* Content */}
        <div
          className="prose prose-sm md:prose max-w-none"
          style={{ color: text_color }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Buttons */}
        {blocks && blocks.length > 0 && (
          <div
            className={`flex gap-3 mt-6 ${text_alignment === 'center' ? 'justify-center' : text_alignment === 'right' ? 'justify-end' : 'justify-start'}`}
          >
            {blocks.map((block) => {
              if (block.type !== 'button') return null;

              const buttonText = (block.settings?.text as string) || 'Learn More';
              const buttonLink = (block.settings?.link as string) || '#';
              const buttonStyle = (block.settings?.style as string) || 'primary';

              if (buttonStyle === 'primary') {
                return (
                  <a
                    key={block.id}
                    href={buttonLink}
                    className="inline-flex items-center px-6 py-2.5 rounded font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primary_color }}
                  >
                    {buttonText}
                  </a>
                );
              }

              return (
                <a
                  key={block.id}
                  href={buttonLink}
                  className="inline-flex items-center px-6 py-2.5 rounded font-medium border-2 transition-colors"
                  style={{ borderColor: primary_color, color: primary_color }}
                >
                  {buttonText}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
