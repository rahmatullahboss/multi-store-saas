/**
 * Agency Theme
 * Bold, creative design with dynamic gradients and portfolio sections
 */

import { LeadCaptureForm, hexToRgb, type LeadGenThemeProps } from '../shared';

export default function AgencyRenderer({ settings }: LeadGenThemeProps) {
  const primaryRgb = hexToRgb(settings.primaryColor);
  const accentRgb = hexToRgb(settings.accentColor);

  const capabilities = [
    { title: 'Brand Strategy', desc: 'Crafting unique brand identities that resonate with your audience.' },
    { title: 'Digital Marketing', desc: 'Data-driven campaigns that deliver measurable ROI.' },
    { title: 'Web Development', desc: 'High-performance websites and web applications.' },
    { title: 'UI/UX Design', desc: 'User experiences that delight and convert.' },
    { title: 'Content Creation', desc: 'Compelling stories that drive engagement.' },
    { title: 'Social Media', desc: 'Building communities and growing your presence.' },
  ];

  const caseStudies = [
    { client: 'Fashion Brand X', result: '340% increase in online sales', category: 'E-Commerce' },
    { client: 'TechStartup Y', result: '5x growth in user acquisition', category: 'SaaS' },
    { client: 'Restaurant Chain Z', result: '200% increase in reservations', category: 'F&B' },
  ];

  const stats = [
    { value: '200+', label: 'Projects Delivered' },
    { value: '50+', label: 'Happy Clients' },
    { value: '95%', label: 'Client Retention' },
    { value: '12+', label: 'Years Experience' },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      {settings.showAnnouncement && settings.announcementText && (
        <div className="py-2 text-center text-sm font-bold tracking-wider" style={{ background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
          {settings.announcementText}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt={settings.storeName} className="h-9 w-auto" />
            ) : (
              <span className="text-2xl font-black tracking-tight">{settings.storeName}<span style={{ color: settings.accentColor }}>.</span></span>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
            <a href="#work" className="hover:text-white transition">Work</a>
            <a href="#capabilities" className="hover:text-white transition">Capabilities</a>
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
          <a href="#contact" className="px-5 py-2.5 rounded-full text-sm font-bold text-black" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
            {settings.ctaButtonText}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-15" style={{ backgroundColor: settings.primaryColor }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-10" style={{ backgroundColor: settings.accentColor }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm text-gray-400 mb-10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: settings.accentColor }} />
              Creative Digital Agency
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8">
              {settings.heroHeading.split(' ').map((word, i) => (
                <span key={i}>
                  {i % 3 === 2 ? <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>{word}</span> : word}
                  {' '}
                </span>
              ))}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">{settings.heroDescription}</p>
            <div className="flex flex-wrap gap-4">
              <a href="#contact" className="px-8 py-4 rounded-full font-bold text-black text-lg" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
                Start a Project
              </a>
              <a href="#work" className="px-8 py-4 rounded-full font-bold border border-white/20 hover:bg-white/5 transition">
                View Work
              </a>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/10 pt-10">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl lg:text-4xl font-black bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>{s.value}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies / Work */}
      <section id="work" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: settings.accentColor }}>Selected Work</p>
            <h2 className="text-4xl lg:text-5xl font-black">Case Studies</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((cs, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/5 hover:border-white/15 transition-all duration-500 cursor-pointer">
                <div className="aspect-[4/5] p-8 flex flex-col justify-end" style={{ background: `linear-gradient(${135 + i * 20}deg, rgba(${primaryRgb}, 0.15), rgba(${accentRgb}, 0.08))` }}>
                  <span className="text-xs uppercase tracking-widest text-gray-500 mb-2">{cs.category}</span>
                  <h3 className="text-2xl font-bold mb-3">{cs.client}</h3>
                  <p className="text-lg font-semibold" style={{ color: settings.accentColor }}>{cs.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      {settings.showServices && (
        <section id="capabilities" className="py-24 border-t border-white/5 bg-[#111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: settings.accentColor }}>What We Do</p>
              <h2 className="text-4xl lg:text-5xl font-black">Capabilities</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
              {capabilities.map((cap, i) => (
                <div key={i} className="bg-[#111] p-8 hover:bg-[#1a1a1a] transition-colors group">
                  <div className="text-4xl font-black mb-4 opacity-20 group-hover:opacity-40 transition" style={{ color: settings.accentColor }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cap.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About / Process */}
      <section id="about" className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: settings.accentColor }}>Our Process</p>
              <h2 className="text-4xl font-black mb-6">How We Work</h2>
              <div className="space-y-6">
                {[
                  { step: 'Discovery', desc: 'We learn about your business, goals, and target audience.' },
                  { step: 'Strategy', desc: 'We craft a data-driven plan tailored to your objectives.' },
                  { step: 'Execute', desc: 'Our team brings the strategy to life with precision.' },
                  { step: 'Optimize', desc: 'We measure, iterate, and scale what works.' },
                ].map((p, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-black" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{p.step}</h3>
                      <p className="text-gray-500 text-sm">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div id="contact" className="rounded-2xl border border-white/10 p-8 backdrop-blur-sm" style={{ background: `linear-gradient(160deg, rgba(${primaryRgb}, 0.05), rgba(${accentRgb}, 0.03))` }}>
              <h3 className="text-2xl font-black mb-2">Let's Talk</h3>
              <p className="text-gray-500 text-sm mb-6">Tell us about your project and we'll get back to you fast.</p>
              <LeadCaptureForm formId="agency-contact" submitButtonText={settings.ctaButtonText} primaryColor={settings.primaryColor} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {settings.showTestimonials && (
        <section className="py-24 border-t border-white/5 bg-[#111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: settings.accentColor }}>Testimonials</p>
              <h2 className="text-4xl font-black">Client Love</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { text: 'They transformed our brand. Sales skyrocketed from day one.', name: 'Sarah Kim', role: 'CEO, FashionCo' },
                { text: 'The most professional agency we have worked with. Period.', name: 'Ahmed Raza', role: 'Founder, TechWave' },
                { text: 'Creative, strategic, and always on time. Truly exceptional.', name: 'Lisa Chen', role: 'CMO, FoodHub' },
              ].map((t, i) => (
                <div key={i} className="rounded-2xl border border-white/5 p-8 hover:border-white/15 transition">
                  <div className="w-10 h-1 rounded-full mb-6" style={{ background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.accentColor})` }} />
                  <p className="text-gray-300 mb-6 leading-relaxed">{t.text}</p>
                  <div className="border-t border-white/10 pt-4">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <h3 className="text-3xl font-black mb-4">{settings.storeName}<span style={{ color: settings.accentColor }}>.</span></h3>
              <p className="text-gray-500 text-sm max-w-md">A creative agency that turns bold ideas into impactful digital experiences.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest" style={{ color: settings.accentColor }}>Links</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#work" className="hover:text-white transition">Work</a></li>
                <li><a href="#capabilities" className="hover:text-white transition">Capabilities</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest" style={{ color: settings.accentColor }}>Contact</h4>
              <div className="space-y-2 text-sm text-gray-500">
                {settings.phone && <p>{settings.phone}</p>}
                {settings.email && <p>{settings.email}</p>}
                {settings.address && <p>{settings.address}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
