/**
 * Premium CTA Button - PERFORMANCE OPTIMIZED
 * Removed heavy particle effects and simplified animations
 * - No more 8 particle animations
 * - Simplified glow effect (CSS only, no JS animation)
 * - Removed infinite gradient animation
 * - Respects prefers-reduced-motion
 */

import { ReactNode, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface PremiumCTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function PremiumCTAButton({
  children,
  href,
  onClick,
  className = '',
}: PremiumCTAButtonProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const buttonContent = (
    <>
      {/* Static gradient background - no animation */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #00875F 0%, #006A4E 50%, #F9A825 100%)',
        }}
      />

      {/* Simple glow effect - CSS only, no JS animation */}
      <div
        className="absolute -inset-1 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #00875F, #F9A825)',
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        {children as any}
      </span>

      {/* Simple shine effect on hover - CSS animation */}
      {isHovered && !shouldReduceMotion && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shine 1.5s ease-in-out',
          }}
        />
      )}
    </>
  );
}

  const commonProps = {
    ref: ref as any,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: `group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${className}`,
    style: {
      background: 'linear-gradient(135deg, #006A4E 0%, #00875F 100%)',
      boxShadow: '0 0 20px rgba(0, 135, 95, 0.25)',
    },
  };

  if (href) {
    return (
      <a
        {...commonProps}
        href={href}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      {...commonProps}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
}
