/**
 * Professional Services Theme - Footer Section
 * Simple footer with links and contact info
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function ProfessionalFooter({ section, context }: SectionComponentProps) {
  const { settings, blocks = [] } = section;
  const { store } = context;
  const showSocial = Boolean(settings.show_social);

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-[var(--color-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-10 w-auto mb-6 brightness-0 invert"
              />
            ) : (
              <div className="text-2xl font-bold mb-6 font-heading text-white">{store.name}</div>
            )}
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              {settings.description as string || 'Expert Education is a trusted study abroad consultant.'}
            </p>
            
            {/* Social Links */}
            {showSocial && (
              <div className="flex space-x-4">
                {typeof settings.facebook_url === 'string' && settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-all transform hover:-translate-y-1"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>
                )}
                {typeof settings.linkedin_url === 'string' && settings.linkedin_url && (
                  <a
                    href={settings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-all transform hover:-translate-y-1"
                  >
                    <span className="sr-only">LinkedIn</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {blocks.map((block, index) => (
              <div key={block.id || index}>
                <h3 className="font-bold text-lg mb-6 text-white uppercase tracking-wider text-sm border-b border-gray-700 pb-2 inline-block">
                  {block.settings.heading as string}
                </h3>
                <ul className="space-y-3">
                  {(block.settings.links as string || '').split('\n').filter(Boolean).map((link, i) => {
                    const [text, url] = link.split('|');
                    return (
                      <li key={i}>
                        <a
                          href={url?.trim() || '#'}
                          className="text-gray-400 hover:text-[var(--color-accent)] transition-colors text-sm flex items-center group"
                        >
                          <span className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          {text?.trim()}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const schema: SectionSchema = {
  type: 'footer',
  name: 'Footer',
  settings: [
    {
      type: 'textarea',
      id: 'description',
      label: 'Company Description',
      default: 'Your trusted partner for business growth',
    },
    {
      type: 'checkbox',
      id: 'show_social',
      label: 'Show Social Links',
      default: true,
    },
    {
      type: 'url',
      id: 'facebook_url',
      label: 'Facebook URL',
      default: '',
    },
    {
      type: 'url',
      id: 'linkedin_url',
      label: 'LinkedIn URL',
      default: '',
    },
  ],
  blocks: [
    {
      type: 'link_column',
      name: 'Link Column',
      settings: [
        {
          type: 'text',
          id: 'heading',
          label: 'Column Heading',
          default: 'Quick Links',
        },
        {
          type: 'textarea',
          id: 'links',
          label: 'Links (Text | URL per line)',
          default: 'Home | /\nAbout | /about\nContact | /contact',
        },
      ],
    },
  ],
  max_blocks: 4,
};
