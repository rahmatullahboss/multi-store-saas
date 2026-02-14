/**
 * Professional Services Theme
 * Clean, corporate design with blue tones
 */

import {
  LeadCaptureForm,
  ServiceCard,
  TestimonialCard,
  WhatsAppFloatingButton,
  type LeadGenThemeProps,
} from '../shared';

export default function ProfessionalServicesRenderer({ settings }: LeadGenThemeProps) {
  return (
    <div
      className="min-h-screen"
      style={
        {
          '--primary-color': settings.primaryColor,
          '--accent-color': settings.accentColor,
        } as React.CSSProperties
      }
    >
      {/* Announcement Banner */}
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
            <div className="flex items-center">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.storeName} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold text-gray-900">{settings.storeName}</span>
              )}
            </div>
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
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/lead-gen/auth/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-primary"
              >
                Login
              </a>
              <a
                href="/lead-gen/auth/register"
                className="px-4 py-2 font-medium rounded-lg text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                {settings.heroHeading}
              </h1>
              <p className="text-xl text-gray-600 mb-8">{settings.heroDescription}</p>
              <ul className="space-y-4">
                {['Free consultation', 'Expert advice', 'Fast turnaround'].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg
                      className="w-6 h-6 mr-3 flex-shrink-0"
                      style={{ color: settings.primaryColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
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

      {/* Services */}
      {settings.showServices && (
        <section id="services" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {(settings.services && settings.services.length > 0 ? settings.services : [
                { icon: '💼', title: 'Consulting', description: 'Strategic advice to help your business grow', enabled: true },
                { icon: '📚', title: 'Training', description: 'Expert training programs for your team', enabled: true },
                { icon: '🛟', title: 'Support', description: '24/7 support when you need it', enabled: true },
              ]).map((service, idx) => (
                <ServiceCard
                  key={idx}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  primaryColor={settings.primaryColor}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {settings.showTestimonials && (
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {(settings.successStories && settings.successStories.length > 0
                ? settings.successStories.slice(0, 3).map((story, idx) => (
                    <TestimonialCard
                      key={idx}
                      text={story.text}
                      author={story.name}
                      position={story.university || story.program}
                      rating={5}
                      avatar={story.image || undefined}
                    />
                  ))
                : [
                    { text: 'Working with this team transformed our business.', author: 'Sarah Ahmed', position: 'CEO, Tech Solutions', rating: 5, photo: '' },
                    { text: 'Professional and results-driven. Best investment.', author: 'Kamal Rahman', position: 'Founder, Digital Ventures', rating: 5, photo: '' },
                    { text: 'Their expertise is unmatched. Results in weeks.', author: 'Nadia Khan', position: 'MD, Global Traders', rating: 5, photo: '' },
                  ].map((testimonial, idx) => (
                    <TestimonialCard
                      key={idx}
                      text={testimonial.text}
                      author={testimonial.author}
                      position={testimonial.position}
                      rating={testimonial.rating}
                      avatar={testimonial.photo}
                    />
                  ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section
        id="contact"
        className="py-20 text-white"
        style={{
          background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-white/90">Contact us today for a free consultation</p>
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
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.address && (
                <div>
                  <div className="text-sm text-white/70 mb-1">Location</div>
                  <div className="text-lg font-medium">{settings.address}</div>
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
              <p className="text-gray-400">Your trusted partner for business growth</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#services" className="text-gray-400 hover:text-white">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-400 hover:text-white">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </div>
        </div>
      </footer>

      {settings.showWhatsApp && settings.whatsappNumber && (
        <WhatsAppFloatingButton phoneNumber={settings.whatsappNumber} />
      )}
    </div>
  );
}
