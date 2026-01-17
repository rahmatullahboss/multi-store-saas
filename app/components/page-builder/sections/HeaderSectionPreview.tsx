/**
 * Header Section Preview
 * 
 * Renders the page header with logo, navigation links, and CTA button.
 * Supports multiple variants: simple, centered, minimal.
 */

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { HeaderProps } from '~/lib/page-builder/schemas';

interface HeaderSectionPreviewProps {
  props: Record<string, unknown>;
}

export function HeaderSectionPreview({ props }: HeaderSectionPreviewProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Type-safe props with defaults
  const {
    logoUrl = '',
    logoText = '',
    logoSize = 'md',
    showNavLinks = true,
    navLinks = [],
    showCta = true,
    ctaText = 'অর্ডার করুন',
    ctaLink = '#order',
    ctaStyle = 'solid',
    variant = 'simple',
    bgColor = '#FFFFFF',
    textColor = '#18181B',
    ctaBgColor = '#6366F1',
    ctaTextColor = '#FFFFFF',
    isSticky = true,
    mobileMenuBgColor = '#FFFFFF',
  } = props as HeaderProps;

  // Logo size classes
  const logoSizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  // CTA button styles
  const ctaButtonStyles = {
    solid: {
      backgroundColor: ctaBgColor,
      color: ctaTextColor,
    },
    outline: {
      backgroundColor: 'transparent',
      color: ctaBgColor,
      border: `2px solid ${ctaBgColor}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: ctaBgColor,
    },
  };

  // Render nav links
  const renderNavLinks = () => {
    if (!showNavLinks || !navLinks.length) return null;
    
    return navLinks.map((link: { label: string; url: string }, index: number) => (
      <a
        key={index}
        href={link.url}
        className="text-sm font-medium hover:opacity-80 transition-opacity"
        style={{ color: textColor }}
      >
        {link.label}
      </a>
    ));
  };

  // Render CTA button
  const renderCtaButton = (isMobile = false) => {
    if (!showCta) return null;
    
    return (
      <a
        href={ctaLink}
        className={`
          px-4 py-2 rounded-lg font-semibold text-sm transition-all
          hover:opacity-90 hover:shadow-md
          ${isMobile ? 'w-full text-center' : ''}
        `}
        style={ctaButtonStyles[ctaStyle]}
      >
        {ctaText}
      </a>
    );
  };

  // Render logo
  const renderLogo = () => {
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={logoText || 'Logo'} 
          className={`${logoSizeClasses[logoSize]} object-contain`}
        />
      );
    }
    
    if (logoText) {
      return (
        <span 
          className="font-bold text-lg"
          style={{ color: textColor }}
        >
          {logoText}
        </span>
      );
    }
    
    // Default placeholder
    return (
      <div 
        className={`${logoSizeClasses[logoSize]} w-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs`}
      >
        লোগো
      </div>
    );
  };

  // Mobile menu
  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;
    
    return (
      <div
        className="absolute top-full left-0 right-0 p-4 shadow-lg md:hidden z-50"
        style={{ backgroundColor: mobileMenuBgColor }}
      >
        <div className="flex flex-col gap-4">
          {navLinks.map((link: { label: string; url: string }, index: number) => (
            <a
              key={index}
              href={link.url}
              className="text-sm font-medium py-2 border-b border-gray-100"
              style={{ color: textColor }}
            >
              {link.label}
            </a>
          ))}
          {renderCtaButton(true)}
        </div>
      </div>
    );
  };

  // SIMPLE variant - Logo left, nav center, CTA right
  if (variant === 'simple') {
    return (
      <header
        className={`w-full ${isSticky ? 'sticky top-0 z-40' : ''} shadow-sm`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              {renderLogo()}
            </div>
            
            {/* Nav Links - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-6">
              {renderNavLinks()}
            </nav>
            
            {/* CTA + Mobile menu toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                {renderCtaButton()}
              </div>
              
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 md:hidden rounded-lg hover:bg-gray-100"
                style={{ color: textColor }}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {renderMobileMenu()}
      </header>
    );
  }

  // CENTERED variant - Logo center, nav below
  if (variant === 'centered') {
    return (
      <header
        className={`w-full ${isSticky ? 'sticky top-0 z-40' : ''} shadow-sm`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Logo - Centered */}
          <div className="flex justify-center mb-3">
            {renderLogo()}
          </div>
          
          {/* Nav Links - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            {renderNavLinks()}
            <div className="ml-4">
              {renderCtaButton()}
            </div>
          </nav>
          
          {/* Mobile: Menu toggle below logo */}
          <div className="flex justify-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
              style={{ color: textColor }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {renderMobileMenu()}
      </header>
    );
  }

  // MINIMAL variant - Just logo and CTA, no nav
  return (
    <header
      className={`w-full ${isSticky ? 'sticky top-0 z-40' : ''}`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            {renderLogo()}
          </div>
          
          {/* CTA only */}
          {renderCtaButton()}
        </div>
      </div>
    </header>
  );
}
