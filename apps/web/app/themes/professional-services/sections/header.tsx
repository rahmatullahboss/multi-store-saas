/**
 * Professional Services Theme - Header Section
 * Simple, clean navigation header for lead gen sites
 */

import type { SectionComponentProps } from '~/lib/theme-engine/types';
import type { SectionSchema } from '~/lib/theme-engine/types';
import { Link } from '@remix-run/react';

export default function ProfessionalHeader({ section, context }: SectionComponentProps) {
  const { settings } = section;
  const { store } = context;

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-8 w-auto"
              />
            ) : (
              <span className="text-xl font-bold text-gray-900">
                {store.name}
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {(settings.nav_links as any[])?.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {link.text}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div>
            <a
              href={settings.cta_link as string || '#contact'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {settings.cta_text as string || 'Get Started'}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export const schema: SectionSchema = {
  type: 'header',
  name: 'Header',
  settings: [
    {
      type: 'text',
      id: 'cta_text',
      label: 'CTA Button Text',
      default: 'Get Started',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'CTA Button Link',
      default: '#contact',
    },
  ],
  blocks: [
    {
      type: 'nav_link',
      name: 'Navigation Link',
      settings: [
        { type: 'text', id: 'text', label: 'Link Text' },
        { type: 'url', id: 'url', label: 'Link URL' },
      ],
    },
  ],
  max_blocks: 5,
};
