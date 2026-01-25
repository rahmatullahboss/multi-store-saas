# 🔴 Hardcoded Strings TODO List

> **Status:** These strings need to be wrapped with `t()` function for i18n support

## Summary

| Metric | Value |
|--------|-------|
| **Total Hardcoded Strings** | 950 |
| **Files Affected** | 241 |
| **Priority** | High (User-facing) |

## How to Fix

1. Import translation hook:
```tsx
import { useTranslation } from '~/contexts/LanguageContext';
```

2. Get translation function:
```tsx
const { t } = useTranslation();
```

3. Wrap hardcoded string:
```tsx
// Before
<h1>My Orders</h1>

// After  
<h1>{t('myOrders')}</h1>
```

4. Add key to locale files:
- `public/locales/en/common.json`: `"myOrders": "My Orders"`
- `public/locales/bn/common.json`: `"myOrders": "আমার অর্ডার"`

---

## 🔥 High Priority (Customer-Facing)

### `app/components/page-builder/PropertiesPanel.tsx` (50 strings)

- [ ] Line 1375: `Size`
- [ ] Line 1381: `Small`
- [ ] Line 1382: `Medium`
- [ ] Line 1383: `Large`
- [ ] Line 1384: `Extra Large`
- [ ] Line 1388: `Alignment`
- [ ] Line 1427: `None`
- [ ] Line 1428: `Small`
- [ ] Line 1429: `Medium`
- [ ] Line 1430: `Large`
- [ ] Line 1435: `Animation`
- [ ] Line 1441: `None`
- [ ] Line 1442: `Pulse`
- [ ] Line 1443: `Bounce`
- [ ] Line 1444: `Shake on Hover`
- [ ] Line 1498: `None`
- [ ] Line 1499: `Small`
- [ ] Line 1500: `Medium`
- [ ] Line 1501: `Large`
- [ ] Line 1527: `Logo Size`
- [ ] Line 1533: `Small`
- [ ] Line 1534: `Medium`
- [ ] Line 1535: `Large`
- [ ] Line 1607: `Solid`
- [ ] Line 1608: `Outline`
- [ ] Line 1609: `Ghost`
- [ ] Line 1622: `Variant`
- [ ] Line 1678: `End Date`
- [ ] Line 1687: `End Time`
- [ ] Line 1786: `Variant`
- [ ] Line 1910: `Columns`
- [ ] Line 1922: `Value Size`
- [ ] Line 1928: `Medium`
- [ ] Line 1929: `Large`
- [ ] Line 1930: `Extra Large`
- [ ] Line 1952: `Variant`
- [ ] Line 1958: `Simple`
- [ ] Line 1959: `Cards`
- [ ] Line 1960: `Highlight`
- [ ] Line 1961: `Minimal`
- [ ] Line 2137: `Stacked`
- [ ] Line 2138: `Form Only`
- [ ] Line 2139: `Info Only`
- [ ] Line 2665: `Quick Presets`
- [ ] Line 2695: `Background Pattern`
- [ ] Line 2727: `Font Family`
- [ ] Line 2743: `Vertical Padding`
- [ ] Line 2759: `Border Radius`
- [ ] Line 2775: `Box Shadow`
- [ ] Line 2791: `Entrance Animation`

### `app/components/templates/FullStoreTemplate.tsx` (28 strings)

- [ ] Line 98: `Home`
- [ ] Line 99: `Shop`
- [ ] Line 100: `About`
- [ ] Line 101: `Contact`
- [ ] Line 221: `Free Shipping`
- [ ] Line 226: `Original Products`
- [ ] Line 231: `Cash on Delivery`
- [ ] Line 232: `Pay when you receive`
- [ ] Line 236: `Easy Returns`
- [ ] Line 248: `Shop by Category`
- [ ] Line 249: `Browse our curated collections`
- [ ] Line 284: `Featured Products`
- [ ] Line 285: `Our most popular items`
- [ ] Line 397: `No products found`
- [ ] Line 450: `Stay Updated`
- [ ] Line 481: `Premium Quality`
- [ ] Line 488: `Fast Delivery`
- [ ] Line 526: `Quick Links`
- [ ] Line 528: `Home`
- [ ] Line 529: `Shop`
- [ ] Line 530: `About Us`
- [ ] Line 531: `Contact`
- [ ] Line 536: `Customer Service`
- [ ] Line 538: `FAQ`
- [ ] Line 539: `Shipping Info`
- [ ] Line 541: `Privacy Policy`
- [ ] Line 565: `Powered by`
- [ ] Line 566: `Ozzyl`

### `app/components/landing-builder/SectionManager.tsx` (23 strings)

- [ ] Line 1565: `Full Width`
- [ ] Line 1581: `Compact`
- [ ] Line 1787: `Form Controls`
- [ ] Line 1795: `Name Label`
- [ ] Line 1799: `Phone Label`
- [ ] Line 1803: `Address Label`
- [ ] Line 1815: `Name Placeholder`
- [ ] Line 1819: `Phone Placeholder`
- [ ] Line 1823: `Address Placeholder`
- [ ] Line 1836: `Quantity`
- [ ] Line 1840: `Variant`
- [ ] Line 1844: `Subtotal`
- [ ] Line 1848: `Shipping`
- [ ] Line 1852: `Total`
- [ ] Line 1865: `Submit Button`
- [ ] Line 1869: `Processing Text`
- [ ] Line 1874: `Inside Dhaka`
- [ ] Line 1878: `Outside Dhaka`
- [ ] Line 1891: `Footer Tagline`
- [ ] Line 1895: `Copyright Text`
- [ ] Line 1904: `Validation Messages`
- [ ] Line 1907: `Name Error`
- [ ] Line 1917: `Phone Error`

### `app/components/store-templates/zenith-rise/sections/Footer.tsx` (16 strings)

- [ ] Line 52: `Stay available`
- [ ] Line 69: `Shop`
- [ ] Line 71: `All Products`
- [ ] Line 72: `New Arrivals`
- [ ] Line 73: `Featured`
- [ ] Line 78: `Support`
- [ ] Line 80: `Contact Us`
- [ ] Line 81: `FAQs`
- [ ] Line 82: `Shipping Info`
- [ ] Line 87: `Company`
- [ ] Line 89: `About Us`
- [ ] Line 90: `Careers`
- [ ] Line 91: `Privacy Policy`
- [ ] Line 96: `Contact`
- [ ] Line 134: `Powered by`
- [ ] Line 135: `Ozzyl`

### `app/components/store-layouts/BDShopPageWrapper.tsx` (15 strings)

- [ ] Line 82: `Beta Version`
- [ ] Line 215: `Home`
- [ ] Line 281: `Quick Links`
- [ ] Line 283: `Home`
- [ ] Line 284: `Shop`
- [ ] Line 285: `About Us`
- [ ] Line 286: `Contact`
- [ ] Line 292: `Customer Service`
- [ ] Line 294: `FAQ`
- [ ] Line 295: `Shipping Info`
- [ ] Line 297: `Track Order`
- [ ] Line 303: `Categories`
- [ ] Line 320: `Follow Us`
- [ ] Line 342: `Nagad`
- [ ] Line 343: `COD`

### `app/components/templates/StoreLayout.tsx` (15 strings)

- [ ] Line 449: `Quick Links`
- [ ] Line 451: `Home`
- [ ] Line 452: `All Products`
- [ ] Line 453: `About Us`
- [ ] Line 454: `Contact`
- [ ] Line 465: `Legal`
- [ ] Line 467: `Privacy Policy`
- [ ] Line 468: `Terms of Service`
- [ ] Line 469: `Refund Policy`
- [ ] Line 475: `Categories`
- [ ] Line 492: `Contact`
- [ ] Line 517: `Contact info not set`
- [ ] Line 527: `Ozzyl`
- [ ] Line 541: `Powered by`
- [ ] Line 542: `Ozzyl`

