/**
 * Professional Services Theme - Hero with Contact Form
 * Matches Expert Education: Background image, strong value prop, floating form
 */

import { Form, useActionData, useNavigation } from '@remix-run/react';
import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';

export default function HeroWithForm({ section, context }: SectionComponentProps) {
  const { settings } = section;
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const features =
    typeof settings.features === 'string'
      ? settings.features.split(',').map((f) => f.trim()).filter(Boolean)
      : [];

  // Default background if none provided
  const bgImage = settings.bg_image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80';

  return (
    <section 
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage as string} 
          alt="Hero Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)]/90 to-[var(--color-primary)]/70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-white">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/30">
              {settings.badge_text as string || 'Trusted by 150,000+ Students'}
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              {settings.heading as string || 'Rely on Experts for Your Study Abroad Journey'}
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
              {settings.description as string || 'We help you discover your perfect study destination and guide you through every step of the process.'}
            </p>
            
            {/* Features List */}
            {features.length > 0 && (
              <ul className="space-y-4 mb-8">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white font-medium">{feature.trim()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-[var(--color-secondary)]">
            {actionData?.success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
                  {settings.form_heading as string || 'Get a Free Consultation'}
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  {settings.form_description as string || 'Fill out the form below and our experts will contact you soon'}
                </p>

                <Form method="post" action="/api/submit-lead" className="space-y-4">
                  <input type="hidden" name="form_id" value="hero-form" />
                  <input type="hidden" name="page_url" value={typeof window !== 'undefined' ? window.location.href : ''} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                      {actionData?.errors?.name && (
                        <p className="text-red-500 text-xs mt-1">{actionData.errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                        placeholder="+880..."
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                    {actionData?.errors?.email && (
                      <p className="text-red-500 text-xs mt-1">{actionData.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="destination" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Preferred Destination
                    </label>
                    <select
                      id="destination"
                      name="company" // Reusing company field for destination
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    >
                      <option value="">Select a country...</option>
                      <option value="Australia">Australia</option>
                      <option value="Canada">Canada</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Malaysia">Malaysia</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                      placeholder="I am interested in..."
                    />
                  </div>

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[var(--color-secondary)] text-white font-bold py-3.5 rounded hover:bg-orange-600 transition-all transform hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                  >
                    {isSubmitting ? 'Submitting...' : (settings.submit_text as string || 'Get Free Consultation')}
                  </button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    By submitting this form, you agree to our privacy policy.
                  </p>
                </Form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const schema: SectionSchema = {
  type: 'hero-with-form',
  name: 'Hero with Form',
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Main Heading',
      default: 'Rely on Experts to Create Your Future',
    },
    {
      type: 'text',
      id: 'badge_text',
      label: 'Badge Text',
      default: 'Trusted by 150,000+ Students',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'We provide expert guidance for your study abroad journey.',
    },
    {
      type: 'image_picker', // Assuming this type exists or will serve as text URL
      id: 'bg_image',
      label: 'Background Image URL',
      default: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    },
    {
      type: 'textarea',
      id: 'features',
      label: 'Features (comma-separated)',
      default: 'Expert Counsellors, Visa Assistance, IELTS Preparation, Accommodation Support',
    },
    {
      type: 'text',
      id: 'form_heading',
      label: 'Form Heading',
      default: 'Get a Free Consultation',
    },
    {
      type: 'textarea',
      id: 'form_description',
      label: 'Form Description',
      default: 'Fill out the form below and we\'ll contact you soon',
    },
    {
      type: 'text',
      id: 'submit_text',
      label: 'Submit Button Text',
      default: 'Get Free Consultation',
    },
  ],
  blocks: [],
};
