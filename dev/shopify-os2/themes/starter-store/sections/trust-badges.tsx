/**
 * Trust Badges Section
 *
 * Shopify OS 2.0 Compatible Section
 * Displays trust indicators like delivery, payment security, returns.
 */

import { Truck, Shield, RotateCcw, Clock, CreditCard, Headphones } from 'lucide-react';
import type { SectionSchema, SectionComponentProps } from '~/lib/theme-engine/types';

// ============================================================================
// SCHEMA
// ============================================================================

export const schema: SectionSchema = {
  name: 'Trust Badges',
  tag: 'section',
  class: 'trust-badges',

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
      id: 'layout',
      options: [
        { value: '3', label: '3 columns' },
        { value: '4', label: '4 columns' },
      ],
      default: '3',
      label: 'Layout',
    },
    {
      type: 'color',
      id: 'background_color',
      label: 'Background color',
      default: '#f9fafb',
    },
    {
      type: 'color',
      id: 'card_background',
      label: 'Card background',
      default: '#ffffff',
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
      type: 'badge',
      name: 'Trust Badge',
      settings: [
        {
          type: 'select',
          id: 'icon',
          options: [
            { value: 'truck', label: 'Delivery Truck' },
            { value: 'shield', label: 'Shield' },
            { value: 'return', label: 'Return' },
            { value: 'clock', label: 'Clock' },
            { value: 'card', label: 'Credit Card' },
            { value: 'support', label: 'Support' },
          ],
          default: 'truck',
          label: 'Icon',
        },
        {
          type: 'text',
          id: 'title',
          label: 'Title',
          default: 'Feature',
        },
        {
          type: 'text',
          id: 'description',
          label: 'Description',
          default: 'Description text',
        },
      ],
    },
  ],

  presets: [
    {
      name: 'Trust Badges',
      category: 'Trust',
      blocks: [
        {
          type: 'badge',
          settings: {
            icon: 'truck',
            title: 'দ্রুত ডেলিভারি',
            description: 'ঢাকায় ১-২ দিনে',
          },
        },
        {
          type: 'badge',
          settings: {
            icon: 'shield',
            title: 'নিরাপদ পেমেন্ট',
            description: '১০০% সিকিউর',
          },
        },
        {
          type: 'badge',
          settings: {
            icon: 'return',
            title: 'ইজি রিটার্ন',
            description: '৭ দিনের মধ্যে',
          },
        },
      ],
    },
  ],

  default: {
    blocks: [
      {
        type: 'badge',
        settings: {
          icon: 'truck',
          title: 'দ্রুত ডেলিভারি',
          description: 'ঢাকায় ১-২ দিনে',
        },
      },
      {
        type: 'badge',
        settings: {
          icon: 'shield',
          title: 'নিরাপদ পেমেন্ট',
          description: '১০০% সিকিউর',
        },
      },
      {
        type: 'badge',
        settings: {
          icon: 'return',
          title: 'ইজি রিটার্ন',
          description: '৭ দিনের মধ্যে',
        },
      },
    ],
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export interface TrustBadgesSettings {
  heading?: string;
  layout: '3' | '4';
  background_color: string;
  card_background: string;
  padding_top: number;
  padding_bottom: number;
}

const iconMap = {
  truck: Truck,
  shield: Shield,
  return: RotateCcw,
  clock: Clock,
  card: CreditCard,
  support: Headphones,
};

// Default badges for when no blocks are provided
const DEFAULT_BADGES = [
  { icon: 'truck', title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
  { icon: 'shield', title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
  { icon: 'return', title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
];

export default function TrustBadges({ section, context, settings, blocks }: SectionComponentProps) {
  const {
    heading,
    layout = '3',
    background_color = '#f9fafb',
    card_background = '#ffffff',
    padding_top = 48,
    padding_bottom = 48,
  } = settings as unknown as TrustBadgesSettings;

  const primaryColor = context.theme?.colors?.primary || '#6366f1';
  const textColor = context.theme?.colors?.text || '#111827';
  const mutedColor = context.theme?.colors?.textMuted || '#6b7280';

  // Use blocks if provided, otherwise use defaults
  const badges =
    blocks && blocks.length > 0
      ? blocks.map((block) => ({
          icon: block.settings.icon as keyof typeof iconMap,
          title: block.settings.title as string,
          description: block.settings.description as string,
        }))
      : DEFAULT_BADGES;

  const gridCols = {
    '3': 'md:grid-cols-3',
    '4': 'md:grid-cols-4',
  }[layout];

  return (
    <section
      className="px-4"
      style={{
        backgroundColor: background_color,
        paddingTop: `${padding_top}px`,
        paddingBottom: `${padding_bottom}px`,
      }}
      data-section-id={section.id}
      data-section-type="trust-badges"
    >
      <div className="max-w-5xl mx-auto">
        {heading && (
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: textColor }}>
            {heading}
          </h2>
        )}

        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {badges.map((badge, index) => {
            const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Truck;

            return (
              <div
                key={index}
                className="flex items-center gap-4 p-6 rounded-xl"
                style={{ backgroundColor: card_background }}
              >
                <div className="p-3 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                  <IconComponent className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: textColor }}>
                    {badge.title}
                  </h3>
                  <p className="text-sm" style={{ color: mutedColor }}>
                    {badge.description}
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