### `app/components/store-layouts/UnifiedStoreLayout.tsx` (13 strings)

- [ ] Line 477: `Subscribe to Our Newsletter`
- [ ] Line 478: `Get updates on new products and special offers`
- [ ] Line 524: `Quick Links`
- [ ] Line 526: `Home`
- [ ] Line 527: `Products`
- [ ] Line 528: `About Us`
- [ ] Line 529: `Contact`
- [ ] Line 534: `Categories`
- [ ] Line 553: `Follow Us`
- [ ] Line 587: `Privacy Policy`
- [ ] Line 588: `Terms of Service`
- [ ] Line 589: `Refund Policy`
- [ ] Line 596: `Ozzyl`

### `app/components/store-templates/freshness/sections/Footer.tsx` (12 strings)

- [ ] Line 41: `Secure payment gateway`
- [ ] Line 45: `Easy Returns`
- [ ] Line 81: `Explore`
- [ ] Line 95: `Information`
- [ ] Line 97: `About Freshness`
- [ ] Line 98: `Contact Us`
- [ ] Line 99: `Shipping Guide`
- [ ] Line 100: `Privacy Policy`
- [ ] Line 106: `Get in Touch`
- [ ] Line 131: `Quality Choice`
- [ ] Line 142: `Powered by`
- [ ] Line 143: `Ozzyl`

### `app/components/store-builder/LiveEditor.client.tsx` (12 strings)

- [ ] Line 123: `Heading`
- [ ] Line 135: `Subheading`
- [ ] Line 147: `Text`
- [ ] Line 170: `Alignment`
- [ ] Line 189: `Items to Show`
- [ ] Line 449: `Store Live Editor`
- [ ] Line 562: `Presets`
- [ ] Line 579: `Typography`
- [ ] Line 602: `Social Links`
- [ ] Line 666: `Trust Badges`
- [ ] Line 708: `Live Preview`
- [ ] Line 746: `Add Section`

### `app/components/store-templates/eclipse/sections/Footer.tsx` (11 strings)

- [ ] Line 44: `Explore`
- [ ] Line 46: `Store`
- [ ] Line 47: `About`
- [ ] Line 48: `Journal`
- [ ] Line 53: `Support`
- [ ] Line 55: `FAQ`
- [ ] Line 56: `Shipping`
- [ ] Line 57: `Terms`
- [ ] Line 62: `Connect`
- [ ] Line 83: `Powered by`
- [ ] Line 84: `Ozzyl`

### `app/components/store-templates/aurora-minimal/sections/Footer.tsx` (11 strings)

- [ ] Line 76: `Collections`
- [ ] Line 91: `Experience`
- [ ] Line 93: `Our Story`
- [ ] Line 94: `Process`
- [ ] Line 96: `Connect`
- [ ] Line 103: `The Studio`
- [ ] Line 142: `ETHICAL`
- [ ] Line 143: `SUSTAINABLE`
- [ ] Line 150: `Global Shop`
- [ ] Line 161: `BY`
- [ ] Line 162: `Ozzyl`

### `app/components/store/sections/checkout/CheckoutFormSection.tsx` (11 strings)

- [ ] Line 184: `Dhaka`
- [ ] Line 185: `Chittagong`
- [ ] Line 186: `Sylhet`
- [ ] Line 187: `Rajshahi`
- [ ] Line 188: `Khulna`
- [ ] Line 189: `Barisal`
- [ ] Line 190: `Rangpur`
- [ ] Line 191: `Mymensingh`
- [ ] Line 236: `Cash on Delivery`
- [ ] Line 237: `Pay when you receive`
- [ ] Line 254: `Online Payment`

### `app/routes/pricing.tsx` (11 strings)

- [ ] Line 437: `Enterprise AI Plan`
- [ ] Line 445: `Custom AI Training`
- [ ] Line 449: `We Design For You`
- [ ] Line 453: `Unlimited Everything`
- [ ] Line 457: `Priority Onboarding`
- [ ] Line 496: `Feature`
- [ ] Line 497: `Free`
- [ ] Line 501: `Premium`
- [ ] Line 502: `Business`
- [ ] Line 686: `Shopify Basic`
- [ ] Line 866: `Ozzyl`

### `app/components/store-layouts/DarazPageWrapper.tsx` (10 strings)

- [ ] Line 60: `Save More on App`
- [ ] Line 61: `Become a Seller`
- [ ] Line 192: `Help Center`
- [ ] Line 194: `Contact Us`
- [ ] Line 202: `About Us`
- [ ] Line 203: `Privacy Policy`
- [ ] Line 223: `Nagad`
- [ ] Line 224: `Visa`
- [ ] Line 225: `COD`
- [ ] Line 242: `IG`

### `app/components/store-templates/tech-modern/sections/Footer.tsx` (9 strings)

- [ ] Line 63: `Explore`
- [ ] Line 77: `Support`
- [ ] Line 79: `Contact Us`
- [ ] Line 80: `About TechStore`
- [ ] Line 81: `Shipping Policy`
- [ ] Line 88: `Newsletter`
- [ ] Line 114: `TechPay Verified`
- [ ] Line 125: `Powered by`
- [ ] Line 126: `Ozzyl`

### `app/components/store-layouts/BDShopProductDetail.tsx` (9 strings)

- [ ] Line 264: `Out of stock`
- [ ] Line 316: `Office Pickup`
- [ ] Line 318: `Free`
- [ ] Line 323: `Inside Dhaka`
- [ ] Line 330: `Outside Dhaka`
- [ ] Line 383: `SKU`
- [ ] Line 389: `Category`
- [ ] Line 395: `Brand`
- [ ] Line 401: `Warranty`

### `app/routes/account.tsx` (9 strings)

- [ ] Line 108: `My Account`
- [ ] Line 109: `Manage your profile and view your orders`
- [ ] Line 136: `Orders`
- [ ] Line 142: `Total Spent`
- [ ] Line 148: `Points`
- [ ] Line 164: `My Orders`
- [ ] Line 180: `Sign Out`
- [ ] Line 181: `Log out of your account`
- [ ] Line 190: `Loyalty Tier`

### `app/components/modals/AIUpgradeModal.tsx` (8 strings)

- [ ] Line 51: `Unlock AI Magic`
- [ ] Line 72: `AI Store Setup`
- [ ] Line 82: `Magic Editor`
- [ ] Line 83: `Edit any section with natural language`
- [ ] Line 92: `Unlimited Requests`
- [ ] Line 93: `No daily limits on AI features`
- [ ] Line 101: `Free Plan`
- [ ] Line 105: `Starter Plan`

### `app/components/InfrastructureSection.tsx` (7 strings)

- [ ] Line 198: `Enterprise Grade`
- [ ] Line 250: `Trusted Technology Partners`
- [ ] Line 253: `Cloudflare`
- [ ] Line 254: `Remix`
- [ ] Line 255: `React`
- [ ] Line 256: `PostgreSQL`
- [ ] Line 257: `Prisma`

### `app/components/landing/PaymentIntegrationSection.tsx` (7 strings)

- [ ] Line 47: `Payment Integration`
- [ ] Line 52: `Transaction`
- [ ] Line 95: `Secure Checkout`
- [ ] Line 101: `Total Amount`
- [ ] Line 173: `Fraud Protection`
- [ ] Line 187: `Instantly Credited`
- [ ] Line 188: `Direct to balance`

