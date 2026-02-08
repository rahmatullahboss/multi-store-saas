/**
 * Nova Lux Ultra Header Component
 *
 * Ultra-premium header with:
 * - Glassmorphism effect with dynamic blur
 * - Scroll-triggered animations
 * - Micro-interactions on nav items
 * - Premium hover states with gold accents
 * - Magnetic button effects
 */

import { ShoppingBag, Search, Menu, X, Sparkles } from 'lucide-react';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useCartCount } from '~/hooks/useCartCount';
import { useTranslation } from '~/contexts/LanguageContext';
import { NOVALUX_ULTRA_THEME } from '../theme';
import { LanguageSelector } from '../../shared/LanguageSelector';
import type { ThemeConfig } from '@db/types';

interface NovaLuxUltraHeaderProps {
  storeName: string;
  logo?: string | null;
  config?: ThemeConfig | null;
  currentCategory?: string | null;
  categories: (string | null)[];
  isPreview?: boolean;
}

export function NovaLuxUltraHeader({
  storeName,
  logo,
  config,
  currentCategory,
  categories,
  isPreview,
}: NovaLuxUltraHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const { t } = useTranslation();
  const count = useCartCount();
  const headerRef = useRef<HTMLElement>(null);

  // Scroll-based animations
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );
  const headerBlur = useTransform(scrollY, [0, 100], [0, 20]);
  const headerBorder = useTransform(scrollY, [0, 100], ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.06)']);

  const validCategories = categories.filter((c): c is string => Boolean(c));
  const announcement = config?.announcement;

  const navItems = [
    { label: t('allProducts'), href: '/', active: !currentCategory },
    ...validCategories.slice(0, 3).map((cat) => ({
      label: cat,
      href: `/?category=${encodeURIComponent(cat)}`,
      active: currentCategory === cat,
    })),
  ];

  return (
    <>
      {/* Announcement Bar - Premium Gold */}
      <AnimatePresence>
        {announcement?.text && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
            style={{
              background: NOVALUX_ULTRA_THEME.accentGradient,
              position: 'relative',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: [
                  'linear-gradient(90deg, transparent 0%, transparent 100%)',
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  'linear-gradient(90deg, transparent 0%, transparent 100%)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center gap-3 text-sm font-medium">
                <Sparkles className="w-4 h-4" style={{ color: NOVALUX_ULTRA_THEME.primary }} />
                {announcement.link ? (
                  <a
                    href={announcement.link}
                    className="hover:underline transition-all"
                    style={{ color: NOVALUX_ULTRA_THEME.primary }}
                  >
                    {announcement.text}
                  </a>
                ) : (
                  <span style={{ color: NOVALUX_ULTRA_THEME.primary }}>{announcement.text}</span>
                )}
                <Sparkles className="w-4 h-4" style={{ color: NOVALUX_ULTRA_THEME.primary }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <motion.header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          top: announcement?.text ? 44 : 0,
          backgroundColor: headerBg,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: `1px solid ${headerBorder}`,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Mobile Menu Button - Animated */}
            <motion.button
              className="lg:hidden p-3 rounded-xl transition-all"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: NOVALUX_ULTRA_THEME.text }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Left Navigation - Desktop with Micro-interactions */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onHoverStart={() => setActiveNavItem(item.label)}
                  onHoverEnd={() => setActiveNavItem(null)}
                  className="relative"
                >
                  <PreviewSafeLink
                    to={item.href}
                    className="relative px-5 py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 block"
                    style={{
                      color: item.active ? NOVALUX_ULTRA_THEME.accent : NOVALUX_ULTRA_THEME.text,
                      fontFamily: NOVALUX_ULTRA_THEME.fontBody,
                    }}
                    isPreview={isPreview}
                  >
                    {item.label}

                    {/* Hover underline animation */}
                    <motion.span
                      className="absolute bottom-2 left-5 right-5 h-0.5 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{
                        scaleX: activeNavItem === item.label || item.active ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      style={{
                        background: NOVALUX_ULTRA_THEME.accentGradient,
                        transformOrigin: 'left',
                      }}
                    />

                    {/* Gold glow on hover */}
                    {activeNavItem === item.label && (
                      <motion.span
                        className="absolute inset-0 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          background: NOVALUX_ULTRA_THEME.goldGlow,
                        }}
                      />
                    )}
                  </PreviewSafeLink>
                </motion.div>
              ))}
            </nav>

            {/* Logo - Center with Crown Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <PreviewSafeLink
                to="/"
                className="flex items-center justify-center gap-2 group"
                isPreview={isPreview}
              >
                {logo && (
                  <motion.img
                    src={logo}
                    alt={storeName}
                    className="h-12 lg:h-14 object-contain rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span
                  className="text-2xl lg:text-3xl font-semibold tracking-wider"
                  style={{
                    fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                    color: NOVALUX_ULTRA_THEME.text,
                  }}
                >
                  {storeName}
                </span>
              </PreviewSafeLink>
            </motion.div>

            {/* Right Navigation - Icons with hover effects */}
            <div className="flex items-center gap-2">
              <LanguageSelector className="mr-1" />

              {/* Search Button */}
              <motion.button
                className="p-3 rounded-xl transition-all"
                whileHover={{
                  scale: 1.1,
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(!searchOpen)}
                style={{ color: NOVALUX_ULTRA_THEME.text }}
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Cart Button with Badge Animation */}
              <PreviewSafeLink
                to="/cart"
                className="relative p-3 rounded-xl transition-all"
                isPreview={isPreview}
              >
                <motion.div
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl -m-3"
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: NOVALUX_ULTRA_THEME.text }} />
                </motion.div>

                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 25,
                      }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                      style={{
                        background: NOVALUX_ULTRA_THEME.accentGradient,
                        color: NOVALUX_ULTRA_THEME.primary,
                        boxShadow: NOVALUX_ULTRA_THEME.buttonShadow,
                      }}
                    >
                      {count > 99 ? '99+' : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </PreviewSafeLink>
            </div>
          </div>
        </div>

        {/* Search Bar - Slide down */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden border-t"
              style={{ borderColor: NOVALUX_ULTRA_THEME.border }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder={t('searchProducts')}
                    className="w-full px-6 py-4 rounded-2xl border-2 text-base transition-all duration-300 focus:outline-none"
                    style={{
                      borderColor: NOVALUX_ULTRA_THEME.border,
                      fontFamily: NOVALUX_ULTRA_THEME.fontBody,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = NOVALUX_ULTRA_THEME.accent;
                      e.target.style.boxShadow = NOVALUX_ULTRA_THEME.glowShadow;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = NOVALUX_ULTRA_THEME.border;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <Search
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: NOVALUX_ULTRA_THEME.textMuted }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              top: announcement?.text ? 44 : 0,
            }}
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <PreviewSafeLink
                    to={item.href}
                    className="text-3xl font-medium tracking-wider transition-all duration-300 hover:opacity-70"
                    style={{
                      color: item.active ? NOVALUX_ULTRA_THEME.accent : NOVALUX_ULTRA_THEME.text,
                      fontFamily: NOVALUX_ULTRA_THEME.fontHeading,
                    }}
                    isPreview={isPreview}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </PreviewSafeLink>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div style={{ height: announcement?.text ? 124 : 80 }} />
    </>
  );
}
