# MVP Production Roadmap

## 🎯 Goal: Release "Propilot - E-commerce SaaS" (MVP)

## 🛑 Phase 1: Critical Blockers (Must Fix)
*These prevent money from being made.*

- [ ] **Payment Automation**:
  - [ ] Integrate **bKash Merchant API** (or SSL Wireless/Shurjopay).
  - [ ] Existing `manualPaymentConfig` is fallback only.
- [ ] **Courier Automation**:
  - [ ] Connect **Pathao / Steadfast API** for auto-booking.
  - [ ] Ensure `shipments` table syncs status (Delivered/Returned).
- [ ] **Email Reliability**:
  - [ ] Set up **Resend.com** / **SMTP** for transactional emails.
  - [ ] DMARC / DKIM verification for domain.

## 🚧 Phase 2: Essential Features (Should Fix)
*These reduce support burden.*

- [ ] **Customer Auth (Phone)**:
  - [ ] Verify OTP login flow (Crucial for BD market).
- [ ] **Domain Connection**:
  - [ ] Verify Cloudflare for SaaS (SSL issuance flow) works smoothly.
- [ ] **Mobile Responsiveness**:
  - [ ] Double-check `Store Live Editor` output on mobile devices.

## 💅 Phase 3: Polish (Nice to Have)
- [ ] **Terms & Policies**: Auto-generate legal pages for merchants.
- [ ] **Onboarding Tour**: Walkthrough for new merchants (Genie Builder usually solves this).
- [ ] **Performance Tuning**: Cache `home` and `product` pages on Edge.

---

## 🛠️ Tech Debt Cleanup
- [ ] **GrapesJS**: Remove if unused to save bundle size.
- [ ] **Logging**: Add structural logging (e.g. `logger.info({ orderId })`) for debugging in production.