### `app/components/store-layouts/GhorerBazarPageWrapper.tsx` (7 strings)

- [ ] Line 172: `Home`
- [ ] Line 220: `About Us`
- [ ] Line 221: `Contact`
- [ ] Line 222: `FAQ`
- [ ] Line 230: `Return Policy`
- [ ] Line 231: `Refund Policy`
- [ ] Line 232: `Privacy Policy`

### `app/components/store-layouts/GhorerBazarCartPage.tsx` (7 strings)

- [ ] Line 142: `Product`
- [ ] Line 143: `Price`
- [ ] Line 144: `Quantity`
- [ ] Line 145: `Total`
- [ ] Line 231: `Continue shopping`
- [ ] Line 254: `Subtotal`
- [ ] Line 290: `Recently Viewed Products`

### `app/components/templates/social-proof/Hero.tsx` (7 strings)

- [ ] Line 58: `Seller Official`
- [ ] Line 139: `Like`
- [ ] Line 143: `Comment`
- [ ] Line 147: `Share`
- [ ] Line 170: `Like`
- [ ] Line 171: `Reply`
- [ ] Line 199: `WhatsApp Messages`

### `app/components/VariantManager.tsx` (6 strings)

- [ ] Line 206: `Product Variants`
- [ ] Line 257: `New Variant`
- [ ] Line 411: `Variant`
- [ ] Line 412: `Price`
- [ ] Line 413: `SKU`
- [ ] Line 414: `Stock`

### `app/components/landing/CRMMarketingGrowth.tsx` (6 strings)

- [ ] Line 72: `Live`
- [ ] Line 114: `Automated Actions`
- [ ] Line 117: `Abandoned Cart Recovery`
- [ ] Line 121: `Birthday Discount SMS`
- [ ] Line 127: `Marketing Stats`
- [ ] Line 159: `Email Campaign Impact`

### `app/components/landing/CustomerExperienceSection.tsx` (6 strings)

- [ ] Line 217: `Verified Buyer`
- [ ] Line 280: `Order Number`
- [ ] Line 288: `Premium Denim Jacket`
- [ ] Line 300: `Request Approved`
- [ ] Line 307: `Pickup Scheduled`
- [ ] Line 313: `Refund Processed`

### `app/components/store-templates/bdshop/sections/Footer.tsx` (6 strings)

- [ ] Line 38: `Customer Care`
- [ ] Line 40: `Help Center`
- [ ] Line 41: `About Us`
- [ ] Line 46: `Socials`
- [ ] Line 66: `Powered by`
- [ ] Line 67: `Ozzyl`

### `app/components/store/rovo/RovoFooter.tsx` (6 strings)

- [ ] Line 28: `Quick Links`
- [ ] Line 30: `Shop`
- [ ] Line 31: `About Us`
- [ ] Line 32: `Contact`
- [ ] Line 33: `FAQ`
- [ ] Line 39: `Contact`

### `app/components/landing/StorefrontUXShowcase.tsx` (5 strings)

- [ ] Line 30: `Customer Experience`
- [ ] Line 34: `Premium UX`
- [ ] Line 92: `Premium Smart Watch`
- [ ] Line 119: `Fast Checkout`
- [ ] Line 120: `Optimized for mobile`

### `app/components/store-templates/luxe-boutique/sections/Footer.tsx` (5 strings)

- [ ] Line 50: `Home`
- [ ] Line 51: `Shop All`
- [ ] Line 52: `About Us`
- [ ] Line 53: `Contact`
- [ ] Line 122: `Ozzyl`

### `app/components/store-templates/daraz/index.tsx` (5 strings)

- [ ] Line 517: `Product not found`
- [ ] Line 1046: `FAQ`
- [ ] Line 1047: `Shipping`
- [ ] Line 1048: `Returns`
- [ ] Line 1049: `Contact`

### `app/components/page-builder/FloatingButtonSettingsPanel.tsx` (5 strings)

- [ ] Line 74: `Floating Button Settings`
- [ ] Line 94: `WhatsApp`
- [ ] Line 152: `Call Button`
- [ ] Line 194: `Order Now Button`
- [ ] Line 281: `Button Position`

### `app/components/store-layouts/BDShopCartPage.tsx` (5 strings)

- [ ] Line 119: `Product`
- [ ] Line 120: `Price`
- [ ] Line 121: `Quantity`
- [ ] Line 122: `Total`
- [ ] Line 269: `Free`

### `app/components/templates/minimal-light/index.tsx` (5 strings)

- [ ] Line 33: `Intro`
- [ ] Line 34: `Curated`
- [ ] Line 35: `Acquire`
- [ ] Line 73: `Built with`
- [ ] Line 74: `Ozzyl`

### `app/components/templates/showcase/index.tsx` (5 strings)

- [ ] Line 59: `Authenticity`
- [ ] Line 60: `Quality`
- [ ] Line 61: `Performance`
- [ ] Line 76: `Crafted with`
- [ ] Line 77: `Ozzyl`

### `app/components/landing/InventoryOrderManagement.tsx` (4 strings)

- [ ] Line 85: `Order ID`
- [ ] Line 86: `Customer`
- [ ] Line 87: `Status`
- [ ] Line 134: `Advanced Management`

### `app/components/store-templates/zenith-rise/sections/HeroSection.tsx` (4 strings)

- [ ] Line 121: `No credit card required`
- [ ] Line 137: `App Dashboard Preview`
- [ ] Line 155: `Status`
- [ ] Line 156: `System Optimal`

### `app/components/store-templates/daraz/sections/Footer.tsx` (4 strings)

- [ ] Line 280: `Terms`
- [ ] Line 281: `Privacy`
- [ ] Line 294: `Powered by`
- [ ] Line 295: `Ozzyl`

### `app/components/store-layouts/GhorerBazarProductDetail.tsx` (4 strings)

- [ ] Line 95: `Home`
- [ ] Line 207: `Add to cart`
- [ ] Line 275: `Description`
- [ ] Line 296: `You Might Also Like`

### `app/components/templates/video-focus/index.tsx` (4 strings)

- [ ] Line 36: `Showreel`
- [ ] Line 37: `Spec`
- [ ] Line 38: `Access`
- [ ] Line 75: `Directed by`

### `app/components/templates/modern-premium/index.tsx` (4 strings)

- [ ] Line 46: `Elite Experience`
- [ ] Line 47: `Voices`
- [ ] Line 48: `Acquire`
- [ ] Line 86: `Engineered by`

### `app/components/templates/modern-premium/OrderForm.tsx` (4 strings)

- [ ] Line 105: `SUCCESS ACQUIRED`
- [ ] Line 107: `Protocol Finalized`
- [ ] Line 119: `PREMIUM`
- [ ] Line 124: `Total Investment`

### `app/routes/_index.tsx` (4 strings)

- [ ] Line 861: `Request Info`
- [ ] Line 871: `Error Details`
- [ ] Line 882: `Response Data`
- [ ] Line 892: `Stack Trace`

### `app/components/landing/SecuritySpeedInfrastructure.tsx` (3 strings)

- [ ] Line 36: `Enterprise Infrastructure`
- [ ] Line 39: `Unmatched`
- [ ] Line 82: `Global Edge Network`

### `app/components/landing/LogisticsOperationsSection.tsx` (3 strings)

- [ ] Line 34: `Smart Logistics`
- [ ] Line 153: `Cash on Delivery`
- [ ] Line 177: `Select Courier`

### `app/components/store-templates/zenith-rise/sections/Header.tsx` (3 strings)

- [ ] Line 75: `Home`
- [ ] Line 76: `Products`
- [ ] Line 77: `About`

