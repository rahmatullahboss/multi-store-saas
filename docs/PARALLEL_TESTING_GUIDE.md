# 🧪 Parallel Testing Guide - 3 Testers

> **উদ্দেশ্য:** ৩ জন টেস্টার একসাথে পুরো Multi-Store SaaS system টেস্ট করবে collision ছাড়াই।

---

## 📋 Test Environment Setup

```bash
# Production URL
https://multistore-saas.pages.dev

# অথবা Local Development
npm run dev
# → http://localhost:5173
```

---

## 👥 Tester Assignments

| Tester               | Focus Area                      | Test Store Subdomain | Test Email       |
| -------------------- | ------------------------------- | -------------------- | ---------------- |
| **Tester 1 (Rahim)** | Merchant Dashboard & Products   | `test-rahim`         | `rahim@test.com` |
| **Tester 2 (Karim)** | Orders, Payments & Checkout     | `test-karim`         | `karim@test.com` |
| **Tester 3 (Salim)** | Marketing, Analytics & Settings | `test-salim`         | `salim@test.com` |

> ⚠️ **Important:** প্রত্যেকে নিজের assigned store নিয়ে কাজ করবে। অন্যের store-এ কাজ করবে না।

---

## 🎯 Tester 1: Rahim - Merchant Dashboard & Products

### 1.1 Authentication Tests

- [ ] **Registration**

  - `/auth/register` → নতুন store তৈরি করা
  - Store Name: `Rahim Test Store`
  - Subdomain: `test-rahim`
  - Email: `rahim@test.com`
  - Password: `TestPass123!`

- [ ] **Login**

  - `/auth/login` → credentials দিয়ে login
  - Session persistence check (browser close করে reopen)

- [ ] **Logout**
  - Dashboard থেকে logout
  - Protected routes `/app/*` access করতে গেলে redirect হয় কিনা

### 1.2 Product Management Tests

- [ ] **Add New Product** (`/app/products/new`)

  - Title: `Rahim Test Product 1`
  - Description: Any text
  - Price: 500
  - Compare at Price: 600
  - Inventory: 100
  - SKU: `RAHIM-001`
  - Category: `Electronics`
  - Image upload (Cloudinary)
  - Multiple images upload
  - Tags: `test, rahim`

- [ ] **Add Product with Variants** (`/app/products/new`)

  - Title: `Rahim Variant Product`
  - Price: 1000
  - Add Size variants: Small (900), Medium (1000), Large (1100)
  - Add Color variants: Red, Blue, Green
  - Each variant has own inventory

- [ ] **Edit Product** (`/app/products/$id`)

  - Title change করা
  - Price update
  - Inventory update
  - Image change

- [ ] **Delete Product**

  - একটি product delete করা
  - Confirmation modal check

- [ ] **Product List View** (`/app/products`)
  - Pagination কাজ করছে কিনা
  - Search functionality
  - Category filter
  - Published/Unpublished toggle

### 1.3 Inventory Management Tests

- [ ] **Inventory Overview** (`/app/inventory`)

  - Low stock products দেখা যাচ্ছে কিনা
  - Stock update functionality

- [ ] **Bulk Import** (`/app/inventory/import`)

  - CSV file prepare করা
  - Upload এবং preview
  - Import confirm

- [ ] **Export Products** (API: `/api/products/export`)
  - CSV export ডাউনলোড হচ্ছে কিনা

### 1.4 Dashboard Overview Tests

- [ ] **Dashboard Stats** (`/app/dashboard`)
  - Total Products count correct
  - Total Orders count
  - Revenue calculation
  - Recent orders list

---

## 🎯 Tester 2: Karim - Orders, Payments & Checkout

### 2.1 Storefront Tests

- [ ] **Homepage** (`/` or `test-karim.localhost:5173`)

  - Products grid দেখা যাচ্ছে
  - Category navigation
  - Store branding

- [ ] **Product Detail Page** (`/products/$id`)
  - Product info correct
  - Variant selection কাজ করছে
  - Add to cart button

### 2.2 Cart Tests

- [ ] **Add to Cart** (`/cart`)

  - Single product add
  - Multiple products add
  - Quantity update
  - Remove item
  - Cart persistence (localStorage)

- [ ] **Discount Code Apply**
  - Valid code apply → price reduction
  - Invalid code → error message
  - Expired code → error message
  - Minimum order amount check

### 2.3 Checkout Flow Tests

- [ ] **Checkout Page**

  - Customer info form
  - Shipping address
  - Phone number (required for COD)
  - Email (optional for COD)

- [ ] **COD (Cash on Delivery) Order**

  - Complete order without payment
  - Order confirmation page
  - Order number generation

