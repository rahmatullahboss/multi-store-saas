/**
 * Lead Gen Renderer Component
 *
 * Renders lead generation pages based on theme settings.
 * Follows the EXACT same pattern as ThemeStoreRenderer.tsx for e-commerce.
 *
 * Responsibilities:
 * - Load theme settings from database
 * - Merge with user customizations
 * - Render appropriate theme template
 * - Pass settings to components
 *
 * @see apps/web/app/components/store/ThemeStoreRenderer.tsx - E-commerce equivalent
 */

import type { LeadGenSettingsWithTheme } from '~/services/lead-gen-settings.server';

// ============================================================================
// TYPES
// ============================================================================

interface LeadGenRendererProps {
  themeId: string; // 'professional-services', 'consulting-firm', etc.
  settings: LeadGenSettingsWithTheme; // User customizations + theme defaults
  storeId: number; // For form submissions
  storeName: string; // Business name
  storeLogo?: string | null; // Logo URL
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LeadGenRenderer({
  themeId,
  settings,
  storeId,
  storeName,
  storeLogo,
}: LeadGenRendererProps) {
  // Load theme-specific renderer
  switch (themeId) {
    case 'professional-services':
      return <ProfessionalServicesRenderer settings={settings} storeId={storeId} />;
    
    case 'consulting-firm':
      return <ConsultingFirmRenderer settings={settings} storeId={storeId} />;
    
    case 'law-firm':
      return <LawFirmRenderer settings={settings} storeId={storeId} />;
    
    case 'healthcare':
      return <HealthcareRenderer settings={settings} storeId={storeId} />;
    
    case 'agency':
      return <AgencyRenderer settings={settings} storeId={storeId} />;
    
    default:
      // Fallback to professional-services
      return <ProfessionalServicesRenderer settings={settings} storeId={storeId} />;
  }
}

// ============================================================================
// THEME RENDERERS (Simple, no ThemeBridge complexity)
// ============================================================================

/**
 * Professional Services Theme Renderer
 * Uses reusable components + settings from database
 */
function ProfessionalServicesRenderer({ 
  settings, 
  storeId 
}: { 
  settings: LeadGenSettingsWithTheme; 
  storeId: number;
}) {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        '--primary-color': settings.primaryColor,
        '--accent-color': settings.accentColor,
      } as React.CSSProperties}
    >
      {/* Announcement Banner (conditional) */}
      {settings.showAnnouncement && settings.announcementText && (
        <div 
          className="py-2 text-center text-sm font-medium text-white"
          style={{ backgroundColor: settings.accentColor }}
        >
          {settings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.storeName}
                  className="h-8 w-auto"
                />
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  {settings.storeName}
                </span>
              )}
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-primary font-medium">
                Services
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary font-medium">
                Testimonials
              </a>
              <a href="#contact" className="text-gray-700 hover:text-primary font-medium">
                Contact
              </a>
            </nav>

            {/* CTA Button */}
            <a
              href="#contact"
              className="px-4 py-2 font-medium rounded-lg text-white"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.ctaButtonText}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                {settings.heroHeading}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {settings.heroDescription}
              </p>
              
              {/* Features */}
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: settings.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Free consultation</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: settings.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Expert advice</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: settings.primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Fast turnaround</span>
                </li>
              </ul>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <LeadCaptureForm
                storeId={storeId}
                formId="hero-form"
                submitButtonText={settings.ctaButtonText}
                primaryColor={settings.primaryColor}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section (conditional) */}
      {settings.showServices && (
        <section id="services" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              Our Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Hardcoded for now - will be customizable later */}
              <ServiceCard 
                title="Consulting"
                description="Strategic advice to help your business grow"
                primaryColor={settings.primaryColor}
              />
              <ServiceCard 
                title="Training"
                description="Expert training programs for your team"
                primaryColor={settings.primaryColor}
              />
              <ServiceCard 
                title="Support"
                description="24/7 support when you need it"
                primaryColor={settings.primaryColor}
              />
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section (conditional) */}
      {settings.showTestimonials && (
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Hardcoded for now - will be customizable later */}
              <TestimonialCard
                text="Working with this team transformed our business. Highly recommended!"
                author="Sarah Ahmed"
                position="CEO, Tech Solutions Ltd"
                rating={5}
              />
              <TestimonialCard
                text="Professional, knowledgeable, and results-driven. Best investment we made."
                author="Kamal Rahman"
                position="Founder, Digital Ventures"
                rating={5}
              />
              <TestimonialCard
                text="Their expertise is unmatched. We saw results within weeks."
                author="Nadia Khan"
                position="MD, Global Traders"
                rating={5}
              />
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA Section */}
      <section 
        id="contact"
        className="py-20 text-white"
        style={{
          background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 text-white/90">
            Contact us today for a free consultation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#hero"
              className="px-8 py-4 bg-white font-semibold rounded-lg hover:bg-gray-100"
              style={{ color: settings.primaryColor }}
            >
              Get Free Consultation
            </a>
            
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10"
              >
                Call Us Now
              </a>
            )}
          </div>

          {/* Contact Info */}
          {(settings.phone || settings.email || settings.address) && (
            <div className="mt-12 grid sm:grid-cols-3 gap-6">
              {settings.phone && (
                <div>
                  <div className="text-sm text-white/70 mb-1">Phone</div>
                  <a href={`tel:${settings.phone}`} className="text-lg font-medium hover:underline">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.email && (
                <div>
                  <div className="text-sm text-white/70 mb-1">Email</div>
                  <a href={`mailto:${settings.email}`} className="text-lg font-medium hover:underline">
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.address && (
                <div>
                  <div className="text-sm text-white/70 mb-1">Location</div>
                  <div className="text-lg font-medium">
                    {settings.address}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.storeName}
                  className="h-8 w-auto mb-4 brightness-0 invert"
                />
              ) : (
                <div className="text-xl font-bold mb-4">{settings.storeName}</div>
              )}
              <p className="text-gray-400">
                Your trusted partner for business growth
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#services" className="text-gray-400 hover:text-white">Services</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-400 hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Placeholder renderers for other themes (same structure, different styles)
function ConsultingFirmRenderer(props: any) {
  return <ProfessionalServicesRenderer {...props} />;
}

function LawFirmRenderer(props: any) {
  return <ProfessionalServicesRenderer {...props} />;
}

function HealthcareRenderer(props: any) {
  return <ProfessionalServicesRenderer {...props} />;
}

function AgencyRenderer(props: any) {
  return <ProfessionalServicesRenderer {...props} />;
}

// ============================================================================
// REUSABLE COMPONENTS (Simple, no theme engine)
// ============================================================================

import { Form, useActionData, useNavigation } from '@remix-run/react';

function LeadCaptureForm({ 
  storeId, 
  formId, 
  submitButtonText,
  primaryColor 
}: { 
  storeId: number; 
  formId: string;
  submitButtonText: string;
  primaryColor: string;
}) {
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  if (actionData?.success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">We'll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <Form method="post" action="/api/submit-lead" className="space-y-4">
      <input type="hidden" name="form_id" value={formId} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          type="text"
          name="company"
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          name="message"
          rows={4}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
        />
      </div>

      {/* Honeypot */}
      <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full text-white font-semibold py-4 rounded-lg hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {isSubmitting ? 'Submitting...' : submitButtonText}
      </button>
    </Form>
  );
}

function ServiceCard({ title, description, primaryColor }: { title: string; description: string; primaryColor: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
        <svg className="w-8 h-8" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ text, author, position, rating }: { text: string; author: string; position: string; rating: number }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="text-gray-700 mb-6">"{text}"</blockquote>
      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        <div className="text-sm text-gray-600">{position}</div>
      </div>
    </div>
  );
}
