/**
 * Tech Modern - Features Section
 *
 * Trust/feature badges with:
 * - Icon boxes with hover effects
 * - Blue accents on hover
 * - Clean modern layout
 */

import type { SectionSchema, SectionComponentProps, BlockInstance } from '~/lib/theme-engine/types';
import { Zap, CheckCircle, Shield, Truck, Headphones, CreditCard } from 'lucide-react';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Features',
  tag: 'section',
  class: 'tech-features',

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
      type: 'select',
      id: 'background_style',
      label: 'Background style',
      options: [
        { value: 'white', label: 'White' },
        { value: 'light', label: 'Light gray' },
      ],
      default: 'white',
    },
  ],

  blocks: [
    {
      type: 'feature',
      name: 'Feature',
      limit: 6,
      settings: [
        {
          type: 'select',
          id: 'icon',
          label: 'Icon',
          options: [
            { value: 'zap', label: 'Zap (Fast)' },
            { value: 'check', label: 'Check (Verified)' },
            { value: 'shield', label: 'Shield (Secure)' },
            { value: 'truck', label: 'Truck (Delivery)' },
            { value: 'headphones', label: 'Headphones (Support)' },
            { value: 'credit-card', label: 'Credit Card (Payment)' },
          ],
          default: 'zap',
        },
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Fast Delivery',
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
          default: '24-48 hour delivery nationwide.',
        },
        {
          type: 'text',
          id: 'description_bn',
          label: 'Description (Bangla)',
        },
      ],
    },
  ],

  default: {
    blocks: [
      {
        type: 'feature',
        settings: {
          icon: 'zap',
          title: 'Fast Delivery',
          description: '24-48 hour delivery nationwide.',
        },
      },
      {
        type: 'feature',
        settings: {
          icon: 'check',
          title: 'Verified Gadgets',
          description: 'Every product is quality checked.',
        },
      },
      {
        type: 'feature',
        settings: {
          icon: 'shield',
          title: 'Secure Checkout',
          description: 'Multiple payment options available.',
        },
      },
    ],
  },

  presets: [
    {
      name: 'Tech Features',
      category: 'Trust',
      settings: {
        background_style: 'white',
      },
      blocks: [
        {
          type: 'feature',
          settings: {
            icon: 'zap',
            title: 'Fast Delivery',
            description: '24-48 hour delivery nationwide.',
          },
        },
        {
          type: 'feature',
          settings: {
            icon: 'check',
            title: 'Verified Gadgets',
            description: 'Every product is quality checked.',
          },
        },
        {
          type: 'feature',
          settings: {
            icon: 'shield',
            title: 'Secure Checkout',
            description: 'Multiple payment options available.',
          },
        },
      ],
    },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface FeaturesSettings {
  heading?: string;
  background_style: 'white' | 'light';
}

interface FeatureBlockSettings {
  icon: 'zap' | 'check' | 'shield' | 'truck' | 'headphones' | 'credit-card';
  title: string;
  title_bn?: string;
  description: string;
  description_bn?: string;
}

// ============================================================================
// THEME COLORS
// ============================================================================

const THEME = {
  primary: '#0f172a',
  accent: '#3b82f6',
  accentLight: '#dbeafe',
  background: '#f8fafc',
  white: '#ffffff',
  text: '#0f172a',
  muted: '#64748b',
};

// ============================================================================
// ICON MAP
// ============================================================================

const ICON_MAP = {
  zap: Zap,
  check: CheckCircle,
  shield: Shield,
  truck: Truck,
  headphones: Headphones,
  'credit-card': CreditCard,
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function TechFeatures({ section, settings, blocks = [] }: SectionComponentProps) {
  const config = settings as unknown as FeaturesSettings;
  const featureBlocks = blocks as BlockInstance[];

  const bgColor = config.background_style === 'light' ? THEME.background : THEME.white;

  return (
    <section
      data-section-id={section.id}
      className="py-12 border-b"
      style={{ backgroundColor: bgColor, borderColor: '#f1f5f9' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.heading && (
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: THEME.primary }}>
            {config.heading}
          </h2>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {featureBlocks.map((block) => {
            const blockSettings = block.settings as unknown as FeatureBlockSettings;
            const IconComponent = ICON_MAP[blockSettings.icon] || Zap;

            return (
              <div
                key={block.id}
                className="flex items-start gap-4 p-6 rounded-2xl transition-colors group hover:bg-blue-50"
                style={{ backgroundColor: THEME.background }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white"
                  style={{ backgroundColor: THEME.accentLight, color: THEME.accent }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: THEME.primary }}>
                    {blockSettings.title}
                  </h3>
                  <p className="text-sm" style={{ color: THEME.muted }}>
                    {blockSettings.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
