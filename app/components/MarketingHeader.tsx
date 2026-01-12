
import { useState } from 'react';
import { Link, useLocation } from '@remix-run/react';
import { Store, Menu, X, ArrowLeft, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from '~/components/animations';
import { useLanguage } from '~/contexts/LanguageContext';

export function MarketingHeader({ showBackToHome = false }: { showBackToHome?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { lang, toggleLang, t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-1.5 shadow-lg">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/brand/logo-white.png" alt="Ozzyl" className="h-12 w-auto" />
          </Link>
          
          <div className="flex items-center gap-3">
            {!showBackToHome ? (
              <>
                {!isActive('/pricing') && (
                  <Link 
                    to="/pricing" 
                    className={`hidden md:block font-medium text-sm px-3 py-2 transition ${
                      isActive('/pricing') ? 'text-[#00875F]' : 'text-white/60 hover:text-[#00875F]'
                    }`}
                  >
                    {t('navBilling')}
                  </Link>
                )}
                {!isActive('/tutorials') && (
                  <Link 
                    to="/tutorials" 
                    className={`hidden md:block font-medium text-sm px-3 py-2 transition ${
                      isActive('/tutorials') ? 'text-[#00875F]' : 'text-white/60 hover:text-[#00875F]'
                    }`}
                  >
                    {t('navTutorials')}
                  </Link>
                )}
                {/* Language Toggle */}
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-sm font-medium transition border border-white/10"
                  title={lang === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
                >
                  <Globe className="w-4 h-4" />
                  {lang === 'en' ? 'EN' : 'BN'}
                </button>
                <Link 
                  to="/auth/login" 
                  className="hidden sm:block text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
                >
                  {t('login')}
                </Link>
                <MagneticButton>
                  <Link 
                    to="/auth/register" 
                    className="hidden sm:inline-block px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
                  >
                    {t('register')}
                  </Link>
                </MagneticButton>
              </>
            ) : (
              // Back to Home mode (for specific pages if needed, though usually standard nav is better)
              <>
                   <Link 
                  to="/" 
                  className="hidden sm:flex items-center gap-2 text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToHome')}
                </Link>
                 {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] hover:bg-[#EBEDF0] rounded-xl text-sm font-medium transition text-[#475569] border border-[#EBEDF0]"
                title={lang === 'en' ? 'Switch to Bengali' : 'ইংরেজিতে পরিবর্তন করুন'}
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'EN' : 'BN'}
              </button>   <MagneticButton>
                  <Link 
                    to="/auth/register" 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
                  >
                    {t('register')}
                  </Link>
                </MagneticButton>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden mt-4 pt-4 border-t border-white/10"
            >
              <div className="flex flex-col gap-2">
                {!showBackToHome ? (
                  <>
                    <Link 
                      to="/pricing" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/pricing') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navBilling')}
                    </Link>
                    <Link 
                      to="/tutorials" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/tutorials') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('navTutorials')}
                    </Link>
                    <Link 
                      to="/about" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/about') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('sidebarSettings')}
                    </Link>
                    <Link 
                      to="/contact" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/contact') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('contactSupport')}
                    </Link>
                    <Link 
                      to="/auth/login" 
                      className="text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('login')}
                    </Link>
                  </>
                ) : (
                   <Link 
                      to="/" 
                      className="text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('backToHome')}
                    </Link>
                )}
                
                <Link 
                  to="/auth/register" 
                  className="px-4 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-semibold rounded-xl text-sm text-center shadow-lg shadow-[#006A4E]/25"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('register')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
