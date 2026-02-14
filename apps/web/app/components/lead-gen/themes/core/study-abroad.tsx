/**
 * Study Abroad Theme - Dynamic Version
 * Education consultancy with destination cards, university partners, team, and more
 * All content is now editable via admin settings
 */

import { LeadCaptureForm, WhatsAppFloatingButton, type LeadGenThemeProps } from '../shared';

export default function StudyAbroadRenderer({ settings }: LeadGenThemeProps) {
  // Use settings with fallbacks to empty arrays if not defined
  const destinations = settings.destinations || [];
  const services = settings.services || [];
  const whyChoosePoints = settings.whyChoosePoints || [];
  const processSteps = settings.processSteps || [];
  const successStories = settings.successStories || [];
  const teamMembers = settings.teamMembers || [];
  const universityLogos = settings.universityLogos || [];
  const whyStudyPoints = settings.whyStudyPoints || [];
  const otherCountries = settings.otherCountries || [];
  const quickLinks = settings.quickLinks || [];

  // Stats for hero section
  const metrics = [
    { value: settings.statsStudentsCount || '20,000+', label: "Student's Career" },
    { value: settings.statsRecruitmentAwards || '35+', label: 'Recruitment Awards' },
    { value: settings.statsUniversityPartners || '140+', label: 'University Partners' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Announcement Banner */}
      {settings.showAnnouncement && settings.announcementText && (
        <div
          className="px-4 py-2 text-center text-sm font-semibold text-white"
          style={{ backgroundColor: settings.accentColor }}
        >
          {settings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            {settings.logo ? (
              <img className="h-10 w-auto" src={settings.logo} alt={settings.storeName} />
            ) : (
              <span className="text-2xl font-bold" style={{ color: settings.primaryColor }}>
                {settings.storeName}
              </span>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            {destinations.length > 0 && (
              <a
                href="#destinations"
                className="text-gray-700 hover:text-red-600 font-medium transition"
              >
                Destinations
              </a>
            )}
            {services.length > 0 && (
              <a
                href="#services"
                className="text-gray-700 hover:text-red-600 font-medium transition"
              >
                Services
              </a>
            )}
            {processSteps.length > 0 && (
              <a
                href="#process"
                className="text-gray-700 hover:text-red-600 font-medium transition"
              >
                Process
              </a>
            )}
            {teamMembers.length > 0 && (
              <a href="#team" className="text-gray-700 hover:text-red-600 font-medium transition">
                Team
              </a>
            )}
            <a href="#contact" className="text-gray-700 hover:text-red-600 font-medium transition">
              Contact
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/lead-gen/auth/login"
              className="px-4 py-2 text-gray-700 font-medium hover:text-red-600 transition"
            >
              Login
            </a>
            <a
              href="/lead-gen/auth/register"
              className="px-5 py-2.5 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Sign Up
            </a>
          </div>
          <div className="md:hidden">
            <a href="#contact" style={{ color: settings.primaryColor }} className="font-bold">
              Menu
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${settings.primaryColor}, transparent 60%), radial-gradient(circle at 10% 80%, ${settings.accentColor}, transparent 60%)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Hero Badge */}
              {settings.heroBadge && (
                <span className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                  {settings.heroBadge}
                </span>
              )}
              {settings.heroSubheading && (
                <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-6 bg-white border border-gray-200 text-gray-600 shadow-sm">
                  {settings.heroSubheading}
                </span>
              )}
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                {settings.heroHeading}
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">{settings.heroDescription}</p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="px-8 py-4 rounded-lg text-white font-bold text-lg shadow-lg transition hover:opacity-90"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {settings.ctaButtonText}
                </a>
                {destinations.length > 0 && (
                  <a
                    href="#destinations"
                    className="px-8 py-4 rounded-lg bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition"
                  >
                    Explore Countries
                  </a>
                )}
              </div>

              {/* Stats - Only show if enabled */}
              {settings.showStats && (
                <div className="mt-12 grid grid-cols-3 gap-6 border-t border-gray-200 pt-8">
                  {metrics.map((stat, idx) => (
                    <div key={idx}>
                      <div
                        className="text-2xl lg:text-3xl font-bold"
                        style={{ color: settings.primaryColor }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div id="contact" className="relative">
              <div
                className="absolute -inset-1 rounded-2xl blur opacity-30"
                style={{
                  background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.accentColor})`,
                }}
              />
              <div className="relative bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Get Free Consultation</h3>
                <p className="text-gray-500 mb-6">Talk to our education experts today.</p>
                <LeadCaptureForm
                  formId="study-abroad-hero"
                  submitButtonText="Book Appointment"
                  primaryColor={settings.primaryColor}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      {destinations.length > 0 && (
        <section id="destinations" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Discover Your Perfect Study Destination
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                We help students choose destinations based on academic eligibility, budget, and
                career goals.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations
                .filter((d) => d.enabled)
                .map((card, idx) => (
                  <div
                    key={idx}
                    className="group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
                  >
                    <div
                      className="h-12 w-12 rounded-lg mb-6 flex items-center justify-center text-white text-xl font-bold shadow-md"
                      style={{
                        background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                      }}
                    >
                      {card.title.charAt(9)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{card.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section - Improved with Cards */}
      {settings.showWhyChoose && whyChoosePoints.length > 0 && (
        <section id="why-us" className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Why Students Choose Us?</h2>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Choosing the right consultancy can shape your entire study abroad journey. We're here to make it seamless.
              </p>
            </div>
            
            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChoosePoints
                .filter((p) => p.enabled)
                .map((item, i) => (
                  <div 
                    key={i} 
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="text-4xl mb-4 bg-white/20 w-16 h-16 rounded-xl flex items-center justify-center">
                      {item.icon || '✓'}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                      {item.text}
                    </h3>
                  </div>
                ))}
            </div>
            
            {/* CTA */}
            <div className="text-center mt-12">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300"
              >
                Get Free Advice
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      {settings.showServices && services.length > 0 && (
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Comprehensive educational consultancy services designed to make your international
                study journey simple and affordable.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services
                .filter((s) => s.enabled)
                .map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Process / How We Help Section */}
      {processSteps.length > 0 && (
        <section id="process" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                How We Can Help You?
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Our experienced consultants provide personalized assistance at every step.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className="text-6xl font-bold opacity-10"
                    style={{ color: settings.primaryColor }}
                  >
                    {step.number}
                  </div>
                  <div className="absolute top-0 left-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Success Stories / Testimonials */}
      {settings.showTestimonials && successStories.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Success Stories</h2>
            <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12">
              Hear from students who achieved their dream of studying abroad with our help.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {successStories.map((story, i) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow-sm">
                  <p className="text-gray-700 italic mb-6">{story.text}</p>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {story.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{story.name}</div>
                      <div className="text-sm text-gray-600">
                        {story.program}, {story.university}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team / Counselors - Toggle enabled */}
      {settings.showTeam && teamMembers.length > 0 && (
        <section id="team" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Counselors
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Our experienced team is dedicated to helping you achieve your study abroad dreams.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="text-center">
                  <div
                    className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-500"
                    style={{ backgroundColor: `${settings.primaryColor}20` }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="font-semibold mb-3" style={{ color: settings.primaryColor }}>
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* University Partners - Horizontal Scrolling Marquee */}
      {settings.showUniversityPartners && universityLogos.length > 0 && (
        <section className="py-12 border-t border-b border-gray-100 bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Partner Universities
            </p>
          </div>
          <div className="relative">
            {/* Gradient overlays for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling container */}
            <div className="flex gap-8 animate-scroll">
              {/* Double the logos for seamless loop */}
              {[...universityLogos, ...universityLogos].map((logo, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 h-20 w-40 bg-white rounded-lg shadow-sm flex items-center justify-center px-4"
                >
                  {typeof logo === 'string' && logo.startsWith('http') ? (
                    <img 
                      src={logo} 
                      alt="University Logo" 
                      className="max-h-16 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300" 
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold text-sm text-center">
                      {logo}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
        </section>
      )}

      {/* Other Countries Section */}
      {settings.showOtherCountries && otherCountries.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Other Countries We Serve
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Beyond our primary focus, we also help students explore other premium destinations.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {otherCountries
                .filter((c) => c.enabled)
                .map((country, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{country.title}</h3>
                    <p className="text-gray-600 text-sm">{country.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Study Abroad */}
      {whyStudyPoints.length > 0 && (
        <section
          id="why-study"
          className="py-20"
          style={{ backgroundColor: `${settings.primaryColor}05` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Study Abroad?
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Discover the benefits of pursuing your education overseas.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyStudyPoints.map((point, idx) => (
                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm text-center">
                  <div className="text-5xl mb-4">{point.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{point.title}</h3>
                  <p className="text-gray-600 text-sm">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">{settings.storeName}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                {settings.footerDescription ||
                  'Helping students achieve study abroad dreams since 2008.'}
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                {quickLinks.slice(0, 4).map((link, i) => (
                  <li key={i}>
                    <a href={link.url} className="hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Destinations</h3>
              <ul className="space-y-2 text-gray-400">
                {destinations
                  .filter((d) => d.enabled)
                  .slice(0, 4)
                  .map((dest, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-white">
                        {dest.title.replace('Study in ', '')}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Contact</h3>
              <div className="text-gray-400 space-y-2">
                {settings.phone && <p>Phone: {settings.phone}</p>}
                {settings.email && <p>Email: {settings.email}</p>}
                {settings.address && <p>Address: {settings.address}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      {settings.showWhatsApp && settings.whatsappNumber && (
        <WhatsAppFloatingButton phoneNumber={settings.whatsappNumber} />
      )}
    </div>
  );
}
