# CSS Theme Audit Report

**Generated**: March 7, 2026  
**Scope**: `apps/web/app/styles/` and `apps/web/app/components/store-templates/`  
**Purpose**: Audit CSS and theme configuration files

---

## Executive Summary

| Category | Count | Status | Notes |
|----------|-------|--------|-------|
| CSS Files | 1 | 🟡 Minimal | Only tailwind.css |
| Theme Config Files | 18 | 🟢 Complete | One per theme |
| CSS Variables | 0 | 🔴 Missing | No CSS variable system |
| Theme Directories | 18 | 🟢 Complete | All themes present |

---

## 1. CSS Files Analysis

### 1.1 Styles Directory

```
apps/web/app/styles/
└── tailwind.css (15,434 bytes)
```

**File**: `tailwind.css`

**Contents**:
- Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
- Custom component styles
- Base layer overrides

**Missing**:
- ❌ No CSS variables file
- ❌ No theme-specific CSS files
- ❌ No CSS modules
- ❌ No theme switching mechanism

---

## 2. Theme Configuration Files

### 2.1 Theme.ts Files (18 files)

| Theme | File Size | Lines | Colors Defined | Fonts Defined | Complexity |
|-------|-----------|-------|----------------|---------------|------------|
| `artisan-market` | 312 bytes | ~10 | 6 | ❌ No | Low |
| `aurora-minimal` | 2,142 bytes | ~60 | 12 | ✅ Yes | Medium |
| `bdshop` | 772 bytes | ~25 | 8 | ❌ No | Low |
| `daraz` | 1,234 bytes | ~40 | 12 | ❌ No | Low |
| `dc-store` | 5,074 bytes | ~150 | 15 | ✅ Yes | High |
| `eclipse` | 1,383 bytes | ~45 | 10 | ❌ No | Medium |
| `freshness` | 2,675 bytes | ~80 | 12 | ✅ Yes | Medium |
| `ghorer-bazar` | 2,416 bytes | ~75 | 12 | ✅ Yes | Medium |
| `luxe-boutique` | 265 bytes | ~10 | 5 | ❌ No | Low |
| `nova-lux-ultra` | 4,631 bytes | ~140 | 18 | ✅ Yes | High |
| `nova-lux` | 1,589 bytes | ~50 | 14 | ✅ Yes | Medium |
| `ozzyl-premium` | 710 bytes | ~25 | 8 | ❌ No | Low |
| `rovo` | 372 bytes | ~12 | 6 | ❌ No | Low |
| `sokol` | 5,619 bytes | ~170 | 20 | ✅ Yes | High |
| `starter-store` | 4,685 bytes | ~150 | 18 | ✅ Yes | High |
| `tech-modern` | 367 bytes | ~12 | 6 | ❌ No | Low |
| `turbo-sale` | 2,798 bytes | ~85 | 12 | ✅ Yes | Medium |
| `zenith-rise` | 2,609 bytes | ~80 | 12 | ✅ Yes | Medium |

**Total**: ~35,000 bytes, ~1,100 lines

---

## 3. Theme.ts Structure Analysis

### 3.1 Simple Theme (daraz/theme.ts)

```typescript
/**
 * Daraz Bangladesh Theme
 * Color palette matching the real Daraz.com.bd website
 */
export const DARAZ_THEME = {
  // Primary brand colors
  primary: '#F85606',        // Daraz Orange
  accent: '#E04E05',         // Orange hover/darker
  
  // Background colors
  background: '#F5F5F5',     // Page background gray
  cardBg: '#FFFFFF',         // Product cards
  headerBg: '#F85606',       // Main header
  topBarBg: '#2E2E2E',       // Top utility bar
  
  // Text colors
  text: '#212121',           // Primary text
  textSecondary: '#757575',  // Secondary text
  muted: '#999999',          // Light muted text
  
  // Accent colors
  gold: '#FFD700',           // Cart badge
  buyNowBlue: '#26ABD4',     // Buy Now button
  // ... more colors
};
```

**Characteristics**:
- Simple constant export
- No helper functions
- Pure color definitions
- ~40 lines

---

### 3.2 Complex Theme (starter-store/theme.ts)

