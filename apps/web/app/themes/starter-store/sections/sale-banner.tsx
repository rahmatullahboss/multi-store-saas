/**
 * Sale Banner Section
 *
 * Shopify OS 2.0 Compatible Section
 * Promotional banner for sales and special offers.
 */

import { Link } from '@remix-run/react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Sale Banner',
  tag: 'section',
  class: 'sale-banner',

  enabled_on: {
    templates: ['index', 'collection'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: '🎉 বিশেষ ছাড় চলছে!',
    },
    {
      type: 'textarea',
      id: 'subheading',
      label: 'Subheading',
      default: 'সীমিত সময়ের জন্য ৫০% পর্যন্ত ছাড়',
    },
    {
      type: 'text',
      id: 'button_label',
      label: 'Button label',
      default: 'সেল দেখুন',
    },
    {
      type: 'url',
      id: 'button_link',
      label: 'Button link',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#f59e0b',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text color',
      default: '#ffffff',
    },
    {
      type: 'color',
      id: 'button_background',
      label: 'Button background',
      default: '#ffffff',
    },
    {
      type: 'color',
      id: 'button_text_color',
      label: 'Button text color',
      default: '#f59e0b',
    },
    {
      type: 'range',
      id: 'padding_top',
      min: 20,
      max: 100,
      step: 4,
      default: 64,
      unit: 'px',
      label: 'Padding top',
    },
    {
      type: 'range',
      id: 'padding_bottom',
      min: 20,
      max: 100,
      step: 4,
      default: 64,
      unit: 'px',
      label: 'Padding bottom',
    },
  ],

  presets: [
    {
      name: 'Sale Banner',
      category: 'Promotions',
      settings: {
        heading: '🎉 বিশেষ ছাড় চলছে!',
        subheading: 'সীমিত সময়ের জন্য ৫০% পর্যন্ত ছাড়',
        button_label: 'সেল দেখুন',
        button_link: '/collections/sale',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface SaleBannerSettings {
  heading: string;
  subheading: string;
  button_label: string;
  button_link?: string;
  background_color: string;
  text_color: string;
  button_background: string;
  button_text_color: string;
  padding_top: number;
  padding_bottom: number;
}

export default function SaleBanner({ section, context, settings }: SectionComponentProps) {
  const {
    heading = '🎉 বিশেষ ছাড় চলছে!',
    subheading = 'সীমিত সময়ের জন্য ৫০% পর্যন্ত ছাড়',
    button_label = 'সেল দেখুন',
    button_link = '/collections/sale',
    background_color = '#f59e0b',
    text_color = '#ffffff',
    button_background = '#ffffff',
    button_text_color = '#f59e0b',
    padding_top = 64,
    padding_bottom = 64,
  } = settings as unknown as SaleBannerSettings;

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="sale-banner"
    >
      <div className="max-w-4xl mx-auto text-center" style={{ color: text_color }}>
        {heading && <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>}
        {subheading && <p className="text-lg mb-6 opacity-90">{subheading}</p>}
        {button_label && (
          <Link
            to={button_link || '/collections/sale'}
            className="inline-block px-8 py-3 rounded-lg font-medium transition hover:opacity-90"
            style={{
              backgroundColor: button_background,
              color: button_text_color,
            }}
          >
            {button_label}
          </Link>
        )}
      </div>
    </section>
  );
}