### `app/components/store-templates/rovo/sections/Footer.tsx` (3 strings)

- [ ] Line 52: `Shop`
- [ ] Line 71: `Support`
- [ ] Line 103: `Contact Us`

### `app/components/store-templates/rovo/sections/CartDrawer.tsx` (3 strings)

- [ ] Line 94: `Close panel`
- [ ] Line 121: `Your cart is empty`
- [ ] Line 195: `Subtotal`

### `app/components/store-templates/rovo/sections/Header.tsx` (3 strings)

- [ ] Line 139: `Menu`
- [ ] Line 146: `Home`
- [ ] Line 152: `All Products`

### `app/components/store-templates/sokol/sections/Footer.tsx` (3 strings)

- [ ] Line 68: `Shop`
- [ ] Line 93: `Support`
- [ ] Line 125: `Contact Us`

### `app/components/store-templates/sokol/sections/CartDrawer.tsx` (3 strings)

- [ ] Line 77: `Your Cart`
- [ ] Line 93: `Your cart is empty`
- [ ] Line 149: `Subtotal`

### `app/components/store-templates/freshness/sections/Header.tsx` (3 strings)

- [ ] Line 158: `About Us`
- [ ] Line 161: `Contact`
- [ ] Line 173: `Hotline`

### `app/components/store-templates/bdshop/pages/CartPage.tsx` (3 strings)

- [ ] Line 343: `Delivery`
- [ ] Line 351: `Discount`
- [ ] Line 410: `Secure checkout powered by SSL encryption`

### `app/components/store-templates/daraz/sections/HeroCarousel.tsx` (3 strings)

- [ ] Line 187: `Rated`
- [ ] Line 200: `Free Delivery`
- [ ] Line 204: `Limited Time`

### `app/components/page-builder/BuilderLayout.tsx` (3 strings)

- [ ] Line 401: `Sections`
- [ ] Line 453: `No sections yet`
- [ ] Line 632: `Create a page to see preview`

### `app/components/page-builder/sections/features/SocialProofFeatures.tsx` (3 strings)

- [ ] Line 42: `Store Official`
- [ ] Line 44: `Just now`
- [ ] Line 133: `No features added yet`

### `app/components/store-layouts/GhorerBazarCheckoutPage.tsx` (3 strings)

- [ ] Line 307: `Subtotal`
- [ ] Line 311: `Shipping`
- [ ] Line 315: `Total`

### `app/components/templates/minimal-clean/OrderForm.tsx` (3 strings)

- [ ] Line 112: `Quantity`
- [ ] Line 131: `Option`
- [ ] Line 208: `Total`

### `app/components/templates/showcase/OrderForm.tsx` (3 strings)

- [ ] Line 105: `Acquisition Complete`
- [ ] Line 125: `Experience`
- [ ] Line 131: `Total Value`

### `app/components/templates/luxe/OrderForm.tsx` (3 strings)

- [ ] Line 103: `Order Confirmed`
- [ ] Line 124: `Secure Your`
- [ ] Line 124: `Selection`

### `app/components/templates/video-focus/OrderForm.tsx` (3 strings)

- [ ] Line 107: `Transmission Complete`
- [ ] Line 126: `EXPERIENCE`
- [ ] Line 131: `Premium Access`

### `app/components/templates/modern-premium/Hero.tsx` (3 strings)

- [ ] Line 66: `Ultra Fast`
- [ ] Line 72: `Secure`
- [ ] Line 100: `In Stock`

### `app/components/editor/AIEditPanel.tsx` (3 strings)

- [ ] Line 148: `Magic Edit`
- [ ] Line 173: `AI is transforming your content`
- [ ] Line 192: `Your section has been updated`

### `app/components/store/sections/cart/CartSummarySection.tsx` (3 strings)

- [ ] Line 64: `Subtotal`
- [ ] Line 68: `Shipping`
- [ ] Line 69: `Calculated at checkout`

### `app/components/store/rovo/RovoCartDrawer.tsx` (3 strings)

- [ ] Line 94: `Close panel`
- [ ] Line 121: `Your cart is empty`
- [ ] Line 195: `Subtotal`

### `app/routes/policies.fair-usage.tsx` (3 strings)

- [ ] Line 92: `Free`
- [ ] Line 93: `Starter`
- [ ] Line 94: `Premium`

### `app/routes/account.orders.tsx` (3 strings)

- [ ] Line 125: `My Orders`
- [ ] Line 133: `No orders yet`
- [ ] Line 134: `Start shopping to see your orders here`

### `app/components/BentoFeaturesSection.tsx` (2 strings)

- [ ] Line 122: `Theme`
- [ ] Line 189: `Input`

### `app/components/LiveDashboard.tsx` (2 strings)

- [ ] Line 97: `LIVE`
- [ ] Line 355: `All Systems Operational`

### `app/components/OrderTimeline.tsx` (2 strings)

- [ ] Line 146: `No activity recorded yet`
- [ ] Line 205: `System`

### `app/components/SpeedComparison.tsx` (2 strings)

- [ ] Line 627: `Cloudflare Edge Network`
- [ ] Line 635: `Smart Caching`

### `app/components/landing/BusinessManagementSection.tsx` (2 strings)

- [ ] Line 36: `Enterprise Control`
- [ ] Line 158: `Staff Performance`

### `app/components/landing/AISocialProofSection.tsx` (2 strings)

- [ ] Line 120: `Google`
- [ ] Line 124: `Xiaomi`

### `app/components/landing/BanglaNativeLocalization.tsx` (2 strings)

- [ ] Line 43: `Dashboard Language`
- [ ] Line 140: `Proudly Made for Bangladesh`

### `app/components/landing/MarketingAutomationSection.tsx` (2 strings)

- [ ] Line 33: `Smart Automation`
- [ ] Line 180: `Today`

### `app/components/store-templates/ghorer-bazar/sections/Footer.tsx` (2 strings)

- [ ] Line 331: `Nagad`
- [ ] Line 365: `Powered by`

### `app/components/store-templates/shared/ProductPage.tsx` (2 strings)

- [ ] Line 139: `Products`
- [ ] Line 436: `Related Products`

### `app/components/store-templates/artisan-market/sections/Footer.tsx` (2 strings)

- [ ] Line 117: `Handcrafted with Love`
- [ ] Line 127: `Powered by`

### `app/components/store-templates/turbo-sale/sections/Footer.tsx` (2 strings)

- [ ] Line 175: `Powered by`
- [ ] Line 176: `Ozzyl`

### `app/components/store-templates/bdshop/sections/Header.tsx` (2 strings)

- [ ] Line 176: `Shop by Category`
- [ ] Line 192: `All Products`

### `app/components/page-builder/sections/order-form/SocialProofOrderForm.tsx` (2 strings)

- [ ] Line 213: `Like`
- [ ] Line 214: `Reply`

### `app/components/store-layouts/RovoProductDetail.tsx` (2 strings)

- [ ] Line 235: `Product Description`
- [ ] Line 245: `You May Also Like`

### `app/components/store-layouts/StoreFooter.tsx` (2 strings)

- [ ] Line 167: `Powered by`
- [ ] Line 168: `Ozzyl`

### `app/components/templates/flash-sale/index.tsx` (2 strings)

- [ ] Line 170: `Powered by`
- [ ] Line 171: `Ozzyl`

### `app/components/templates/flash-sale/Comparison.tsx` (2 strings)

- [ ] Line 37: `Fake`
- [ ] Line 51: `Real`

### `app/components/templates/minimal-light/OrderForm.tsx` (2 strings)

- [ ] Line 103: `Order Confirmed`
- [ ] Line 105: `Processing Sequence Active`

