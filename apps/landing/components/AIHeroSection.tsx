'use client';

/**
 * Award-Winning Hero Section - Bangladesh Edition (AI Transformation)
 *
 * Design: Bangladesh's First AI-Powered E-commerce Builder
 * Theme: Dark mode with Bangladesh-inspired accent colors + AI Purples
 *
 * Features:
 * - Split screen layout (messaging + AI visual)
 * - Neural network background pattern
 * - Floating typography + AI nodes
 * - AI Chat & Drag-Drop Simulation
 *
 * Animation: Pure CSS + IntersectionObserver (no framer-motion)
 */

import { useEffect, useRef, useState, ReactNode } from 'react';
import Link from 'next/link';
import {
  Play,
  Check,
  ArrowRight,
  Sparkles,
  MousePointer2,
  Type,
  Palette,
  Globe,
  Bot,
  Zap,
  MessageCircle,
  Box,
} from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/useIsMobile';

// ============================================================================
// TYPES
// ============================================================================
interface HeroProps {
  theme?: 'dark' | 'light';
  totalUsers?: number;
}

// ============================================================================
// DESIGN TOKENS - AI Enhanced Theme
// ============================================================================
const DARK_COLORS = {
  primary: '#006A4E', // Bangladesh Green
  primaryLight: '#00875F',
  primaryDark: '#004D38',
  accent: '#F9A825', // Golden Yellow
  aiPurple: '#8B5CF6', // AI Purple
  aiPurpleLight: '#A78BFA',
  background: '#0A0A0B', // Deep dark base
  backgroundAlt: '#0E1210',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

const LIGHT_COLORS = {
  primary: '#006A4E',
  primaryLight: '#00875F',
  primaryDark: '#005740',
  accent: '#D97706',
  aiPurple: '#7C3AED',
  aiPurpleLight: '#8B5CF6',
  background: '#FAFBFC',
  backgroundAlt: '#F4F5F7',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#94A3B8',
  cardBg: '#FFFFFF',
  cardBorder: '#EBEDF0',
};

const getColors = (theme: 'dark' | 'light') => (theme === 'light' ? LIGHT_COLORS : DARK_COLORS);

// ============================================================================
// GRAIN TEXTURE OVERLAY
// ============================================================================
const GrainOverlay = ({ isLight = false }: { isLight?: boolean }) => (
  <div
    className={`pointer-events-none fixed inset-0 z-50 ${isLight ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

// ============================================================================
// NEURAL NETWORK BACKGROUND - CSS animations
// ============================================================================
const NeuralBackground = ({ colors, isMobile = false }: { colors: typeof DARK_COLORS; isMobile?: boolean }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Grid Pattern */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `linear-gradient(${colors.text} 1px, transparent 1px), linear-gradient(90deg, ${colors.text} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    />

    {/* Green Orb */}
    <div
      className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[100px]"
      style={{
        background: colors.primary,
        opacity: isMobile ? 0.1 : undefined,
        animation: isMobile ? 'none' : 'orbPulseGreen 10s ease-in-out infinite',
      }}
    />

    {/* Purple Orb (AI) */}
    <div
      className="absolute top-[20%] right-[0%] w-[500px] h-[500px] rounded-full blur-[100px]"
      style={{
        background: colors.aiPurple,
        opacity: isMobile ? 0.05 : undefined,
        animation: isMobile ? 'none' : 'orbPulsePurple 12s ease-in-out infinite',
      }}
    />

    <style>{`
      @keyframes orbPulseGreen {
        0%, 100% { opacity: 0.1; transform: scale(1); }
        50%       { opacity: 0.15; transform: scale(1.1); }
      }
      @keyframes orbPulsePurple {
        0%, 100% { opacity: 0.05; transform: scale(1) translateX(0); }
        50%       { opacity: 0.1; transform: scale(1.2) translateX(-20px); }
      }
    `}</style>
  </div>
);

// ============================================================================
// AI VISUAL COMPONENT - CSS animations replace framer-motion
// ============================================================================
const AIHeroVisual = ({ theme, isMobile }: { theme: 'dark' | 'light'; isMobile?: boolean }) => {
  const colors = getColors(theme);
  const { t } = useTranslation();
  const [activeChat, setActiveChat] = useState(0);
  const [blocksVisible, setBlocksVisible] = useState(false);

  // Chat sequence animation
  useEffect(() => {
    let cancelled = false;

    const sequence = async () => {
      // Small delay so blocks animate in first
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setBlocksVisible(true);

      while (!cancelled) {
        await new Promise((r) => setTimeout(r, 1000));
        if (cancelled) return;
        setActiveChat(1); // User asks
        await new Promise((r) => setTimeout(r, 2000));
        if (cancelled) return;
        setActiveChat(2); // AI responds
        await new Promise((r) => setTimeout(r, 5000));
        if (cancelled) return;
        setActiveChat(0); // Reset
      }
    };

    sequence();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-square max-h-[500px]">
      {/* Container Frame */}
      <div
        className="absolute inset-0 rounded-2xl border backdrop-blur-xl overflow-hidden shadow-2xl"
        style={{
          borderColor: colors.cardBorder,
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
        }}
      >
        {/* Split View */}
        <div className="absolute inset-0 flex">
          {/* LEFT: Drag & Drop Canvas */}
          <div className="w-1/2 border-r p-4 relative" style={{ borderColor: colors.cardBorder }}>
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>

            {/* Draggable Blocks */}
            <div className="mt-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={`block-${i}`}
                  className="rounded-lg p-3 border border-dashed relative overflow-hidden"
                  style={{
                    borderColor: colors.cardBorder,
                    background:
                      theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    opacity: blocksVisible ? 1 : 0,
                    transform: blocksVisible ? 'translateX(0)' : 'translateX(-20px)',
                    transition: `opacity 0.4s ease-out ${i * 0.2}s, transform 0.4s ease-out ${i * 0.2}s`,
                  }}
                >
                  <div className="h-2 w-2/3 rounded bg-current opacity-10 mb-2" />
                  <div className="h-12 rounded bg-current opacity-5" />

                  {/* Drag Hand */}
                  {i === 2 && (
                    <div
                      className="absolute bottom-1 right-2"
                      style={{
                        opacity: activeChat === 1 ? 1 : 0,
                        transform: activeChat === 1 ? 'translate(0,0)' : 'translate(20px,20px)',
                        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                      }}
                    >
                      <MousePointer2 className="w-6 h-6 fill-white stroke-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              className="absolute bottom-4 left-4 text-[10px] font-mono px-2 py-1 rounded border"
              style={{ borderColor: colors.primary, color: colors.primary }}
            >
              {t('heroAiVisualEditor')}
            </div>
          </div>

          {/* RIGHT: AI Chat Interface */}
          <div
            className="w-1/2 relative bg-opacity-50"
            style={{
              backgroundColor:
                theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <div className="p-4 flex flex-col justify-center h-full gap-4">
              {/* User Message Bubble */}
              <div
                className="self-end max-w-[90%] rounded-2xl rounded-tr-sm p-3 shadow-sm"
                style={{
                  background: colors.primary,
                  color: 'white',
                  opacity: activeChat >= 1 ? 1 : 0,
                  transform: activeChat >= 1 ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.9)',
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                }}
              >
                <p className="text-xs">💬 &quot;{t('heroAiVisualUserMsg')}&quot;</p>
              </div>

              {/* Bot Typing Indicator */}
              <div
                className="self-start"
                style={{
                  opacity: activeChat === 1 ? 1 : 0,
                  transition: 'opacity 0.3s ease-out',
                  pointerEvents: 'none',
                }}
              >
                <div className="flex gap-1 px-3 py-2 rounded-2xl rounded-tl-sm bg-white/10">
                  <div
                    className="w-1 h-1 rounded-full bg-current opacity-50"
                    style={{ animation: 'typingDot 0.6s ease-in-out infinite', animationDelay: '0s' }}
                  />
                  <div
                    className="w-1 h-1 rounded-full bg-current opacity-50"
                    style={{ animation: 'typingDot 0.6s ease-in-out infinite', animationDelay: '0.2s' }}
                  />
                  <div
                    className="w-1 h-1 rounded-full bg-current opacity-50"
                    style={{ animation: 'typingDot 0.6s ease-in-out infinite', animationDelay: '0.4s' }}
                  />
                </div>
              </div>

              {/* Bot Response Bubble */}
              <div
                className="self-start max-w-[90%] rounded-2xl rounded-tl-sm p-3 border shadow-sm"
                style={{
                  background: theme === 'dark' ? '#1a1a20' : '#ffffff',
                  borderColor: colors.cardBorder,
                  opacity: activeChat >= 2 ? 1 : 0,
                  transform: activeChat >= 2 ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.9)',
                  transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                }}
              >
                <div className="flex items-start gap-2">
                  <div className="p-1 rounded bg-purple-500/10 mt-0.5">
                    <Bot className="w-3 h-3 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: colors.text }}>
                      🤖 &quot;{t('heroAiVisualAiReply')}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Badge — AI Logic */}
        <div
          className="absolute -right-4 top-10 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-2 z-10"
          style={{
            background: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.8)',
            borderColor: colors.aiPurple,
            animation: isMobile ? 'none' : 'floatUp 4s ease-in-out infinite',
          }}
        >
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            AI Logic
          </span>
        </div>

        {/* Floating Badge — Fast CDN */}
        <div
          className="absolute -left-4 bottom-20 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-2 z-10"
          style={{
            background: theme === 'dark' ? 'rgba(0, 106, 78, 0.1)' : 'rgba(255,255,255,0.8)',
            borderColor: colors.primary,
            animation: isMobile ? 'none' : 'floatDown 5s ease-in-out infinite',
          }}
        >
          <Zap className="w-3 h-3" style={{ color: colors.primary }} />
          <span className="text-xs font-medium" style={{ color: colors.primary }}>
            Fast CDN
          </span>
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN HERO COMPONENT
// ============================================================================
export function AIHeroSection({ theme = 'dark', totalUsers = 0 }: HeroProps) {
  const colors = getColors(theme);
  const isLight = theme === 'light';
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  // Entrance animation: mount flag
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Small rAF delay so first paint isn't blocked
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section
      className="relative min-h-[90vh] overflow-hidden flex items-center"
      style={{ backgroundColor: colors.background }}
    >
      <GrainOverlay isLight={isLight} />
      <NeuralBackground colors={colors} isMobile={isMobile} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* LEFT: CONTENT */}
          <div className="relative z-20">
            {/* AI Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
              style={{
                backgroundColor: isLight ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.1)',
                borderColor: isLight ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.3)',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
              </span>
              <span
                className="text-xs font-semibold tracking-wide uppercase"
                style={{ color: isLight ? colors.aiPurple : colors.aiPurpleLight }}
              >
                {t('heroAiBadge')}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.15] mb-6 tracking-tight"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
              }}
            >
              <span className="block" style={{ color: colors.text }}>
                {t('heroAiTitle')}
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl mb-8 leading-relaxed max-w-lg"
              style={{
                color: colors.textMuted,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease-out 0.25s, transform 0.5s ease-out 0.25s',
              }}
            >
              {t('heroAiSubtitle')}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-4 mb-10"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease-out 0.35s, transform 0.5s ease-out 0.35s',
              }}
            >
              <Link
                href="https://app.ozzyl.com/auth/register"
                className="group relative px-8 py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  <RocketIcon /> {t('heroAiCta')}
                </span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t"
              style={{
                borderColor: colors.cardBorder,
                color: colors.textSubtle,
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.5s ease-out 0.5s',
              }}
            >
              {[
                { icon: Bot, label: t('heroAiTrust1'), color: colors.aiPurpleLight },
                { icon: Zap, label: '310+ CDN', color: '#EAB308' },
                { icon: Box, label: 'Drag & Drop', color: colors.primaryLight },
                { icon: Globe, label: t('heroAiTrust2'), color: '#EF4444' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2">
                  <badge.icon className="w-4 h-4" style={{ color: badge.color }} />
                  <span className="text-sm font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: AI VISUAL */}
          <div
            className="relative z-10 lg:translate-x-10"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 0.7s ease-out 0.3s, transform 0.7s ease-out 0.3s',
            }}
          >
            <AIHeroVisual theme={theme} isMobile={isMobile} />

            {/* Decorative Background Blob */}
            <div
              className="absolute inset-0 -z-10 bg-gradient-to-tr from-purple-500/20 to-green-500/20 rounded-full blur-[80px] opacity-50"
              style={{ transform: 'scale(0.8)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Simple Rocket Icon helper
const RocketIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

export default AIHeroSection;
