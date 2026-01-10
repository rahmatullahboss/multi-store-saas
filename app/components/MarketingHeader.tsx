
import { useState } from 'react';
import { Link, useLocation } from '@remix-run/react';
import { Store, Menu, X, ArrowLeft, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagneticButton } from '~/components/animations';
import { useLanguage } from '~/contexts/LanguageContext';

export function MarketingHeader({ showBackToHome = false }: { showBackToHome?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { lang, toggleLang } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#006A4E] to-[#00875F] rounded-xl flex items-center justify-center shadow-lg shadow-[#006A4E]/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white hidden sm:block">
              Multi-Store
            </span>
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
                    প্রাইসিং
                  </Link>
                )}
                {!isActive('/tutorials') && (
                  <Link 
                    to="/tutorials" 
                    className={`hidden md:block font-medium text-sm px-3 py-2 transition ${
                      isActive('/tutorials') ? 'text-[#00875F]' : 'text-white/60 hover:text-[#00875F]'
                    }`}
                  >
                    টিউটোরিয়াল
                  </Link>
                )}
                <Link 
                  to="/auth/login" 
                  className="hidden sm:block text-white/60 hover:text-white font-medium text-sm px-4 py-2 transition"
                >
                  লগইন
                </Link>
                <MagneticButton>
                  <Link 
                    to="/auth/register" 
                    className="hidden sm:inline-block px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
                  >
                    ফ্রি শুরু করুন
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
                  হোমে ফিরে যান
                </Link>
                 <MagneticButton>
                  <Link 
                    to="/auth/register" 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-[#006A4E]/25"
                  >
                    ফ্রি শুরু করুন
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
                      প্রাইসিং
                    </Link>
                    <Link 
                      to="/tutorials" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/tutorials') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      টিউটোরিয়াল
                    </Link>
                    <Link 
                      to="/about" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/about') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      আমাদের সম্পর্কে
                    </Link>
                    <Link 
                      to="/contact" 
                      className={`font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition ${
                        isActive('/contact') ? 'text-[#00875F]' : 'text-white/70 hover:text-[#00875F]'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      যোগাযোগ
                    </Link>
                    <Link 
                      to="/auth/login" 
                      className="text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      লগইন
                    </Link>
                  </>
                ) : (
                   <Link 
                      to="/" 
                      className="text-white/70 hover:text-white font-medium text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      হোমে ফিরে যান
                    </Link>
                )}
                
                <Link 
                  to="/auth/register" 
                  className="px-4 py-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] text-white font-semibold rounded-xl text-sm text-center shadow-lg shadow-[#006A4E]/25"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ফ্রি শুরু করুন
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
