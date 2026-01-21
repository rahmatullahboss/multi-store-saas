# GENIE_DEV_IMPLEMENTATION.md

Practical implementation guide for Quick Builder developers. Heavy on code, light on prose.

---

## 1. Adding Intent Wizard Step (100 lines)

### Route: `app/routes/app.quick-builder.new.tsx`

Multi-step form pattern for product selection → goal → traffic source → builder launch.

```typescript
// app/routes/app.quick-builder.new.tsx
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { products } from '@db/schema';
import { createDb } from '~/lib/db.server';

// Intent schema - validates user selections
export const IntentSchema = z.object({
  productType: z.enum(['single', 'multiple']),
  goal: z.enum(['direct_sales', 'lead_whatsapp']),
  trafficSource: z.enum(['facebook', 'tiktok', 'organic']),
  productId: z.number().int().positive(),
});

export type Intent = z.infer<typeof IntentSchema>;

// Loader: Fetch store products
export async function loader({ context }: LoaderFunctionArgs) {
  const { storeId, cloudflare } = context;
  const db = createDb(cloudflare.env.DB);
  
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId as number))
    .limit(50);
  
  return json({ products: storeProducts });
}

// Action: Create landing page from intent
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });
  
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  
  const validatedIntent = IntentSchema.parse({
    productType: body.productType,
    goal: body.goal,
    trafficSource: body.trafficSource,
    productId: parseInt(body.productId as string),
  });
  
  const db = createDb(context.cloudflare.env.DB);
  
  // Generate initial landing config from intent
  const landingConfig = generateDefaultContent(validatedIntent);
  
  // Create landing page record (pseudo-code)
  const page = await db.insert(savedLandingConfigs).values({
    storeId: context.storeId,
    title: `${validatedIntent.goal} Campaign`,
    configJson: JSON.stringify(landingConfig),
    intent: JSON.stringify(validatedIntent),
  }).returning();
  
  return json({ pageId: page[0].id, redirect: `/app/quick-builder/${page[0].id}` });
}

// Component with step management
export default function IntentWizard() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [intent, setIntent] = useState<Partial<Intent>>({});
  
  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };
  
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('productType', intent.productType || '');
    formData.append('goal', intent.goal || '');
    formData.append('trafficSource', intent.trafficSource || '');
    formData.append('productId', intent.productId?.toString() || '');
    fetcher.submit(formData, { method: 'POST' });
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">কোন ধরনের প্রোডাক্ট?</h2>
          <select 
            value={intent.productType || ''} 
            onChange={(e) => setIntent({ ...intent, productType: e.target.value as 'single' | 'multiple' })}
            className="w-full p-2 border rounded mb-4"
          >
            <option>একটি নির্বাচন করুন</option>
            <option value="single">একটি পণ্য</option>
            <option value="multiple">একাধিক পণ্য</option>
          </select>
          <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded">পরবর্তী</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">আপনার লক্ষ্য কি?</h2>
          <div className="space-y-2">
            {(['direct_sales', 'lead_whatsapp'] as const).map(g => (
              <label key={g} className="flex items-center p-3 border rounded cursor-pointer">
                <input 
                  type="radio" 
                  name="goal" 
                  value={g}
                  checked={intent.goal === g}
                  onChange={(e) => setIntent({ ...intent, goal: e.target.value as Intent['goal'] })}
                  className="mr-3"
                />
                {g === 'direct_sales' ? 'সরাসরি বিক্রয়' : 'হোয়াটসঅ্যাপ লিড'}
              </label>
            ))}
          </div>
          <button onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded mt-4">পরবর্তী</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">পণ্য নির্বাচন করুন</h2>
          <select 
            value={intent.productId || ''} 
            onChange={(e) => setIntent({ ...intent, productId: parseInt(e.target.value) })}
            className="w-full p-2 border rounded mb-4"
          >
            <option>পণ্য নির্বাচন করুন</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button onClick={handleSubmit} disabled={fetcher.state !== 'idle'} className="bg-green-600 text-white px-4 py-2 rounded">
            {fetcher.state === 'submitting' ? 'তৈরি হচ্ছে...' : 'শুরু করুন'}
          </button>
        </div>
      )}
    </div>
  );
}

function generateDefaultContent(intent: Intent): Record<string, any> {
  return {
    sections: [
      { type: 'hero', variant: 'product-focused' },
      { type: 'testimonials', variant: 'carousel' },
      { type: 'cta', variant: 'button-only' },
    ],
    styleWizard: {
      primaryColor: '#3B82F6',
      buttonStyle: 'rounded',
    },
  };
}
```

