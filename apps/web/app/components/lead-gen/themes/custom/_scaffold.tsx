/**
 * Custom Lead Gen Theme Scaffold
 * 
 * ─────────────────────────────────────────────────────────────
 * HOW TO USE:
 * 1. Copy this file → rename to `client-name.tsx`
 * 2. Replace all TODO: comments with client-specific content
 * 3. Register in lead-gen-registry.ts (see README.md)
 * 4. Add default settings in lead-gen-theme-settings.ts
 * ─────────────────────────────────────────────────────────────
 */

import { LeadCaptureForm, ServiceCard, TestimonialCard, hexToRgb, type LeadGenThemeProps } from '../shared';

// TODO: Rename this function to match the client name
//       e.g., ClientFashionHouseRenderer
export default function ScaffoldRenderer({ settings, storeId }: LeadGenThemeProps) {
  const { primaryColor, accentColor } = settings;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ══════════════════════════════════════════════════════════════════
          ANNOUNCEMENT BAR (optional)
          ══════════════════════════════════════════════════════════════════ */}
      {settings.showAnnouncement && settings.announcementText && (
        <div className="text-white text-center py-2 text-sm" style={{ backgroundColor: primaryColor }}>
          {settings.announcementText}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          HEADER / NAVIGATION
          ══════════════════════════════════════════════════════════════════ */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-10" />
          ) : (
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
              {settings.storeName}
            </h1>
          )}
          {/* TODO: Add navigation links if needed */}
          <a
            href="#contact"
            className="text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            {settings.ctaButtonText}
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION
          TODO: Customize background, layout, imagery
          ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative py-24 lg:py-32"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {settings.heroHeading}
          </h1>
          <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto mb-8">
            {settings.heroDescription}
          </p>
          <a
            href="#contact"
            className="inline-block bg-white font-semibold px-8 py-4 rounded-lg text-lg hover:shadow-lg transition"
            style={{ color: primaryColor }}
          >
            {settings.ctaButtonText}
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          SERVICES SECTION
          TODO: Replace hardcoded services with client-specific services
          ══════════════════════════════════════════════════════════════════ */}
      {settings.showServices && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: primaryColor }}>
              Our Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* TODO: Replace with client-specific services */}
              <ServiceCard
                title="Service One"
                description="Description of the first service offering."
                primaryColor={primaryColor}
              />
              <ServiceCard
                title="Service Two"
                description="Description of the second service offering."
                primaryColor={primaryColor}
              />
              <ServiceCard
                title="Service Three"
                description="Description of the third service offering."
                primaryColor={primaryColor}
              />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
          TODO: Replace with real client testimonials
          ══════════════════════════════════════════════════════════════════ */}
      {settings.showTestimonials && (
        <section className="py-20" style={{ backgroundColor: `rgba(${hexToRgb(primaryColor)}, 0.05)` }}>
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* TODO: Replace with real testimonials */}
              <TestimonialCard
                text="Amazing service! Highly recommended."
                author="John Doe"
                position="CEO, Company"
                rating={5}
              />
              <TestimonialCard
                text="Professional and reliable. Great results."
                author="Jane Smith"
                position="Marketing Director"
                rating={5}
              />
              <TestimonialCard
                text="Exceeded our expectations in every way."
                author="Mike Johnson"
                position="Founder, Startup"
                rating={5}
              />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          CONTACT / LEAD CAPTURE SECTION
          ══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: primaryColor }}>
            Get In Touch
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
          <LeadCaptureForm
            formId={`custom-${storeId}`}
            submitButtonText={settings.ctaButtonText}
            primaryColor={primaryColor}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
          TODO: Customize footer layout / links
          ══════════════════════════════════════════════════════════════════ */}
      <footer className="text-white py-12" style={{ backgroundColor: primaryColor }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">{settings.storeName}</h3>
          <div className="flex justify-center gap-6 text-sm opacity-80 mb-4">
            {settings.phone && <span>📞 {settings.phone}</span>}
            {settings.email && <span>✉️ {settings.email}</span>}
          </div>
          {settings.address && (
            <p className="text-sm opacity-60">{settings.address}</p>
          )}
          <p className="text-sm opacity-40 mt-4">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
