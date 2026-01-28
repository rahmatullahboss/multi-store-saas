/**
 * Rich Text Section
 *
 * Shopify OS 2.0 Compatible Section
 * General purpose rich text section for content pages.
 */

import { Link } from '@remix-run/react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  type: 'rich-text',
  name: 'Rich Text',
  tag: 'section',
  class: 'rich-text',

  enabled_on: {
    templates: ['index', 'page', 'product', 'collection', 'cart'],
  },

  settings: [
    {
      type: 'header',
      id: 'header_content',
      label: 'Content',
    },
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'সেকশন শিরোনাম',
    },
    {
      type: 'select',
      id: 'heading_size',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      default: 'medium',
      label: 'Heading size',
    },
    {
      type: 'richtext',
      id: 'content',
      label: 'Content',
      default:
        '<p>এখানে আপনার কন্টেন্ট যোগ করুন। এটি একটি রিচ টেক্সট সেকশন যা আপনার পেজে টেক্সট কন্টেন্ট প্রদর্শন করতে ব্যবহার করা যায়।</p>',
    },
    {
      type: 'header',
      id: 'header_layout',
      label: 'Layout',
    },
    {
      type: 'select',
      id: 'text_alignment',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      default: 'center',
      label: 'Text alignment',
    },
    {
      type: 'select',
      id: 'content_width',
      options: [
        { value: 'small', label: 'Small (600px)' },
        { value: 'medium', label: 'Medium (800px)' },
        { value: 'large', label: 'Large (1000px)' },
        { value: 'full', label: 'Full width' },
      ],
      default: 'medium',
      label: 'Content width',
    },
    {
      type: 'header',
      id: 'header_button',
      label: 'Button',
    },
    {
      type: 'text',
      id: 'button_label',
      label: 'Button label',
    },
    {
      type: 'url',
      id: 'button_link',
      label: 'Button link',
    },
    {
      type: 'select',
      id: 'button_style',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
      ],
      default: 'primary',
      label: 'Button style',
    },
    {
      type: 'header',
      id: 'header_style',
      label: 'Style',
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
    },
    {
      type: 'range',
      id: 'padding_top',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding top',
    },
    {
      type: 'range',
      id: 'padding_bottom',
      min: 0,
      max: 100,
      step: 4,
      default: 48,
      unit: 'px',
      label: 'Padding bottom',
    },
  ],

  blocks: [
    {
      type: 'paragraph',
      name: 'Paragraph',
      settings: [
        {
          type: 'richtext',
          id: 'text',
          label: 'Text',
          default: '<p>অতিরিক্ত প্যারাগ্রাফ যোগ করুন।</p>',
        },
      ],
    },
    {
      type: 'button',
      name: 'Button',
      limit: 2,
      settings: [
        {
          type: 'text',
          id: 'label',
          label: 'Label',
          default: 'আরো দেখুন',
        },
        {
          type: 'url',
          id: 'link',
          label: 'Link',
        },
        {
          type: 'select',
          id: 'style',
          options: [
            { value: 'primary', label: 'Primary' },
            { value: 'secondary', label: 'Secondary' },
            { value: 'outline', label: 'Outline' },
          ],
          default: 'primary',
          label: 'Style',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Rich Text',
      category: 'Content',
      settings: {
        heading: 'আমাদের সম্পর্কে',
        content:
          '<p>আমরা বাংলাদেশের সেরা অনলাইন শপিং প্ল্যাটফর্ম। উচ্চ মানের পণ্য এবং সেরা কাস্টমার সার্ভিস প্রদান করি।</p>',
        text_alignment: 'center',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface RichTextSettings {
  heading?: string;
  heading_size: 'small' | 'medium' | 'large';
  content?: string;
  text_alignment: 'left' | 'center' | 'right';
  content_width: 'small' | 'medium' | 'large' | 'full';
  button_label?: string;
  button_link?: string;
  button_style: 'primary' | 'secondary' | 'outline';
  background_color: string;
  text_color?: string;
  padding_top: number;
  padding_bottom: number;
}

const headingSizeClass = {
  small: 'text-xl md:text-2xl',
  medium: 'text-2xl md:text-3xl',
  large: 'text-3xl md:text-4xl',
};

const contentWidthClass = {
  small: 'max-w-xl',
  medium: 'max-w-3xl',
  large: 'max-w-5xl',
  full: 'max-w-7xl',
};

const alignmentClass = {
  left: 'text-left',
  center: 'text-center mx-auto',
  right: 'text-right ml-auto',
};

export default function RichText({ section, context, settings, blocks }: SectionComponentProps) {
  const {
    heading,
    heading_size = 'medium',
    content,
    text_alignment = 'center',
    content_width = 'medium',
    button_label,
    button_link,
    button_style = 'primary',
    background_color = '#ffffff',
    text_color,
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as RichTextSettings;

  // Theme colors
  const primaryColor = context.theme?.colors?.primary || '#6366f1';
  const secondaryColor = context.theme?.colors?.secondary || '#4f46e5';
  const themeTextColor = text_color || context.theme?.colors?.text || '#111827';
  const mutedColor = context.theme?.colors?.textMuted || '#6b7280';

  // Button styles
  const buttonStyles = {
    primary: {
      backgroundColor: primaryColor,
      color: '#ffffff',
      border: 'none',
    },
    secondary: {
      backgroundColor: secondaryColor,
      color: '#ffffff',
      border: 'none',
    },
    outline: {
      backgroundColor: 'transparent',
      color: primaryColor,
      border: `2px solid ${primaryColor}`,
    },
  };

  const renderButton = (
    label: string,
    link: string,
    style: 'primary' | 'secondary' | 'outline'
  ) => (
    <Link
      to={link}
      className="inline-block px-8 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
      style={buttonStyles[style]}
    >
      {label}
    </Link>
  );

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="rich-text"
    >
      <div className={`${contentWidthClass[content_width]} ${alignmentClass[text_alignment]}`}>
        {/* Heading */}
        {heading && (
          <h2
            className={`${headingSizeClass[heading_size]} font-bold mb-6`}
            style={{ color: themeTextColor }}
          >
            {heading}
          </h2>
        )}

        {/* Main Content */}
        {content && (
          <div
            className="prose prose-lg max-w-none mb-6"
            style={{ color: mutedColor }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Blocks */}
        {blocks && blocks.length > 0 && (
          <div className="space-y-6 mb-6">
            {blocks.map((block) => {
              if (block.type === 'paragraph' && block.settings?.text) {
                return (
                  <div
                    key={block.id}
                    className="prose prose-lg max-w-none"
                    style={{ color: mutedColor }}
                    dangerouslySetInnerHTML={{ __html: block.settings.text as string }}
                  />
                );
              }
              if (block.type === 'button' && block.settings?.label) {
                return (
                  <div key={block.id} className={text_alignment === 'center' ? 'text-center' : ''}>
                    {renderButton(
                      block.settings.label as string,
                      (block.settings.link as string) || '/',
                      (block.settings.style as 'primary' | 'secondary' | 'outline') || 'primary'
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Main Button */}
        {button_label && button_link && (
          <div className="mt-8">{renderButton(button_label, button_link, button_style)}</div>
        )}
      </div>
    </section>
  );
}