---

## 2. Adding Section Variant (100 lines)

### Create component in `app/components/templates/[template]/`

Register new variant in SECTION_VARIANTS, update SectionManager.

```typescript
// app/components/page-builder/sections/HeroProductFocused.tsx
import type { SectionVariantProps } from '~/lib/page-builder/types';
import { useState } from 'react';

interface HeroProductFocusedConfig {
  headline: string;
  subheadline: string;
  productImage: string;
  ctaText: string;
  ctaColor: string;
  badges: string[];
}

export function HeroProductFocused({ 
  config, 
  isEditing, 
  onUpdate 
}: SectionVariantProps) {
  const [localConfig, setLocalConfig] = useState<HeroProductFocusedConfig>(
    config as HeroProductFocusedConfig
  );

  const handleChange = (field: keyof HeroProductFocusedConfig, value: any) => {
    const updated = { ...localConfig, [field]: value };
    setLocalConfig(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left: Content */}
        <div>
          {isEditing ? (
            <>
              <textarea
                value={localConfig.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                className="w-full text-4xl font-bold mb-4 p-2 border rounded"
                placeholder="হেডলাইন..."
              />
              <textarea
                value={localConfig.subheadline}
                onChange={(e) => handleChange('subheadline', e.target.value)}
                className="w-full text-lg text-gray-600 mb-6 p-2 border rounded"
                placeholder="সাব-হেডলাইন..."
              />
              <input
                type="text"
                value={localConfig.ctaText}
                onChange={(e) => handleChange('ctaText', e.target.value)}
                className="w-full p-2 border rounded mb-2"
                placeholder="বাটন টেক্সট..."
              />
              <input
                type="color"
                value={localConfig.ctaColor}
                onChange={(e) => handleChange('ctaColor', e.target.value)}
                className="w-12 h-12 border rounded"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-4">{localConfig.headline}</h1>
              <p className="text-lg text-gray-600 mb-6">{localConfig.subheadline}</p>
              <button
                style={{ backgroundColor: localConfig.ctaColor }}
                className="text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90"
              >
                {localConfig.ctaText}
              </button>
            </>
          )}
        </div>

        {/* Right: Product Image */}
        <div>
          {isEditing ? (
            <input
              type="url"
              value={localConfig.productImage}
              onChange={(e) => handleChange('productImage', e.target.value)}
              className="w-full p-2 border rounded mb-2"
              placeholder="ইমেজ URL..."
            />
          ) : null}
          <img
            src={localConfig.productImage}
            alt="Product"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

// Export for registry
export const heroVariants = {
  'product-focused': {
    component: HeroProductFocused,
    name: 'পণ্য ফোকাস',
    nameEn: 'Product Focused',
    description: 'বড় প্রোডাক্ট ইমেজ সহ হিরো',
    descriptionEn: 'Hero with large product image',
    defaultConfig: {
      headline: 'আপনার পণ্যের নাম',
      subheadline: 'সংক্ষিপ্ত বিবরণ',
      productImage: 'https://placeholder.com/400x400',
      ctaText: 'এখনই অর্ডার করুন',
      ctaColor: '#3B82F6',
      badges: ['নতুন', 'সীমিত সংস্করণ'],
    },
  },
};
```

