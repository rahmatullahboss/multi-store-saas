/**
 * Law Firm Theme
 * Dark, authoritative design with serif typography and gold accents
 */

import {
  LeadCaptureForm,
  hexToRgb,
  WhatsAppFloatingButton,
  type LeadGenThemeProps,
} from '../shared';

export default function LawFirmRenderer({ settings }: LeadGenThemeProps) {
  const primaryRgb = hexToRgb(settings.primaryColor);

  const practiceAreas = [
    {
      title: 'Corporate Law',
      description: 'Expert guidance on mergers, acquisitions, compliance and corporate governance.',
    },
    {
      title: 'Family Law',
      description: 'Compassionate representation for divorce, custody, and family matters.',
    },
    {
      title: 'Criminal Defense',
      description: 'Aggressive defense strategies to protect your rights and freedom.',
    },
    {
      title: 'Real Estate Law',
      description: 'Trusted advice for property transactions, disputes and land registration.',
    },
    {
      title: 'Immigration Law',
      description: 'Comprehensive immigration services for visas, citizenship and asylum.',
    },
    {
      title: 'Civil Litigation',
      description: 'Strategic litigation support for disputes, injunctions and settlements.',
    },
  ];

  const caseResults = [
    { value: '2,500+', label: 'Cases Won' },
    { value: '98%', label: 'Success Rate' },
    { value: '25+', label: 'Years of Experience' },
    { value: '50+', label: 'Expert Attorneys' },
  ];

  const attorneys = [
    { name: 'Advocate Rahman', title: 'Senior Partner', specialty: 'Corporate & Commercial Law' },
    { name: 'Barrister Fatima', title: 'Managing Partner', specialty: 'Criminal Defense' },
    { name: 'Advocate Hossain', title: 'Partner', specialty: 'Family & Immigration Law' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-serif">
      {/* Announcement */}
      {settings.showAnnouncement && settings.announcementText && (
        <div
          className="py-2.5 text-center text-sm font-medium tracking-wider uppercase"
          style={{ backgroundColor: settings.accentColor, color: '#0a0a0a' }}
        >
          {settings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.storeName} className="h-10 w-auto" />
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center border-2"
                    style={{ borderColor: settings.accentColor }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: settings.accentColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
                      />
                    </svg>
                  </div>
                  <span className="text-xl font-bold tracking-wide">{settings.storeName}</span>
                </div>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-gray-400">
              <a href="#practice" className="hover:text-white transition">
                Practice
              </a>
              <a href="#results" className="hover:text-white transition">
                Results
              </a>
              <a href="#team" className="hover:text-white transition">
                Team
              </a>
              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/lead-gen/auth/login"
                className="px-4 py-2 text-sm uppercase tracking-widest text-gray-400 hover:text-white"
              >
                Login
              </a>
              <a
                href="/lead-gen/auth/register"
                className="px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition hover:opacity-90"
                style={{ backgroundColor: settings.accentColor }}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 0%, rgba(${primaryRgb}, 0.15), transparent 60%)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-white/20 text-xs uppercase tracking-[0.3em] text-gray-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: settings.accentColor }}
                />
                Trusted Legal Representation
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
                {settings.heroHeading}
              </h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl font-sans">
                {settings.heroDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#contact"
                  className="px-8 py-4 text-sm font-semibold uppercase tracking-wider text-black transition hover:opacity-90"
                  style={{ backgroundColor: settings.accentColor }}
                >
                  Free Case Review
                </a>
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="px-8 py-4 border border-white/30 text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition"
                  >
                    Call {settings.phone}
                  </a>
                )}
              </div>
            </div>

            <div id="contact" className="bg-[#111] border border-white/10 p-8 lg:p-10">
              <h3 className="text-2xl font-bold mb-2 font-serif">Free Consultation</h3>
              <p className="text-gray-500 mb-6 font-sans text-sm">
                Describe your case. All consultations are confidential.
              </p>
              <LeadCaptureForm
                formId="law-hero"
                submitButtonText={settings.ctaButtonText}
                primaryColor={settings.accentColor}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Case Results Stats */}
      <section id="results" className="py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {caseResults.map((stat, i) => (
              <div key={i} className="text-center">
                <div
                  className="text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: settings.accentColor }}
                >
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-widest text-gray-500 font-sans">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Areas */}
      {settings.showServices && (
        <section id="practice" className="py-24 bg-[#0f0f0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <p
                className="text-xs uppercase tracking-[0.3em] mb-3 font-sans"
                style={{ color: settings.accentColor }}
              >
                Areas of Expertise
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold">Practice Areas</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {practiceAreas.map((area, i) => (
                <div
                  key={i}
                  className="group bg-[#1a1a1a] border border-white/5 p-8 hover:border-white/20 transition-all duration-300"
                >
                  <div
                    className="w-10 h-0.5 mb-6 transition-all group-hover:w-16"
                    style={{ backgroundColor: settings.accentColor }}
                  />
                  <h3 className="text-xl font-bold mb-3">{area.title}</h3>
                  <p className="text-gray-500 font-sans text-sm leading-relaxed">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Team */}
      <section id="team" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p
              className="text-xs uppercase tracking-[0.3em] mb-3 font-sans"
              style={{ color: settings.accentColor }}
            >
              Our Attorneys
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold">Meet the Team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {attorneys.map((attorney, i) => (
              <div key={i} className="group">
                <div className="aspect-[3/4] bg-[#1a1a1a] mb-6 flex items-end p-6 border border-white/5 group-hover:border-white/15 transition-colors">
                  <div
                    className="w-16 h-16 rounded-full bg-[#222] flex items-center justify-center text-2xl font-bold"
                    style={{ color: settings.accentColor }}
                  >
                    {attorney.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-xl font-bold">{attorney.name}</h3>
                <p className="text-sm font-sans mt-1" style={{ color: settings.accentColor }}>
                  {attorney.title}
                </p>
                <p className="text-sm text-gray-500 font-sans mt-1">{attorney.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {settings.showTestimonials && (
        <section className="py-24 bg-[#0f0f0f] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <p
                className="text-xs uppercase tracking-[0.3em] mb-3 font-sans"
                style={{ color: settings.accentColor }}
              >
                Client Testimonials
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold">What Our Clients Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  text: 'They handled my case with absolute professionalism. The outcome exceeded my expectations.',
                  name: 'Abdul Karim',
                  role: 'Corporate Client',
                },
                {
                  text: 'During the most difficult time of my life, this firm gave me hope and delivered justice.',
                  name: 'Nasreen Akter',
                  role: 'Family Law Client',
                },
                {
                  text: 'Their knowledge of immigration law is unparalleled. I got my visa approved quickly.',
                  name: 'David Chen',
                  role: 'Immigration Client',
                },
              ].map((t, i) => (
                <div key={i} className="bg-[#1a1a1a] border border-white/5 p-8">
                  <svg
                    className="w-8 h-8 mb-6 opacity-30"
                    style={{ color: settings.accentColor }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21L14.017 18C14.017 16.096 14.017 14.742 14.017 14.742C14.017 10.158 17.572 7 22.017 7L22.017 10C19.167 10 17.017 11.2 17.017 14L17 14L17 21L14.017 21ZM5.017 21L5.017 18C5.017 16.096 5.017 14.742 5.017 14.742C5.017 10.158 8.572 7 13.017 7L13.017 10C10.167 10 8.017 11.2 8.017 14L8 14L8 21L5.017 21Z" />
                  </svg>
                  <p className="text-gray-300 mb-6 font-sans leading-relaxed">{t.text}</p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-sans">
                      {t.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{settings.storeName}</h3>
              <p className="text-gray-500 font-sans text-sm leading-relaxed max-w-md">
                Providing exceptional legal representation with integrity, dedication, and a
                commitment to achieving the best outcomes for our clients.
              </p>
            </div>
            <div>
              <h4
                className="font-bold mb-4 text-sm uppercase tracking-widest"
                style={{ color: settings.accentColor }}
              >
                Practice
              </h4>
              <ul className="space-y-2 text-gray-500 font-sans text-sm">
                {practiceAreas.slice(0, 4).map((a) => (
                  <li key={a.title}>
                    <a href="#practice" className="hover:text-white transition">
                      {a.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4
                className="font-bold mb-4 text-sm uppercase tracking-widest"
                style={{ color: settings.accentColor }}
              >
                Contact
              </h4>
              <div className="space-y-2 text-gray-500 font-sans text-sm">
                {settings.phone && <p>{settings.phone}</p>}
                {settings.email && <p>{settings.email}</p>}
                {settings.address && <p>{settings.address}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 font-sans">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition">
                Terms
              </a>
              <a href="#" className="hover:text-white transition">
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      </footer>

      {settings.showWhatsApp && settings.whatsappNumber && (
        <WhatsAppFloatingButton phoneNumber={settings.whatsappNumber} />
      )}
    </div>
  );
}
