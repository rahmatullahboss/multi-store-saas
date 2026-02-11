---
description: How to implement a custom-designed store for a specific client within the Multi-Store SaaS platform
---

# Custom Store Implementation Workflow

This workflow describes the process for implementing a custom design for a specific client while keeping them on the shared SaaS platform.

## 1. Scaffold the Custom Template

Create a new directory for the client's store in the templates folder. It is recommended to copy the `starter-store` as a base.

```bash
# Navigate to the templates directory
cd apps/web/app/components/store-templates

# Create a new directory for the client (e.g., client-xyz)
cp -r starter-store client-xyz
```

## 2. Rename and Customize Components

1.  Rename the main component in `client-xyz/index.tsx` to `ClientXyzTemplate`.
2.  Rename the theme file in `client-xyz/theme.ts` to `CLIENT_XYZ_THEME`.
3.  Implement the custom design by modifying the components in `client-xyz/sections/` and `client-xyz/pages/`.
    - **Header/Footer**: Customize `sections/Header.tsx` and `sections/Footer.tsx`.
    - **Homepage**: Modify `index.tsx`.
    - **Product Page**: Create or modify `pages/ProductPage.tsx`.

## 3. Register the Template

Open `apps/web/app/templates/store-registry.ts` and register the new template.

```typescript
// 1. Import the new components
import { CLIENT_XYZ_THEME } from '~/components/store-templates/client-xyz/theme';

const ClientXyzTemplate = React.lazy(() =>
  import('~/components/store-templates/client-xyz/index').then((m) => ({
    default: m.ClientXyzTemplate,
  }))
);

// ... import other page components if needed

// 2. Add to STORE_TEMPLATE_THEMES
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  // ... existing themes
  'client-xyz': {
    primary: CLIENT_XYZ_THEME.primary,
    accent: CLIENT_XYZ_THEME.accent,
    // ... map other colors
  },
};

// 3. Add to STORE_TEMPLATES array
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  // ... existing templates
  {
    id: 'client-xyz', // This ID is crucial!
    name: 'Client XYZ Custom Store',
    description: 'Custom design implementation for Client XYZ',
    thumbnail: '/templates/placeholder.png', // Optional
    category: 'modern', // Or a new 'private' category
    theme: STORE_TEMPLATE_THEMES['client-xyz'],
    fonts: {
      heading: 'Inter', // Custom fonts
      body: 'Inter',
    },
    component: ClientXyzTemplate,
    // Map custom page components if they exist, otherwise use Shared
    Header: ClientXyzHeader,
    Footer: ClientXyzFooter,
    ProductPage: ClientXyzProductPage, // or SharedProductPage
    CartPage: SharedCartPage,
    CollectionPage: SharedCollectionPage,
    CheckoutPage: SharedCheckoutPage,
  },
];
```

## 4. Assign to Store

In your Database or Admin Panel, update the target store's settings to use the new template ID.

- **Database Field**: `Store.theme` or `Store.themeConfig.storeTemplateId`
- **Value**: `'client-xyz'` (The `id` you defined in step 3)

## 5. Verify

1.  Navigate to the client's domain (or localhost with the correct host header).
2.  The system will load `store.home.tsx`.
3.  `resolveStore` will identify the store.
4.  `getStoreTemplate('client-xyz')` will return your new component.
5.  The custom design will be rendered.

## Best Practices

- **Shared Components**: Use `~/components/store-templates/shared/` for generic parts (Cart, Checkout) to save time.
- **Tailwind Config**: Ensure any custom fonts or colors are compatible with the global Tailwind config or use arbitrary values in the client's components.
- **Isolation**: Keep all client-specific code inside their folder `apps/web/app/components/store-templates/client-xyz`. Do not modify shared files for a single client unless necessary.
