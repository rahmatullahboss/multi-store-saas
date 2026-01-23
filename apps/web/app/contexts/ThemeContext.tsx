/**
 * Theme Context for Marketing Landing Page
 * 
 * Enables components to access and respond to theme changes
 * without prop drilling through the component tree.
 */

import { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  defaultTheme = 'dark' 
}: { 
  children: ReactNode; 
  defaultTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility to get theme-specific classes
export function getThemeClasses(isDark: boolean) {
  return {
    // Backgrounds
    bgBase: isDark ? 'bg-[#0A0A0F]' : 'bg-[#FAFBFC]',
    bgSurface1: isDark ? 'bg-white/5' : 'bg-white',
    bgSurface2: isDark ? 'bg-white/10' : 'bg-[#F4F5F7]',
    bgSurface3: isDark ? 'bg-white/15' : 'bg-[#EBEDF0]',
    
    // Text
    textPrimary: isDark ? 'text-white' : 'text-[#0F172A]',
    textSecondary: isDark ? 'text-white/70' : 'text-[#475569]',
    textTertiary: isDark ? 'text-white/50' : 'text-[#94A3B8]',
    textMuted: isDark ? 'text-white/40' : 'text-[#CBD5E1]',
    
    // Brand Colors
    primaryGradient: isDark 
      ? 'from-violet-500 to-blue-600' 
      : 'from-[#006A4E] to-[#059669]',
    primaryBg: isDark 
      ? 'bg-gradient-to-br from-violet-500 to-blue-600' 
      : 'bg-gradient-to-br from-[#006A4E] to-[#059669]',
    primaryShadow: isDark 
      ? 'shadow-violet-500/30' 
      : 'shadow-[0_4px_14px_rgba(0,106,78,0.25)]',
    
    // Glass/Cards
    glassCard: isDark
      ? 'bg-white/5 backdrop-blur-xl border border-white/10'
      : 'bg-white/80 backdrop-blur-xl border border-[#EBEDF0] shadow-[0_4px_20px_rgba(0,0,0,0.04)]',
    
    // Card shadows
    cardShadow: isDark
      ? 'shadow-lg'
      : 'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]',
    cardHoverShadow: isDark
      ? 'hover:shadow-xl'
      : 'hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]',
    
    // Borders
    border: isDark ? 'border-white/10' : 'border-[#EBEDF0]',
    borderSubtle: isDark ? 'border-white/5' : 'border-[#F4F5F7]',
    
    // Buttons
    btnPrimary: isDark
      ? 'bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25'
      : 'bg-gradient-to-r from-[#006A4E] to-[#059669] hover:from-[#005740] hover:to-[#047857] text-white shadow-[0_4px_14px_rgba(0,106,78,0.25)]',
    btnSecondary: isDark
      ? 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
      : 'bg-[#F4F5F7] hover:bg-[#EBEDF0] text-[#475569] border border-[#EBEDF0]',
    btnGhost: isDark
      ? 'text-white/60 hover:text-white'
      : 'text-[#475569] hover:text-[#0F172A]',
    
    // CTA
    ctaGradient: isDark
      ? 'from-amber-400 to-orange-500'
      : 'from-[#D97706] to-[#B45309]',
    ctaShadow: isDark
      ? 'shadow-amber-500/30'
      : 'shadow-[0_4px_14px_rgba(217,119,6,0.25)]',
    
    // Accent backgrounds
    accentBg: isDark
      ? 'bg-gradient-to-br from-violet-500/10 to-blue-500/10'
      : 'bg-gradient-to-br from-[#006A4E]/5 to-[#059669]/5',
    
    // Section styling
    sectionAlt: isDark
      ? 'bg-[#0D0D12]'
      : 'bg-white',
    
    // Footer
    footerBg: isDark ? 'bg-[#050508]' : 'bg-[#0F172A]',
  };
}

// Colors object for inline styles
export function getThemeColors(isDark: boolean) {
  return {
    primary: isDark ? '#8B5CF6' : '#006A4E',
    primaryHover: isDark ? '#7C3AED' : '#005740',
    accent: isDark ? '#3B82F6' : '#059669',
    cta: isDark ? '#F9A825' : '#D97706',
    success: isDark ? '#10B981' : '#059669',
    error: isDark ? '#EF4444' : '#DC2626',
    
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? 'rgba(255,255,255,0.7)' : '#475569',
    textTertiary: isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8',
    
    bgBase: isDark ? '#0A0A0F' : '#FAFBFC',
    bgCard: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
    border: isDark ? 'rgba(255,255,255,0.1)' : '#EBEDF0',
  };
}

export default ThemeContext;