### `app/components/templates/minimal-light/Comparison.tsx` (2 strings)

- [ ] Line 32: `Before`
- [ ] Line 50: `After`

### `app/components/templates/trust-first/index.tsx` (2 strings)

- [ ] Line 70: `Powered by`
- [ ] Line 71: `Ozzyl`

### `app/components/templates/organic/index.tsx` (2 strings)

- [ ] Line 69: `Grown with`
- [ ] Line 70: `Ozzyl`

### `app/components/templates/organic/Pricing.tsx` (2 strings)

- [ ] Line 31: `Save`
- [ ] Line 37: `Special Price`

### `app/components/templates/organic/OrderForm.tsx` (2 strings)

- [ ] Line 123: `Organic Lifestyle`
- [ ] Line 128: `Final Investment`

### `app/components/templates/organic/Comparison.tsx` (2 strings)

- [ ] Line 30: `Standard`
- [ ] Line 44: `Organic`

### `app/components/templates/organic/Testimonials.tsx` (2 strings)

- [ ] Line 25: `Real stories from our community`
- [ ] Line 48: `Verified Buyer`

### `app/components/templates/modern-dark/index.tsx` (2 strings)

- [ ] Line 68: `Powered by`
- [ ] Line 69: `Ozzyl`

### `app/components/templates/modern-dark/Comparison.tsx` (2 strings)

- [ ] Line 32: `Old`
- [ ] Line 46: `New`

### `app/components/templates/modern-dark/Testimonials.tsx` (2 strings)

- [ ] Line 24: `User Stories`
- [ ] Line 48: `Verified Customer`

### `app/components/templates/premium-bd/index.tsx` (2 strings)

- [ ] Line 77: `Build with`
- [ ] Line 78: `Ozzyl`

### `app/components/templates/premium-bd/Comparison.tsx` (2 strings)

- [ ] Line 30: `No Image`
- [ ] Line 44: `No Image`

### `app/components/templates/quick-start/Footer.tsx` (2 strings)

- [ ] Line 77: `Powered by`
- [ ] Line 78: `Ozzyl`

### `app/components/templates/story-driven/index.tsx` (2 strings)

- [ ] Line 70: `Powered by`
- [ ] Line 71: `Ozzyl`

### `app/components/templates/showcase/Showcase.tsx` (2 strings)

- [ ] Line 25: `Unboxing`
- [ ] Line 26: `Box Contents`

### `app/components/templates/showcase/Testimonials.tsx` (2 strings)

- [ ] Line 26: `Insights`
- [ ] Line 47: `Verified Member`

### `app/components/templates/luxe/index.tsx` (2 strings)

- [ ] Line 64: `Powered by`
- [ ] Line 65: `Ozzyl`

### `app/components/templates/luxe/Comparison.tsx` (2 strings)

- [ ] Line 31: `Ordinary`
- [ ] Line 47: `Artisan`

### `app/components/templates/video-focus/Testimonials.tsx` (2 strings)

- [ ] Line 24: `WATCHER REVIEWS`
- [ ] Line 48: `Verified Reviewer`

### `app/components/templates/social-proof/OrderForm.tsx` (2 strings)

- [ ] Line 140: `Cash on Delivery Available`
- [ ] Line 284: `WhatsApp Reviews`

### `app/components/templates/modern-premium/Testimonials.tsx` (2 strings)

- [ ] Line 25: `VOICES`
- [ ] Line 52: `Verified Elite Member`

### `app/components/store/sections/product/ProductDescriptionSection.tsx` (2 strings)

- [ ] Line 56: `Delivery Options`
- [ ] Line 63: `Return Policy`

### `app/components/store/sections/checkout/CheckoutSummarySection.tsx` (2 strings)

- [ ] Line 102: `Subtotal`
- [ ] Line 108: `Shipping`

### `app/routes/collections.$slug.tsx` (2 strings)

- [ ] Line 346: `Sort`
- [ ] Line 352: `Newest`

### `app/routes/template-preview.$templateId.tsx` (2 strings)

- [ ] Line 342: `No sections yet`
- [ ] Line 343: `Add sections from the sidebar to start building`

### `app/routes/policies.$type.tsx` (2 strings)

- [ ] Line 272: `Powered by`
- [ ] Line 273: `Ozzyl`

### `app/routes/thank-you.$orderId.tsx` (2 strings)

- [ ] Line 255: `Powered by`
- [ ] Line 256: `Ozzyl`

### `app/routes/unsubscribe.tsx` (2 strings)

- [ ] Line 106: `Unsubscribed`
- [ ] Line 121: `Unsubscribe`

### `app/components/ThemePreview.tsx` (1 strings)

- [ ] Line 173: `Store Template Preview`

### `app/components/AIShowcaseSection.tsx` (1 strings)

- [ ] Line 97: `AI Powered Platform`

### `app/components/ComparisonSection.tsx` (1 strings)

- [ ] Line 463: `Shopify`

### `app/components/AddToCartButton.tsx` (1 strings)

- [ ] Line 125: `Add to Cart`

### `app/components/MarketingFooter.tsx` (1 strings)

- [ ] Line 29: `Ozzyl`

### `app/components/TrustSection.tsx` (1 strings)

- [ ] Line 269: `Early Adopter`

### `app/components/TemplatePreview.tsx` (1 strings)

- [ ] Line 161: `Template Preview`

### `app/components/TrackingTimeline.tsx` (1 strings)

- [ ] Line 128: `Track Shipment`

### `app/components/AIHeroSection.tsx` (1 strings)

- [ ] Line 276: `AI Logic`

### `app/components/landing/AllInOneSolution.tsx` (1 strings)

- [ ] Line 38: `Ozzyl`

### `app/components/landing/AIMagicSection.tsx` (1 strings)

- [ ] Line 165: `AI`

### `app/components/landing/OzzylAIChatWidget.tsx` (1 strings)

- [ ] Line 263: `Ozzyl AI`

### `app/components/landing/AnalyticsInsightsSection.tsx` (1 strings)

- [ ] Line 172: `Active now`

### `app/components/store-templates/eclipse/index.tsx` (1 strings)

- [ ] Line 243: `NO IMAGE`

### `app/components/store-templates/ghorer-bazar/index.tsx` (1 strings)

- [ ] Line 2105: `Latest`

### `app/components/store-templates/ghorer-bazar/sections/Header.tsx` (1 strings)

- [ ] Line 106: `WhatsApp`

### `app/components/store-templates/nova-lux/sections/Footer.tsx` (1 strings)

- [ ] Line 108: `Ozzyl`

### `app/components/store-templates/tech-modern/sections/Header.tsx` (1 strings)

- [ ] Line 149: `Cart`

### `app/components/store-templates/sokol/sections/Header.tsx` (1 strings)

- [ ] Line 200: `My Account`

### `app/components/store-templates/artisan-market/sections/Header.tsx` (1 strings)

- [ ] Line 129: `Basket`

### `app/components/store-templates/aurora-minimal/sections/Header.tsx` (1 strings)

- [ ] Line 262: `All Products`

### `app/components/store-templates/daraz/pages/ProductPage.tsx` (1 strings)

- [ ] Line 94: `Home`

### `app/components/store-sections/CartSummarySection.tsx` (1 strings)

- [ ] Line 31: `Calculated at checkout`

### `app/components/page-builder/ThemePanel.tsx` (1 strings)

- [ ] Line 144: `Applied to paragraphs and body text`

### `app/components/page-builder/DeleteConfirmModal.tsx` (1 strings)

- [ ] Line 42: `Delete Section`

