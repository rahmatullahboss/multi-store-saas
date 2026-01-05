# Template System Guide

How to add new storefront templates to Multi-Store SaaS.

## Current Templates

Located in `app/components/templates/`:

| Template                  | Description                     |
| ------------------------- | ------------------------------- |
| `StoreLayout.tsx`         | Full e-commerce store (default) |
| `LandingPageTemplate.tsx` | Single product landing page     |

## Adding a New Template

### Step 1: Create Template Component

Create a new file in `app/components/templates/`:

```tsx
// app/components/templates/NewTemplate.tsx

import { useLanguage, useFormatPrice } from "~/contexts/LanguageContext";

interface NewTemplateProps {
  storeName: string;
  storeId: number;
  products: Product[];
  // ... other props
}

export function NewTemplate(props: NewTemplateProps) {
  // Use global language context
  const { lang, t } = useLanguage();
  const formatPrice = useFormatPrice();

  return (
    <div>
      {/* {t('home')} for translations */}
      {/* {formatPrice(100)} for prices */}
    </div>
  );
}
```

### Step 2: Register Template

Add to `app/templates/registry.ts`:

```ts
import { NewTemplate } from "~/components/templates/NewTemplate";

export const TEMPLATES = [
  // ... existing templates
  {
    id: "new-template",
    name: "New Template",
    description: "Description here",
    thumbnail: "/templates/new-template.png",
    component: NewTemplate,
  },
];
```

### Step 3: Add Translations (if needed)

Add any new translation keys to `app/utils/i18n.ts`:

```ts
export const translations = {
  en: {
    // ... existing
    newKey: "English text",
  },
  bn: {
    // ... existing
    newKey: "বাংলা টেক্সট",
  },
};
```

## Using Translations

```tsx
import {
  useLanguage,
  useFormatPrice,
  useTranslation,
} from "~/contexts/LanguageContext";

function MyComponent() {
  // Option 1: Full context
  const { lang, t, toggleLang } = useLanguage();

  // Option 2: Just translation function
  const t = useTranslation();

  // Option 3: Price formatter
  const formatPrice = useFormatPrice();

  return (
    <div>
      <h1>{t("home")}</h1>
      <p>{formatPrice(1500)}</p>
      <button onClick={toggleLang}>{lang === "en" ? "বাংলা" : "EN"}</button>
    </div>
  );
}
```

## Language Toggle URL

Language is stored in URL: `?lang=bn` or `?lang=en`

This allows:

- Persistence across page navigation
- Shareable URLs with language preference
- SEO-friendly language switching