- [ ] **bKash Payment** (`/api/bkash/initiate`)

  - Initiate payment
  - Redirect to bKash
  - Callback handling
  - Success page

- [ ] **Nagad Payment** (`/api/nagad/initiate`)

  - Payment initiation
  - Redirect flow
  - Callback

- [ ] **Stripe Payment** (`/api/stripe/initiate`)
  - Test card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVV: Any 3 digits
  - Payment success webhook

### 2.4 Order Management Tests (Dashboard)

- [ ] **Orders List** (`/app/dashboard/orders`)

  - All orders দেখা যাচ্ছে
  - Status filter (pending, processing, shipped, delivered)
  - Date filter

- [ ] **Order Detail** (`/app/dashboard/orders/$id`)

  - Customer info
  - Order items
  - Payment status
  - Shipping status

- [ ] **Order Status Update**

  - Pending → Processing
  - Processing → Shipped
  - Add tracking number
  - Shipped → Delivered

- [ ] **Shipping/Courier Integration** (`/app/settings/courier`)
  - Pathao integration check
  - Create shipment
  - Track shipment

### 2.5 Abandoned Cart Tests

- [ ] **Abandoned Cart List** (`/app/abandoned-carts`)
  - Carts list দেখা যাচ্ছে
  - Cart items preview
  - Customer info (if provided)

---

## 🎯 Tester 3: Salim - Marketing, Analytics & Settings

### 3.1 Discount & Promotions Tests

- [ ] **Create Discount** (`/app/discounts`)

  - Code: `SALIM20`
  - Type: Percentage
  - Value: 20
  - Min order: 500
  - Max uses: 100
  - Expiry date

- [ ] **Flash Sale**

  - Create flash sale discount
  - Show on homepage toggle
  - Timer functionality

- [ ] **Edit/Delete Discount**
  - Update discount value
  - Deactivate discount
  - Delete discount

### 3.2 Email Marketing Tests

- [ ] **Subscriber List** (`/app/subscribers`)

  - View all subscribers
  - Add subscriber manually
  - Export subscribers

- [ ] **Create Campaign** (`/app/campaigns/new`)

  - Campaign name: `Salim Test Campaign`
  - Subject: `Test Email`
  - HTML content
  - Preview text

- [ ] **Campaign Management** (`/app/campaigns`)

  - Draft campaigns
  - Schedule campaign
  - View sent campaigns
  - Campaign stats (open, click)

- [ ] **Unsubscribe** (`/unsubscribe?email=test@test.com`)
  - Unsubscribe link working
  - Status update

### 3.3 Analytics & Reports Tests

- [ ] **Analytics Dashboard** (`/app/analytics`)

  - Sales chart
  - Top products
  - Customer demographics
  - Conversion metrics

- [ ] **Reports** (`/app/reports`)
  - Sales report export (CSV)
  - Inventory report
  - Customer report
  - Tax report
  - Date filter functionality

### 3.4 Store Settings Tests

- [ ] **General Settings** (`/app/settings`)

  - Store name change
  - Logo upload
  - Currency change
  - Language (EN/BN)

- [ ] **Theme & Branding**

  - Accent color picker
  - Font selection
  - Favicon upload

- [ ] **Social Links**

  - Facebook URL
  - Instagram URL
  - WhatsApp number

- [ ] **SEO Settings** (`/app/settings/seo`)

  - Meta title
  - Meta description
  - OG image

- [ ] **Shipping Settings** (`/app/settings/shipping`)

  - Add shipping zone: `Dhaka City`
  - Rate: 60
  - Add zone: `Outside Dhaka`
  - Rate: 120
  - Free shipping threshold

- [ ] **Courier Settings** (`/app/settings/courier`)
  - Pathao API credentials
  - Test connection

### 3.5 Team Management Tests

- [ ] **Invite Team Member** (`/app/settings/team`)

  - Email: `team-salim@test.com`
  - Role: Staff
  - Send invite

- [ ] **Accept Invite** (`/invite/$token`)

  - Open invite link
  - Create password
  - Login as team member

- [ ] **Activity Logs** (`/app/settings/activity`)
  - Recent activities দেখা যাচ্ছে
  - Filter by action type
  - User attribution

### 3.6 Notification Settings

- [ ] **Email Notifications**
  - Notification email override
  - Enable/disable toggle
  - Low stock threshold setting

---

## 📊 System Readiness Checklist

### ✅ Core Features (Must Work)

