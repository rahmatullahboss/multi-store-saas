/**
 * Healthcare Theme
 * Clean, trustworthy medical design with rounded elements
 */

import { LeadCaptureForm, type LeadGenThemeProps } from '../shared';

export default function HealthcareRenderer({ settings }: LeadGenThemeProps) {
  const departments = [
    { title: 'General Medicine', desc: 'Comprehensive primary care for all ages.', icon: '🩺' },
    { title: 'Cardiology', desc: 'Advanced cardiac care and procedures.', icon: '❤️' },
    { title: 'Orthopedics', desc: 'Joint replacement and sports medicine.', icon: '🦴' },
    { title: 'Pediatrics', desc: 'Specialized child healthcare.', icon: '👶' },
    { title: 'Dermatology', desc: 'Skin care and cosmetic treatments.', icon: '✨' },
    { title: 'Neurology', desc: 'Nervous system disorder treatments.', icon: '🧠' },
  ];

  const stats = [
    { value: '50,000+', label: 'Happy Patients' },
    { value: '150+', label: 'Expert Doctors' },
    { value: '25+', label: 'Departments' },
    { value: '99%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {settings.showAnnouncement && settings.announcementText && (
        <div className="py-2.5 text-center text-sm font-medium text-white" style={{ backgroundColor: settings.primaryColor }}>
          📋 {settings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.storeName} className="h-10 w-auto" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style={{ backgroundColor: settings.primaryColor }}>+</div>
                <span className="text-xl font-bold text-gray-900">{settings.storeName}</span>
              </>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#departments" className="hover:text-teal-600 transition">Departments</a>
            <a href="#why-us" className="hover:text-teal-600 transition">Why Us</a>
            <a href="#contact" className="hover:text-teal-600 transition">Contact</a>
          </nav>
          <a href="#contact" className="px-6 py-2.5 rounded-full text-sm font-semibold text-white shadow-md" style={{ backgroundColor: settings.primaryColor }}>
            {settings.ctaButtonText}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}08, ${settings.accentColor}10)` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-8 border border-teal-100">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Trusted Healthcare Provider
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">{settings.heroHeading}</h1>
              <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-xl">{settings.heroDescription}</p>
              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="px-8 py-4 rounded-xl text-white font-semibold shadow-lg" style={{ backgroundColor: settings.primaryColor }}>Book Appointment</a>
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} className="px-8 py-4 rounded-xl bg-white text-gray-800 font-semibold border border-gray-200 shadow-sm">📞 Call Now</a>
                )}
              </div>
              <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold" style={{ color: settings.primaryColor }}>{s.value}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div id="contact" className="relative">
              <div className="absolute -inset-1 rounded-3xl blur-lg opacity-20" style={{ backgroundColor: settings.primaryColor }} />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Book an Appointment</h3>
                <p className="text-sm text-gray-500 mb-6">We'll confirm your appointment shortly</p>
                <LeadCaptureForm formId="healthcare-hero" submitButtonText="Book Appointment" primaryColor={settings.primaryColor} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      {settings.showServices && (
        <section id="departments" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: settings.primaryColor }}>Specialized Care</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Our Departments</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, i) => (
                <div key={i} className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-4xl mb-4">{dept.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{dept.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section id="why-us" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: settings.primaryColor }}>Why Choose Us</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12">Your Health, Our Priority</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: '24/7 Emergency', d: 'Round-the-clock emergency services.' },
              { t: 'Online Booking', d: 'Book appointments from home.' },
              { t: 'Insurance Support', d: 'All major insurers accepted.' },
              { t: 'Modern Facilities', d: 'State-of-the-art equipment.' },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-xl mb-4 mx-auto flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: settings.primaryColor }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 className="font-bold text-gray-900 mb-1">{f.t}</h3>
                <p className="text-sm text-gray-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {settings.showTestimonials && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: settings.primaryColor }}>Patient Reviews</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">What Patients Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { text: 'Doctors are exceptionally caring. Surgery went perfectly.', name: 'Amina Begum', role: 'Cardiology Patient' },
                { text: 'Best pediatric care. My children feel safe here.', name: 'Rafiq Islam', role: 'Parent' },
                { text: 'Modern facilities, professional staff. Recommended!', name: 'Sadia Rahman', role: 'General Patient' },
              ].map((t, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-sm mb-4">⭐⭐⭐⭐⭐</div>
                  <p className="text-gray-600 mb-6 leading-relaxed">{t.text}</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: settings.primaryColor }}>{t.name.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-3xl p-12 text-center text-white relative overflow-hidden" style={{ backgroundColor: settings.primaryColor }}>
            <h2 className="text-3xl font-bold mb-4 relative z-10">Need Medical Attention?</h2>
            <p className="text-lg text-white/80 mb-8 relative z-10">Book today or call our emergency line.</p>
            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <a href="#contact" className="px-8 py-3 bg-white font-bold rounded-xl" style={{ color: settings.primaryColor }}>Book Appointment</a>
              {settings.phone && <a href={`tel:${settings.phone}`} className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl">Emergency: {settings.phone}</a>}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">{settings.storeName}</h3>
              <p className="text-gray-400 text-sm">Quality healthcare with compassion.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Departments</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {departments.slice(0, 4).map((d) => <li key={d.title}><a href="#departments" className="hover:text-white">{d.title}</a></li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#contact" className="hover:text-white">Book Appointment</a></li>
                <li><a href="#why-us" className="hover:text-white">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                {settings.phone && <p>📞 {settings.phone}</p>}
                {settings.email && <p>✉️ {settings.email}</p>}
                {settings.address && <p>📍 {settings.address}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
