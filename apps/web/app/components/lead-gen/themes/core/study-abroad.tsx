/**
 * Study Abroad Theme - Dynamic Version with Animations
 * Education consultancy with destination cards, university partners, team, and more
 * All content is now editable via admin settings
 * Enhanced with scroll animations and interactive country logos
 */

import { useState, useEffect, useRef } from 'react';
import { LeadCaptureForm, WhatsAppFloatingButton, type LeadGenThemeProps } from '../shared';

// Country data with flag emojis and colors
const COUNTRIES = [
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    color: '#FFD700',
    desc: 'World-class universities & PR opportunities',
  },
  {
    id: 'canada',
    name: 'Canada',
    flag: '🇨🇦',
    color: '#FF6B6B',
    desc: 'Affordable education & work permits',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    flag: '🇬🇧',
    color: '#4169E1',
    desc: 'Historic universities & 2-year PSW',
  },
  {
    id: 'usa',
    name: 'USA',
    flag: '🇺🇸',
    color: '#4A90E2',
    desc: 'Top-ranked universities & scholarships',
  },
  {
    id: 'germany',
    name: 'Germany',
    flag: '🇩🇪',
    color: '#F4D03F',
    desc: 'Free tuition & strong job market',
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    color: '#E74C3C',
    desc: 'Affordable living & quality education',
  },
  {
    id: 'sweden',
    name: 'Sweden',
    flag: '🇸🇪',
    color: '#3498DB',
    desc: 'Innovation hub & english programs',
  },
  {
    id: 'ireland',
    name: 'Ireland',
    flag: '🇮🇪',
    color: '#27AE60',
    desc: 'Post-study work visa & EU access',
  },
];

// Hook for scroll-triggered animations
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Default Malaysian university logos (from tawakkulmalaysia.com reference)
const DEFAULT_UNIVERSITY_LOGOS = [
  {
    name: 'Sunway University',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Sunway_University_logo.svg/1200px-Sunway_University_logo.svg.png',
  },
  { name: 'MSU', logo: 'https://www.msu.edu.my/wp-content/uploads/2021/01/MSU-Logo-2021.png' },
  { name: 'UTMSPACE', logo: 'https://space.utm.my/wp-content/uploads/2022/09/UTMSPACE-LOGO.png' },
  { name: 'Heriot-Watt', logo: 'https://www.hw.ac.uk/themes/custom/hwum/assets/img/logo.svg' },
  { name: 'Southampton', logo: 'https://www.southampton.ac.uk/assets/images/logo-white.svg' },
  {
    name: 'Curtin Malaysia',
    logo: 'https://www.curtin.edu.my/wp-content/uploads/2021/08/Curtin-Logo.png',
  },
  {
    name: 'Swinburne',
    logo: 'https://www.swinburne.edu.my/wp-content/uploads/2021/07/swinburne-logo.png',
  },
  { name: 'IMU', logo: 'https://www.imu.edu.my/wp-content/uploads/2021/01/IMU-Logo.png' },
  {
    name: 'Nilai University',
    logo: 'https://www.nilai.edu.my/wp-content/uploads/2021/01/nilai-logo.png',
  },
  { name: 'UOW Malaysia', logo: 'https://www.uow.edu.my/wp-content/uploads/2021/01/uow-logo.png' },
  { name: 'Newcastle', logo: 'https://www.ncl.ac.uk/media/wwwnclacuk/websitedemo/images/logo.svg' },
  {
    name: 'Universiti Malaya',
    logo: 'https://www.um.edu.my/wp-content/uploads/2021/01/um-logo.png',
  },
];

