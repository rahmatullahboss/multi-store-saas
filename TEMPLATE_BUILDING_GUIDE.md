# Template Building Guide: The "Pure UI" Standard (World-Class Edition)

This guide is the **absolute reference** for creating world-class, future-proof store templates on the Ozzyl SaaS platform.

> [!IMPORTANT] > **Core Principle: Pure UI & Logic Centralization**
> Themes are **Strictly Presentational**. They must NEVER contain business logic (e.g., price calculations, cart management, wishlist storage). All logic must be consumed via **Standardized Hooks** and **Contexts**. This ensures that when we upgrade the backend logic (e.g., add a new discount engine), _every_ theme is automatically upgraded without editing the theme file.

---

## 1. Critical: Hydration & SSR Safety

Templates rely on client-side storage (localStorage) for Cart and Wishlist. To prevent **Hydration Mismatches** (a common source of production bugs), you **MUST** use the `ClientOnly` wrapper.

**Why?** Server-side rendered HTML (empty cart) will not match client-side HTML (3 items in cart), causing React to bail out of hydration.

```tsx
import { ClientOnly } from "remix-utils/client-only";
import { SkeletonLoader } from "~/components/SkeletonLoader"; // Create or use generic

export function MyNewTemplate({ config, ...props }: StoreTemplateProps) {
  return (
    <StoreConfigProvider config={config}>
      <ClientOnly fallback={<SkeletonLoader />}>
        {() => (
          <WishlistProvider>
            {/* Main UI */}
            <div className="min-h-screen">{/* ... */}</div>
          </WishlistProvider>
        )}
      </ClientOnly>
    </StoreConfigProvider>
  );
}
```

---

## 2. World-Class Performance: Bundle Splitting

Monolithic bundles kill conversion rates. We use **Route-based Code Splitting** and **Dynamic Imports** for templates.

When registering your template, use `React.lazy`:

```tsx
// store-registry.ts (Example Pattern)
const EclipseTemplate = React.lazy(
  () => import("~/components/store-templates/EclipseTemplate")
);

// In the loader/router:
<Suspense fallback={<TemplateLoader />}>
  <EclipseTemplate {...props} />
</Suspense>;
```

**Section Level Splitting:**
Use the `SECTION_REGISTRY` which handles dynamic imports for heavy sections automatically.

---

## 3. Theme Token System (Design System)

Do not use arbitrary values. Define a `THEME` constant that follows this exact world-class schema for consistency and animation smoothness.

```tsx
export const THEME_TOKENS = {
  colors: {
    primary: { DEFAULT: "#000", hover: "#333", subtle: "#f0f0f0" },
    secondary: { DEFAULT: "#fff", contrast: "#000" },
    semantic: { success: "#10b981", error: "#ef4444", warning: "#f59e0b" },
  },
  typography: {
    fontFamily: {
      heading: ['"Newsreader"', "serif"],
      body: ['"Inter"', "sans-serif"],
    },
    fontSize: { xs: "0.75rem", sm: "0.875rem", base: "1rem", xl: "1.25rem" },
  },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "40px" },
  shadows: {
    card: "0 1px 3px rgba(0,0,0,0.1)",
    hover: "0 10px 15px -3px rgba(0,0,0,0.1)",
  },
  animations: {
    duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
    easing: { easeOut: "cubic-bezier(0.4, 0, 0.2, 1)" },
  },
} as const;
```

---

## 4. Standardized Hooks (The "Brain")

**Never** write your own logic. Use these hooks to power your UI.

### 💰 Pricing & Discounts: `useProductPrice(product)`

**MANDATORY** for every product card.

- **Why?** Automatically handles Flash Sales, huge discounts, currency formatting, and sales badges.
- **Usage**:
  ```tsx
  const { price, compareAtPrice, isFlashSale, isOnSale } =
    useProductPrice(product);
  ```

### ❤ Wishlist: `useWishlist()`

**MANDATORY** for wishlist interactions.

- **Why?** Handles `localStorage` persistence and global state sync.
- **Usage**:
  ```tsx
  const { isInWishlist, toggleWishlist } = useWishlist();
  ```

### 🛒 Cart: `useCartCount()`

**MANDATORY** for header cart icons.

- **Why?** Handles isolation from other browser tabs and hydration issues.

---

## 5. AI Integration: The API Contract (Secret Sauce)

Your template must be "AI Editable". To allow the AI to intelligently redesign sections, you must expose an **`AI_SCHEMA`** for complex sections.

**Reference**: See `AI_ARCHITECTURE_SPEC.md` for the full system architecture.

### Schema-First Design (Mandatory)

Every section component must export a schema defining _exactly_ what the AI can allow the merchant to edit.

```tsx
// Export this alongside your component (e.g., HeroSection.tsx)
export const HERO_SECTION_AI_SCHEMA = {
  component: "hero",
  version: "1.0",
  properties: {
    title: {
      type: "text",
      aiEditable: true,
      maxLength: 100,
      aiPrompt: "Compelling hero title for {storeType} store", // Context-aware prompt
      examples: ["Welcome to Our Store", "New Collection 2025"],
    },
    background: {
      type: "object",
      aiEditable: true,
      properties: {
        color: {
          type: "color",
          aiTransform: "hexToRgb",
          constraints: { minBrightness: 0.3 }, // Accessibility check
        },
        image: {
          type: "image",
          aiAction: "generate", // Enables AI Image Generation
          constraints: { maxSizeMB: 2, aspectRatio: "16:9" },
        },
      },
    },
    cta: {
      type: "object",
      aiEditable: true,
      properties: {
        text: {
          type: "text",
          aiEnum: ["Shop Now", "Explore", "Get Started"], // Restrict AI creativity here
        },
        action: {
          type: "link",
          aiValidate: "internalLink", // Ensure valid internal routing only
        },
      },
    },
  },
  actions: ["update", "duplicate", "remove", "reorder"],
};
```

---

## 6. Security & SEO Standards

### Content Security Policy (CSP)

Templates must be CSP-compliant. Avoid inline scripts (`<script>...</script>`) and `eval()`. Use `style={{}}` react prop instead of `<style>` tags where possible.

### SEO Schema Injection

Every template MUST inject JSON-LD structured data for products to ensure Google Rich Snippets (Star ratings, Price, Stock status).

```tsx
// Helper: getProductSchema(product)
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    offers: {
      "@type": "Offer",
      price: product.price,
      availability: product.inStock ? "InStock" : "OutOfStock",
    },
  })}
</script>
```

---

## Quick Checklist for New Templates

1.  [ ] **Wrapped in `ClientOnly`**?
2.  [ ] **Wrapped in `StoreConfigProvider` & `WishlistProvider`**?
3.  [ ] **Using `useProductPrice`** for all prices?
4.  [ ] **Using `THEME_TOKENS`** (no magic hex codes)?
5.  [ ] **Mobile Responsive** (Hamburger menu, touch targets)?
6.  [ ] **Exported via `React.lazy`**?

---

**Version**: 2.0.0 (World-Class Standard)
