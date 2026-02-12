/**
 * Professional Services Theme - Contact CTA Section
 * Call-to-action with contact form or button
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function ContactCTA({ section, context }: SectionComponentProps) {
  const { settings } = section;
  const showSecondary = Boolean(settings.show_secondary);
  const showContactInfo = Boolean(settings.show_contact_info);
  const phone = typeof settings.phone === 'string' ? settings.phone : '';
  const email = typeof settings.email === 'string' ? settings.email : '';
  const address = typeof settings.address === 'string' ? settings.address : '';

  return (
    <section 
      id="contact"
      className="py-20"
      style={{ 
        background: `linear-gradient(135deg, ${settings.gradient_from || '#2563EB'} 0%, ${settings.gradient_to || '#7C3AED'} 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          {settings.heading as string || 'Ready to Get Started?'}
        </h2>
        <p className="text-xl text-white/90 mb-10">
          {settings.description as string || 'Contact us today for a free consultation'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={settings.primary_link as string || '#contact'}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {settings.primary_text as string || 'Get Free Consultation'}
          </a>
          
          {showSecondary && (
            <a
              href={settings.secondary_link as string || 'tel:+8801234567890'}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              {settings.secondary_text as string || 'Call Us Now'}
            </a>
          )}
        </div>

        {/* Contact Info */}
        {showContactInfo && (
          <div className="mt-12 grid sm:grid-cols-3 gap-6 text-white">
            {phone && (
              <div>
                <div className="text-sm text-white/70 mb-1">Phone</div>
                <a href={`tel:${phone}`} className="text-lg font-medium hover:underline">
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div>
                <div className="text-sm text-white/70 mb-1">Email</div>
                <a href={`mailto:${email}`} className="text-lg font-medium hover:underline">
                  {email}
                </a>
              </div>
            )}
            {address && (
              <div>
                <div className="text-sm text-white/70 mb-1">Location</div>
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
      default: 'Ready to Get Started?',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Contact us today for a free consultation',
    },
    {
      type: 'color',
      id: 'gradient_from',
      label: 'Gradient Color (From)',
      default: '#2563EB',
    },
    {
      type: 'color',
      id: 'gradient_to',
      label: 'Gradient Color (To)',
      default: '#7C3AED',
    },
    {
      type: 'text',
      id: 'primary_text',
      label: 'Primary Button Text',
      default: 'Get Free Consultation',
    },
    {
      type: 'url',
      id: 'primary_link',
      label: 'Primary Button Link',
      default: '#contact',
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
      default: 'hello@example.com',
    },
    {
      type: 'text',
      id: 'address',
      label: 'Address',
      default: 'Dhaka, Bangladesh',
    },
  ],
  blocks: [],
};