```typescript
/**
 * Starter Store Theme Configuration
 * A complete, immersive e-commerce theme
 */

import type { ThemeConfig } from '@db/types';
import type { StoreTemplateTheme } from '~/templates/types';

export const STARTER_STORE_THEME = {
  // Primary Colors
  primary: '#6366f1',
  secondary: '#4f46e5',
  primaryDark: '#4f46e5',
  primaryLight: '#eef2ff',
  
  // Accent & Status
  accent: '#f59e0b',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  
  // Layout Colors
  background: '#f9fafb',
  cardBg: '#ffffff',
  headerBg: '#ffffff',
  footerBg: '#111827',
  footerText: '#ffffff',
  
  // Text Colors
  text: '#111827',
  textSecondary: '#4b5563',
  muted: '#6b7280',
  
  // Border
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Shadows
  shadowSm: '0 1px 2px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 6px -1px rgba(0,0,0,0.1)',
  shadowLg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  shadowCard: '0 1px 3px rgba(0,0,0,0.1)',
};

export const STARTER_STORE_FONTS = {
  heading: "'Inter', 'Hind Siliguri', sans-serif",
  body: "'Inter', 'Hind Siliguri', sans-serif",
};

// Helper functions
function normalizeHex(color: string | undefined): string | null { ... }
function withAlpha(hex: string, alpha: number): string { ... }
function darken(hex: string, percent: number): string { ... }

export function resolveStarterStoreTheme(
  config?: ThemeConfig | null,
  theme?: StarterThemeWithSecondary | null
): StarterStoreResolvedTheme {
  // Merge merchant config with theme defaults
  const primary = config?.primaryColor || theme?.primary || STARTER_STORE_THEME.primary;
  const secondary = configWithSecondary?.secondaryColor || theme?.secondary || darken(primary, 0.12);
  // ... more merging logic
  
  return {
    ...STARTER_STORE_THEME,
    ...theme,
    primary,
    secondary,
    // ... resolved values
  };
}
```

**Characteristics**:
- TypeScript types imported
- Helper functions (normalizeHex, withAlpha, darken)
- Resolve function for merging config
- Shadow definitions
- Font definitions
- ~150 lines

---

### 3.3 Premium Theme (nova-lux/theme.ts)

```typescript
/**
 * NovaLux Premium Theme Constants
 * World-class luxury ecommerce template
 */

export const NOVALUX_THEME = {
  // Colors
  primary: '#1C1C1E',
  accent: '#C4A35A',
  accentHover: '#B8943F',
  accentLight: '#F5F0E6',
  background: '#FAFAFA',
  backgroundAlt: '#F5F5F5',
  text: '#2C2C2C',
  textLight: '#FFFFFF',
  muted: '#8E8E93',
  mutedLight: '#AEAEB2',
  cardBg: '#FFFFFF',
  headerBg: 'rgba(255, 255, 255, 0.95)',
  headerBgSolid: '#FFFFFF',
  footerBg: '#1C1C1E',
  footerText: '#FAFAFA',
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  
  // Gradients
  accentGradient: 'linear-gradient(135deg, #C4A35A 0%, #D4B86A 50%, #C4A35A 100%)',
  heroGradient: 'linear-gradient(180deg, rgba(28,28,30,0) 0%, rgba(28,28,30,0.7) 100%)',
  
  // Shadows
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  cardShadowHover: '0 12px 40px rgba(0, 0, 0, 0.12)',
  headerShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
  buttonShadow: '0 4px 14px rgba(196, 163, 90, 0.3)',
  
  // Typography
  fontHeading: "'Cormorant Garamond', Georgia, serif",
  fontBody: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  
  // Spacing
  containerPadding: '1rem',
  sectionPadding: '4rem',
  
  // Transitions
  transitionFast: '0.15s ease',
  transitionBase: '0.3s ease',
  transitionSlow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Border Radius
  radiusSmall: '0.375rem',
  radiusMedium: '0.75rem',
  radiusLarge: '1rem',
  radiusFull: '9999px',
} as const;

export type NovaLuxTheme = typeof NOVALUX_THEME;
```

**Characteristics**:
- Comprehensive design tokens
- Gradients defined
- Shadows defined
- Typography tokens
- Spacing tokens
- Transition tokens
- Border radius tokens
- TypeScript type export
- `as const` for immutability

---

## 4. Color Definitions Summary

### 4.1 Common Color Properties

| Property | Themes Using | Example Value |
|----------|--------------|---------------|
| `primary` | 18/18 | `#4F46E5` |
| `accent` | 18/18 | `#F59E0B` |
| `background` | 18/18 | `#FFFFFF` |
| `text` | 18/18 | `#111827` |
| `cardBg` | 15/18 | `#FFFFFF` |
| `headerBg` | 12/18 | `#FFFFFF` |
| `footerBg` | 12/18 | `#1F2937` |
| `footerText` | 10/18 | `#FFFFFF` |
| `border` | 10/18 | `#E5E7EB` |
| `muted` | 10/18 | `#6B7280` |
| `textSecondary` | 8/18 | `#4B5563` |

