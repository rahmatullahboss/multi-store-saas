# Multi-Tenant Customer Account System — Final Plan

## 🎯 Overview

Multi-Store SaaS সিস্টেমের জন্য Customer Account Dashboard plan। সব query তে `storeId` isolation ensure করা হবে।

**Tech Stack:** Remix + Tailwind CSS + Drizzle ORM + D1 + Lucide Icons

---

## 📊 Original Plan vs Multi-Tenant Reality

| #   | Section                  | DB/Service Status                       | Action                                   |
| --- | ------------------------ | --------------------------------------- | ---------------------------------------- |
| 1   | Dashboard Overview       | ✅ `getCustomerStats()` exists          | **MODIFY** — recent orders যোগ           |
| 2   | Order List               | ✅ `getCustomerOrders()` exists         | ✅ Done                                  |
| 3   | Order Details + Tracking | ✅ `shipments` table exists             | **NEW** route                            |
| 4   | Profile Settings         | ✅ `updateCustomerProfile()` exists     | ✅ Done                                  |
| 5   | Address Book             | ✅ Full CRUD in service                 | ✅ Done                                  |
| 6   | Payment Methods          | ❌ No table                             | **SKIP** — BD market COD/bKash per order |
| 7   | Wishlist                 | ✅ `wishlists` + `wishlistItems` tables | **NEW** route                            |
| 8   | Returns & Refunds        | ❌ No table                             | **SKIP** — WhatsApp/phone handled        |
| 9   | Coupons & Offers         | ✅ `discounts` table exists             | **NEW** route                            |
| 10  | Support Tickets          | ❌ No table                             | **SKIP** — WhatsApp/Messenger link       |

---

## ✅ Already Implemented (5 pages)

| Page                     | File                    | Status                                    |
| ------------------------ | ----------------------- | ----------------------------------------- |
| Account Layout + Sidebar | `account.tsx`           | ✅ Responsive sidebar, breadcrumbs, theme |
| Dashboard Overview       | `account._index.tsx`    | ✅ Stats cards, quick actions             |
| Profile Settings         | `account.profile.tsx`   | ✅ Edit name, email, phone                |
| Address Book             | `account.addresses.tsx` | ✅ Full CRUD                              |
| Order List               | `account.orders.tsx`    | ✅ List with status badges                |

---

## 🔧 Phase 1: Dashboard Enhancement

**File:** `account._index.tsx` (MODIFY)

```
📊 Enhanced Dashboard Cards (4 columns, mobile 2x2):
─────────────────────────────────────────────────────
Card 1: "মোট অর্ডার" — stats.totalOrders, Package icon
Card 2: "মোট খরচ" — ৳stats.totalSpent, DollarSign icon
Card 3: "লয়ালটি পয়েন্ট" — stats.loyaltyPoints, Award icon
Card 4: "উইশলিস্ট" — wishlist count, Heart icon → link to /account/wishlist

📦 সাম্প্রতিক ৩টি অর্ডার (Recent Orders):
─────────────────────────────────────────
- Query: orders WHERE customerId AND storeId, LIMIT 3
- কলাম: অর্ডার নম্বর, তারিখ, মোট, স্ট্যাটাস ব্যাজ
- "সব অর্ডার দেখুন" → /account/orders

🎯 Quick Actions:
──────────────────
- "শপিং করুন" → /products
- "উইশলিস্ট" → /account/wishlist
- "কুপন" → /account/coupons
```

**Service:** `getCustomerStats()` — already exists, add `getRecentOrders(customerId, storeId, db, limit=3)`

---

## 🔧 Phase 2: Order Details + Tracking

**File:** `account.orders.$id.tsx` (NEW)

