# Landing Page Template Building Guide

> **Last Updated:** January 2026  
> **System Version:** Multi-Store SaaS with Isolated Feature Folders & ThemeConfig

---

## 🚀 Quick Start (New Architecture - Feature Folders)

```tsx
// 1. Create your template folder structure
// app/components/templates/your-template/
// ├── index.tsx          # Main template component
// ├── theme.ts           # Template-specific theme
// ├── SectionRenderer.tsx # Template's section renderer
// ├── Hero.tsx           # Template's hero section
// ├── Features.tsx       # Template's features section
// ├── Testimonials.tsx   # Template's testimonials
// ├── Gallery.tsx        # Gallery section
// ├── FAQ.tsx            # FAQ section
// └── OrderForm.tsx      # Order form (CTA)

// 2. Import from shared core
import { ThemeConfig, SectionProps, applyCustomColors } from '../_core/types';
import { FloatingButtons } from '../_core/FloatingButtons';
import type { TemplateProps } from '~/templates/registry';

// 3. Import your local theme
import { YOUR_THEME } from './theme';

// 4. Template component
export function YourTemplate({ product, config, storeName, storeId, ... }: TemplateProps) {
  const theme = applyCustomColors(YOUR_THEME, config.primaryColor, config.accentColor);

  return (
    <div className={`min-h-screen ${theme.bgPrimary} ${theme.textPrimary}`}>
      {/* Import YOUR local SectionRenderer */}
      <SectionRenderer
        sectionOrder={config.sectionOrder}
        hiddenSections={config.hiddenSections}
        config={config}
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

      <FloatingButtons
        whatsappEnabled={config.whatsappEnabled}
        whatsappNumber={config.whatsappNumber}
        callEnabled={config.callEnabled}
        callNumber={config.callNumber}
        productTitle={product.title}
      />
    </div>
  );
}
```

---

## 📁 Feature Folders Structure (New)

Each template is now **fully isolated** in its own directory:

```
app/components/templates/
├── _core/                    # Shared utilities
│   ├── types.ts              # ThemeConfig, SectionProps, applyCustomColors
│   └── FloatingButtons.tsx   # Shared floating buttons
├── flash-sale/               # Flash Sale Template
│   ├── index.tsx             # Main component
│   ├── theme.ts              # FLASH_SALE_THEME
│   ├── SectionRenderer.tsx   # Template's renderer
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Testimonials.tsx
│   ├── Gallery.tsx
│   ├── FAQ.tsx
│   └── OrderForm.tsx
├── luxe/                     # Luxe Template
├── organic/                  # Organic Template
├── modern-dark/              # Modern Dark Template
├── showcase/                 # Showcase Template
├── minimal-light/            # Minimal Light Template
├── mobile-first/             # Mobile First Template
├── video-focus/              # Video Focus Template
├── premium-bd/               # Premium BD Template
└── modern-premium/           # Modern Premium Template
```

---

## 🎨 ThemeConfig System

All templates define their theme in a local `theme.ts` file:

### Example Theme File (`your-template/theme.ts`)

```typescript
import type { ThemeConfig } from "../_core/types";

export const YOUR_THEME: ThemeConfig = {
  isDark: true,
  primary: "#1a1a1a",
  accent: "#f59e0b",
  bgPrimary: "bg-zinc-900",
  bgSecondary: "bg-zinc-800",
  textPrimary: "text-white",
  textSecondary: "text-gray-400",
  cardBg: "bg-zinc-800",
  cardBorder: "border-zinc-700",
  ctaBg: "bg-orange-500",
  ctaText: "text-white",
  headerBg: "bg-zinc-900",
  footerBg: "bg-zinc-950",
  footerText: "text-gray-400",
  urgencyBg: "bg-red-600",
};
```

### ThemeConfig Interface

```typescript
interface ThemeConfig {
  isDark: boolean;
  primary: string; // Hex color
  accent: string; // Hex color
  bgPrimary: string; // Tailwind class
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  ctaBg: string;
  ctaText: string;
  headerBg: string;
  footerBg: string;
  footerText: string;
  urgencyBg?: string;
}
```

### Apply Custom Colors