### `app/components/page-builder/SectionRenderer.tsx` (1 strings)

- [ ] Line 111: `No sections to display`

### `app/components/page-builder/ButtonConnectorModal.tsx` (1 strings)

- [ ] Line 459: `WhatsApp`

### `app/components/page-builder/BuilderImageUpload.tsx` (1 strings)

- [ ] Line 202: `Click or drag`

### `app/components/page-builder/NewPageModal.tsx` (1 strings)

- [ ] Line 55: `Create New Page`

### `app/components/page-builder/sections/FooterSectionPreview.tsx` (1 strings)

- [ ] Line 189: `Powered by`

### `app/components/page-builder/sections/VideoSectionPreview.tsx` (1 strings)

- [ ] Line 87: `Add a video URL`

### `app/components/page-builder/sections/faq/NeubrutalistFAQ.tsx` (1 strings)

- [ ] Line 88: `No FAQ items added yet`

### `app/components/page-builder/sections/features/NeubrutalistFeatures.tsx` (1 strings)

- [ ] Line 119: `No features added yet`

### `app/components/page-builder/sections/trust-badges/NeubrutalistTrustBadges.tsx` (1 strings)

- [ ] Line 69: `No trust badges added yet`

### `app/components/page-builder/sections/benefits/SocialProofBenefits.tsx` (1 strings)

- [ ] Line 40: `Benefits Update`

### `app/components/templates/LandingPageTemplate.tsx` (1 strings)

- [ ] Line 70: `Engine Error`

### `app/components/templates/flash-sale/SocialProof.tsx` (1 strings)

- [ ] Line 11: `HOT`

### `app/components/templates/minimal-clean/index.tsx` (1 strings)

- [ ] Line 72: `Ozzyl`

### `app/components/templates/urgency-scarcity/index.tsx` (1 strings)

- [ ] Line 85: `Ozzyl`

### `app/components/templates/minimal-light/HowToOrder.tsx` (1 strings)

- [ ] Line 23: `How It Works`

### `app/components/templates/organic/Benefits.tsx` (1 strings)

- [ ] Line 12: `Our Promise`

### `app/components/templates/modern-dark/Features.tsx` (1 strings)

- [ ] Line 24: `Us`

### `app/components/templates/premium-bd/Hero.tsx` (1 strings)

- [ ] Line 91: `Original Product`

### `app/components/templates/premium-bd/Testimonials.tsx` (1 strings)

- [ ] Line 48: `Verified Purchase`

### `app/components/templates/mobile-first/index.tsx` (1 strings)

- [ ] Line 63: `Built For Success With`

### `app/components/templates/mobile-first/Testimonials.tsx` (1 strings)

- [ ] Line 48: `Verified User`

### `app/components/templates/showcase/FAQ.tsx` (1 strings)

- [ ] Line 29: `Queries`

### `app/components/templates/luxe/Hero.tsx` (1 strings)

- [ ] Line 113: `Limited Edition`

### `app/components/templates/luxe/Showcase.tsx` (1 strings)

- [ ] Line 48: `Premium Packaging`

### `app/components/templates/luxe/Testimonials.tsx` (1 strings)

- [ ] Line 27: `Patron Reviews`

### `app/components/templates/luxe/FAQ.tsx` (1 strings)

- [ ] Line 29: `Frequently Asked Questions`

### `app/components/templates/video-focus/Pricing.tsx` (1 strings)

- [ ] Line 33: `Best Value`

### `app/components/templates/video-focus/FAQ.tsx` (1 strings)

- [ ] Line 26: `FREQUENTLY ASKED`

### `app/components/templates/social-proof/index.tsx` (1 strings)

- [ ] Line 70: `Ozzyl`

### `app/components/templates/modern-premium/Pricing.tsx` (1 strings)

- [ ] Line 53: `Total Price`

### `app/components/templates/modern-premium/SocialProof.tsx` (1 strings)

- [ ] Line 37: `Verified Client Reviews`

### `app/components/templates/modern-premium/FAQ.tsx` (1 strings)

- [ ] Line 26: `QUERIES`

### `app/components/landing-builder/IntentWizard.tsx` (1 strings)

- [ ] Line 872: `Genie`

### `app/components/store/sections/home/FeaturedProductsSection.tsx` (1 strings)

- [ ] Line 76: `No products available yet`

### `app/components/store/sections/product/ProductGallerySection.tsx` (1 strings)

- [ ] Line 59: `No image available`

### `app/components/store/sections/product/ProductMainSection.tsx` (1 strings)

- [ ] Line 118: `Product not found`

### `app/components/store/sections/product/ProductInfoSection.tsx` (1 strings)

- [ ] Line 237: `Secure checkout with SSL encryption`

### `app/components/store/sections/product/ProductHeaderSection.tsx` (1 strings)

- [ ] Line 52: `Home`

### `app/routes/auth.register.tsx` (1 strings)

- [ ] Line 251: `Digital Care`

### `app/routes/offline.tsx` (1 strings)

- [ ] Line 10: `You are offline`

### `app/routes/checkout.tsx` (1 strings)

- [ ] Line 600: `Extra Offers`

### `app/routes/auth.forgot-password.tsx` (1 strings)

- [ ] Line 57: `Check Your Email`

### `app/routes/offers.$productId.tsx` (1 strings)

- [ ] Line 404: `Product Not Found`

### `app/routes/debug-env.tsx` (1 strings)

- [ ] Line 20: `Env Debug`

### `app/routes/products.$id.tsx` (1 strings)

- [ ] Line 379: `No Image`

### `app/routes/checkout.success.tsx` (1 strings)

- [ ] Line 90: `Transaction ID`

### `app/routes/auth.login.tsx` (1 strings)

- [ ] Line 188: `Ozzyl`

### `app/routes/invite.$token.tsx` (1 strings)

- [ ] Line 253: `Invitation Error`

### `app/routes/about.tsx` (1 strings)

- [ ] Line 168: `Early Adopter`

### `app/routes/categories.tsx` (1 strings)

- [ ] Line 101: `Categories`

## 🟡 Medium Priority (Dashboard)

### `app/routes/app.pages.tsx` (15 strings)

- [ ] Line 151: `Pages`
- [ ] Line 152: `Create and manage your landing pages and campaigns`
- [ ] Line 169: `Page`
- [ ] Line 170: `Type`
- [ ] Line 171: `Status`
- [ ] Line 172: `URL`
- [ ] Line 173: `Actions`
- [ ] Line 271: `No pages yet`
- [ ] Line 288: `Create New Page`
- [ ] Line 289: `Choose a builder to create your page`
- [ ] Line 302: `Page Builder`
- [ ] Line 305: `Recommended`
- [ ] Line 318: `GrapesJS`
- [ ] Line 319: `Visual HTML editor`
- [ ] Line 321: `Advanced`

### `app/routes/app.customers.$id.tsx` (10 strings)

- [ ] Line 269: `Customer Stats`
- [ ] Line 273: `Total Spent`
- [ ] Line 279: `Orders`
- [ ] Line 283: `Average Order`
- [ ] Line 292: `Contact`
- [ ] Line 293: `Edit`
- [ ] Line 297: `Email`
- [ ] Line 301: `Phone`
- [ ] Line 310: `Addresses`
- [ ] Line 394: `Timeline`

### `app/routes/app.settings.metafields.tsx` (9 strings)

- [ ] Line 158: `Metafields`
- [ ] Line 203: `No metafield definitions yet`
- [ ] Line 288: `Pinned`
- [ ] Line 374: `Apply to`
- [ ] Line 390: `Namespace`
- [ ] Line 402: `Key`
- [ ] Line 417: `Display Name`
- [ ] Line 430: `Type`
- [ ] Line 463: `Pin to show prominently`

