# 🧪 Complete Testing Guide - Single Tester

> **উদ্দেশ্য:** একজন টেস্টার পুরো Multi-Store SaaS system সম্পূর্ণভাবে টেস্ট করবে।

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

## 🧑‍� Tester Details

| Field             | Value             |
| ----------------- | ----------------- |
| **Tester Name**   | [Your Name]       |
| **Test Store**    | `test-store`      |
| **Test Email**    | `tester@test.com` |
| **Test Password** | `TestPass123!`    |

---

## 1️⃣ Authentication Tests

- [ ] **Registration** (`/auth/register`)

  - Store Name: `Test Store`
  - Subdomain: `test-store`
  - Email: `tester@test.com`
  - Password: `TestPass123!`

- [ ] **Login** (`/auth/login`)

  - Login with credentials
  - Session persistence (close & reopen browser)

- [ ] **Logout**
  - Dashboard logout
  - Protected route redirect verification (`/app/*`)

---

## 2️⃣ Product Management Tests

- [ ] **Add New Product** (`/app/products/new`)

  - Title: `Test Product 1`
  - Description: Any text
  - Price: 500 | Compare at Price: 600
  - Inventory: 100 | SKU: `TEST-001`
  - Category: `Electronics`
  - Image upload (Cloudinary)
  - Multiple images upload
  - Tags: `test, product`

- [ ] **Add Product with Variants**

  - Title: `Test Variant Product`
  - Size variants: Small (900), Medium (1000), Large (1100)
  - Color variants: Red, Blue, Green
  - Each variant has own inventory

- [ ] **Edit Product** (`/app/products/$id`)

  - Change title, price, inventory, image

- [ ] **Delete Product**

  - Delete a product with confirmation modal

- [ ] **Product List View** (`/app/products`)
  - Pagination | Search | Category filter | Published toggle

---

## 3️⃣ Inventory Management Tests

- [ ] **Inventory Overview** (`/app/inventory`)

  - Low stock products visible
  - Stock update functionality

- [ ] **Bulk Import** (`/app/inventory/import`)

  - CSV file upload and preview
  - Import confirmation

- [ ] **Export Products** (API: `/api/products/export`)
  - CSV export download

---

## 4️⃣ Storefront Tests

- [ ] **Homepage** (`/` or `test-store.localhost:5173`)

  - Products grid | Category navigation | Store branding

- [ ] **Product Detail Page** (`/products/$id`)
  - Product info | Variant selection | Add to cart button

---

## 5️⃣ Cart & Checkout Tests

- [ ] **Cart Functionality** (`/cart`)

  - Single product add | Multiple products add
  - Quantity update | Remove item
  - Cart persistence (localStorage)

- [ ] **Discount Code Apply**

  - Valid code → price reduction
  - Invalid code → error message
  - Expired code → error message
  - Minimum order amount check

- [ ] **Checkout Page**

  - Customer info form
  - Shipping address | Phone number | Email

- [ ] **COD Order**

  - Complete order without payment
  - Order confirmation page
  - Order number generation

- [ ] **bKash Payment** (`/api/bkash/initiate`)

  - Initiate → Redirect → Callback → Success

- [ ] **Nagad Payment** (`/api/nagad/initiate`)

  - Payment flow complete

- [ ] **Stripe Payment** (`/api/stripe/initiate`)
  - Test card: `4242 4242 4242 4242`
  - Expiry: Any future date | CVV: Any 3 digits

---

## 6️⃣ Order Management Tests

- [ ] **Orders List** (`/app/dashboard/orders`)

  - All orders visible | Status filter | Date filter

- [ ] **Order Detail** (`/app/dashboard/orders/$id`)

  - Customer info | Order items | Payment status | Shipping status

- [ ] **Order Status Update**

  - Pending → Processing → Shipped → Delivered
  - Add tracking number

- [ ] **Courier Integration** (`/app/settings/courier`)

  - Pathao integration | Create shipment | Track shipment

- [ ] **Abandoned Carts** (`/app/abandoned-carts`)
  - Cart list | Cart items preview | Customer info

