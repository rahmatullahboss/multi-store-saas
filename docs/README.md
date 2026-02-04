# Documentation Index - Multi Store SaaS

## 🎯 Quick Links

| Document                          | Description                                    |
| --------------------------------- | ---------------------------------------------- |
| [AGENTS.md](../AGENTS.md)         | Main development guidelines & coding standards |
| [NEXT_STEPS.md](../NEXT_STEPS.md) | Current development roadmap & next tasks       |
| [LAUNCH_READINESS_2026-02-04.md](LAUNCH_READINESS_2026-02-04.md) | Sprint delivery, pending work, and go-live checklist |

---

## 🎨 Theme System (Shopify OS 2.0)

The storefront uses a **Shopify OS 2.0 compatible theme system**.

### Core Components

| File                                                 | Purpose                         |
| ---------------------------------------------------- | ------------------------------- |
| `~/themes/*`                                         | Theme folders with sections     |
| `~/lib/theme-engine/ThemeBridge.ts`                  | Theme loader & section registry |
| `~/components/store/ThemeStoreRenderer.tsx`          | Storefront section renderer     |
| `~/components/store-builder/LiveEditorV2.client.tsx` | Visual theme editor             |

### Available Themes

| Theme ID        | Description           |
| --------------- | --------------------- |
| `starter-store` | Default minimal store |
| `daraz`         | Marketplace style     |
| `bdshop`        | BDShop variant        |
| `ghorer-bazar`  | Grocery store         |
| `luxe-boutique` | Luxury boutique       |
| `tech-modern`   | Tech/gadget store     |

---

## 📁 Documentation Categories

### Infrastructure

- [CLOUDFLARE_SAAS_SETUP.md](CLOUDFLARE_SAAS_SETUP.md) - Cloudflare SaaS setup guide
- [CLOUDFLARE_OZZYL_SETUP.md](CLOUDFLARE_OZZYL_SETUP.md) - Ozzyl domain setup
- [D1_OPTIMIZATION_GUIDE.md](D1_OPTIMIZATION_GUIDE.md) - Database optimization
- [DURABLE_OBJECTS_GUIDE.md](DURABLE_OBJECTS_GUIDE.md) - Durable Objects usage

### Features

- [SYSTEM_FEATURES.md](SYSTEM_FEATURES.md) - Complete feature list
- [MERCHANT_FEATURES.md](MERCHANT_FEATURES.md) - Merchant dashboard features
- [SUPER_ADMIN_FEATURES.md](SUPER_ADMIN_FEATURES.md) - Admin panel features
- [API_REFERENCE.md](API_REFERENCE.md) - API documentation

### Translations

- [TRANSLATION_INDEX.md](TRANSLATION_INDEX.md) - Translation system overview
- [TRANSLATION_QUICK_START.md](TRANSLATION_QUICK_START.md) - Quick start guide

### Genie Builder (Landing Page Builder)

- [genie-builder/](genie-builder/) - Full Genie Builder documentation

---

## 🏗️ Architecture

```
apps/web/app/
├── themes/                    # Shopify OS 2.0 themes
│   ├── starter-store/
│   ├── daraz/
│   ├── luxe-boutique/
│   └── tech-modern/
├── lib/theme-engine/          # Theme engine core
├── components/store/          # Store components
├── components/store-builder/  # Editor components
└── routes/                    # All routes
```

---

## 📊 Current Status

| Area                          | Status      |
| ----------------------------- | ----------- |
| Theme System (Shopify OS 2.0) | ✅ Active   |
| ThemeStoreRenderer            | ✅ Active   |
| LiveEditorV2                  | ✅ Active   |
| Store Routes                  | ✅ Migrated |
| Legacy StoreSectionRenderer   | ❌ Removed  |
| Legacy LiveEditor             | ❌ Removed  |

---

**Mission**: Build the Shopify of Bangladesh 🇧🇩🚀
