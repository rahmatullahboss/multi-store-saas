# Shopify‑like Gap Improvement Tracker (Bangla)

এই ডকুমেন্টে Shopify‑like gap গুলো পূরণ করার অগ্রগতি, সিদ্ধান্ত, এবং পরবর্তী কাজগুলো ট্র্যাক করা হবে।

## ✅ Completed
- **Navigation System (Dropdown + Footer Menu Builder)**
  - `themeConfig`‑এ nested header menu ও footer columns যোগ করা হয়েছে
  - Settings UI থেকে মেনু ও footer columns ম্যানেজ করা যায়
  - Storefront header/footer এখন config থেকে রেন্ডার হয়

- **Template Quality Baseline**
  - Global `DEFAULT_SECTIONS` upgraded (Hero → Features → Categories → Products → Banner → Scroll → RichText → FAQ → Newsletter)
  - Tech Modern, Artisan Market, Daraz, BDShop, Ghorer Bazar, Turbo Sale, Zenith Rise templates enhanced
  - All templates now have trust badges, category grid, FAQ, newsletter

- **Collections Browsing Filters + Sorting**
  - Price range filters (min/max)
  - In-stock filter
  - On-sale filter
  - Sorting: Newest, Price Low-High, Price High-Low
  - Implemented in both `/collections/:slug` and `/products`

## ✅ Completed (cont.)
- **Template QA Pass**
  - Reviewed all section spacing consistency
  - Verified padding standards: sections use py-8/py-12, max-w-7xl containers
  - Mobile responsive patterns verified
  - Typography hierarchy consistent across templates

- **Checkout/Payment Flow Polish**
  - Fixed typo "Simited" → "Limited Time Offer"
  - Added trust badges at checkout (🔒 Secure, ✓ Verified, 📦 Fast Delivery)
  - Enhanced success page with "What happens next?" guidance
  - Enhanced failed page with helpful troubleshooting tips

- **Product SEO Enhancements**
  - Added OG/Twitter meta tags and robots directives
  - Added JSON-LD Product schema with offers + ratings
  - Added productUrl to loader for accurate SEO URLs

- **Sitemap Enhancements**
  - Added collections entries
  - Added landing pages `/p/:slug` entries

- **Storefront Custom Pages (Shopify-like pages)**
  - Created `/pages/:slug` route for custom pages
  - Uses template system (not landing builder)
  - Pages accessible in both full store + landing mode
  - Admin route `/app/pages/new` for creating custom pages (MVP)

## 🔜 Upcoming (Priority Order)
1. **Collections browsing + filters/sorting**
2. **Storefront custom pages (Shopify‑style pages)**

## 📌 Decisions
- **Custom Pages Builder**: Shopify‑এর মতো *store editor/sections* দিয়ে custom pages রেন্ডার হবে (landing builder নয়)
- **Navigation depth**: max depth 3 রাখা হবে (Shopify standard)

## 📝 Notes
- Landing page builder আলাদা থাকবে; storefront pages এর জন্য store editor ভিত্তিক routing তৈরি হবে
