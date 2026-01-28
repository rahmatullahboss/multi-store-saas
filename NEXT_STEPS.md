# NEXT_STEPS.md - Multi Store SaaS Development Roadmap

**Last Updated**: January 28, 2026
**Current Status**: Shopify OS 2.0 Theme Sections Complete for starter-store

---

## ✅ Recently Completed

### Session: January 28, 2026

| Task                                | Status      |
| ----------------------------------- | ----------- |
| Created product-main section        | ✅ Complete |
| Created cart-items section          | ✅ Complete |
| Created cart-summary section        | ✅ Complete |
| Created collection-header section   | ✅ Complete |
| Created collection-grid section     | ✅ Complete |
| Created rich-text section           | ✅ Complete |
| Created product.json template       | ✅ Complete |
| Created cart.json template          | ✅ Complete |
| Created collection.json template    | ✅ Complete |
| Created page.json template          | ✅ Complete |
| Code review & critical fixes        | ✅ Complete |
| Added `type` field to SectionSchema | ✅ Complete |

### Session: January 27, 2026

| Task                              | Status      |
| --------------------------------- | ----------- |
| ThemeStoreRenderer implementation | ✅ Complete |
| Store routes migration            | ✅ Complete |
| Legacy system removal             | ✅ Complete |
| Documentation update (AGENTS.md)  | ✅ Complete |

---

## 📊 Theme Section Status

### starter-store (Complete ✅)

| Page       | Sections                                                                                                       | Status                        |
| ---------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Homepage   | announcement-bar, header, hero-banner, categories-grid, featured-collection, sale-banner, trust-badges, footer | ✅ Complete                   |
| Product    | header, product-main, featured-collection, footer                                                              | ✅ Complete                   |
| Cart       | header, cart-items, cart-summary, featured-collection, footer                                                  | ✅ Complete                   |
| Collection | header, collection-header, collection-grid, footer                                                             | ✅ Complete                   |
| Page       | header, rich-text, footer                                                                                      | ✅ Complete                   |
| Checkout   | N/A                                                                                                            | ❌ Custom (not section-based) |

### Other Themes (Pending)

| Theme         | Homepage         | Product | Cart | Collection |
| ------------- | ---------------- | ------- | ---- | ---------- |
| daraz         | ✅               | ❌      | ❌   | ❌         |
| luxe-boutique | ✅               | ❌      | ❌   | ❌         |
| tech-modern   | ✅               | ❌      | ❌   | ❌         |
| bdshop        | ⚠️ Extends daraz | ❌      | ❌   | ❌         |
| ghorer-bazar  | ⚠️ Extends daraz | ❌      | ❌   | ❌         |

---

## 🎯 Immediate Next Steps (Priority Order)

### 1. Create FUTURE_FEATURES.md (HIGH)

Document plans for:

- Theme Marketplace
- External Theme Import
- Theme Developer SDK
- Theme Versioning

### 2. Accessibility Improvements (HIGH)

Add aria-labels to all interactive elements:

```typescript
// Quantity buttons
<button aria-label="Decrease quantity">
<button aria-label="Increase quantity">

// Add to cart
<button aria-label="Add to cart">

// Wishlist
<button aria-label="Add to wishlist">
```

### 3. Replicate Sections to Other Themes (MEDIUM)

Copy new sections from starter-store to:

- daraz
- luxe-boutique
- tech-modern

### 4. LiveEditorV2 Testing (MEDIUM)

- [ ] Test section drag-and-drop
- [ ] Test settings panel
- [ ] Test block management
- [ ] Test save/publish workflow

### 5. Performance Optimizations (LOW)

- [ ] Memoize ProductCard components
- [ ] Use useCallback for handlers
- [ ] Add useMemo for computed values

---

## 📋 Feature Development Backlog

### Q1 2026

| Feature                    | Priority | Status         |
| -------------------------- | -------- | -------------- |
| Checkout page sections     | HIGH     | ❌ Not Started |
| Product variants in themes | HIGH     | ❌ Not Started |
| Mobile responsive testing  | MEDIUM   | ⚠️ Partial     |
| i18n for hardcoded strings | MEDIUM   | ❌ Not Started |

### Q2 2026

| Feature               | Priority | Status         |
| --------------------- | -------- | -------------- |
| Theme Marketplace     | MEDIUM   | ❌ Not Started |
| Global theme settings | MEDIUM   | ❌ Not Started |
| AI content generation | LOW      | ❌ Not Started |

---

## 📁 Current File Structure

```
apps/web/app/themes/starter-store/
├── index.ts                    # 14 sections registered
├── theme.json
├── templates/
│   ├── index.json             # Homepage
│   ├── product.json           # Product page (NEW)
│   ├── cart.json              # Cart page (NEW)
│   ├── collection.json        # Collection page (NEW)
│   └── page.json              # Static pages (NEW)
└── sections/
    ├── announcement-bar.tsx   # Layout
    ├── header.tsx             # Layout
    ├── footer.tsx             # Layout
    ├── hero-banner.tsx        # Homepage
    ├── categories-grid.tsx    # Homepage
    ├── featured-collection.tsx# Homepage/Product/Cart
    ├── sale-banner.tsx        # Homepage
    ├── trust-badges.tsx       # Homepage
    ├── product-main.tsx       # Product (NEW)
    ├── cart-items.tsx         # Cart (NEW)
    ├── cart-summary.tsx       # Cart (NEW)
    ├── collection-header.tsx  # Collection (NEW)
    ├── collection-grid.tsx    # Collection (NEW)
    └── rich-text.tsx          # General (NEW)
```

---

## 🔧 Quick Reference

### Build Commands

```bash
cd apps/web
npm run dev          # Development
npm run build        # Production build
npm run typecheck    # Type checking
```

### Adding a New Section

1. Create `~/themes/{theme}/sections/my-section.tsx`
2. Define schema with `type`, `name`, `settings`, `blocks`
3. Export from `~/themes/{theme}/index.ts`
4. Add to SECTIONS registry

### Schema Example

```typescript
export const schema: SectionSchema = {
  type: 'my-section',      // Required for OS 2.0
  name: 'My Section',
  tag: 'section',
  enabled_on: { templates: ['index'] },
  settings: [...],
  blocks: [...],
  presets: [...]
};
```

---

## 📞 Session Reference

- **SESSION_SUMMARY_JAN_28_2026.md**: Full session details
- **AGENTS.md**: Development guidelines
- **docs/THEME_SYSTEM_GUIDE.md**: Architecture docs

---

**Mission**: Build the Shopify of Bangladesh 🇧🇩🚀
