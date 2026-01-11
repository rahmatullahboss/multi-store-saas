# Template Building Guide

This guide outlines the best practices and requirements for creating new store templates in the Multi-Store SaaS platform. Follow these guidelines to ensure consistency, performance, and full feature support.

## 1. Core Structure

All store templates reside in `app/components/store-templates/`. A basic template structure looks like this:

```tsx
import type { StoreTemplateProps } from "~/templates/store-registry";
// ... other imports

export function MyNewTemplate({
  storeName,
  storeId,
  logo,
  products,
  categories,
  currentCategory,
  config,
  currency,
  socialLinks,
  footerConfig,
  businessInfo,
  isPreview,
}: StoreTemplateProps) {
  // ... hook calls

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* Dynamic Sections */}
      {/* Footer */}
    </div>
  );
}
```

## 2. Reactive Cart Logic (CRITICAL)

**Do NOT implement manual `localStorage` listeners or `window` event handlers for the cart.**

Use the centralized `useCartCount` hook. This hook handles hydration safety, `localStorage` parsing, and real-time updates across tabs and components.

```tsx
import { useCartCount } from "~/hooks/useCartCount";

// Inside your component:
const count = useCartCount();

// Usage in JSX:
<Link to="/cart">
  <ShoppingCartIcon />
  <span>{count}</span>
</Link>;
```

## 3. Dynamic Section Rendering

Templates must support the drag-and-drop section builder. Do not hardcode the homepage layout.

Use the `SECTION_REGISTRY` to render sections based on `config.sections`.

```tsx
import {
  SECTION_REGISTRY,
  DEFAULT_SECTIONS,
} from "~/components/store-sections/registry";

// ... inside the return statement:
{
  (config?.sections ?? DEFAULT_SECTIONS).map((section: any) => {
    const SectionComponent = SECTION_REGISTRY[section.type]?.component;
    if (!SectionComponent) return null;

    return (
      <SectionComponent
        key={section.id}
        settings={section.settings}
        theme={THEME} // Your theme constants
        products={products}
        categories={categories}
        storeId={storeId}
        currency={currency}
        store={{
          name: storeName,
          email: businessInfo?.email,
          phone: businessInfo?.phone,
          address: businessInfo?.address,
          currency: currency,
        }}
        // Optional: Pass custom card components if needed
        // ProductCardComponent={MyCustomProductCard}
      />
    );
  });
}
```

## 4. Theme Configuration & Fallbacks

Always define a theme constant object for consistent styling, but allow overriding from `config` if applicable (future proofing).

```tsx
const THEME = {
  primary: "#...",
  accent: "#...",
  background: "#...",
  // ...
};
```

Ensure robust fallbacks for all optional props (`socialLinks`, `businessInfo`, `storeName`).

## 5. Icons & Assets

- **Icons**: Use `lucide-react` for all UI icons to maintain consistency.
- **Images**: Use the `OptimizedImage` component (if available locally) or standard `img` tags with proper `alt` text.

## 6. URLs & Navigation

- **Internal Links**: Use Remix's `<Link to="...">` component.
- **Categories**: Use query parameters: `<Link to="/?category=example">`.
- **Cart**: Link to `/cart`.
- **Checkout**: Link to `/checkout`.

## 7. Mobile Responsiveness

All templates must be fully responsive.

- Implement a mobile menu (hamburger).
- Ensure product grids collapse to 1 or 2 columns on mobile.
- Verify touch targets (buttons/links) are at least 44px height.

## 8. Internationalization

Use existing translation hooks where possible.

```tsx
import { useTranslation } from "~/contexts/LanguageContext";

const { t } = useTranslation();

// Usage:
{
  t("addToCart");
}
```

## 9. World-Class Performance & Quality Standards

To maintain a premium standard, all templates must adhere to:

### Performance

- **LCP (Largest Contentful Paint)**: Core content must load within 2.5s. Use `fetchPriority="high"` on hero images.
- **CLS (Cumulative Layout Shift)**: Must be < 0.1. Always set `width` and `height` on images or use aspect-ratio containers.
- **Code Splitting**: Dynamic sections are automatically code-split. Do not import heavy libraries (e.g., `framer-motion`) in the main bundle unless necessary.

### Accessibility (a11y)

- **Semantic HTML**: Use `<header>`, `<main>`, `<nav>`, `<footer>`, `<article>`.
- **Keyboard Navigation**: Ensure all interactive elements are focusable and have visible focus states.
- **Color Contrast**: Text must meet WCAG AA standards (4.5:1 ratio).
- **ARIA**: Use `aria-label` for icon-only buttons (e.g., Search, Cart).

### Clean Code

- **Type Safety**: No `any` types. Define proper interfaces for all props.
- **Prop Drilling**: Use Context for deep state, but prefer composition.
- **Comments**: Explain _why_, not _what_, for complex logic.

## 10. AI & Editor Compatibility (Mandatory)

To ensure the "Store AI" can fully edit, redesign, and copywrite for your template (achieving a "Lovable-like" dynamic experience), you must adhere to **Strict Configuration Binding**:

1.  **Zero Hardcoded Content**: Never write static text (e.g., `<h1>Welcome</h1>`). Always bind to config (e.g., `<h1>{config.hero.title}</h1>`).
2.  **Theme-Token Usage**: Never use arbitrary hex codes. Use `theme.primary`, `theme.accent`, or `config.colors`.
3.  **Structure via JSON**: The layout must be generated from `config.sections`. This allows the AI to reorder, add, or remove sections instantly.
4.  **Granular Props**: Every simplified component (like a ProductCard) must accept style overrides from the parent, allowing the AI to tweak "border-radius" or "shadows" globally.
