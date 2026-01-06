# 🇧🇩 Bangladesh SME E-commerce Roadmap

> **Goal**: Best E-commerce Platform for Bangladeshi SMEs  
> **Updated**: January 6, 2026

---

## ✅ Phase 1: Quick Wins

### 1. WhatsApp Floating Button ✅ COMPLETE

- [x] Created `WhatsAppButton.tsx` component
- [x] Added to `StoreLayout.tsx`

### 2. Inside/Outside Dhaka Shipping ✅ COMPLETE

- [x] Added `shippingConfig` to stores schema
- [x] Created `app/utils/shipping.ts` with BD 8 divisions
- [x] Updated `api.create-order.ts` with division-based calculation
- [x] Added division dropdown with live shipping preview

### 3. Facebook Pixel Integration ✅ COMPLETE

- [x] Added `facebookPixelId` to stores schema
- [x] Created `app/utils/pixel.ts`
- [x] Injected pixel script in `root.tsx`
- [x] Added settings UI in SEO settings page

### 4. Manual bKash/Nagad Payment

- [ ] Add manual payment fields to stores schema
- [ ] Create payment method selection at checkout
- [ ] Add Transaction ID input field

---

## Phase 2: Customer Features

### 5. Google Login for Customers

- [ ] Setup Google OAuth
- [ ] Create customer auth flow
- [ ] Save customer sessions

### 6. Customer Account Features

- [ ] Saved addresses
- [ ] Order history page
- [ ] Wishlist feature

---

## Phase 3: Marketing & Growth

### 7. SMS Marketing

- [ ] SMS provider integration (BulkSMS BD)
- [ ] Order confirmation SMS
- [ ] Delivery status SMS

### 8. Reseller/Agent System

- [ ] Reseller registration
- [ ] Commission tracking
- [ ] Referral links

---

## Summary

| Feature                         | Status      |
| ------------------------------- | ----------- |
| WhatsApp Button                 | ✅ COMPLETE |
| Shipping (Inside/Outside Dhaka) | ✅ COMPLETE |
| Facebook Pixel                  | ✅ COMPLETE |
| Manual bKash/Nagad              | ⬜ TODO     |
| Google Login                    | ⬜ TODO     |
| Customer Accounts               | ⬜ TODO     |
| SMS Marketing                   | ⬜ TODO     |
| Reseller System                 | ⬜ TODO     |
