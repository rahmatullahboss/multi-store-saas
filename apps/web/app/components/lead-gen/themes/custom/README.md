# Custom Lead Gen Themes (Paid Clients)

This folder contains custom-designed lead generation themes for **paid clients**.

## How to Create a New Custom Theme

### Step 1: Copy the Scaffold

```bash
cp _scaffold.tsx client-name.tsx
```

### Step 2: Customize the Theme

Open the new file and replace all `TODO:` comments:

- **Rename** the component function (e.g. `ClientFashionHouseRenderer`)
- **Hero section** — background, layout, imagery
- **Services** — client-specific service cards
- **Testimonials** — real client testimonials
- **Footer** — contact info, social links
- **Colors** — adjust inline styles
- **Fonts** — change `fontFamily` if needed

### Step 3: Register the Theme

In `lead-gen-registry.ts`:

1. Add the import at the top:

```typescript
import ClientNameRenderer from './themes/custom/client-name';
```

2. Add to `CUSTOM_TEMPLATES` array:

```typescript
{
  id: 'client-name',
  name: 'Client Name',
  description: 'Custom theme for Client Name.',
  component: ClientNameRenderer,
  isPaid: true,
  category: 'custom',
  clientName: 'Client Name',
},
```

### Step 4: Add Default Settings

In `config/lead-gen-theme-settings.ts`, add to `CUSTOM_LEAD_GEN_SETTINGS`:

```typescript
'client-name': {
  storeName: 'Client Name',
  logo: null,
  favicon: null,
  primaryColor: '#...',
  accentColor: '#...',
  heroHeading: '...',
  heroDescription: '...',
  ctaButtonText: '...',
  showAnnouncement: false,
  announcementText: null,
  showTestimonials: true,
  showServices: true,
  phone: null,
  email: null,
  address: null,
},
```

### Step 5: Assign to Store

Set the store's `lead_gen_config` JSON to include `"themeId": "client-name"`.

---

## File Naming Convention

- Use kebab-case: `client-fashion-house.tsx`
- Prefix with `client-` to distinguish from core themes
- Component name: `ClientFashionHouseRenderer` (PascalCase)

## Shared Components

All custom themes can use shared components from `../shared.tsx`:

| Component         | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `LeadCaptureForm` | Form with name, email, phone, company, message fields |
| `ServiceCard`     | Card component for services section                   |
| `TestimonialCard` | Card for testimonials with star rating                |
| `hexToRgb`        | Utility to convert hex color to RGB string            |
