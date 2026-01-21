# ✨ Genie - The Quick Builder User Guide

## Overview
Genie helps you create high-converting landing pages in **just 4 steps**. ম্যাজিক্যালি তৈরি করুন!

## How to Access
1. Go to `/app/new-builder`
2. Click "✨ Genie দিয়ে তৈরি করুন" (purple button)

## 4-Step Wizard

### Step 1: Select Your Intent
Choose your selling strategy:
- **Product Type:** 
  - Single product (focused page)
  - Multiple products (2-3 products with bundle discount)
- **Goal:** 
  - Direct Sales (COD checkout)
  - Lead Generation (WhatsApp capture)
- **Traffic Source:** 
  - Facebook Ads (urgency-focused sections)
  - TikTok (video-focused, social proof)
  - Organic/Search (detailed benefits, trust badges)

### Step 2: Select Products (Multi-Product Support)
Choose products to feature:
- **Single Product:** Select from existing products or create new inline
- **Multiple Products (2-3):** 
  - Select 2-3 products from your store
  - System auto-generates product grid section
  - Auto-applies combo discounts:
    - 2 products = 10% discount
    - 3+ products = 15% discount
  - Customers can multi-select with checkboxes

### Step 3: Customize Your Style (NEW!)
Personalize the page appearance:
- **Brand Color:** 6 preset colors + custom color picker
  - Orange, Blue, Green, Purple, Red, Pink
  - Or pick any color you want
- **Button Style:** 
  - Rounded (modern, soft)
  - Sharp (minimal, clean)
  - Pill (friendly, rounded)
- **Font Family:**
  - Default (System fonts, fast)
  - Bengali (Bangla fonts optimized)
  - Modern (Trendy sans-serif)
  - Classic (Traditional serif)

### Step 4: Choose Template
- System suggests 3 best templates based on your intent
- See visual preview of each
- Select one and click "ল্যান্ডিং পেইজ তৈরি করুন"

## After Creation
Page opens in editor with optimized sections based on your intent. You can:
- Click palette icon 🎨 to change section variants
- Edit all text content inline
- Upload custom images
- Publish when ready

## Section Variants
| Section | Variants Available |
|---------|-------------------|
| Hero | Product-focused, Offer-focused, Video-focused, Text-focused |
| Testimonials | Cards, Carousel, Avatars, Screenshots, Star-rating |
| CTA | Button-only, With-trust, Urgency |
| Features | Grid-3, Grid-4, List |
| Product Grid | Grid (multi-product display) |
| Social | Counter, Live-feed, Badges |

## Built-in Best Practices (Fully Configurable!)

Genie automatically includes conversion-boosting elements that you can toggle on/off:

### Urgency Banner (OFF by default)
- Shows limited stock or time pressure
- Uses **real stock counts** from your products (no fake numbers!)
- Customizable urgency text
- Toggle in editor

### Social Proof (OFF by default)
- Shows real recent orders from last 24 hours
- Displays "X people bought in last 24h"
- Uses **real order data** from your store
- Customizable proof text
- Toggle in editor

### Free Shipping Progress (Optional)
- Shows progress bar toward free shipping threshold
- Customizable threshold amount
- Encourages cart additions
- Toggle in editor

### Delivery Estimate (Optional)
- "Delivered by [date]" messaging
- Separate timings for Dhaka & Outside Dhaka
- Customizable per your shipping policy
- Toggle in editor

### Trust Badges (Always Visible)
- COD (Cash on Delivery) badge
- 30-day return guarantee
- Secure payment badge
- Auto-displayed

### Order Summary Preview
- Shows selected products & quantities
- Displays auto-applied combo discounts
- Shows final price
- Always visible in checkout

## Style & Settings
Go to `/app/settings/landing` for:
- Brand color picker (same 6 presets + custom)
- Button style (rounded/sharp/pill)
- Font family
- Dark mode toggle

## Checkout Settings
In `/app/settings/landing`:
- Toggle between Redirect and Modal checkout
- Modal checkout keeps customers on page
- Embedded checkout form (name, phone, address)

## Combo Discount System

When you select 2-3 products:
- **2 Products = 10% bundle discount** (auto-applied at checkout)
- **3+ Products = 15% bundle discount** (auto-applied at checkout)
- Discounts are stored in order pricing
- Customers see breakdown in order summary

Example:
```
Product A: ৳1000
Product B: ৳1500
────────────────
Subtotal: ৳2500
Bundle Discount (10%): -৳250
────────────────
Total: ৳2250
```

## Real Data Features

**No fake numbers!** All metrics are real:

| Metric | Source | Behavior |
|--------|--------|----------|
| Stock Count | `products.stock` field | Updates whenever inventory changes |
| Order Count | `orders` table (last 24h) | Real recent customers |
| Sales | Actual store sales | Verified conversions only |

## Best Practices by Traffic Source

### Facebook Ads → Flash-Sale Strategy
- Use **flash-sale template** with urgency banner ON
- Select **offer-focused hero variant**
- Enable **social proof** (recent orders)
- Use **pill button style** (friendly, clickable)
- 2-3 products with combo discount

### TikTok → Viral Strategy
- Use **video-focus template** with video hero
- Use **carousel testimonials** for social proof
- Enable **urgency banner** with stock count
- 1-3 products (mix singles and bundles)
- Trendy colors: Orange or Purple

### Organic/Search → Authority Strategy
- Use **premium-bd template** with detailed sections
- Enable **trust badges** prominently
- Use **classic font** for professional look
- 1 product or curated 2-3 products
- Blue or Green brand colors

## Performance Targets
- Page loads in < 2 seconds
- Real data refreshes every hour
- Auto-saves while you edit
- Mobile-optimized (100% responsive)
