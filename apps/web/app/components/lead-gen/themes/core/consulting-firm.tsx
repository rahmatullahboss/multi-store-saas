/**
 * Consulting Firm Theme
 * Modern SaaS-style with clean cards and gradient accents
 */

import { LeadCaptureForm, hexToRgb, type LeadGenThemeProps } from '../shared';

export default function ConsultingFirmRenderer({ settings }: LeadGenThemeProps) {
  const primaryRgb = hexToRgb(settings.primaryColor);
  const accentRgb = hexToRgb(settings.accentColor);

  const metrics = [
    { value: '150,000+', label: 'Students Counselled' },
    { value: '22,000+', label: 'Visa Success Stories' },
    { value: '50+', label: 'Partner Universities' },
    { value: '15+', label: 'Years Experience' },
  ];

  const destinationCards = [
    { title: 'Australia', description: 'High visa success, work opportunities, and globally ranked universities.' },
    { title: 'Canada', description: 'Excellent education system with welcoming immigration policies.' },
    { title: 'United Kingdom', description: "Home to some of the world's oldest and most prestigious universities." },
    { title: 'USA', description: "The world's most popular study destination with diverse opportunities." },
  ];

  const serviceCards = [
    { title: 'Coaching', description: 'IELTS and PTE preparation with experienced trainers and structured modules.' },
    { title: 'Visa Application', description: 'End-to-end support for application, documents, SOP, and interview preparation.' },
    { title: 'Accommodation Support', description: 'Pre-departure planning and accommodation support for safer student transition.' },
  ];

  const testimonials = [
    { name: 'Farhan Ahmed', role: 'University of Sydney', text: 'Expert Education guided me through the entire visa process. I could not have done it without them.' },
    { name: 'Nusrat Jahan', role: 'Seneca College', text: 'The counsellors are knowledgeable and supportive. Highly recommended for Canada aspirants.' },
    { name: 'Rahim Uddin', role: 'Coventry University', text: 'They helped me choose the right course and university. Support was excellent throughout.' },
  ];

  const accreditations = ['British Council', 'IDP', 'Pearson', 'Global Education Partners'];

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#0f172a]">
      {settings.showAnnouncement && settings.announcementText && (
        <div className="px-4 py-2 text-center text-sm font-semibold" style={{ backgroundColor: settings.accentColor, color: '#111827' }}>
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
                <div className="h-8 w-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }} />
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
          <a href="#contact" className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>
            {settings.ctaButtonText}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(1100px 500px at 10% -10%, rgba(${primaryRgb}, 0.26), transparent 55%), radial-gradient(800px 420px at 90% 0%, rgba(${accentRgb}, 0.2), transparent 55%)` }} />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Study Abroad Consultancy</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">Rely on Experts for Your Study Abroad Journey</h1>
            <p className="max-w-2xl text-lg text-slate-600">We help you discover your perfect study destination and guide you through every step from university selection to visa approval.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#contact" className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>{settings.ctaButtonText || 'Get Free Consultation'}</a>
              <a href="#destinations" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Explore Destinations</a>
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
          <div id="contact" className="rounded-3xl border border-slate-200 bg-white p-6 text-gray-900 shadow-xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Get Consultation</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Get a Free Consultation</h2>
            <p className="mt-2 text-sm text-gray-600">Fill out the form below and our experts will contact you soon.</p>
            <div className="mt-6">
              <LeadCaptureForm formId="consulting-hero-form" submitButtonText={settings.ctaButtonText} primaryColor={settings.primaryColor} />
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      {settings.showServices && (
        <section id="services" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Our Vision & Your Solutions</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Guidance built for Bangladesh students</h2>
              </div>
              <p className="max-w-xl text-sm text-slate-600">We provide profile-based guidance for HSC, A-Levels, and undergraduate applicants with transparent process support.</p>
            </div>
            <div id="destinations" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {destinationCards.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 h-10 w-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }} />
                  <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
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

      {/* Testimonials */}
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
                  <p className="mt-4 inline-flex rounded-lg px-3 py-1 text-sm font-semibold" style={{ backgroundColor: `rgba(${accentRgb}, 0.2)`, color: settings.accentColor }}>Verified Student</p>
                  <p className="mt-4 text-sm text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Accreditations */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Membership, Certification & Accreditation</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {accreditations.map((item) => (
                <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 p-8 text-center sm:p-12" style={{ background: `linear-gradient(130deg, rgba(${primaryRgb}, 0.25), rgba(${accentRgb}, 0.2))` }}>
            <h2 className="text-3xl font-bold sm:text-4xl">Turn your global study dream into reality</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-700">Get expert advice on universities, scholarships, visa, accommodation, and next steps.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#contact" className="rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>Get Consultation</a>
              {settings.phone ? <a href={`tel:${settings.phone}`} className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700">Call {settings.phone}</a> : null}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