### 4.2 Theme-Specific Colors

| Theme | Unique Colors |
|-------|--------------|
| `daraz` | `topBarBg`, `gold`, `buyNowBlue`, `lightPeach`, `priceOrange` |
| `nova-lux` | `accentHover`, `accentLight`, `backgroundAlt`, `textLight` |
| `sokol` | 20+ colors (most comprehensive) |
| `dc-store` | 15 colors with semantic names |

---

## 5. Font Definitions

### 5.1 Themes with Font Config (8/18)

| Theme | Font Heading | Font Body |
|-------|-------------|-----------|
| `starter-store` | `'Inter', 'Hind Siliguri', sans-serif` | Same |
| `aurora-minimal` | `'Inter', 'Hind Siliguri', sans-serif` | Same |
| `nova-lux` | `'Cormorant Garamond', Georgia, serif` | `'DM Sans', -apple-system` |
| `nova-lux-ultra` | `'Cormorant Garamond', Georgia, serif` | `'DM Sans', -apple-system` |
| `freshness` | Custom | Custom |
| `ghorer-bazar` | Custom | Custom |
| `turbo-sale` | Custom | Custom |
| `zenith-rise` | Custom | Custom |

### 5.2 Themes without Font Config (10/18)

These themes inherit default fonts from Tailwind.

---

## 6. CSS Variable Migration Plan

### 6.1 Proposed Structure

```
apps/web/app/styles/
├── tailwind.css (existing)
└── themes/
    ├── variables.css (NEW - CSS variables)
    ├── daraz.css (NEW - theme overrides)
    ├── nova-lux.css (NEW - theme overrides)
    └── ... (16 more theme files)
```

### 6.2 variables.css (Core)

```css
:root {
  /* Primary Colors */
  --theme-primary: #4F46E5;
  --theme-primary-dark: #4338CA;
  --theme-primary-light: #EEF2FF;
  --theme-secondary: #6366F1;
  
  /* Accent Colors */
  --theme-accent: #F59E0B;
  --theme-accent-hover: #D97706;
  
  /* Status Colors */
  --theme-success: #22C55E;
  --theme-danger: #EF4444;
  --theme-warning: #F59E0B;
  
  /* Background Colors */
  --theme-background: #FFFFFF;
  --theme-card-bg: #FFFFFF;
  --theme-header-bg: #FFFFFF;
  --theme-footer-bg: #1F2937;
  
  /* Text Colors */
  --theme-text: #111827;
  --theme-text-secondary: #4B5563;
  --theme-muted: #6B7280;
  
  /* Border Colors */
  --theme-border: #E5E7EB;
  --theme-border-light: #F3F4F6;
  
  /* Shadows */
  --theme-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --theme-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --theme-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  
  /* Typography */
  --theme-font-heading: 'Inter', 'Hind Siliguri', sans-serif;
  --theme-font-body: 'Inter', 'Hind Siliguri', sans-serif;
  
  /* Spacing */
  --theme-container-padding: 1rem;
  --theme-section-padding: 4rem;
  
  /* Transitions */
  --theme-transition-fast: 0.15s ease;
  --theme-transition-base: 0.3s ease;
  
  /* Border Radius */
  --theme-radius-small: 0.375rem;
  --theme-radius-medium: 0.75rem;
  --theme-radius-large: 1rem;
  --theme-radius-full: 9999px;
}
```

### 6.3 Theme Override Files (e.g., daraz.css)

```css
[data-theme="daraz"] {
  --theme-primary: #F85606;
  --theme-primary-dark: #E04E05;
  --theme-accent: #E04E05;
  --theme-background: #F5F5F5;
  --theme-header-bg: #F85606;
  --theme-top-bar-bg: #2E2E2E;
  --theme-gold: #FFD700;
  --theme-buy-now-blue: #26ABD4;
  --theme-light-peach: #FFE1D2;
  --theme-price-orange: #F36D00;
}
```

---

## 7. Tailwind Config Integration

### 7.1 Proposed tailwind.config.js Update