### `app/routes/app.analytics.tsx` (9 strings)

- [ ] Line 568: `Conversion Funnel`
- [ ] Line 571: `Views`
- [ ] Line 575: `Add to Cart`
- [ ] Line 579: `Checkout`
- [ ] Line 583: `Orders`
- [ ] Line 610: `Recovery Rate`
- [ ] Line 613: `Recovered carts`
- [ ] Line 626: `Recovered Revenue`
- [ ] Line 629: `Recovered from carts`

### `app/routes/app.page-builder.tsx` (8 strings)

- [ ] Line 174: `Back to Dashboard`
- [ ] Line 179: `Page Builder`
- [ ] Line 196: `All Pages`
- [ ] Line 209: `Published`
- [ ] Line 224: `Drafts`
- [ ] Line 267: `Your Pages`
- [ ] Line 268: `Manage your custom landing pages`
- [ ] Line 390: `Create New Page`

### `app/routes/app.settings.messaging.tsx` (7 strings)

- [ ] Line 91: `Messaging Settings`
- [ ] Line 105: `WhatsApp Business API`
- [ ] Line 120: `Enable WhatsApp Integration`
- [ ] Line 124: `WhatsApp Phone Number ID`
- [ ] Line 145: `Facebook Messenger`
- [ ] Line 160: `Enable Messenger Integration`
- [ ] Line 164: `Facebook Page ID`

### `app/routes/app.orders.$id.tsx` (7 strings)

- [ ] Line 804: `Notes`
- [ ] Line 812: `Powered by Ozzyl`
- [ ] Line 921: `Summary`
- [ ] Line 924: `Subtotal`
- [ ] Line 928: `Shipping`
- [ ] Line 932: `Tax`
- [ ] Line 937: `Total`

### `app/routes/app.theme._index.tsx` (6 strings)

- [ ] Line 290: `Templates`
- [ ] Line 294: `Heading Font`
- [ ] Line 298: `Header Style`
- [ ] Line 302: `Footer Style`
- [ ] Line 310: `Page Templates`
- [ ] Line 347: `Install Theme Preset`

### `app/routes/app.theme.templates.$templateId.tsx` (5 strings)

- [ ] Line 456: `Add Section`
- [ ] Line 594: `Enabled`
- [ ] Line 889: `Sections`
- [ ] Line 936: `No sections yet`
- [ ] Line 1062: `Template Preview`

### `app/routes/app.collections.tsx` (4 strings)

- [ ] Line 74: `Title`
- [ ] Line 75: `Products`
- [ ] Line 76: `Status`
- [ ] Line 77: `Actions`

### `app/routes/app.products.$id.tsx` (4 strings)

- [ ] Line 457: `Edit Product`
- [ ] Line 458: `Update product details`
- [ ] Line 691: `SEO Settings`
- [ ] Line 782: `Combo Pricing`

### `app/routes/app.settings.webhooks.tsx` (4 strings)

- [ ] Line 416: `Event`
- [ ] Line 417: `Endpoint`
- [ ] Line 418: `Status`
- [ ] Line 419: `Time`

### `app/routes/app.page-builder_.preview.$pageId.tsx` (3 strings)

- [ ] Line 83: `No Content Yet`
- [ ] Line 100: `Preview Mode`
- [ ] Line 104: `Draft`

### `app/routes/app.my-themes.tsx` (3 strings)

- [ ] Line 119: `Collection`
- [ ] Line 121: `My Themes`
- [ ] Line 148: `No Themes Yet`

### `app/routes/app.store-design.tsx` (3 strings)

- [ ] Line 305: `Your store is in`
- [ ] Line 305: `Landing Page Mode`
- [ ] Line 305: `Store Mode`

### `app/routes/app.settings.courier.tsx` (3 strings)

- [ ] Line 494: `Login to`
- [ ] Line 594: `Login to`
- [ ] Line 596: `Copy your API Key and Secret Key`

### `app/components/dashboard/RecentOrders.tsx` (2 strings)

- [ ] Line 85: `No orders yet`
- [ ] Line 86: `Orders will appear here when customers place them`

### `app/routes/app.settings.domain.tsx` (2 strings)

- [ ] Line 415: `CNAME`
- [ ] Line 592: `CNAME`

### `app/routes/app.settings.team.tsx` (2 strings)

- [ ] Line 603: `Staff`
- [ ] Line 612: `Viewer`

### `app/routes/app.theme-store.tsx` (2 strings)

- [ ] Line 135: `Marketplace`
- [ ] Line 137: `Theme Store`

### `app/routes/app.agent.knowledge.tsx` (2 strings)

- [ ] Line 431: `Website URL`
- [ ] Line 455: `Upload a file`

### `app/routes/app.ab-tests.$id.tsx` (2 strings)

- [ ] Line 284: `CR`
- [ ] Line 286: `Action`

### `app/routes/app.push.tsx` (2 strings)

- [ ] Line 110: `Active subscribers`
- [ ] Line 197: `No subscribers yet`

### `app/routes/app.customers._index.tsx` (2 strings)

- [ ] Line 224: `Premium`
- [ ] Line 357: `Actions`

### `app/routes/app.collections.new.tsx` (2 strings)

- [ ] Line 97: `Create Collection`
- [ ] Line 107: `Products`

### `app/routes/app.customers.new.tsx` (1 strings)

- [ ] Line 273: `Notes`

### `app/routes/app.credits.tsx` (1 strings)

- [ ] Line 162: `BDT`

### `app/routes/app.ab-tests.tsx` (1 strings)

- [ ] Line 282: `CR`

### `app/routes/app.new-builder._index.tsx` (1 strings)

- [ ] Line 339: `Page Builder`

### `app/routes/app.pages.new.tsx` (1 strings)

- [ ] Line 63: `Create Custom Page`

### `app/routes/app.settings.tracking.tsx` (1 strings)

- [ ] Line 187: `Facebook Pixel`

## 🟢 Lower Priority (Admin)

### `app/routes/admin.billing.tsx` (45 strings)

- [ ] Line 630: `Billing Management`
- [ ] Line 631: `Manage subscriptions and approve manual payments`
- [ ] Line 642: `Total MRR`
- [ ] Line 645: `Monthly Recurring Revenue`
- [ ] Line 666: `Active Subscribers`
- [ ] Line 669: `Paid stores`
- [ ] Line 681: `Awaiting verification`
- [ ] Line 687: `Revenue Trend`
- [ ] Line 760: `No pending approvals`
- [ ] Line 767: `Store`
- [ ] Line 768: `Owner`
- [ ] Line 769: `Plan`
- [ ] Line 770: `Transaction`
- [ ] Line 771: `Amount`
- [ ] Line 772: `Submitted`
- [ ] Line 773: `Actions`
- [ ] Line 877: `Store`
- [ ] Line 878: `Plan`
- [ ] Line 879: `Amount`
- [ ] Line 880: `Status`
- [ ] Line 881: `Date`
- [ ] Line 890: `No payment history found`
- [ ] Line 935: `Approve Payment`
- [ ] Line 972: `Plan`
- [ ] Line 986: `Start Date`
- [ ] Line 996: `End Date`
- [ ] Line 1099: `No active subscribers yet`
- [ ] Line 1104: `No expired subscriptions`
- [ ] Line 1118: `Store`
- [ ] Line 1119: `Owner`
- [ ] Line 1120: `Plan`
- [ ] Line 1121: `Payment`
- [ ] Line 1122: `Period`
- [ ] Line 1123: `Status`
- [ ] Line 1124: `Change Plan`
- [ ] Line 1213: `Free`
- [ ] Line 1214: `Starter`
- [ ] Line 1215: `Premium`
- [ ] Line 1265: `Owner`
- [ ] Line 1269: `Plan`
- [ ] Line 1273: `Payment`
- [ ] Line 1279: `Period`
- [ ] Line 1295: `Free`
- [ ] Line 1296: `Starter`
- [ ] Line 1297: `Premium`

