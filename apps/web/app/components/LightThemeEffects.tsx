/**
 * Light Theme Visual Effects Components
 * 
 * Premium visual effects adapted for light theme backgrounds.
 * Provides subtle depth and visual interest without overwhelming.
 */

import { motion } from 'framer-motion';

/**
 * Subtle floating gradient orbs for light theme backgrounds
 * Uses soft pastel colors with low opacity for gentle visual interest
 */
export function LightFloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top-left soft indigo orb */}
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(224, 231, 255, 0.6) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Top-right soft green orb */}
      <motion.div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 106, 78, 0.08) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -25, 0],
          y: [0, 30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Center-bottom soft blue orb */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(219, 234, 254, 0.5) 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}

/**
 * Hero section gradient overlay for light theme
 * Creates a subtle radial gradient effect at the top
 */
export function LightHeroGradient() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 100% 60% at 50% -10%, rgba(224, 231, 255, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 80% 40% at 80% 20%, rgba(0, 106, 78, 0.05) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 20% 80%, rgba(219, 234, 254, 0.3) 0%, transparent 50%)
        `,
      }}
    />
  );
}

/**
 * Subtle micro-texture pattern for visual interest
 * Uses a very light noise pattern to add depth
 */
export function SubtleTexture() {
  return (
    <div 
      className="absolute inset-0 opacity-40 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        opacity: 0.02,
      }}
    />
  );
}

/**
 * Dotted grid background for light theme
 * Uses brand green with very low opacity
 */
export function LightDottedGrid() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(0, 106, 78, 0.12) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    />
  );
}

/**
 * Animated gradient border effect for light theme cards
 */
export function GradientBorder({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 106, 78, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(0, 106, 78, 0.3) 100%)',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {/* Content */}
      <div className="relative bg-white rounded-2xl">
        {children}
      </div>
    </div>
  );
}

/**
 * Soft glow effect on hover for light theme
 */
export function SoftGlow({ 
  children, 
  color = 'green',
  className = '' 
}: { 
  children: React.ReactNode; 
  color?: 'green' | 'purple' | 'amber';
  className?: string;
}) {
  const glowColors = {
    green: 'rgba(0, 106, 78, 0.15)',
    purple: 'rgba(139, 92, 246, 0.15)',
    amber: 'rgba(217, 119, 6, 0.15)',
  };

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: `0 20px 50px ${glowColors[color]}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shimmer text effect for light theme (adapted for better visibility)
 */
export function LightShimmerText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <span 
      className={`relative inline-block ${className}`}
      style={{
        background: 'linear-gradient(135deg, #006A4E 0%, #059669 25%, #006A4E 50%, #059669 75%, #006A4E 100%)',
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animation: 'shimmer 3s linear infinite',
      }}
    >
      {children}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </span>
  );
}

/**
 * Premium section divider for light theme
 */
export function LightSectionDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${className}`}>
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 106, 78, 0.2) 20%, rgba(0, 106, 78, 0.2) 80%, transparent 100%)',
        }}
      />
    </div>
  );
}

/**
 * Floating badge animation for light theme
 */
export function FloatingBadge({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${className}`}
      style={{
        background: 'rgba(0, 106, 78, 0.06)',
        border: '1px solid rgba(0, 106, 78, 0.12)',
        color: '#006A4E',
      }}
      animate={{
        y: [0, -4, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
