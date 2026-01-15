# Landing Page Template Building Guide

> **Last Updated:** January 2026  
> **System Version:** Multi-Store SaaS with Isolated Feature Folders, ThemeConfig & Product Variants

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
│   ├── OrderForm.tsx
│   └── StickyBuyButton.tsx # Optional: Mobile sticky CTA
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
  productVariants?: LandingProductVariant[]; // Product variants (weight, color, etc.)
  orderBumps?: any[];
  storeId?: number | string;
  planType?: string;
}
```

---

## 🛒 Order Form Features

The `OrderForm.tsx` component in each template supports the following features:

### Product Variant Selection

Users can select product variants (e.g., weight, color, size) directly within the order form. The selected variant's price dynamically updates the subtotal and total.

```tsx
// In OrderForm.tsx
const [formData, setFormData] = useState({
  customer_name: "",
  phone: "",
  address: "",
  division: "dhaka" as DivisionValue,
  quantity: 1,
  selectedVariant: config.productVariants?.[0] || null, // Default to first variant
});

// Dynamic price calculation
const subtotal =
  (formData.selectedVariant?.price || product.price) * formData.quantity;
```

### Variant Selector UI

```tsx
{
  config.productVariants && config.productVariants.length > 0 && (
    <div className="...">
      <span>পণ্য নির্বাচন করুন</span>
      <div className="flex flex-wrap gap-2">
        {config.productVariants.map((variant) => (
          <button
            key={variant.id}
            onClick={() =>
              setFormData({ ...formData, selectedVariant: variant })
            }
            className={
              formData.selectedVariant?.id === variant.id
                ? "active-style"
                : "inactive-style"
            }
          >
            {variant.name}
            {variant.price && <span>({formatPrice(variant.price)})</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Delivery Area & Dynamic Shipping

Shipping costs are calculated based on the selected delivery area (Inside Dhaka vs Outside Dhaka) using `config.shippingConfig`.

```tsx
import {
  calculateShipping,
  DEFAULT_SHIPPING_CONFIG,
  type DivisionValue,
} from "~/utils/shipping";

const shippingCost = calculateShipping(
  config.shippingConfig || DEFAULT_SHIPPING_CONFIG,
  formData.division,
  subtotal
).cost;
```

### Quantity Selector

All order forms include a quantity selector with +/- buttons.

```tsx
<button onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}> - </button>
<span>{formData.quantity}</span>
<button onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}> + </button>
```

### Form Submission with Variant

```tsx
if (formData.selectedVariant)
  submitData.set("variant_name", formData.selectedVariant.name);
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
- [ ] Add `StickyBuyButton` for mobile CTA (optional)
- [ ] Implement product variant selection in `OrderForm.tsx`
- [ ] Implement delivery area selection (Dhaka / Outside Dhaka)
- [ ] Implement quantity selector with +/- controls
- [ ] Use `calculateShipping()` for dynamic shipping costs
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

---

## 📚 Available Sections (Section Manager)

Total Sections: **16**

The following sections are available in the Quick Builder's `SectionManager`:

| ID | Name (BN) | Name (EN) | Description (BN) | Icon |
|Keys: **bold** | ----------------- | ------------------- | ---------------------------- | -------------- |
| `hero` | হেডার | Header | প্রথমে যা দেখা যাবে | Type |
| `video` | ভিডিও | Video | প্রোডাক্ট ভিডিও/ডেমো | Video |
| `trust` | বিশ্বাসযোগ্যতা | Trust Badges | গ্যারান্টি ও নিরাপত্তা | ShieldCheck |
| `problem-solution`| সমস্যা ও সমাধান | Problem Solution | সমস্যা এবং সমাধান তুলে ধরুন | AlertCircle |
| `features` | বৈশিষ্ট্য | Features | প্রোডাক্টের সুবিধাসমূহ | Star |
| `benefits` | কেন কিনবেন | Why Buy Us | কেন আমাদের থেকে কিনবেন | CheckCircle |
| `showcase` | প্রোডাক্ট ডিটেইলস | Product Details | প্রোডাক্টের বিস্তারিত বর্ণনা | Box |
| `comparison` | তুলনা | Comparison | আগে/পরে বা প্রতিযোগী তুলনা | Layers |
| `gallery` | ফটো গ্যালারি | Photo Gallery | প্রোডাক্ট ইমেজ গ্যালারি | Image |
| `social` | সোশ্যাল প্রুফ | Social Proof | অর্ডার/ভিজিটর সংখ্যা | Users |
| `testimonials` | টেস্টিমোনিয়াল | Testimonials | কাস্টমার রিভিউ | MessageSquare |
| `delivery` | ডেলিভারি | Delivery Info | শিপিং ও ডেলিভারি তথ্য | Truck |
| `pricing` | প্রাইসিং | Pricing | প্রাইসিং প্ল্যান এবং ফিচার | Tag |
| `guarantee` | গ্যারান্টি | Guarantee | রিটার্ন ও রিফান্ড পলিসি | ShieldCheck |
| `how-to-order` | অর্ডার প্রক্রিয়া | How to Order | অর্ডার করার নিয়মাবলী | ListOrdered |
| `cta` | অর্ডার ফর্ম | Order Form | যেখানে কাস্টমার অর্ডার করবে | ShoppingCart |
| `faq` | FAQ | FAQ | সচরাচর জিজ্ঞাসা | HelpCircle |