### `app/routes/admin.analytics.tsx` (24 strings)

- [ ] Line 672: `No sales data yet`
- [ ] Line 703: `No stores at risk`
- [ ] Line 798: `Retention Cohorts`
- [ ] Line 806: `Cohort`
- [ ] Line 807: `Stores`
- [ ] Line 966: `Visitors`
- [ ] Line 970: `Orders`
- [ ] Line 974: `Ratio`
- [ ] Line 994: `All Stores Breakdown`
- [ ] Line 1002: `All Plans`
- [ ] Line 1003: `Free`
- [ ] Line 1004: `Starter`
- [ ] Line 1005: `Premium`
- [ ] Line 1013: `Sort by Revenue`
- [ ] Line 1014: `Sort by Orders`
- [ ] Line 1015: `Sort by Visitors`
- [ ] Line 1016: `Sort by Products`
- [ ] Line 1025: `Store`
- [ ] Line 1026: `Plan`
- [ ] Line 1027: `Revenue`
- [ ] Line 1028: `Orders`
- [ ] Line 1029: `Products`
- [ ] Line 1030: `Visitors`
- [ ] Line 1031: `Usage`

### `app/routes/admin.domains.tsx` (16 strings)

- [ ] Line 366: `Total Domains`
- [ ] Line 402: `Failed`
- [ ] Line 426: `All Statuses`
- [ ] Line 427: `Active`
- [ ] Line 428: `Pending`
- [ ] Line 429: `Failed`
- [ ] Line 451: `Store`
- [ ] Line 452: `Domain URL`
- [ ] Line 453: `SSL Status`
- [ ] Line 454: `DNS Verified`
- [ ] Line 455: `Plan`
- [ ] Line 456: `Actions`
- [ ] Line 660: `DNS Configuration Required`
- [ ] Line 671: `CNAME Record`
- [ ] Line 676: `Type`
- [ ] Line 677: `CNAME`

### `app/routes/admin.ai-requests.tsx` (13 strings)

- [ ] Line 234: `Pending`
- [ ] Line 238: `Active`
- [ ] Line 293: `Store`
- [ ] Line 294: `Plan`
- [ ] Line 295: `Requested At`
- [ ] Line 296: `Payment Info`
- [ ] Line 297: `Actions`
- [ ] Line 344: `No payment info`
- [ ] Line 395: `No Pending Requests`
- [ ] Line 423: `Store`
- [ ] Line 424: `Plan`
- [ ] Line 425: `Usage`
- [ ] Line 426: `Status`

### `app/routes/admin.team.tsx` (12 strings)

- [ ] Line 242: `Team Management`
- [ ] Line 243: `Manage admin access and roles`
- [ ] Line 261: `Member`
- [ ] Line 262: `Role`
- [ ] Line 263: `Permissions`
- [ ] Line 264: `Joined`
- [ ] Line 265: `Actions`
- [ ] Line 309: `Default`
- [ ] Line 368: `Full Name`
- [ ] Line 379: `Email Address`
- [ ] Line 390: `Password`
- [ ] Line 401: `Role`

### `app/routes/admin.health.tsx` (9 strings)

- [ ] Line 152: `Monitor application performance and error logs`
- [ ] Line 189: `System Status`
- [ ] Line 206: `Fatal or Error level logs`
- [ ] Line 218: `Total log entries`
- [ ] Line 277: `Level`
- [ ] Line 278: `Timestamp`
- [ ] Line 279: `Message`
- [ ] Line 280: `Context`
- [ ] Line 308: `View Stack Trace`

### `app/routes/admin.audience-insights.tsx` (7 strings)

- [ ] Line 376: `No product data yet`
- [ ] Line 419: `Store`
- [ ] Line 420: `Revenue`
- [ ] Line 421: `Orders`
- [ ] Line 422: `VIPs`
- [ ] Line 467: `Avg Order Value`
- [ ] Line 479: `VIP Conversion`

### `app/routes/admin.stores.tsx` (6 strings)

- [ ] Line 663: `Cr`
- [ ] Line 815: `No stores found`
- [ ] Line 847: `Owner`
- [ ] Line 852: `Plan`
- [ ] Line 856: `Usage`
- [ ] Line 949: `Impersonation Security Notice`

### `app/routes/admin._index.tsx` (6 strings)

- [ ] Line 182: `Dashboard Overview`
- [ ] Line 183: `Global platform metrics and recent activity`
- [ ] Line 217: `Plan Distribution`
- [ ] Line 243: `Recent Stores`
- [ ] Line 246: `No stores yet`
- [ ] Line 286: `Quick Actions`

### `app/routes/admin.security.tsx` (6 strings)

- [ ] Line 138: `Suspicious IPs`
- [ ] Line 141: `IPs with multiple failures`
- [ ] Line 160: `Time`
- [ ] Line 161: `Reason`
- [ ] Line 162: `Details`
- [ ] Line 227: `Failures`

### `app/routes/admin.broadcasts.tsx` (5 strings)

- [ ] Line 153: `System Broadcasts`
- [ ] Line 154: `Send announcements to all merchants`
- [ ] Line 169: `Create New Broadcast`
- [ ] Line 259: `All Broadcasts`
- [ ] Line 265: `No broadcasts yet`

### `app/routes/admin.visitor-chats.tsx` (5 strings)

- [ ] Line 87: `Phone`
- [ ] Line 88: `Last Activity`
- [ ] Line 89: `Messages`
- [ ] Line 90: `Latest Message`
- [ ] Line 91: `Action`

### `app/routes/admin.audit-logs.tsx` (5 strings)

- [ ] Line 274: `Admin`
- [ ] Line 275: `Action`
- [ ] Line 276: `Target`
- [ ] Line 277: `Details`
- [ ] Line 278: `IP`

### `app/routes/admin.marketplace-themes.tsx` (5 strings)

- [ ] Line 151: `Theme Info`
- [ ] Line 152: `Designer`
- [ ] Line 153: `Status`
- [ ] Line 154: `Submitted`
- [ ] Line 155: `Actions`

### `app/routes/admin.storage.tsx` (4 strings)

- [ ] Line 293: `Storage Management`
- [ ] Line 317: `Total Storage`
- [ ] Line 329: `Total Files`
- [ ] Line 561: `Orphaned Files`

### `app/routes/admin.tsx` (4 strings)

- [ ] Line 157: `Ozzyl Admin`
- [ ] Line 158: `Control Panel`
- [ ] Line 163: `Ozzyl Admin`
- [ ] Line 164: `Control Panel`

### `app/routes/admin.marketing.tsx` (3 strings)

- [ ] Line 196: `Create New Coupon`
- [ ] Line 360: `No coupons yet`
- [ ] Line 361: `Create your first coupon to offer discounts on subscriptions`

### `app/components/admin/NotificationToggle.tsx` (2 strings)

- [ ] Line 94: `Active`
- [ ] Line 107: `Enable Alerts`

### `app/components/admin/CommandMenu.tsx` (1 strings)

- [ ] Line 68: `ESC`

### `app/routes/admin.apps.install.tsx` (1 strings)

- [ ] Line 105: `Error`

### `app/routes/app.admin.plans.tsx` (1 strings)

- [ ] Line 617: `Usage`