```js
module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--theme-primary)',
          'primary-dark': 'var(--theme-primary-dark)',
          'primary-light': 'var(--theme-primary-light)',
          secondary: 'var(--theme-secondary)',
          accent: 'var(--theme-accent)',
          'accent-hover': 'var(--theme-accent-hover)',
          success: 'var(--theme-success)',
          danger: 'var(--theme-danger)',
          warning: 'var(--theme-warning)',
          background: 'var(--theme-background)',
          'card-bg': 'var(--theme-card-bg)',
          'header-bg': 'var(--theme-header-bg)',
          'footer-bg': 'var(--theme-footer-bg)',
          'footer-text': 'var(--theme-footer-text)',
          text: 'var(--theme-text)',
          'text-secondary': 'var(--theme-text-secondary)',
          muted: 'var(--theme-muted)',
          border: 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
          // Daraz-specific
          'top-bar-bg': 'var(--theme-top-bar-bg)',
          gold: 'var(--theme-gold)',
          'buy-now-blue': 'var(--theme-buy-now-blue)',
          'light-peach': 'var(--theme-light-peach)',
          'price-orange': 'var(--theme-price-orange)',
        },
      },
      fontFamily: {
        heading: 'var(--theme-font-heading)',
        body: 'var(--theme-font-body)',
      },
      boxShadow: {
        'theme-sm': 'var(--theme-shadow-sm)',
        'theme-md': 'var(--theme-shadow-md)',
        'theme-lg': 'var(--theme-shadow-lg)',
        'theme-card': 'var(--theme-card-shadow)',
        'theme-card-hover': 'var(--theme-card-shadow-hover)',
      },
      spacing: {
        'theme-container': 'var(--theme-container-padding)',
        'theme-section': 'var(--theme-section-padding)',
      },
      transitionDuration: {
        'theme-fast': 'var(--theme-transition-fast)',
        'theme-base': 'var(--theme-transition-base)',
        'theme-slow': 'var(--theme-transition-slow)',
      },
      borderRadius: {
        'theme-small': 'var(--theme-radius-small)',
        'theme-medium': 'var(--theme-radius-medium)',
        'theme-large': 'var(--theme-radius-large)',
        'theme-full': 'var(--theme-radius-full)',
      },
    },
  },
  plugins: [],
};
```

---

## 8. Migration Priority

| Priority | Theme | Complexity | Effort | Impact |
|----------|-------|------------|--------|--------|
| **P0** | starter-store | High | 2 days | High |
| **P0** | nova-lux | High | 2 days | High |
| **P0** | daraz | Low | 1 day | High |
| **P1** | sokol | High | 2 days | Medium |
| **P1** | dc-store | High | 2 days | Medium |
| **P1** | nova-lux-ultra | High | 2 days | Medium |
| **P2** | aurora-minimal | Medium | 1 day | Medium |
| **P2** | freshness | Medium | 1 day | Medium |
| **P2** | ghorer-bazar | Medium | 1 day | Medium |
| **P2** | turbo-sale | Medium | 1 day | Medium |
| **P2** | zenith-rise | Medium | 1 day | Medium |
| **P3** | artisan-market | Low | 0.5 day | Low |
| **P3** | bdshop | Low | 0.5 day | Low |
| **P3** | eclipse | Medium | 1 day | Low |
| **P3** | luxe-boutique | Low | 0.5 day | Low |
| **P3** | ozzyl-premium | Low | 0.5 day | Low |
| **P3** | rovo | Low | 0.5 day | Low |
| **P3** | tech-modern | Low | 0.5 day | Low |

**Total Migration Effort**: ~20 days

---

## 9. Recommendations

### Immediate Actions

1. **Create variables.css** - Core CSS variables
2. **Update tailwind.config.js** - Add theme color mappings
3. **Import CSS in root** - Add to root.tsx or tailwind.css
4. **Test theme switching** - Verify data-attribute switching

### Medium-term Actions

1. **Migrate theme by theme** - Start with P0 themes
2. **Remove inline styles** - Replace with CSS variable classes
3. **Add theme tests** - Verify colors render correctly

### Long-term Actions

1. **Theme editor UI** - Allow merchants to customize colors
2. **Theme preview** - Real-time preview of changes
3. **Theme marketplace** - Share/sell themes

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS variables not supported | Low | Low | All modern browsers support |
| Theme switching breaks | Medium | High | Test thoroughly before deploy |
| Performance regression | Low | Medium | Measure Lighthouse before/after |
| Merchant customizations lost | Medium | High | Backup theme.ts before migration |

---

## 11. Conclusion

**Current State**: 🟡 **PARTIAL**

- 18 theme.ts files exist with color definitions
- No CSS variable system in place
- 2,419 inline styles need migration
- Tailwind config needs theme color integration

**Recommendation**: CSS theme system is the **FOUNDATION** for theme rebuild. Build this first before component migration.

---

**Audit Completed**: March 7, 2026  
**Theme Files**: 18 theme.ts files  
**CSS Files**: 1 (tailwind.css only)  
**CSS Variables**: 0 (needs creation)  
**Estimated Migration**: 20 days