export default function StudyAbroadRenderer({ settings, customer }: LeadGenThemeProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Use settings with fallbacks to empty arrays if not defined
  const destinations = settings.destinations || [];
  const services = settings.services || [];
  const whyChoosePoints = settings.whyChoosePoints || [];
  const processSteps = settings.processSteps || [];
  const successStories = settings.successStories || [];
  const teamMembers = settings.teamMembers || [];
  const universityLogos =
    settings.universityLogos?.length > 0 ? settings.universityLogos : DEFAULT_UNIVERSITY_LOGOS;
  const whyStudyPoints = settings.whyStudyPoints || [];
  const otherCountries = settings.otherCountries || [];
  const quickLinks = settings.quickLinks || [];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Global Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slide-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        
        .animate-slide-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: -3s;
        }
        
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }
        
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
        
        .country-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .country-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        
        .country-card:hover .country-flag {
          transform: scale(1.2) rotate(5deg);
        }
        
        .country-flag {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid currentColor;
          animation: pulse-ring 2s ease-out infinite;
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .scroll-hidden {
          opacity: 0;
          transform: translateY(30px);
        }
        
        .scroll-visible {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
      `}</style>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:ring-2 focus:ring-blue-600"
      >
        Skip to main content
      </a>

      {/* Announcement Banner */}
      {settings.showAnnouncement && settings.announcementText && (
        <div
          className="px-4 py-2 text-center text-sm font-semibold text-white"
          style={{ backgroundColor: settings.accentColor }}
        >
          {settings.announcementText}
        </div>
      )}

      {/* Header - Glassmorphism & Premium Feel */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            {settings.logo ? (
              <img
                className="h-10 w-auto object-contain"
                src={settings.logo}
                alt={settings.storeName}
              />
            ) : (
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: settings.primaryColor }}
              >
                {settings.storeName}
              </span>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            {destinations.length > 0 && (
              <a
                href="#destinations"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
              >
                Destinations
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ color: settings.primaryColor }}
                />
              </a>
            )}
            {services.length > 0 && (
              <a
                href="#services"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
              >
                Services
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ color: settings.primaryColor }}
                />
              </a>
            )}
            {processSteps.length > 0 && (
              <a
                href="#process"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
              >
                Process
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ color: settings.primaryColor }}
                />
              </a>
            )}
            {teamMembers.length > 0 && (
              <a
                href="#team"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
              >
                Team
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ color: settings.primaryColor }}
                />
              </a>
            )}
            <a
              href="#contact"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors relative group"
            >
              Contact
              <span
                className="absolute inset-x-0 bottom-0 h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                style={{ color: settings.primaryColor }}
              />
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {customer ? (
              <a
                href="/lead-dashboard"
                className="px-6 py-2.5 rounded-full text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <span>Dashboard</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            ) : (
              <>
                <a
                  href="/lead-gen/auth/login"
                  className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                >
                  Login
                </a>
                <a
                  href="/lead-gen/auth/register"
                  className="px-6 py-2.5 rounded-full text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              type="button"
              aria-label="Open menu"
              className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setMobileMenuOpen(true)}
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay - Smooth Slide-in */}
      <div
        className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl p-6 flex flex-col transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center mb-8">
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: settings.primaryColor }}
            >
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col space-y-4">
            {destinations.length > 0 && (
              <a
                href="#destinations"
                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Destinations
              </a>
            )}
            {services.length > 0 && (
              <a
                href="#services"
                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
            )}
            {processSteps.length > 0 && (
              <a
                href="#process"
                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </a>
            )}
            {teamMembers.length > 0 && (
              <a
                href="#team"
                className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Team
              </a>
            )}
            <a
              href="#contact"
              className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors py-2 border-b border-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-3">
            {customer ? (
              <a
                href="/lead-dashboard"
                className="w-full py-3.5 rounded-xl text-white font-semibold text-center shadow-lg active:scale-95 transition-transform"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/lead-gen/auth/login"
                  className="w-full py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-center hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Login
                </a>
                <a
                  href="/lead-gen/auth/register"
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-center shadow-lg active:scale-95 transition-all"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section - Redesigned */}
      <main id="main-content">
        <section className="relative bg-white overflow-hidden pb-12 pt-8 lg:pt-20">
          {/* Background Decorations */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: settings.primaryColor }}
          />
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl"
            style={{ backgroundColor: settings.accentColor }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                {/* Hero Badge */}
                {settings.heroBadge && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 bg-white/80 border border-gray-200 shadow-sm backdrop-blur-sm self-start mx-auto lg:mx-0">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: settings.primaryColor }}
                    ></span>
                    <span className="text-gray-700">{settings.heroBadge}</span>
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 leading-[1.15]">
                  {settings.heroHeading}
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {settings.heroDescription}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href="#contact"
                    className="px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {settings.ctaButtonText}
                  </a>
                  {destinations.length > 0 && (
                    <a
                      href="#destinations"
                      className="px-8 py-4 rounded-xl bg-white text-gray-800 font-bold text-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                    >
                      Explore Countries
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Form / Hero Image Area */}
              <div id="contact" className="relative mt-8 lg:mt-0">
                {/* Decorative blobs behind form */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full opacity-20 blur-3xl -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                  }}
                />

                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/50">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg animate-bounce duration-[3000ms]">
                    <span className="text-2xl">🎓</span>
                  </div>

                  <div className="text-left mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Get Free Consultation</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Chat with our expert counselors today.
                    </p>
                  </div>

                  <LeadCaptureForm
                    formId="study-abroad-hero"
                    submitButtonText="Book Free Appointment"
                    primaryColor={settings.primaryColor}
                  />

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Your information is 100% secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                {[...universityLogos, ...universityLogos].map((item, i) => {
                  const logoUrl = typeof item === 'string' ? item : item.logo;
                  const logoName = typeof item === 'string' ? 'University' : item.name;
                  return (
                    <div
                      key={i}
                      className="flex-shrink-0 h-20 w-48 bg-white rounded-lg shadow-sm flex items-center justify-center px-4 hover:shadow-md transition-shadow"
                    >
                      {logoUrl && logoUrl.startsWith('http') ? (
                        <img
                          src={logoUrl}
                          alt={logoName}
                          className="max-h-16 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold text-sm text-center">
                          {logoName}
                        </span>
                      )}
                    </div>
                  );
                })}
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
            @media (prefers-reduced-motion: reduce) {
              .animate-scroll {
                animation: none;
              }
            }
          `}</style>
          </section>
        )}

        {/* Study Destinations - Country Flags */}
        {settings.showDestinations && (
        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                style={{
                  backgroundColor: `${settings.primaryColor}15`,
                  color: settings.primaryColor,
                }}
              >
                <span className="animate-pulse">🌍</span>
                Popular Destinations
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Study in Your Dream Country
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                We help students get admitted to top universities across the globe with scholarship
                opportunities.
              </p>
            </div>

            {/* Country Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {COUNTRIES.map((country, idx) => (
                <div
                  key={country.id}
                  className="country-card group bg-white rounded-2xl p-6 border border-gray-100 cursor-pointer"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-center">
                    <div
                      className="country-flag w-20 h-20 mx-auto mb-4 text-5xl flex items-center justify-center rounded-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${country.color}20, ${country.color}40)`,
                        boxShadow: `0 8px 32px ${country.color}30`,
                      }}
                    >
                      {country.flag}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{country.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{country.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Why Choose Us Section - Modern Grid */}
        {settings.showWhyChoose && whyChoosePoints.length > 0 && (
          <section
            id="why-us"
            className="py-24 relative overflow-hidden"
            style={{
              background: `linear-gradient(170deg, ${settings.primaryColor} 0%, ${settings.accentColor || settings.primaryColor} 100%)`,
            }}
          >
            {/* Organic Shapes */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16 lg:mb-20">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Why Students Choose Us?
                </h2>
                <p className="text-lg md:text-xl text-blue-50/90 max-w-2xl mx-auto leading-relaxed">
                  Thousands of students trust us for our transparency, expertise, and proven track
                  record of success.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {whyChoosePoints
                  .filter((p) => p.enabled)
                  .map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/15 hover:-translate-y-2 transition-all duration-300 group"
                    >
                      <div className="text-4xl mb-6 bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">
                        {item.icon || '✓'}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">
                        {item.text}
                      </h3>
                      <div className="h-1 w-12 bg-white/30 rounded-full group-hover:w-full transition-all duration-500" />
                    </div>
                  ))}
              </div>

              {/* Enhanced CTA */}
              <div className="text-center mt-16">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white font-bold text-lg rounded-2xl shadow-2xl hover:bg-gray-50 hover:-translate-y-1 hover:shadow-white/20 transition-all duration-300 group"
                  style={{ color: settings.primaryColor }}
                >
                  Get Free Consultation
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Services Section - Clean & Modern */}
        {settings.showServices && services.length > 0 && (
          <section id="services" className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Our Services</h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                  We provide end-to-end assistance from university selection to visa processing and
                  landing support.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services
                  .filter((s) => s.enabled)
                  .map((service, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 border border-gray-100/50"
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${settings.primaryColor}10` }}
                      >
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        {service.description}
                      </p>

                      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                        View Details
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Process Section - Visual Timeline */}
        {settings.showProcess && processSteps.length > 0 && (
          <section id="process" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  How It Works
                </span>
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Your Journey to Success
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  A simple, transparent, and guided process to help you reach your dream university.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-gray-100 z-0 mx-16" />

                {processSteps.map((step, idx) => (
                  <div key={idx} className="relative z-10 group">
                    <div className="text-center">
                      <div
                        className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-3xl font-bold border-4 border-gray-50 shadow-xl mb-8 group-hover:scale-110 transition-transform duration-300"
                        style={{
                          color: settings.primaryColor,
                          boxShadow: `0 0 0 4px ${settings.primaryColor}20`,
                        }}
                      >
                        {step.number}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-500 leading-relaxed text-sm px-4">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Success Stories / Testimonials - Floating Cards */}
        {settings.showTestimonials && successStories.length > 0 && (
          <section className="py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Success Stories
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  Join thousands of students who have successfully placed in top universities
                  worldwide.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {successStories.map((story, i) => (
                  <div
                    key={i}
                    className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 relative"
                  >
                    <div
                      className="absolute top-8 right-8 text-6xl opacity-10 font-serif"
                      style={{ color: settings.primaryColor }}
                    >
                      "
                    </div>
                    <p className="text-gray-600 italic mb-8 relative z-10 leading-relaxed">
                      "{story.text}"
                    </p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-gray-50"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        {story.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{story.name}</div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: settings.primaryColor }}
                        >
                          {story.program}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{story.university}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Team / Counselors - Professional Profiles */}
        {settings.showTeam && teamMembers.length > 0 && (
          <section id="team" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Meet Our Experts
                </h2>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                  Certified counselors dedicated to guiding you through every step of your journey.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-10">
                {teamMembers.map((member, idx) => (
                  <div key={idx} className="group text-center">
                    <div className="relative inline-block mb-6">
                      <div
                        className="w-48 h-48 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-5xl font-bold text-gray-400 overflow-hidden relative z-10 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-300"
                        style={{
                          backgroundColor: `${settings.primaryColor}10`,
                          color: settings.primaryColor,
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div
                        className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ backgroundColor: settings.primaryColor }}
                      ></div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                    <p
                      className="font-semibold mb-4 uppercase tracking-wider text-xs"
                      style={{ color: settings.primaryColor }}
                    >
                      {member.role}
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                      {member.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
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
                  Beyond our primary focus, we also help students explore other premium
                  destinations.
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
        {settings.showWhyStudy && whyStudyPoints.length > 0 && (
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

        {/* FAQ Section - Lead Gen Best Practice */}
        {settings.showFAQ && settings.faqs && settings.faqs.length > 0 && (
          <section className="py-20 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-500">
                  Get answers to common questions about studying abroad.
                </p>
              </div>
              <div className="space-y-4">
                {settings.faqs
                  .filter((f) => f.enabled)
                  .map((faq, idx) => (
                    <details
                      key={idx}
                      className="group bg-white rounded-xl shadow-sm overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                        {faq.question}
                        <span className="ml-4 flex-shrink-0 transition-transform group-open:rotate-180">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
                    </details>
                  ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer - Modern & Responsive */}
      <footer className="bg-gray-900 text-white py-16 lg:py-24 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-white">{settings.storeName}</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {settings.footerDescription ||
                  'Empowering students to achieve their global education dreams through expert guidance and personalized support since 2008.'}
              </p>
              <div className="flex gap-4">{/* Social placeholders could go here */}</div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg tracking-wide text-white">Quick Links</h3>
              <ul className="space-y-4 text-gray-400">
                {quickLinks.slice(0, 4).map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      className="hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-white transition-colors"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg tracking-wide text-white">Top Destinations</h3>
              <ul className="space-y-4 text-gray-400">
                {destinations
                  .filter((d) => d.enabled)
                  .slice(0, 4)
                  .map((dest, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="hover:text-white transition-colors flex items-center gap-2 group"
                      >
                        <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">
                          🌍
                        </span>
                        {dest.title.replace('Study in ', '')}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg tracking-wide text-white">Contact Us</h3>
              <div className="text-gray-400 space-y-4">
                {settings.phone && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <p>{settings.phone}</p>
                  </div>
                )}
                {settings.email && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <p>{settings.email}</p>
                  </div>
                )}
                {settings.address && (
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 mt-1 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p>{settings.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {settings.showPrivacyPolicy !== false && (
                <a href="/lead-gen/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              )}
              {settings.showTermsOfService !== false && (
                <a href="/lead-gen/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              )}
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
