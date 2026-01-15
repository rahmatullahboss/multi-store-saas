import React from 'react';

/**
 * GlassCard
 * 
 * Best Practices for Glassmorphism:
 * 1. Transparency: bg-white/10 (or black/10 for dark mode)
 * 2. Blur: backdrop-blur-md or lg
 * 3. Border: Subtle semi-transparent border to define edges
 * 4. Shadow: Use shadow-xl for depth separation from background
 */
export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-md dark:bg-black/20 dark:border-white/10">
      {/* Optional: Shine effect or gradient overlay usually goes here */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
