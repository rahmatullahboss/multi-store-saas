# Landing Page Template Building Guide

> **Last Updated:** January 2026  
> **System Version:** Multi-Store SaaS with Shared Components

---

## Quick Start

New template তৈরি করতে এই steps follow করুন:

```tsx
// 1. Import shared components
import { FloatingButtons } from './FloatingButtons';
import { getButtonStyles } from './theme-utils';
import type { TemplateProps } from '~/templates/registry';

// 2. Template component
export function NewTemplate({ product, config, ... }: TemplateProps) {
  const editableConfig = { ...defaultConfig, ...config };

  return (
    <div>
      {/* Your template content */}

      {/* Always include FloatingButtons at the end */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}
```

---

## Shared Components

These components are **centralized** - edit once, updates everywhere:

| Component             | Location                        | Purpose                          |
| --------------------- | ------------------------------- | -------------------------------- |
| `FloatingButtons`     | `templates/FloatingButtons.tsx` | WhatsApp + Call floating buttons |
| `theme-utils`         | `templates/theme-utils.ts`      | Dynamic color styling            |
| `CountdownTimer`      | `components/landing/`           | Sale countdown timer             |
| `OrderBumpsContainer` | `components/landing/`           | Add-on products                  |

### FloatingButtons Props

```tsx
interface FloatingButtonsProps {
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  callEnabled?: boolean;
  callNumber?: string;
  productTitle?: string;
}
```

### Theme Utils

```tsx
import { getButtonStyles, getGradientButtonStyles } from './theme-utils';

// Solid color button
<button style={getButtonStyles(config.primaryColor)}>Order Now</button>

// Gradient button
<button style={getGradientButtonStyles(config.primaryColor, config.accentColor)}>
  Order Now
</button>
```

---

## Template Structure

```
templates/
├── FloatingButtons.tsx      # Shared floating buttons (REUSABLE)
├── theme-utils.ts           # Color utilities (REUSABLE)
├── PremiumBDTemplate.tsx    # Template 1
├── MobileFirstTemplate.tsx  # Template 2
├── OrganicTemplate.tsx      # Template 3
├── LuxeTemplate.tsx         # Template 4
├── FlashSaleTemplate.tsx    # Template 5
├── ShowcaseTemplate.tsx     # Template 6
└── LandingPageTemplate.tsx  # Default template
```

---

## Config Fields (LandingConfig)

All templates receive these via `config` prop:

```typescript
// Core Content
headline?: string;
subHeadline?: string;
ctaText?: string;
urgencyText?: string;

// Colors
primaryColor?: string;      // Button/accent color
accentColor?: string;       // Secondary color
backgroundColor?: string;
textColor?: string;

// Features
whatsappEnabled?: boolean;
whatsappNumber?: string;
whatsappMessage?: string;
callEnabled?: boolean;
callNumber?: string;

// Sections
hiddenSections?: string[];  // Array of section IDs to hide
sectionOrder?: string[];    // Custom section ordering

// Custom HTML
customSections?: CustomSection[];
```

---

## Section Visibility

Use `isSectionVisible` helper:

```tsx
const isSectionVisible = (sectionId: string, hiddenSections?: string[]) => {
  if (!hiddenSections?.length) return true;
  return !hiddenSections.includes(sectionId);
};

// Usage
{
  isSectionVisible("testimonials", config.hiddenSections) && (
    <TestimonialsSection />
  );
}
```

---

## Responsive Design Rules

| Breakpoint | Prefix      | Use Case   |
| ---------- | ----------- | ---------- |
| Mobile     | _(default)_ | All phones |
| Tablet     | `md:`       | >= 768px   |
| Desktop    | `lg:`       | >= 1024px  |

### FloatingButtons Position

```
Mobile:  bottom-28 (112px) - Above sticky order bar
Desktop: bottom-12 (48px)  - Near page bottom
Gap:     16px between Call and WhatsApp
```

---

## Template Registration

Register in `templates/registry.ts`:

```tsx
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "new-template",
    name: "New Template",
    description: "Description here",
    thumbnail: "/thumbnails/new-template.png",
    component: NewTemplate,
    category: "modern",
  },
  // ...
];
```

---

## Checklist for New Templates

- [ ] Import `FloatingButtons` from `./FloatingButtons`
- [ ] Import `getButtonStyles` from `./theme-utils`
- [ ] Use `config.primaryColor` for buttons (not hardcoded colors)
- [ ] Add `FloatingButtons` component at template end
- [ ] Check section visibility with `isSectionVisible()`
- [ ] Add responsive classes for mobile/desktop
- [ ] Register in `templates/registry.ts`
- [ ] Add Ozzyl branding for free plan users

---

## Example: Minimal Template

```tsx
import { FloatingButtons } from "./FloatingButtons";
import { getButtonStyles } from "./theme-utils";
import type { TemplateProps } from "~/templates/registry";

export function MinimalTemplate({
  product,
  config,
  storeName,
  currency,
}: TemplateProps) {
  const editableConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold">{editableConfig.headline}</h1>
        <button
          style={getButtonStyles(editableConfig.primaryColor)}
          className="mt-8 px-8 py-4 text-white rounded-xl"
        >
          {editableConfig.ctaText}
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white text-center">
        <p>
          © {new Date().getFullYear()} {storeName}
        </p>
      </footer>

      {/* Floating Buttons - Always include */}
      <FloatingButtons
        whatsappEnabled={editableConfig.whatsappEnabled}
        whatsappNumber={editableConfig.whatsappNumber}
        whatsappMessage={editableConfig.whatsappMessage}
        callEnabled={editableConfig.callEnabled}
        callNumber={editableConfig.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}
```

---

## Support

Questions? Check existing templates in `app/components/templates/` for patterns.
