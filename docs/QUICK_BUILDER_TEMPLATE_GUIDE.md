# Landing Page Template Building Guide

> **Last Updated:** January 2026  
> **System Version:** Multi-Store SaaS with Modular Sections & ThemeConfig

---

## 🚀 Quick Start (New Architecture)

```tsx
// 1. Import shared components + ThemeConfig
import { SectionRenderer } from './SectionRenderer';
import { FloatingButtons } from './FloatingButtons';
import { getButtonStyles } from './theme-utils';
import { PREMIUM_BD_THEME, applyCustomColors } from './sections/types';
import type { TemplateProps } from '~/templates/registry';

// 2. Template component
export function NewTemplate({ product, config, storeName, storeId, ... }: TemplateProps) {
  const editableConfig = config;

  // Use preset theme with custom color overrides
  const theme = applyCustomColors(PREMIUM_BD_THEME, editableConfig.primaryColor, editableConfig.accentColor);

  return (
    <div className={`min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
      {/* Dynamic Section Renderer - renders all sections */}
      <SectionRenderer
        sectionOrder={editableConfig.sectionOrder}
        hiddenSections={editableConfig.hiddenSections}
        config={editableConfig}
        product={product}
        storeName={storeName}
        theme={theme}
        formatPrice={formatPrice}
        productVariants={[]}
        orderBumps={[]}
        currency={currency}
        storeId={storeId}
        isPreview={isPreview}
        planType={planType}
      />

      {/* Floating Buttons at end */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}
```

---

## 🎨 ThemeConfig System

All templates use **preset themes** from `sections/types.ts`:

### Available Preset Themes

| Theme Name            | ID            | Style                    |
| --------------------- | ------------- | ------------------------ |
| `FLASH_SALE_THEME`    | flash-sale    | Red/Yellow urgency, dark |
| `MODERN_DARK_THEME`   | modern-dark   | Zinc/Orange, dark        |
| `MINIMAL_LIGHT_THEME` | minimal-light | Clean white              |
| `ORGANIC_THEME`       | organic       | Green/Nature             |
| `LUXE_THEME`          | luxe          | Gold/Black luxury        |
| `VIDEO_FOCUS_THEME`   | video-focus   | Purple/Violet            |
| `PREMIUM_BD_THEME`    | premium-bd    | Orange/Green             |

### ThemeConfig Interface

```typescript
interface ThemeConfig {
  isDark: boolean;
  primary: string; // Hex color for primary
  accent: string; // Hex color for accent
  bgPrimary: string; // Tailwind class
  bgSecondary: string; // Tailwind class
  textPrimary: string; // Tailwind class
  textSecondary: string; // Tailwind class
  cardBg: string; // Tailwind class
  cardBorder: string; // Tailwind class
  ctaBg: string; // Tailwind class
  ctaText: string; // Tailwind class
  headerBg: string; // Tailwind class
  footerBg: string; // Tailwind class
  footerText: string; // Tailwind class
  urgencyBg?: string; // Optional urgency bar
}
```

### Customize Theme with User Colors

```tsx
import { MODERN_DARK_THEME, applyCustomColors } from "./sections/types";

// Apply user's primaryColor and accentColor to the preset
const theme = applyCustomColors(
  MODERN_DARK_THEME,
  config.primaryColor, // User's selected primary
  config.accentColor // User's selected accent
);
```

---

## 📦 Modular Sections

Sections are now **reusable components** in `sections/` folder:

```
templates/
├── SectionRenderer.tsx      # Main renderer for all sections
├── FloatingButtons.tsx      # Shared floating buttons
├── theme-utils.ts           # Color utilities
├── sections/
│   ├── types.ts             # ThemeConfig + SectionProps + Preset Themes
│   ├── HeroSection.tsx      # Hero with product showcase
│   ├── TrustSection.tsx     # Trust badges
│   ├── FeaturesSection.tsx  # Product features
│   ├── GallerySection.tsx   # Image gallery
│   ├── VideoSection.tsx     # Video embed
│   ├── BenefitsSection.tsx  # Why buy section
│   ├── ComparisonSection.tsx # Before/After
│   ├── TestimonialsSection.tsx # Customer reviews
│   ├── SocialProofSection.tsx # Social proof bar
│   ├── DeliverySection.tsx  # Delivery info
│   ├── FAQSection.tsx       # FAQ accordion
│   ├── GuaranteeSection.tsx # Guarantee section
│   ├── OrderFormSection.tsx # Order form (CTA)
│   └── ContactSection.tsx   # Contact info
```

### SectionProps (All sections receive)

```typescript
interface SectionProps {
  config: LandingConfig;
  product: any;
  storeName: string;
  theme: ThemeConfig; // Required - use preset
  isPreview?: boolean;
  isEditMode?: boolean;
  onUpdate?: (sectionId: string, newData: any) => void;
  formatPrice: (price: number) => string;
  productVariants?: any[];
  orderBumps?: any[];
  storeId?: number | string;
  planType?: string;
}
```

---

## 🔧 Creating a New Template

### Step 1: Choose a Preset Theme

```tsx
import { LUXE_THEME, applyCustomColors } from "./sections/types";
```

### Step 2: Use SectionRenderer

```tsx
<SectionRenderer
  sectionOrder={['hero', 'trust', 'features', 'testimonials', 'cta']}
  hiddenSections={config.hiddenSections}
  config={editableConfig}
  product={product}
  theme={theme}
  formatPrice={formatPrice}
  ...
/>
```

### Step 3: Add Template-Specific Headers/Footers

```tsx
{/* Custom Header */}
<header className={theme.headerBg}>
  <h1>{storeName}</h1>
</header>

<SectionRenderer ... />

{/* Custom Footer */}
<footer className={theme.footerBg}>
  <p className={theme.footerText}>© {storeName}</p>
</footer>
```

---

## ✅ Checklist for New Templates

- [ ] Import preset theme from `./sections/types`
- [ ] Use `applyCustomColors()` for user color overrides
- [ ] Use `SectionRenderer` for section rendering
- [ ] Pass `theme` prop to SectionRenderer
- [ ] Add `FloatingButtons` at template end
- [ ] Add Ozzyl branding for `planType === 'free'`
- [ ] Register in `templates/registry.ts`

---

## 📋 Template Registration

```tsx
// templates/registry.ts
import { NewTemplate } from "~/components/templates/NewTemplate";

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "new-template",
    name: "New Template",
    description: "Description here",
    thumbnail: "/templates/new-template.png",
    component: NewTemplate,
  },
];
```

---

## 🎯 Section Order

Default section order (customizable via `config.sectionOrder`):

```typescript
const DEFAULT_ORDER = [
  "hero",
  "trust",
  "features",
  "gallery",
  "video",
  "benefits",
  "comparison",
  "testimonials",
  "social",
  "delivery",
  "faq",
  "guarantee",
  "cta",
  "contact",
];
```

Template-specific sections:

- `showcase-hero` - Showcase template hero
- `mobile-first-hero` - Mobile-first hero
- `modern-dark-hero` - Modern dark hero
- `video-focus-hero` - Video-focused hero

---

## Support

Check existing templates for patterns:

- `PremiumBDTemplate.tsx` - Light theme example
- `FlashSaleTemplate.tsx` - Dark urgency theme
- `ModernDark.tsx` - Dark gradient theme
