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

### Phase 8: Enterprise Features (Completed)

- [x] **Audit Trails**: Detailed logs for all sensitive actions (Expanded).
- [x] **SSO**: Single Sign-On for enterprise merchants (Google OAuth).
- [x] **Multi-Language Admin**: Full Bengali/English toggle for Admin panel.
- [x] **Marketing Landing Page i18n**: Full Bengali/English support for all landing page components (Chat, Builder, Product, etc.).
- [x] **Ozzyl AI Chatbot**: Premium dark glassmorphism chatbot for marketing pages.
- [x] **Lead Capture & Chat History**: Mandatory Name/Phone registration and persistent message logging.
- [x] **Marketing Header Standardization**: Unified header component across all marketing pages.
- [x] **Loyalty Database Schema**: Added tables for points, tiers, and transactions.

### Phase 14: Advanced Marketing & Loyalty (Priority: Research Paper) 🚀

- [ ] **Loyalty Logic Core**:
  - [ ] Implement Tier-based Multipliers (Bronze 1x, Silver 1.2x, etc.).
  - [ ] Implement Referral Point System.
  - [ ] Tier Upgrade Notifications.
- [ ] **Omnichannel Messaging**:
  - [ ] **SSL Wireless Integration**: Replace simulator with real API.
  - [ ] **Meta Cloud API**: Replace simulator with real WhatsApp API.
  - [ ] **Smart Triggers**:
    - [ ] Abandoned Cart (1 hour delay).
    - [ ] Win-back (30 days inactivity).
    - [ ] Review Request (3 days post-delivery).
- [ ] **Predictive AI**:
  - [ ] Churn Probability Calculation (based on order frequency).
  - [ ] Customer LTV Forecasting.

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

### Phase 10: Technical Debt & Standardization (Ongoing)

- [x] **Reactive Cart Logic**: Standardized `useCartCount` hook across all templates and headers.
- [x] **Template Building Guide**: Created comprehensive documentation for future theme development.

### Phase 11: Monetization & AI Economy (Completed)

- [x] **Restore Store Plan Lifecycle**: Restored robust product and order limits based on Starter/Pro/Business plans.
- [x] **AI Credit System**: Implemented a persistent credit-based economy for all AI features.
- [x] **Credit Ledger & History**: Added detailed transaction logging and merchant history UI.
- [x] **Admin Credit Oversight**: Enabled Super Admin monitoring of store credit balances.
- [x] **Sustainable Pricing**: Launched credit packages aligned with a 1:1 BDT-to-Credit ratio.

### Phase 12: AI-Powered Customer Segmentation & Remarketing (Completed)

- [x] **Master Pixel Setup**: Dual-pixel tracking for platform-wide audience aggregation
- [x] **Customer Segmentation Schema**: VIP, Churn Risk, Window Shopper, New, Regular segments
- [x] **AI Marketing Message Generator**: Personalized SMS/Email content in Bangla & English
- [x] **Merchant AI Campaigns Page**: Segment visualization and one-click campaign creation
- [x] **Super Admin Audience Insights**: Platform-wide customer analytics dashboard

### Phase 13: Merchant AI & Automation (Completed) 🤖

- [x] **Merchant AI Infrastructure**: Schema update (`agents`, `messages`, `conversations`).
- [x] **Messaging Hub**: WhatsApp & Messenger configuration UI for merchants.
- [x] **AI Agent Logic**: Multi-channel support (Web, WhatsApp, Messenger) with credit deduction.
- [x] **Deep Integration**: AI tools for Order Status Check, Tracking, and Lead Collection.
- [x] **Webhook Hander**: Unified webhook for Meta (WhatsApp/Messenger) events.

### Phase 14: Loyalty & Advanced Lifecycle Automations (Completed) 💎

- [x] **Loyalty Points System**: Customers earn points on every purchase (1 pt / 100 BDT).
- [x] **Tiered Membership**: Automated tiers (Bronze, Silver, Gold, Platinum) based on total spend.
- [x] **Referral System**: Built-in tracking for customer referrals and rewards.
- [x] **Lifecycle Automations**:
  - **Win-back SMS**: Auto-trigger for customers inactive for 30+ days.
  - **Review Request**: Auto-trigger 3 days after order delivery.
- [x] **Predictive Analytics**:
  - **CLV Calculation**: Customer Lifetime Value estimation.
  - **Product Recommendations**: AI-driven "Frequently Bought Together" logic.
  - **Next Purchase Prediction**: Forecasted date for next order.

### Phase 15: Advanced Marketing Integrations (Planned) 🚧

- [ ] **SMS Gateway Integration**: Native integration with SSL Wireless / BulkSMS BD for real SMS delivery.
- [ ] **WhatsApp Business API**: Direct integration for official Template Messages (Order Confirm, Shipping).
- [ ] **Catalog Sync**: Sync Product Catalog with WhatsApp/Facebook Shops.
- [ ] **Smart Discount Rules**: Time-based (Flash Sale) and Behavior-based (Cart Abandonment) dynamic discounts.
- [ ] **A/B Testing**: Split testing framework for marketing subject lines and offers.