| Feature                         | Status | Notes |
| ------------------------------- | ------ | ----- |
| Authentication (Login/Register) | ⬜     |       |
| Product CRUD                    | ⬜     |       |
| Product Variants                | ⬜     |       |
| Order Creation (COD)            | ⬜     |       |
| Order Management                | ⬜     |       |
| Cart Functionality              | ⬜     |       |
| Checkout Flow                   | ⬜     |       |

### 🔄 Payment Gateways

| Gateway                | Status | Notes         |
| ---------------------- | ------ | ------------- |
| COD (Cash on Delivery) | ⬜     |               |
| bKash                  | ⬜     | Need API keys |
| Nagad                  | ⬜     | Need API keys |
| Stripe                 | ⬜     | Test mode     |

### 📧 Notification System

| Feature                  | Status | Notes        |
| ------------------------ | ------ | ------------ |
| Order Confirmation Email | ⬜     | Resend API   |
| Shipping Update Email    | ⬜     |              |
| Low Stock Alert          | ⬜     |              |
| Campaign Emails          | ⬜     | Queue system |

### 📈 Marketing & Analytics

| Feature             | Status | Notes |
| ------------------- | ------ | ----- |
| Discount Codes      | ⬜     |       |
| Flash Sales         | ⬜     |       |
| Analytics Dashboard | ⬜     |       |
| CSV Reports         | ⬜     |       |
| Email Campaigns     | ⬜     |       |

### ⚙️ Settings & Configuration

| Feature         | Status | Notes |
| --------------- | ------ | ----- |
| Store Settings  | ⬜     |       |
| Shipping Zones  | ⬜     |       |
| SEO Settings    | ⬜     |       |
| Team Management | ⬜     |       |
| Activity Logs   | ⬜     |       |

---

## 🐛 Bug Reporting Template

```markdown
## Bug Report

**Tester:** [Rahim/Karim/Salim]
**Date:** [Date]
**Feature Area:** [e.g., Product Management]

### Description

[Brief description of the issue]

### Steps to Reproduce

1. Step 1
2. Step 2
3. Step 3

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happened]

### Screenshots

[Attach if applicable]

### Browser/Device

- Browser: Chrome/Firefox/Safari
- Device: Desktop/Mobile

### Priority

- [ ] Critical (blocks testing)
- [ ] High (major feature broken)
- [ ] Medium (feature partially works)
- [ ] Low (cosmetic/minor)
```

---

## 📝 Testing Schedule

| Time            | Tester 1 (Rahim)     | Tester 2 (Karim)   | Tester 3 (Salim)      |
| --------------- | -------------------- | ------------------ | --------------------- |
| Day 1, Hour 1   | Auth & Setup         | Auth & Setup       | Auth & Setup          |
| Day 1, Hour 2-3 | Products CRUD        | Storefront Browse  | Store Settings        |
| Day 1, Hour 4-5 | Variants & Inventory | Cart & Checkout    | Shipping & SEO        |
| Day 2, Hour 1-2 | Dashboard Stats      | Payment Testing    | Discounts & Campaigns |
| Day 2, Hour 3-4 | Import/Export        | Order Management   | Analytics & Reports   |
| Day 2, Hour 5   | Cross-verification   | Cross-verification | Cross-verification    |

---

## 🔗 Important URLs Summary

```
Authentication:
- /auth/register
- /auth/login
- /auth/logout

Dashboard:
- /app/dashboard
- /app/products
- /app/products/new
- /app/products/$id
- /app/dashboard/orders
- /app/dashboard/orders/$id
- /app/inventory
- /app/inventory/import

Marketing:
- /app/discounts
- /app/campaigns
- /app/campaigns/new
- /app/campaigns/$id
- /app/subscribers
- /app/abandoned-carts

Analytics:
- /app/analytics
- /app/reports

Settings:
- /app/settings
- /app/settings/seo
- /app/settings/shipping
- /app/settings/courier
- /app/settings/team
- /app/settings/activity

Storefront:
- / (Homepage)
- /products/$id
- /cart
- /checkout
- /thank-you/$orderId

Admin:
- /app/admin/payouts
```

---

## ⚠️ Collision Prevention Rules

1. **নিজের Store-এই কাজ করুন** - অন্যের subdomain এ যাবেন না
2. **Unique Data Use করুন** - Product/Discount নামে নিজের নাম prefix দিন
3. **API Keys Share করবেন না** - প্রত্যেকের আলাদা test credentials
4. **Bug Report এ Tester Name Mention করুন**
5. **Cross-verification সময় আগে coordinate করুন**

---

**Status Legend:**

- ⬜ Not Tested
- 🟡 In Progress
- ✅ Passed
- ❌ Failed
- ⚠️ Partial/Issues Found

---

> **Last Updated:** January 5, 2026
> **Version:** 1.0