### Register in SECTION_VARIANTS

```typescript
// app/lib/page-builder/registry.ts
import { heroVariants } from '~/components/page-builder/sections/HeroProductFocused';

export const SECTION_VARIANTS: Record<string, Record<string, any>> = {
  'hero': {
    'product-focused': heroVariants['product-focused'],
    'offer-focused': { /* ... */ },
    'video-focused': { /* ... */ },
  },
  'testimonials': {
    'carousel': { /* ... */ },
    'cards': { /* ... */ },
  },
  'cta': {
    'button-only': { /* ... */ },
    'with-trust': { /* ... */ },
  },
};
```

### Update SectionManager.tsx

```typescript
// app/components/landing-builder/SectionManager.tsx
import { SECTION_VARIANTS } from '~/lib/page-builder/registry';

export function SectionVariantSelector({ 
  sectionType, 
  currentVariant, 
  onSelectVariant 
}: { 
  sectionType: string; 
  currentVariant: string; 
  onSelectVariant: (variant: string) => void; 
}) {
  const variants = SECTION_VARIANTS[sectionType] || {};

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-3">ভেরিয়েন্ট পছন্দ করুন</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(variants).map(([variantId, variantDef]) => (
          <button
            key={variantId}
            onClick={() => onSelectVariant(variantId)}
            className={`p-3 border-2 rounded-lg transition ${
              currentVariant === variantId
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{variantDef.name}</div>
            <div className="text-xs text-gray-600">{variantDef.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. Checkout Modal Implementation (100 lines)

### CheckoutModal component pattern

```typescript
// app/components/landing-builder/CheckoutModal.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CheckoutModalContextValue {
  isOpen: boolean;
  productId: number | null;
  openModal: (productId: number) => void;
  closeModal: () => void;
}

const CheckoutModalContext = createContext<CheckoutModalContextValue | null>(null);

export function useCheckoutModal() {
  const context = useContext(CheckoutModalContext);
  if (!context) throw new Error('useCheckoutModal must be used within CheckoutModalProvider');
  return context;
}

export function CheckoutModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);

  const openModal = (pId: number) => {
    setProductId(pId);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <CheckoutModalContext.Provider value={{ isOpen, productId, openModal, closeModal }}>
      {children}
      {isOpen && productId && <CheckoutModalContent productId={productId} onClose={closeModal} />}
    </CheckoutModalContext.Provider>
  );
}

function CheckoutModalContent({ 
  productId, 
  onClose 
}: { 
  productId: number; 
  onClose: () => void; 
}) {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
        <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">অর্ডার ডিটেইলস</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[80vh] md:max-h-[70vh]">
            <CompactCheckoutForm productId={productId} onSuccess={onClose} />
          </div>
        </div>
      </div>
    </>
  );
}
```

### CompactCheckoutForm with Zod validation

```typescript
// app/components/landing-builder/CompactCheckoutForm.tsx
import { useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { z } from 'zod';

const CheckoutFormSchema = z.object({
  customer_name: z.string().min(2, 'নাম প্রয়োজন'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'সঠিক নম্বর দিন'),
  address: z.string().min(5, 'ঠিকানা প্রয়োজন'),
  division: z.enum(['dhaka', 'outside']),
  quantity: z.number().int().min(1).default(1),
  payment_method: z.enum(['cod', 'bkash', 'nagad']).default('cod'),
});

export function CompactCheckoutForm({ 
  productId, 
  onSuccess 
}: { 
  productId: number; 
  onSuccess: () => void; 
}) {
  const fetcher = useFetcher<{ success: boolean; orderId: string }>();
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    division: 'dhaka' as const,
    quantity: 1,
    payment_method: 'cod' as const,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      CheckoutFormSchema.parse(formData);
      setErrors({});
      
      const data = new FormData();
      Object.entries({ ...formData, product_id: productId, store_id: 1 }).forEach(([k, v]) => {
        data.append(k, v.toString());
      });
      
      fetcher.submit(data, { 
        method: 'POST', 
        action: '/api/create-order',
        encType: 'application/x-www-form-urlencoded',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errs: Record<string, string> = {};
        error.errors.forEach(e => {
          errs[e.path[0] as string] = e.message;
        });
        setErrors(errs);
      }
    }
  };

  if (fetcher.data?.success) {
    return (
      <div className="p-6 text-center">
        <div className="text-green-600 mb-2">✓ সফল!</div>
        <p className="text-gray-700 mb-4">আপনার অর্ডার #{fetcher.data.orderId} তৈরি হয়েছে।</p>
        <button onClick={onSuccess} className="bg-blue-600 text-white px-4 py-2 rounded">বন্ধ করুন</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input
        type="text"
        placeholder="নাম"
        value={formData.customer_name}
        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
        className={`w-full p-3 border rounded-lg ${errors.customer_name ? 'border-red-500' : 'border-gray-300'}`}
      />
      {errors.customer_name && <p className="text-red-600 text-sm">{errors.customer_name}</p>}

      <input
        type="tel"
        placeholder="মোবাইল নম্বর"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
      />
      {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}

      <textarea
        placeholder="ডেলিভারি ঠিকানা"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
      />
      {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}

      <select
        value={formData.division}
        onChange={(e) => setFormData({ ...formData, division: e.target.value as 'dhaka' | 'outside' })}
        className="w-full p-3 border border-gray-300 rounded-lg"
      >
        <option value="dhaka">ঢাকার মধ্যে (60 টাকা)</option>
        <option value="outside">ঢাকার বাইরে (120 টাকা)</option>
      </select>

      <select
        value={formData.payment_method}
        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as 'cod' | 'bkash' | 'nagad' })}
        className="w-full p-3 border border-gray-300 rounded-lg"
      >
        <option value="cod">ক্যাশ অন ডেলিভারি</option>
        <option value="bkash">bKash</option>
        <option value="nagad">Nagad</option>
      </select>

      <button
        type="submit"
        disabled={fetcher.state !== 'idle'}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {fetcher.state === 'submitting' ? 'প্রক্রিয়া হচ্ছে...' : 'অর্ডার নিশ্চিত করুন'}
      </button>
    </form>
  );
}
```

---

## 4. Working with LandingConfig (100 lines)

### Key interfaces

```typescript
// app/lib/page-builder/types.ts

// Main config for entire landing page
export interface LandingConfig {
  id: string;
  storeId: number;
  title: string;
  slug: string;
  
  // Sections array
  sections: SectionConfig[];
  
  // Style overrides
  styleWizard: StyleWizardConfig;
  
  // Checkout behavior
  checkoutModalEnabled: boolean;
  checkoutModalPosition: 'floating' | 'sticky-bottom' | 'hidden';
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  
  // Analytics
  publishedAt: string | null;
  viewCount: number;
  conversionCount: number;
  
  // Creator intent (for recommendations)
  intent: Intent;
}

// Single section in the page
export interface SectionConfig {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'faq' | 'gallery';
  variant: string;  // e.g., 'product-focused', 'carousel'
  sortOrder: number;
  enabled: boolean;
  
  // Section-specific props
  props: Record<string, any>;
  
  // Visibility rules (show/hide on mobile, etc.)
  visibility: VisibilityRule;
}

// Controls when section displays
export interface VisibilityRule {
  hideOnMobile: boolean;
  hideOnDesktop: boolean;
  showAfterScroll: number;  // pixels
  condition?: 'always' | 'if-visitor-from-facebook' | 'if-first-visit';
}

// Style wizard config
export interface StyleWizardConfig {
  primaryColor: string;        // HEX
  secondaryColor: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  fontFamily: 'sans' | 'serif' | 'mono';
  darkMode: boolean;
  customCSS?: string;
}

export interface Intent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
}
```

### Default config location

```typescript
// app/lib/page-builder/defaults.ts

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  id: '',
  storeId: 0,
  title: 'নতুন ক্যাম্পেইন',
  slug: 'new-campaign',
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      variant: 'product-focused',
      sortOrder: 0,
      enabled: true,
      props: {
        headline: 'আপনার পণ্য এখানে',
        subheadline: 'একটি আকর্ষণীয় অফার',
        ctaText: 'এখনই অর্ডার করুন',
      },
      visibility: {
        hideOnMobile: false,
        hideOnDesktop: false,
        showAfterScroll: 0,
      },
    },
  ],
  styleWizard: {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    buttonStyle: 'rounded',
    fontFamily: 'sans',
    darkMode: false,
  },
  checkoutModalEnabled: true,
  checkoutModalPosition: 'floating',
  seoTitle: '',
  seoDescription: '',
  ogImage: '',
  publishedAt: null,
  viewCount: 0,
  conversionCount: 0,
  intent: {
    productType: 'single',
    goal: 'direct_sales',
    trafficSource: 'facebook',
  },
};
```

### Adding new fields to config

```typescript
// When adding a new feature, update:

// 1. Interface definition
export interface LandingConfig {
  // ... existing fields
  newFeatureEnabled: boolean;  // NEW
}

// 2. Default config
export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  // ... existing fields
  newFeatureEnabled: true,  // NEW
};

// 3. Zod schema for validation
export const LandingConfigSchema = z.object({
  // ... existing fields
  newFeatureEnabled: z.boolean().default(true),  // NEW
});

// 4. Database migration
// ALTER TABLE saved_landing_configs 
// ADD COLUMN newFeatureEnabled BOOLEAN DEFAULT 1;

// 5. Load/save in routes
export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDb(context.cloudflare.env.DB);
  const config = await db.query.savedLandingConfigs.findFirst({ /* ... */ });
  
  // Merge with defaults
  return {
    config: { ...DEFAULT_LANDING_CONFIG, ...parseLandingConfig(config?.configJson) },
  };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = createDb(context.cloudflare.env.DB);
  const body = await request.json();
  
  // Validate with schema
  const validated = LandingConfigSchema.parse(body);
  
  // Save to DB
  await db.update(savedLandingConfigs).set({
    configJson: JSON.stringify(validated),
    updatedAt: new Date(),
  });
  
  return json({ success: true });
}
```

### Type safety tips

```typescript
// ✅ GOOD: Use interfaces for shape validation
export interface SectionProps<T extends Record<string, any>> {
  config: T;
  onUpdate: (updated: T) => void;
}

// ✅ GOOD: Use discriminated unions for section types
type Section = 
  | { type: 'hero'; props: HeroProps }
  | { type: 'cta'; props: CTAProps }
  | { type: 'features'; props: FeaturesProps };

// ❌ AVOID: Using Record<string, any> everywhere
// export function SectionEditor(props: Record<string, any>) { }

// ✅ GOOD: Use Zod for runtime validation
const OrderSchema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/),
  quantity: z.number().int().min(1),
});

// ❌ AVOID: Manual validation in handlers
// if (!phone || phone.length < 10) { throw Error('Invalid') }

// ✅ GOOD: Extend existing types when possible
export interface CustomLandingConfig extends LandingConfig {
  premiumFeatures: PremiumConfig;
}

// ❌ AVOID: Duplicating entire interface definitions
```

---

## Key Takeaways

1. **Intent Wizard**: Multi-step form (useState), persist to DB, generate default config
2. **Section Variants**: Component + registry entry + SectionVariantSelector UI
3. **Checkout Modal**: Context API for state, useFetcher for POST to /api/create-order
4. **LandingConfig**: Interface + defaults + Zod schema + DB migrations, use discriminated unions
5. All forms use Zod for runtime validation with error messages
6. Banglish throughout (English letters for Bangla words)
