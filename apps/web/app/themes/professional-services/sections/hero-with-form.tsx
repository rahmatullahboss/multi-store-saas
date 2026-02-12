/**
 * Professional Services Theme - Hero with Contact Form
 * Main hero section with inline lead capture form
 */

import type { SectionComponentProps, SectionSchema } from '~/lib/theme-engine/types';
import { Form, useActionData, useNavigation } from '@remix-run/react';

export default function HeroWithForm({ section, context }: SectionComponentProps) {
  const { settings } = section;
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <section 
      className="relative py-20 lg:py-32"
      style={{ 
        backgroundColor: settings.bg_color as string || '#F9FAFB',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              {settings.heading as string || 'Grow Your Business Today'}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {settings.description as string || 'Get expert help to take your business to the next level'}
            </p>
            
            {/* Features List */}
            {settings.features && (
              <ul className="space-y-4 mb-8">
                {(settings.features as string).split(',').map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature.trim()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {settings.form_heading as string || 'Get a Free Consultation'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {settings.form_description as string || 'Fill out the form below and we\'ll contact you soon'}
                </p>

                <Form method="post" action="/api/submit-lead" className="space-y-4">
                  <input type="hidden" name="form_id" value="hero-form" />
                  <input type="hidden" name="page_url" value={typeof window !== 'undefined' ? window.location.href : ''} />

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="John Doe"
                    />
                    {actionData?.errors?.name && (
                      <p className="text-red-500 text-sm mt-1">{actionData.errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="john@example.com"
                    />
                    {actionData?.errors?.email && (
                      <p className="text-red-500 text-sm mt-1">{actionData.errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="+880 1234-567890"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="ABC Company Ltd."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Tell us about your needs..."
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
                    className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : (settings.submit_text as string || 'Get Started')}
                  </button>

                  {actionData?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{actionData.error}</p>
                    </div>
                  )}
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
      default: 'Grow Your Business Today',
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Get expert help to take your business to the next level',
    },
    {
      type: 'textarea',
      id: 'features',
      label: 'Features (comma-separated)',
      default: 'Free consultation, Expert advice, Fast turnaround',
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
      default: 'Get Started',
    },
    {
      type: 'color',
      id: 'bg_color',
      label: 'Background Color',
      default: '#F9FAFB',
    },
  ],
  blocks: [],
};
