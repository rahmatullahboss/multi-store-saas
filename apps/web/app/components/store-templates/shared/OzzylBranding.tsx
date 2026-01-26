/**
 * Ozzyl Branding Component
 *
 * A vibrant, eye-catching "Powered by Ozzyl" badge for store footers.
 * Uses the official Ozzyl green brand colors from the landing page.
 * Used across all templates for consistent branding.
 */

import { Store } from 'lucide-react';

interface OzzylBrandingProps {
  planType?: string;
  showPoweredBy?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

export function OzzylBranding({
  planType = 'free',
  showPoweredBy = true,
  variant = 'default',
}: OzzylBrandingProps) {
  // Only show for free plan or if explicitly enabled
  if (planType !== 'free' && showPoweredBy === false) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <a
        href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <span className="text-xs text-current">Powered by</span>
        <span className="font-bold text-sm text-[#006A4E]">Ozzyl</span>
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <a
        href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, #006A4E 0%, #00875F 100%)',
          boxShadow: '0 2px 10px rgba(0, 106, 78, 0.3)',
        }}
      >
        <Store className="w-3.5 h-3.5 text-white" />
        <span className="text-white font-bold text-xs tracking-tight">Ozzyl</span>
      </a>
    );
  }

  // Default variant - Official Ozzyl green branding
  return (
    <a
      href="https://ozzyl.com?utm_source=footer-branding&utm_medium=referral"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #006A4E 0%, #00875F 100%)',
        boxShadow: '0 4px 15px rgba(0, 106, 78, 0.4)',
      }}
    >
      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
        <Store className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-white/80 text-xs font-medium">Powered by</span>
        <span className="text-white font-bold text-sm tracking-tight">Ozzyl</span>
      </div>
    </a>
  );
}
