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

function ConsultingFirmRenderer({
  settings,
  storeId,
}: {
  settings: LeadGenSettingsWithTheme;
  storeId: number;
}) {
  const metrics = [
    { value: '150,000+', label: 'Students Counselled' },
    { value: '22,000+', label: 'Visa Success Stories' },
    { value: '50+', label: 'Partner Universities' },
    { value: '15+', label: 'Years Experience' },
  ];

  const destinationCards = [
    {
      title: 'Australia',
      description: 'High visa success, work opportunities, and globally ranked universities.',
    },
    {
      title: 'Canada',
      description: 'Excellent education system with welcoming immigration policies.',
    },
    {
      title: 'United Kingdom',
      description: 'Home to some of the world\'s oldest and most prestigious universities.',
    },
    {
      title: 'USA',
      description: 'The world\'s most popular study destination with diverse opportunities.',
    },
  ];

  const serviceCards = [
    {
      title: 'Coaching',
      description: 'IELTS and PTE preparation with experienced trainers and structured modules.',
    },
    {
      title: 'Visa Application',
      description: 'End-to-end support for application, documents, SOP, and interview preparation.',
    },
    {
      title: 'Accommodation Support',
      description: 'Pre-departure planning and accommodation support for safer student transition.',
    },
  ];

  const testimonials = [
    {
      name: 'Farhan Ahmed',
      role: 'University of Sydney',
      text: 'Expert Education guided me through the entire visa process. I could not have done it without them.',
    },
    {
      name: 'Nusrat Jahan',
      role: 'Seneca College',
      text: 'The counsellors are knowledgeable and supportive. Highly recommended for Canada aspirants.',
    },
    {
      name: 'Rahim Uddin',
      role: 'Coventry University',
      text: 'They helped me choose the right course and university. Support was excellent throughout.',
    },
  ];

  const accreditations = [
    'British Council',
    'IDP',
    'Pearson',
    'Global Education Partners',
  ];

  const primaryRgb = hexToRgb(settings.primaryColor);
  const accentRgb = hexToRgb(settings.accentColor);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#0f172a]">
      {settings.showAnnouncement && settings.announcementText && (
        <div
          className="px-4 py-2 text-center text-sm font-semibold"
          style={{
            backgroundColor: settings.accentColor,
            color: '#111827',
          }}
        >
          {settings.announcementText}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.storeName} className="h-8 w-auto" />
            ) : (
              <>
                <div
                  className="h-8 w-8 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                  }}
                />
                <span className="text-base font-semibold tracking-wide text-slate-900">{settings.storeName}</span>
              </>
            )}
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#services" className="transition-colors hover:text-slate-900">Services</a>
            <a href="#process" className="transition-colors hover:text-slate-900">Process</a>
            <a href="#results" className="transition-colors hover:text-slate-900">Results</a>
            <a href="#contact" className="transition-colors hover:text-slate-900">Contact</a>
          </nav>
          <a
            href="#contact"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: settings.primaryColor }}
          >
            {settings.ctaButtonText}
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(1100px 500px at 10% -10%, rgba(${primaryRgb}, 0.26), transparent 55%), radial-gradient(800px 420px at 90% 0%, rgba(${accentRgb}, 0.2), transparent 55%)`,
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              Study Abroad Consultancy
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Rely on Experts for Your Study Abroad Journey
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              We help you discover your perfect study destination and guide you through every step from university selection to visa approval.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#contact"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: settings.primaryColor }}
              >
                {settings.ctaButtonText || 'Get Free Consultation'}
              </a>
              <a
                href="#destinations"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Explore Destinations
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            id="contact"
            className="rounded-3xl border border-slate-200 bg-white p-6 text-gray-900 shadow-xl sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Get Consultation</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Get a Free Consultation</h2>
            <p className="mt-2 text-sm text-gray-600">
              Fill out the form below and our experts will contact you soon.
            </p>
            <div className="mt-6">
              <LeadCaptureForm
                formId="consulting-hero-form"
                submitButtonText={settings.ctaButtonText}
                primaryColor={settings.primaryColor}
              />
            </div>
          </div>
        </div>
      </section>

      {settings.showServices && (
        <section id="services" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Our Vision & Your Solutions</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Guidance built for Bangladesh students</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-600">
                We provide profile-based guidance for HSC, A-Levels, and undergraduate applicants with transparent process support.
              </p>
            </div>

            <div id="destinations" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {destinationCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div
                    className="mb-4 h-10 w-10 rounded-lg"
                    style={{
                      background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                    }}
                  />
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="process" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Student Services</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Complete support for your application journey</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {serviceCards.map((item, idx) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold tracking-wider text-slate-500">0{idx + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {settings.showTestimonials && (
        <section id="testimonials" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Testimonials</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">What our students say</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.role}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">{item.name}</h3>
                  <p
                    className="mt-4 inline-flex rounded-lg px-3 py-1 text-sm font-semibold"
                    style={{
                      backgroundColor: `rgba(${accentRgb}, 0.2)`,
                      color: settings.accentColor,
                    }}
                  >
                    Verified Student
                  </p>
                  <p className="mt-4 text-sm text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Membership, Certification & Accreditation</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {accreditations.map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-3xl border border-white/15 p-8 text-center sm:p-12"
            style={{
              background: `linear-gradient(130deg, rgba(${primaryRgb}, 0.25), rgba(${accentRgb}, 0.2))`,
            }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">Turn your global study dream into reality</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-700">
              Get expert advice on universities, scholarships, visa, accommodation, and next steps.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#contact"
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Get Consultation
              </a>
              {settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
                >
                  Call {settings.phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#services" className="hover:text-slate-900">Services</a>
            <a href="#results" className="hover:text-slate-900">Results</a>
            <a href="#contact" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LawFirmRenderer(props: {
  settings: LeadGenSettingsWithTheme;
  storeId: number;
}) {
  return <ProfessionalServicesRenderer {...props} />;
}

function HealthcareRenderer(props: {
  settings: LeadGenSettingsWithTheme;
  storeId: number;
}) {
  return <ProfessionalServicesRenderer {...props} />;
}

function AgencyRenderer(props: {
  settings: LeadGenSettingsWithTheme;
  storeId: number;
}) {
  return <ProfessionalServicesRenderer {...props} />;
}

function hexToRgb(hexColor: string): string {
  const value = hexColor.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const normalized = full.padEnd(6, '0').slice(0, 6);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

// ============================================================================
// REUSABLE COMPONENTS (Simple, no theme engine)
// ============================================================================

import { useFetcher } from '@remix-run/react';

function LeadCaptureForm({ 
  formId, 
  submitButtonText,
  primaryColor 
}: { 
  formId: string;
  submitButtonText: string;
  primaryColor: string;
}) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const isSubmitting = fetcher.state === 'submitting';
  const actionData = fetcher.data;

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
    <fetcher.Form method="post" action="/api/submit-lead" className="space-y-4">
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
      {actionData?.success === false && actionData.error ? (
        <p className="text-sm text-red-600">{actionData.error}</p>
      ) : null}
    </fetcher.Form>
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
