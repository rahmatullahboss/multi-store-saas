# Development Roadmap

## Current Stage: Phase 8 - Enterprise Features

**Status**: Active Development
**Goal**: Transform the platform into a "World Class" SaaS with premium admin tools, advanced billing, and robust developer features.

---

## ✅ Completed Phases

### Phase 1: MVP Core (Merchant & Storefront)

- [x] **Store Creation**: Subdomain provisioning, Onboarding flow.
- [x] **Product Management**: Variants, Inventory, Categories.
- [x] **Order Management**: Order list, Status updates, Courier integration (Steadfast, Pathao).
- [x] **Storefront**: Dynamic themes, "Landing Mode" vs "Store Mode".
- [x] **Checkout**: bKash/COD support, Upsell offers.

### Phase 2: Marketing & Growth Tools

- [x] **Landing Page Builder**: Drag-and-drop editor for merchants.
- [x] **Marketing Campaigns**: Email broadcasts, Subscriber list.
- [x] **Analytics**: Merchant dashboard, pixel tracking (FB/GA4).

### Phase 3: Infrastructure & Super Admin V1

- [x] **Role Based Access Control (RBAC)**: Super Admin, Merchant, Staff.
- [x] **Domain Management**: Custom domain requests, SSL provisioning.
- [x] **Basic Billing**: Manual subscription verification.

### Phase 4: Super Admin Upgrade (Current)

- [x] **Analytics V2**: Interactive Revenue/Signup charts (Recharts).
- [x] **Command Palette**: Global `Cmd+K` navigation & search.
- [x] **Shadow Mode**: Admin impersonation with persistent visual warning & exit procedure.

---

## 🚀 Upcoming Phases

### Phase 5: Advanced Billing & Finance (Partial Complete)

- [x] **Data Architecture**: Create `payments` and `invoices` tables for historical tracking.
- [x] **Dashboard**: MRR, ARR, and Revenue Trends visualization.
- [ ] **Invoicing**: PDF Invoice generation for merchants.
- [ ] **Automated Billing**: Stripe/Paddle integration (optional upgrade from manual).

### Phase 6: Developer Ecosystem

- [ ] **Webhooks**: Merchant-configurable webhooks for order events.
- [ ] **API Keys**: Public API for merchants to build custom integrations.
- [x] **System Health**: Error logging and performance monitoring UI for Admins.

### Phase 7: Mobile App & Notifications

- [x] **Push Notifications**: Mobile app or PWA notifications for new orders (VAPID Backed).
- [x] **Mobile Admin App**: React Native or Capacitor wrapper (Initialized).

### Phase 8: Enterprise Features

- [x] **Audit Trails**: Detailed logs for all sensitive actions (Expanded).
- [x] **SSO**: Single Sign-On for enterprise merchants (Google OAuth).
- [x] **Multi-Language Admin**: Full Bengali/English toggle for Admin panel.
- [x] **Marketing Landing Page i18n**: Full Bengali/English support for all landing page components (Chat, Builder, Product, etc.).
- [x] **Ozzyl AI Chatbot**: Premium dark glassmorphism chatbot for marketing pages.
- [x] **Lead Capture & Chat History**: Mandatory Name/Phone registration and persistent message logging.
- [x] **Marketing Header Standardization**: Unified header component across all marketing pages.

---

## 🛠 Active Task List

- [x] Implement Audit Logging System
- [x] Integrate Google SSO
- [x] Setup i18n and Language Switcher
- [x] **GJS Rich Templates & Blocks**: Migrated legacy rich templates to GrapesJS with enhanced blocks.
- [x] **Landing Page Internationalization**: Complete i18n support for all marketing components.
- [ ] **Phase 9: Reliability Engineering** (Next)
  - [x] **Sentry Integration**: Integrated Sentry for error logging and monitoring.

### Phase 9: Visual Store Builder Upgrade (Completed)

- [x] **New Section Architecture**: Replaced hardcoded templates with dynamic `SectionRenderer`.
- [x] **Visual Section Editor**: Drag-and-drop management in `store-live-editor.tsx`.
- [x] **Theme Refactoring for Existing Templates**: Ported 6 templates (`LuxeBoutique`, `TechModern`, `ArtisanMarket`, `BDShop`, `Daraz`, `GhorerBazar`) to the new system.
- [x] **Theme Marketplace & Automated Submission**
  - [x] Automated theme submission from Live Editor
  - [x] Admin Theme Management (Approve/Reject/Remove)
  - [x] Merchant Theme Store to browse and apply community themes
- [x] **Theme Centralization**: Standardized brand colors across all refactored themes.