```
📄 Order Detail Page:
─────────────────────
Loader: getCustomerOrderById(orderId, customerId, storeId, db)
        + join orderItems → products for item details

1️⃣ অর্ডার হেডার:
   - Order # (orderNumber), তারিখ (createdAt), Status badge
   - Action: "ক্যান্সেল করুন" (শুধু pending/confirmed status এ)

2️⃣ প্রোডাক্ট লিস্ট:
   - [ছবি] প্রোডাক্ট নাম | ভ্যারিয়েন্ট | x কোয়ান্টিটি | ৳ দাম
   - Query: orderItems JOIN products WHERE orderId

3️⃣ প্রাইস ব্রেকডাউন (parse pricingJson):
   - সাবটোটাল: ৳subtotal
   - ডেলিভারি: ৳shipping
   - ডিসকাউন্ট: -৳discount
   - মোট: ৳total

4️⃣ শিপিং অ্যাড্রেস (parse shippingAddress JSON)

5️⃣ পেমেন্ট মেথড:
   - COD/bKash/Nagad আইকন সহ
   - Transaction ID (if manualPaymentDetails)

6️⃣ অর্ডার টাইমলাইন (Vertical Stepper):
   ✅ অর্ডার প্লেসড — createdAt
   ✅/⭕ কনফার্মড — status check
   ✅/⭕ প্রসেসিং
   ✅/⭕ শিপড — shipments.shippedAt
   ✅/⭕ ডেলিভার্ড — shipments.deliveredAt

   Courier info: courierProvider + courierConsignmentId

   Completed steps: সবুজ + checkmark
   Current step: নীল + pulsing animation
   Upcoming: ধূসর + empty circle
```

**Service functions to add:**

```typescript
getCustomerOrderDetail(orderId, customerId, storeId, db);
// Returns: order + orderItems with product info + shipment data
```

---

## 🔧 Phase 3: Wishlist Page

**File:** `account.wishlist.tsx` (NEW)

```
❤️ Wishlist Page:
─────────────────
Loader: getCustomerWishlist(customerId, storeId, db)
        → wishlists → wishlistItems → products JOIN

🔄 টপ বার:
- "আমার উইশলিস্ট (X আইটেম)"
- Grid layout (4 cols desktop, 2 cols mobile)

📦 প্রোডাক্ট কার্ড:
┌──────────────────────┐
│ [প্রোডাক্ট ছবি]       │
│         ❌ (Remove)    │
│ প্রোডাক্ট নাম          │
│ ৳1,200  ৳1,500 (20%)  │
│ ✅ স্টকে আছে / ❌ স্টক শেষ │
│ [🛒 কার্টে যোগ করুন]   │
└──────────────────────┘

- Out of stock: ধূসর overlay + "স্টক শেষ" ব্যাজ
- Price comparison: compareAtPrice vs price

Empty state: হৃদয় ইলাস্ট্রেশন + "আপনার উইশলিস্ট খালি" + "শপিং করুন" বাটন

Action (POST): removeWishlistItem — useFetcher দিয়ে
```

**Service functions to add:**

```typescript
getCustomerWishlist(customerId, storeId, db);
// Query: wishlists WHERE customerId+storeId → wishlistItems JOIN products

removeWishlistItem(itemId, customerId, db);
// Delete from wishlistItems where id + validate ownership
```

---

## 🔧 Phase 4: Coupons Page

**File:** `account.coupons.tsx` (NEW)

```
🎟️ Coupons & Offers:
─────────────────────
Loader: getAvailableCoupons(storeId, db)

🏷️ ট্যাবস (URL search params):
[ব্যবহারযোগ্য] [মেয়াদোত্তীর্ণ]

🎫 কুপন কার্ড (ticket-style):
┌─────────────┬╌╌╌╌┬────────────────────────┐
│  ২০% ছাড়    │    │ সব পণ্যে ২০% ছাড়       │
│             │    │ কোড: SAVE20            │
│ [কপি করুন]  │    │ সর্বনিম্ন: ৳৫০০         │
│             │    │ মেয়াদ: ৩১ জানু ২০২৫    │
└─────────────┴╌╌╌╌┴────────────────────────┘

প্রতিটি কুপনে:
- ডিসকাউন্ট: % বা flat ৳
- সর্বনিম্ন অর্ডার (minOrderAmount)
- সর্বোচ্চ ছাড় (maxDiscountAmount)
- মেয়াদ (expiresAt) — কাউন্টডাউন
- ব্যবহারের সীমা (usedCount / maxUses)
- "কোড কপি করুন" → clipboard API, copied ✅ feedback

মেয়াদোত্তীর্ণ: ধূসর/faded, "মেয়াদ শেষ" ব্যাজ
Empty state: "কোনো কুপন পাওয়া যায়নি" + "শপিং করুন"
```

