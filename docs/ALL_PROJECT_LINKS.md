# Ozzyl Multi-Store SaaS - Project Links & URLs

This document contains all the important deployed URLs, subdomains, and resource links used across the Ozzyl platform.

---

## 🌐 Main Application URLs (Production)

| Type | URL | Description |
| :--- | :--- | :--- |
| **Landing Page / Marketing Site** | [https://ozzyl.com](https://ozzyl.com) | Hosted marketing website (Vercel). |
| **Super Admin & Merchant Dashboard** | [https://app.ozzyl.com](https://app.ozzyl.com) | The main React (Remix) application where merchants manage their stores and super-admins manage the entire platform. |
| **Storefront Wildcard Domain** | `https://*.ozzyl.com` | Automatically provisioned subdomains for newly created tenant stores (e.g., `mystore.ozzyl.com`). |
| **Custom Domain Support** | *Client's Custom Domains* | Mapped via Cloudflare for custom domains attached to individual stores. |

---

## 🛠️ Microservices & Tools (Production)

| Name | URL | Description |
| :--- | :--- | :--- |
| **Page/Theme Builder** | [https://builder.ozzyl.com](https://builder.ozzyl.com) | Dedicated Cloudflare Worker hosting the GrapesJS visual editor for drag-and-drop store customization. |
| **Staging Environment** | *Internal Workers Dev URLs* | Used for testing features before production deployment. |

---

## 📦 Data Storage & Infrastructure

| Resource | Value / Link | Description |
| :--- | :--- | :--- |
| **Cloudflare R2 Public Media URL** | `https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev` | Publicly accessible URL for uploaded media assets (product images, banners, logos). |
| **Database** | Cloudflare D1 (SQLite) | `multi-store-saas-db` |
| **Cache Server** | Cloudflare KV | `STORE_CACHE`, `AI_RATE_LIMIT` |
| **Vector DB (AI Search)** | Cloudflare Vectorize | `multi-store-saas-vectors` |

---

## 🔗 Third-Party Integrations & Accounts

| Service | Category | Use Case / Integration Detail |
| :--- | :--- | :--- |
| **bKash / Nagad** | Payments | Local Mobile Financial Services (MFS) integration for Bangladesh. |
| **SSLCommerz / Stripe** | Card Payments | Local & International credit/debit card gateway integration. |
| **Pathao / RedX / Steadfast** | Logistics | Automated order placement and status tracking for couriers. |
| **Arcee AI (Trinity)** | Artificial Intelligence | Main AI model via OpenRouter API used for store generation, copywriting, and agents. |
| **Sentry** | Error Tracking | Used for frontend and backend error logging and alerting. |
| **Axiom** | General Logging | Cloudflare worker permanent log storage and visualization. |
| **Resend** | Emails | Transactional email delivery. |
| **Google Cloud Platform** | Social Auth | Google OAuth client ID configured (`477759293578-24qqc1l4mg7dtm2f44vtqbrme6p9cqa3.apps.googleusercontent.com`). |

---

## 📂 Source Code & Internal References

| Repository / Module | Path | Description |
| :--- | :--- | :--- |
| **Main Web Application** | `/apps/web` | Contains the Remix SSR app handling both Admin and Storefront logic. |
| **Page Builder App** | `/apps/page-builder` | Source code for the visual page builder. |
| **Landing Page App** | `/apps/landing` | Next.js/Astro Marketing site. |
| **Cloudflare Workers** | `/apps/web/workers` | CRON jobs, Subdomain proxy, and individual backend services. |
| **Database Schema** | `/packages/database` | Drizzle ORM schema and D1 migrations. |
