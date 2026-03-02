'use client';

import { useState } from 'react';
import { useLocation } from '@remix-run/react';
import { Store, Menu, X, ArrowLeft, Globe } from 'lucide-react';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { ASSETS } from '@/config/assets';

export function MarketingHeader({ showBackToHome = false }: { showBackToHome?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = useLocation().pathname;
  const { lang, setLang, t } = useTranslation();

  const isActive = (path: string) => pathname === path;
  const toggleLang = () => setLang(lang === 'en' ? 'bn' : 'en');

  return (
    <header
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl animate-fade-in-down"
    >
      <div className="relative bg-[#0A0A0F]/70 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-3 shadow-[0_8px_32px_rgb(0_0_0/0.4)] overflow-hidden">
        {/* Subtle top shine */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
        
        <div className="flex items-center justify-between relative z-10">
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#006A4E]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={ASSETS.brand.logoWhite}
                alt="Ozzyl"
                className="h-10 w-auto relative z-10 py-1"
                width="103"
                height="40"
              />
            </div>
          </a>

          <div className="flex items-center gap-3">
            {!showBackToHome ? (
              <>
                {!isActive('/features') && (
                  <a href="/features"
                    className={`hidden md:block font-medium text-sm px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive('/features') ? 'text-[#00875F] bg-[#00875F]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t('navFeatures')}
                  </a>
                )}
                {!isActive('/integrations') && (
                  <a href="/integrations"
                    className={`hidden md:block font-medium text-sm px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive('/integrations') ? 'text-[#00875F] bg-[#00875F]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t('navIntegrations')}
                  </a>
                )}
                {!isActive('/pricing') && (
                  <a href="/pricing"
                    className={`hidden md:block font-medium text-sm px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive('/pricing') ? 'text-[#00875F] bg-[#00875F]/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t('navBilling')}
                  </a>
                )}
                {!isActive('/tutorials') && (
                  <a href="/tutorials"
                    className={`hidden md:block font-medium text-sm px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive('/tutorials')
                        ? 'text-[#00875F] bg-[#00875F]/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t('navTutorials')}
                  </a>
                )}
                
                {/* Language Toggle - Hidden */}
                {/* <button
                  onClick={toggleLang}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-medium transition-all group border border-white/5 hover:border-white/10"
                  title={lang === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
                >
                  <Globe className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="relative top-[1px]">{lang === 'en' ? 'EN' : 'BN'}</span>
                </button> */}

                <a href="https://app.ozzyl.com/auth/login"
                  className="hidden sm:block text-white/70 hover:text-white font-medium text-sm px-5 py-2 transition-colors relative hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-xl"
                >
                  {t('login')}
                </a>
                
                <MagneticButton>
                  <a href="https://app.ozzyl.com/auth/register"
                    className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,106,78,0.3)] hover:shadow-[0_4px_25px_rgba(0,106,78,0.5)] active:scale-[0.98]"
                  >
                    {t('register')}
                  </a>
                </MagneticButton>
              </>
            ) : (
              // Back to Home mode
              <>
                <a href="/"
                  className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToHome')}
                </a>
                {/* Divider and Language Toggle - Hidden */}
                {/* <div className="h-6 w-[1px] bg-white/10 hidden sm:block mx-1" />
                
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-medium transition-all group border border-white/5 hover:border-white/10"
                  title={lang === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
                >
                  <Globe className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="relative top-[1px]">{lang === 'en' ? 'EN' : 'BN'}</span>
                </button> */}

                <MagneticButton>
                  <a href="https://app.ozzyl.com/auth/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    {t('register')}
                  </a>
                </MagneticButton>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition active:scale-95"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-white/10 overflow-hidden animate-fade-in">
            <div className="flex flex-col gap-2 pb-2">
                {!showBackToHome ? (
                  <>
                    <a href="/features"
                      className={`font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center justify-between group ${
                        isActive('/features') ? 'text-[#00875F] bg-[#00875F]/5' : 'text-white/70 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navFeatures')}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                    </a>
                    <a href="/integrations"
                      className={`font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center justify-between group ${
                        isActive('/integrations') ? 'text-[#00875F] bg-[#00875F]/5' : 'text-white/70 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navIntegrations')}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                    </a>
                    <a href="/pricing"
                      className={`font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center justify-between group ${
                        isActive('/pricing') ? 'text-[#00875F] bg-[#00875F]/5' : 'text-white/70 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navBilling')}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                    </a>
                    <a href="/tutorials"
                      className={`font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center justify-between group ${
                        isActive('/tutorials') ? 'text-[#00875F] bg-[#00875F]/5' : 'text-white/70 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navTutorials')}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                    </a>
                    <a href="/contact"
                      className={`font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center justify-between group ${
                        isActive('/contact')
                          ? 'text-[#00875F] bg-[#00875F]/5'
                          : 'text-white/70 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('contactSupport')}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                    </a>
                    <div className="h-[1px] bg-white/5 my-1" />
                    <a href="https://app.ozzyl.com/auth/login"
                      className="text-white/70 hover:text-white font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('login')}
                    </a>
                  </>
                ) : (
                  <a href="/"
                    className="text-white/70 hover:text-white font-medium text-sm px-4 py-3 rounded-xl hover:bg-white/5 transition flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToHome')}
                  </a>
                )}

                <a href="https://app.ozzyl.com/auth/register"
                  className="mx-2 px-4 py-3 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-bold rounded-xl text-sm text-center shadow-lg shadow-[#006A4E]/25 mt-1 active:scale-[0.98] transition-transform"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('register')}
                </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