```tsx
import { applyCustomColors } from "../_core/types";
import { YOUR_THEME } from "./theme";

// Apply user's selected colors to the preset theme
const theme = applyCustomColors(
  YOUR_THEME,
  config.primaryColor,
  config.accentColor
);
```

---

## 📦 Local Section Components

Each template has its **own section implementations**. Copy from an existing template and customize:

### Example: `your-template/Hero.tsx`

```tsx
import type { SectionProps } from "../_core/types";
import { OptimizedImage } from "~/components/OptimizedImage";

export function Hero({ config, product, theme, formatPrice }: SectionProps) {
  return (
    <section className={`py-12 ${theme.bgPrimary}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className={`text-4xl font-bold ${theme.textPrimary}`}>
          {product.title}
        </h1>
        <p
          className={`text-2xl ${theme.ctaBg} ${theme.ctaText} inline-block px-4 py-2 rounded-lg`}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </section>
  );
}
```

### SectionProps Interface

```typescript
interface SectionProps {
  config: LandingConfig;
  product: any;
  storeName: string;
  theme: ThemeConfig;
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

### Step 1: Create Template Folder

```bash
mkdir -p app/components/templates/my-template
```

### Step 2: Copy & Customize

Copy an existing template folder (e.g., `flash-sale/`) and rename files.

### Step 3: Create `theme.ts`

```typescript
// my-template/theme.ts
import type { ThemeConfig } from "../_core/types";

export const MY_THEME: ThemeConfig = {
  isDark: false,
  primary: "#2563eb",
  accent: "#10b981",
  // ... rest of theme
};
```

### Step 4: Create `SectionRenderer.tsx`

```tsx
// my-template/SectionRenderer.tsx
import { Hero } from "./Hero";
import { Features } from "./Features";
import { OrderForm } from "./OrderForm";
// Import other local sections...

const SECTION_MAP: Record<string, React.FC<SectionProps>> = {
  hero: Hero,
  features: Features,
  "order-form": OrderForm,
  // Map more sections...
};

export function SectionRenderer({
  sectionOrder,
  hiddenSections,
  ...props
}: SectionRendererProps) {
  // Render sections based on order...
}
```

### Step 5: Register in `registry.ts`

```tsx
// app/templates/registry.ts
import { MyTemplate } from "~/components/templates/my-template";

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "my-template",
    name: "My Template",
    description: "Description here",
    thumbnail: "/templates/my-template.png",
    component: MyTemplate,
  },
];
```

---

## ✅ Checklist for New Templates

- [ ] Create template folder in `templates/my-template/`
- [ ] Create `theme.ts` with your ThemeConfig
- [ ] Create `index.tsx` (main component)
- [ ] Create `SectionRenderer.tsx`
- [ ] Create all section components (Hero, Features, etc.)
- [ ] Import types from `../_core/types`
- [ ] Use `applyCustomColors()` for user color overrides
- [ ] Add `FloatingButtons` from `../_core/FloatingButtons`
- [ ] Add Ozzyl branding for `planType === 'free'`
- [ ] Register in `templates/registry.ts`

---

## 📋 Available Templates

| Template ID      | Folder            | Style                    |
| ---------------- | ----------------- | ------------------------ |
| `flash-sale`     | `flash-sale/`     | Red/Yellow urgency, dark |
| `modern-dark`    | `modern-dark/`    | Zinc/Orange gradient     |
| `minimal-light`  | `minimal-light/`  | Clean white              |
| `organic`        | `organic/`        | Green/Nature             |
| `luxe`           | `luxe/`           | Gold/Black luxury        |
| `video-focus`    | `video-focus/`    | Purple/Violet            |
| `premium-bd`     | `premium-bd/`     | Orange/Green             |
| `showcase`       | `showcase/`       | Dark gallery             |
| `mobile-first`   | `mobile-first/`   | Mobile optimized         |
| `modern-premium` | `modern-premium/` | Glassmorphism            |

---

## Support

Check existing templates for patterns:

- `flash-sale/` - Dark urgency theme with countdown
- `luxe/` - Luxury gold theme
- `modern-dark/` - Dark gradient theme
- `minimal-light/` - Clean light theme
