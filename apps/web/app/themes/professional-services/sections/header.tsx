/**
 * Professional Services Theme - Header Section
 * Matches Expert Education design: Logo Left, Nav Right, CTA Button
 */

import { Link } from '@remix-run/react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function ProfessionalHeader({ section, context }: SectionComponentProps) {
  const { settings } = section;
  const { store } = context;

  const isSticky = settings.sticky_header !== false;

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const isActive = (_url: string) => {
    // Basic check for active state - can be enhanced with useLocation
    return false; // Placeholder
  };

  return (
    <header
      className={`bg-white border-b border-gray-100 ${isSticky ? 'sticky top-0 z-50' : ''}`}
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-10 w-auto" // Slightly larger for professional look
                />
              ) : (
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
                  {store.name}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {(section.blocks || []).map((block, index) => (
              <a
                key={index}
                href={block.settings.url}
                className="text-[var(--color-foreground)] hover:text-[var(--color-secondary)] font-medium text-sm transition-colors uppercase tracking-wide"
              >
                {block.settings.text}
              </a>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <a
              href={settings.cta_link as string || '#contact'}
              className="hidden sm:inline-flex items-center px-6 py-2.5 bg-[var(--color-secondary)] text-white font-semibold text-sm rounded transition-all hover:bg-orange-600 hover:shadow-md transform hover:-translate-y-0.5"
            >
              {settings.cta_text as string || 'Book Appointment'}
            </a>
            
            {/* Mobile Menu Button (Placeholder for now) */}
            <button className="md:hidden text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
      default: 'Book Appointment',
    },
    {
      type: 'url',
      id: 'cta_link',
      label: 'CTA Button Link',
      default: '#contact',
    },
    {
      type: 'checkbox',
      id: 'sticky_header',
      label: 'Sticky Header',
      default: true,
    },
  ],
  blocks: [
    {
      type: 'nav_link',
      name: 'Link',
      limit: 6,
      settings: [
        { type: 'text', id: 'text', label: 'Link Text', default: 'Home' },
        { type: 'url', id: 'url', label: 'Link URL', default: '#' },
      ],
    },
  ],
  max_blocks: 6,
};
