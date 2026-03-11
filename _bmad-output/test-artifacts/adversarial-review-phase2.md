# Adversarial Review: Phase 2 Component Extraction

## Findings

1. **Hardcoded Payment Methods**: `FooterMarketplace.tsx` hardcodes the payment badges `['bKash', 'Nagad', 'COD']`. In a multi-tenant SaaS, these must be dynamically loaded from the store's actual active payment gateways in the database, not hardcoded into a theme variant.
2. **Fake Mock Data in Production Code**: `ProductCardMarketplace.tsx` uses a deterministic random seed generator (`getProductRating`) to spoof 3.5 - 5.0 star ratings and review counts. This is unacceptable for production code; it should either use real data from the `product` object or hide the rating component entirely if data is absent.
3. **Registry Naming Collision**: `apps/web/app/components/store-sections/registry.ts` now registers `product_grid` alongside an existing `product-grid`, and `hero_banner` alongside `hero`. This mixed use of snake_case and kebab-case for identical section types will cause catastrophic bugs when serializing/deserializing JSON layouts.
4. **Dead Interactive Elements**: The Add to Cart and Wishlist buttons in `ProductCardMarketplace.tsx` are completely non-functional. They simply call `e.preventDefault()` with a `TODO:` comment. Extracting the UI without wiring up the core e-commerce logic (using `useCart` or `useWishlist` hooks) makes the component useless.
5. **Hardcoded Strings & Missing i18n**: `HeaderMarketplace.tsx` hardcodes English strings like "Save More on App", "Become a Seller", and "Help & Support". It completely bypasses the localization (i18n) framework used elsewhere in the app.
6. **Unconfigurable Hero Carousel**: In `HeroMarketplace.tsx`, the `autoPlayInterval` is strictly hardcoded to `5000`ms, and the "Download App" sidebar visibility is hardcoded to `true`. These must be controllable via the `HeroBannerSettings` JSON schema.
7. **Fake App Download Widget**: The `HeroMarketplace.tsx` sidebar widget hardcodes a fake "★ 4.8 Rated" badge. Again, injecting fake social proof into a generic component is unethical for merchants and bad practice.
8. **Inadequate Fallback Layouts**: The fallback `ProductGridSection` layout is extremely primitive compared to the `marketplace` variant. It lacks Add to Cart buttons, hover states, and discount badges, creating a severe disparity in quality for merchants who don't use the marketplace variant.
9. **Inefficient Mobile Menu Active States**: `HeaderMarketplace.tsx` computes active menu links manually via `currentCategory === category` instead of leveraging Remix's native `<NavLink>` component, which automatically handles active routing states efficiently.
10. **Theme Typings Drift**: The `StoreTemplateTheme` interface was modified to accept `isDark?: boolean` and `[key: string]: any;`. The use of `any` defeats the purpose of TypeScript and opens the door for unstructured, unvalidated theme properties slipping into the UI.

---
*End of Review*
