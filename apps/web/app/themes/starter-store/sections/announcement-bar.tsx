/**
 * Announcement Bar Section
 *
 * Shopify OS 2.0 Compatible Section
 * Shows promotional messages at the top of the page.
 */

import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Announcement Bar',
  tag: 'div',
  class: 'announcement-bar',
  limit: 1,

  enabled_on: {
    groups: ['header'],
  },

  settings: [
    {
      type: 'text',
      id: 'text',
      label: 'Announcement text',
      default: '',
    },
    {
      type: 'url',
      id: 'link',
      label: 'Link (optional)',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#f59e0b',
      info: 'Uses theme accent color by default',
    },
    {
      type: 'color',
      id: 'text_color',
      label: 'Text color',
      default: '#ffffff',
    },
    {
      type: 'range',
      id: 'padding_y',
      min: 4,
      max: 24,
      step: 2,
      default: 10,
      unit: 'px',
      label: 'Vertical padding',
    },
    {
      type: 'checkbox',
      id: 'show_close',
      label: 'Show close button',
      default: false,
    },
  ],

  presets: [
    {
      name: 'Announcement Bar',
      category: 'Header',
      settings: {
        text: '',
        background_color: '#f59e0b',
      },
    },
  ],
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface AnnouncementBarSettings {
  text: string;
  link?: string;
  background_color: string;
  text_color: string;
  padding_y: number;
  show_close: boolean;
}

export default function AnnouncementBar({ section, context, settings }: SectionComponentProps) {
  const {
    text = '',
    link,
    background_color = '#f59e0b',
    text_color = '#ffffff',
    padding_y = 10,
    show_close = false,
  } = settings as unknown as AnnouncementBarSettings;

  // Hide if no text is set
  if (!text || text.trim() === '') {
    return null;
  }

  const content = <span className="text-sm font-medium">{text}</span>;

  return (
    <div
      className="text-center"
      style={{
        backgroundColor: background_color,
        color: text_color,
        paddingTop: `${padding_y}px`,
        paddingBottom: `${padding_y}px`,
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
      data-section-id={section.id}
      data-section-type="announcement-bar"
    >
      {link ? (
        <a href={link} className="hover:underline">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
