/**
 * Luxe Boutique - Trust Badges Section
 *
 * Elegant trust indicators with:
 * - Minimalist icons
 * - Clean typography
 * - Optional gold accents
 */

import type { SectionSchema, SectionComponentProps, BlockInstance } from '~/lib/theme-engine/types';
import { Shield, Truck, RefreshCw, Headphones, Award, Lock } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Trust Badges',
  tag: 'section',
  class: 'luxe-trust-badges',

  enabled_on: {
    templates: ['index', 'product', 'cart'],
  },

  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading (optional)',
    },
    {
      type: 'checkbox',
      id: 'show_border',
      label: 'Show top/bottom border',
      default: false,
    },
    {
      type: 'select',
      id: 'background_style',
      label: 'Background style',
      options: [
        { value: 'transparent', label: 'Transparent' },
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      default: 'transparent',
    },
  ],

  blocks: [
    {
      type: 'badge',
      name: 'Badge',
      limit: 6,
      settings: [
        {
          type: 'select',
          id: 'icon',
          label: 'Icon',
          options: [
            { value: 'shield', label: 'Shield (Authentic)' },
            { value: 'truck', label: 'Truck (Shipping)' },
            { value: 'refresh', label: 'Refresh (Returns)' },
            { value: 'headphones', label: 'Headphones (Support)' },
            { value: 'award', label: 'Award (Quality)' },
            { value: 'lock', label: 'Lock (Secure)' },
          ],
          default: 'shield',
        },
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Authentic Products',
        },
        {
          type: 'text',
          id: 'title_bn',
          label: 'Title (Bangla)',
        },
        {
          type: 'text',
          id: 'description',
          label: 'Description',
          default: '100% Genuine Guaranteed',
        },
        {
          type: 'text',
          id: 'description_bn',
          label: 'Description (Bangla)',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Trust Badges',
      category: 'Trust',
      settings: {
        background_style: 'transparent',
      },
      blocks: [
        {
          type: 'badge',
          settings: {
            icon: 'shield',
            title: 'Authentic Products',
            description: '100% Genuine Guaranteed',
          },
        },
        {
          type: 'badge',
          settings: {
            icon: 'truck',
            title: 'Free Shipping',
            description: 'On orders over 5,000',
          },
        },
        {
          type: 'badge',
          settings: {
            icon: 'refresh',
            title: 'Easy Returns',
            description: '7-day return policy',
          },
        },
        {
          type: 'badge',
          settings: {
            icon: 'headphones',
            title: 'Premium Support',
            description: 'Dedicated assistance',
          },
        },
      ],
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface TrustBadgesSettings {
  heading?: string;
  show_border: boolean;
  background_style: 'transparent' | 'light' | 'dark';
}

interface BadgeBlockSettings {
  icon: 'shield' | 'truck' | 'refresh' | 'headphones' | 'award' | 'lock';
  title: string;
  title_bn?: string;
  description: string;
  description_bn?: string;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#1a1a1a',
  accent: '#c9a961',
  background: '#faf9f7',
  muted: '#6b6b6b',
};

// ============================================================================
// ICON MAP
// ============================================================================

const ICON_MAP = {
  shield: Shield,
  truck: Truck,
  refresh: RefreshCw,
  headphones: Headphones,
  award: Award,
  lock: Lock,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function LuxeTrustBadges({ section, settings, blocks = [] }: SectionComponentProps) {
  const config = settings as unknown as TrustBadgesSettings;
  const badgeBlocks = blocks as BlockInstance[];

  const bgStyles = {
    transparent: { backgroundColor: 'transparent' },
    light: { backgroundColor: THEME.background },
    dark: { backgroundColor: THEME.primary, color: '#ffffff' },
  };

  const textColor = config.background_style === 'dark' ? '#ffffff' : THEME.primary;
  const mutedColor = config.background_style === 'dark' ? '#9a9a9a' : THEME.muted;

  return (
    <section
      data-section-id={section.id}
      className={`py-12 lg:py-16 ${config.show_border ? 'border-y' : ''}`}
      style={{
        ...bgStyles[config.background_style],
        borderColor: config.show_border ? '#e5e5e5' : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        {config.heading && (
          <h2
            className="text-2xl text-center mb-10"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: textColor,
            }}
          >
            {config.heading}
          </h2>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {badgeBlocks.map((block) => {
            const blockSettings = block.settings as unknown as BadgeBlockSettings;
            const IconComponent = ICON_MAP[blockSettings.icon] || Shield;

            return (
              <div key={block.id} className="text-center">
                <div
                  className="w-12 h-12 mx-auto mb-4 flex items-center justify-center"
                  style={{ color: THEME.accent }}
                >
                  <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-medium mb-1" style={{ color: textColor }}>
                  {blockSettings.title}
                </h3>
                <p className="text-xs" style={{ color: mutedColor }}>
                  {blockSettings.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
