/**
 * Professional Services Theme - Contact CTA Section
 * Call-to-action with contact form or button
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function ContactCTA({ section, context: _context }: SectionComponentProps) {
  const { settings } = section;
  const showSecondary = Boolean(settings.show_secondary);
  const showContactInfo = Boolean(settings.show_contact_info);
  const phone = typeof settings.phone === 'string' ? settings.phone : '';
  const email = typeof settings.email === 'string' ? settings.email : '';
  const address = typeof settings.address === 'string' ? settings.address : '';

  return (
    <section 
      id="contact"
      className="py-20 bg-[var(--color-primary)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 font-heading">
          {settings.heading as string || 'Ready to Start Your Journey?'}
        </h2>
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
          {settings.description as string || 'Book a free consultation with our expert counsellors today.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href={settings.primary_link as string || '#hero'}
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-secondary)] text-white font-bold rounded hover:bg-white hover:text-[var(--color-secondary)] transition-colors shadow-lg uppercase tracking-wide text-sm"
          >
            {settings.primary_text as string || 'Book Appointment'}
          </a>
          
          {showSecondary && (
            <a
              href={settings.secondary_link as string || 'tel:+8801234567890'}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded hover:bg-white hover:text-[var(--color-primary)] transition-colors uppercase tracking-wide text-sm"
            >
              {settings.secondary_text as string || 'Call Us Now'}
            </a>
          )}
        </div>

        {/* Contact Info */}
        {showContactInfo && (
          <div className="grid md:grid-cols-3 gap-8 text-white border-t border-white/10 pt-12">
            {phone && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-[var(--color-accent)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="text-sm text-white/60 mb-1 uppercase tracking-wider font-semibold">Phone</div>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-lg font-medium hover:text-[var(--color-accent)] transition-colors">
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div className="flex flex-col items-center">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-[var(--color-accent)]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm text-white/60 mb-1 uppercase tracking-wider font-semibold">Email</div>
                <a href={`mailto:${email}`} className="text-lg font-medium hover:text-[var(--color-accent)] transition-colors">
                  {email}
                </a>
              </div>
            )}
            {address && (
              <div className="flex flex-col items-center">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-[var(--color-accent)]">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-sm text-white/60 mb-1 uppercase tracking-wider font-semibold">Visit Us</div>
                <div className="text-lg font-medium">
                  {address}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'contact-cta',
  name: 'Contact CTA',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
      default: 'Ready to Start Your Journey?',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Book a free consultation with our expert counsellors today.',
    },
    {
      type: 'color',
      id: 'gradient_from',
      label: 'Gradient Color (From)',
      default: '#002D72',
    },
    {
      type: 'color',
      id: 'gradient_to',
      label: 'Gradient Color (To)',
      default: '#002D72',
    },
    {
      type: 'text',
      id: 'primary_text',
      label: 'Primary Button Text',
      default: 'Book Appointment',
    },
    {
      type: 'url',
      id: 'primary_link',
      label: 'Primary Button Link',
      default: '#hero',
    },
    {
      type: 'checkbox',
      id: 'show_secondary',
      label: 'Show Secondary Button',
      default: true,
    },
    {
      type: 'text',
      id: 'secondary_text',
      label: 'Secondary Button Text',
      default: 'Call Us Now',
    },
    {
      type: 'url',
      id: 'secondary_link',
      label: 'Secondary Button Link',
      default: 'tel:+8801234567890',
    },
    {
      type: 'checkbox',
      id: 'show_contact_info',
      label: 'Show Contact Information',
      default: true,
    },
    {
      type: 'text',
      id: 'phone',
      label: 'Phone Number',
      default: '+880 1234-567890',
    },
    {
      type: 'text',
      id: 'email',
      label: 'Email Address',
      default: 'info@experteducation.com.bd',
    },
    {
      type: 'text',
      id: 'address',
      label: 'Address',
      default: 'Gulshan 1, Dhaka, Bangladesh',
    },
  ],
  blocks: [],
};
