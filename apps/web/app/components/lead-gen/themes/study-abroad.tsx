/**
 * Study Abroad Theme
 * Education consultancy with destination cards and accreditations
 */

import { LeadCaptureForm, type LeadGenThemeProps } from './shared';

export default function StudyAbroadRenderer({ settings }: LeadGenThemeProps) {
  const metrics = [
    { value: '150,000+', label: 'Students Counselled' },
    { value: '22,000+', label: 'Visa Success Stories' },
    { value: '98%', label: 'Visa Success Rate' },
    { value: '15+', label: 'Years Experience' },
  ];

  const destinationCards = [
    { title: 'Study in Australia', description: 'Globally ranked universities, strong student support, plus clear post-study pathways.' },
    { title: 'Study in Canada', description: 'Quality education with clear post-study work options and safe environment.' },
    { title: 'Study in USA', description: 'World-leading universities, cutting-edge research, and flexible study options.' },
    { title: 'Study in UK', description: 'Globally respected degrees in less time, reducing overall cost.' },
    { title: 'Study in Malaysia', description: 'Quality education close to home with flexible intake options.' },
    { title: 'Study in New Zealand', description: 'High-quality education with a safe lifestyle and future career stability.' },
  ];

  const serviceCards = [
    { title: 'Visa Application', description: 'Our consulting experts will help you with the information you need.' },
    { title: 'Admissions Advice', description: "We'll help you with the admissions process – from start to finish." },
    { title: 'Travel and Stay', description: "We'll assist you with the accommodation details for a happy stay abroad." },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'MSc Student, UK', text: 'The guidance I received was exceptional. From university selection to visa processing, everything was smooth.' },
    { name: 'Michael Chen', role: 'MBA Student, Canada', text: "Highly professional team! They helped me get a scholarship I didn't think was possible." },
    { name: 'Priya Patel', role: 'Monash University', text: 'Expert Education made my dream of studying in Australia a reality. Forever grateful!' },
  ];

  const accreditations = ['British Council', 'IDP Education', 'PIER', 'ICEF', 'English UK', 'QEAC'];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {settings.showAnnouncement && settings.announcementText && (
        <div className="px-4 py-2 text-center text-sm font-semibold text-white" style={{ backgroundColor: settings.accentColor }}>{settings.announcementText}</div>
      )}

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            {settings.logo ? <img className="h-10 w-auto" src={settings.logo} alt={settings.storeName} /> : <span className="text-2xl font-bold" style={{ color: settings.primaryColor }}>{settings.storeName}</span>}
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#destinations" className="text-gray-700 hover:text-red-600 font-medium transition">Destinations</a>
            <a href="#services" className="text-gray-700 hover:text-red-600 font-medium transition">Services</a>
            <a href="#why-us" className="text-gray-700 hover:text-red-600 font-medium transition">Why Us</a>
            <a href="#contact" className="text-gray-700 hover:text-red-600 font-medium transition">Contact</a>
          </nav>
          <div className="hidden md:flex">
            <a href="#contact" className="px-6 py-2.5 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5" style={{ backgroundColor: settings.primaryColor }}>{settings.ctaButtonText}</a>
          </div>
          <div className="md:hidden"><a href="#contact" style={{ color: settings.primaryColor }} className="font-bold">Menu</a></div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{ background: `radial-gradient(circle at 70% 30%, ${settings.primaryColor}, transparent 60%), radial-gradient(circle at 10% 80%, ${settings.accentColor}, transparent 60%)` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-6 bg-white border border-gray-200 text-gray-600 shadow-sm">Study Abroad Consultants</span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">{settings.heroHeading}</h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">{settings.heroDescription}</p>
              <div className="flex flex-wrap gap-4">
                <a href="#contact" className="px-8 py-4 rounded-lg text-white font-bold text-lg shadow-lg transition hover:opacity-90" style={{ backgroundColor: settings.primaryColor }}>{settings.ctaButtonText}</a>
                <a href="#destinations" className="px-8 py-4 rounded-lg bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition">Explore Countries</a>
              </div>
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-gray-200 pt-8">
                {metrics.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-2xl lg:text-3xl font-bold" style={{ color: settings.primaryColor }}>{stat.value}</div>
                    <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div id="contact" className="relative">
              <div className="absolute -inset-1 rounded-2xl blur opacity-30" style={{ background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.accentColor})` }} />
              <div className="relative bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Get Free Consultation</h3>
                <p className="text-gray-500 mb-6">Talk to our education experts today.</p>
                <LeadCaptureForm formId="study-abroad-hero" submitButtonText="Book Appointment" primaryColor={settings.primaryColor} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Discover Your Perfect Study Destination</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">We help students choose destinations based on academic eligibility, budget, and career goals.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinationCards.map((card, idx) => (
              <div key={idx} className="group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                <div className="h-12 w-12 rounded-lg mb-6 flex items-center justify-center text-white text-xl font-bold shadow-md" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>{card.title.charAt(9)}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 text-white relative overflow-hidden" style={{ backgroundColor: settings.accentColor }}>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full opacity-10 bg-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Why Students Choose Us?</h2>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">Choosing the right consultancy can shape your entire study abroad journey.</p>
              <ul className="space-y-4">
                {['95% Student Visa Success Rate', 'HSC, A-Level & National University Experts', 'Dedicated Scholarship Guidance', 'In-person Document Verification'].map((item, i) => (
                  <li key={i} className="flex items-center text-lg">
                    <span className="h-6 w-6 rounded-full bg-white text-blue-900 flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <a href="#contact" className="inline-block px-8 py-3 bg-white text-blue-900 font-bold rounded-lg shadow hover:bg-gray-100 transition">Get Free Advice</a>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="aspect-square bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">15+</div><div className="text-xl">Years of Trust</div>
                  <div className="my-8 h-px bg-white/20 w-32 mx-auto" />
                  <div className="text-5xl font-bold mb-2">20+</div><div className="text-xl">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      {settings.showServices && (
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-wider uppercase text-gray-500">Our Services</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Complete support for your journey</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {serviceCards.map((service, idx) => (
                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border-b-4 border-transparent hover:border-red-500 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-6 text-red-600"><span className="font-bold text-xl">{idx + 1}</span></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {settings.showTestimonials && (
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Student Success Stories</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-xl relative">
                  <p className="text-gray-700 italic mb-6">{t.text}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">{t.name.charAt(0)}</div>
                    <div>
                      <div className="font-bold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500 uppercase">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Accreditations */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Accredited By</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {accreditations.map((acc, i) => <span key={i} className="text-xl font-bold text-gray-800">{acc}</span>)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">{settings.storeName}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Helping students achieve study abroad dreams since 2008.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#destinations" className="hover:text-white">Destinations</a></li>
                <li><a href="#services" className="hover:text-white">Services</a></li>
                <li><a href="#contact" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-lg">Destinations</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">UK</a></li>
                <li><a href="#" className="hover:text-white">USA</a></li>
                <li><a href="#" className="hover:text-white">Canada</a></li>
                <li><a href="#" className="hover:text-white">Australia</a></li>
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
            <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