---

## 7️⃣ Discounts & Promotions Tests

- [ ] **Create Discount** (`/app/discounts`)

  - Code: `TEST20` | Type: Percentage | Value: 20
  - Min order: 500 | Max uses: 100 | Expiry date

- [ ] **Flash Sale**

  - Create flash sale | Homepage toggle | Timer functionality

- [ ] **Edit/Delete Discount**
  - Update | Deactivate | Delete

---

## 8️⃣ Email Marketing Tests

- [ ] **Subscriber List** (`/app/subscribers`)

  - View all | Add manually | Export CSV

- [ ] **Create Campaign** (`/app/campaigns/new`)

  - Name: `Test Campaign`
  - Subject: `Test Email` | HTML content | Preview text

- [ ] **Campaign Management** (`/app/campaigns`)

  - Draft | Schedule | View sent | Stats (open, click)

- [ ] **Unsubscribe** (`/unsubscribe?email=test@test.com`)

---

## 9️⃣ Analytics & Reports Tests

- [ ] **Analytics Dashboard** (`/app/analytics`)

  - Sales chart | Top products | Customer demographics | Conversion metrics

- [ ] **Reports** (`/app/reports`)
  - Sales report CSV | Inventory report | Customer report | Tax report
  - Date filter functionality

---

## 🔟 Store Settings Tests

- [ ] **General Settings** (`/app/settings`)

  - Store name | Logo upload | Currency | Language (EN/BN)

- [ ] **Theme & Branding**

  - Accent color picker | Font selection | Favicon upload

- [ ] **Social Links**

  - Facebook URL | Instagram URL | WhatsApp number

- [ ] **SEO Settings** (`/app/settings/seo`)

  - Meta title | Meta description | OG image

- [ ] **Shipping Settings** (`/app/settings/shipping`)

  - Add zone: `Dhaka City` - Rate: 60
  - Add zone: `Outside Dhaka` - Rate: 120
  - Free shipping threshold

- [ ] **Courier Settings** (`/app/settings/courier`)
  - Pathao API credentials | Test connection

---

## 1️⃣1️⃣ Team & Notification Tests

- [ ] **Invite Team Member** (`/app/settings/team`)

  - Email: `team@test.com` | Role: Staff | Send invite

- [ ] **Accept Invite** (`/invite/$token`)

  - Open invite link | Create password | Login

- [ ] **Activity Logs** (`/app/settings/activity`)

  - Recent activities | Filter by action | User attribution

- [ ] **Email Notifications**
  - Notification email override
  - Enable/disable toggle
  - Low stock threshold setting

---

## 1️⃣2️⃣ Dashboard Overview

- [ ] **Dashboard Stats** (`/app/dashboard`)
  - Total Products | Total Orders | Revenue | Recent orders

---

## 📊 System Readiness Checklist

### ✅ Core Features

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

**Tester:** [Your Name]
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

## 📝 Testing Schedule (Recommended Order)

| Phase | Duration | Area                              |
| ----- | -------- | --------------------------------- |
| 1     | 30 min   | Auth & Store Setup                |
| 2     | 1 hour   | Products CRUD & Variants          |
| 3     | 30 min   | Inventory Management              |
| 4     | 1 hour   | Storefront, Cart & Checkout       |
| 5     | 1 hour   | Payment Gateways (COD/bKash/etc.) |
| 6     | 1 hour   | Order Management & Shipping       |
| 7     | 30 min   | Discounts & Promotions            |
| 8     | 30 min   | Email Marketing & Campaigns       |
| 9     | 30 min   | Analytics & Reports               |
| 10    | 1 hour   | Settings (Store/SEO/Shipping)     |
| 11    | 30 min   | Team & Notifications              |
| 12    | 30 min   | Dashboard & Final Verification    |

**Total Estimated Time:** ~8 hours

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

**Status Legend:**

- ⬜ Not Tested
- 🟡 In Progress
- ✅ Passed
- ❌ Failed
- ⚠️ Partial/Issues Found

---

> **Last Updated:** January 5, 2026
> **Version:** 2.0