**Service function:**

```typescript
getAvailableCoupons(storeId, db);
// Query: discounts WHERE storeId AND isActive AND expiresAt > now
```

---

## 🔧 Phase 5: Sidebar Update

**File:** `AccountSidebar.tsx` (MODIFY)

```
📌 Updated Navigation Items:
─────────────────────────────
1. ড্যাশবোর্ড (Overview)     — /account
2. আমার অর্ডারসমূহ           — /account/orders
3. উইশলিস্ট ❤️              — /account/wishlist  ← NEW
4. অ্যাকাউন্ট সেটিংস        — /account/profile
5. অ্যাড্রেস বুক             — /account/addresses
6. কুপন ও অফার 🎟️          — /account/coupons   ← NEW
7. লগআউট                   — /store/auth/logout
```

---

## ❌ Skipped for MVP

| Feature                       | কারণ                                             |
| ----------------------------- | ------------------------------------------------ |
| Payment Methods (saved cards) | BD market এ per-order payment, saved methods নেই |
| Returns & Refunds             | WhatsApp/ফোনে handle হয়, BD SME pattern         |
| Support Tickets               | WhatsApp/Messenger link ই যথেষ্ট                 |
| Dark Mode Toggle              | Theme system per store handle করে                |
| 2FA / Session Management      | SME customers এর জন্য over-engineering           |
| Wallet Balance                | Schema তে wallet নেই                             |

---

## 🛡️ Multi-Tenant Security Rules

```typescript
// ⚠️ EVERY query MUST have storeId isolation
const result = await db
  .select()
  .from(orders)
  .where(
    and(
      eq(orders.customerId, customerId),
      eq(orders.storeId, storeId) // ← CRITICAL: Never omit
    )
  );

// ⚠️ Address queries - verify customer belongs to store first
// ⚠️ Wishlist queries - filter by storeId on the wishlists table
// ⚠️ Coupon queries - only show store-specific active discounts
```

---

## 📁 Final File Structure

```
apps/web/app/routes/
├── account.tsx              ← EXISTS (layout + sidebar)
├── account._index.tsx       ← MODIFY (add recent orders)
├── account.orders.tsx       ← EXISTS (order list)
├── account.orders.$id.tsx   ← NEW (order detail + tracking)
├── account.profile.tsx      ← EXISTS (profile edit)
├── account.addresses.tsx    ← EXISTS (address CRUD)
├── account.wishlist.tsx     ← NEW (wishlist grid)
└── account.coupons.tsx      ← NEW (available coupons)

apps/web/app/services/
└── customer-account.server.ts ← MODIFY (add new functions)

apps/web/app/components/account/
└── AccountSidebar.tsx       ← MODIFY (add wishlist, coupons nav)
```

---

## 🔄 Implementation Priority

| Priority | Task                    | Complexity | Est. Time |
| -------- | ----------------------- | ---------- | --------- |
| 🔴 P0    | Order Detail page       | Medium     | 2-3 hrs   |
| 🟡 P1    | Dashboard recent orders | Low        | 1 hr      |
| 🟡 P1    | Wishlist page           | Medium     | 2-3 hrs   |
| 🟢 P2    | Coupons page            | Low        | 1-2 hrs   |
| 🟢 P2    | Sidebar update          | Low        | 30 min    |

**Total estimated: ~8-10 hours**

---

## 🎨 Design Notes

- **Existing theme system ব্যবহার করো** — `--color-primary`, `--color-accent` CSS variables
- **Translations** — `useTranslation()` hook ব্যবহার করো সব text এ
- **Icons** — Lucide React (project standard)
- **Components** — existing shadcn/ui components (`Button`, `Badge`, `Sheet`, etc.)
- **Data Fetching** — Remix `loader` + `useLoaderData` (READ), `action` + `useFetcher` (WRITE)
- **Responsive** — mobile-first, Tailwind breakpoints
