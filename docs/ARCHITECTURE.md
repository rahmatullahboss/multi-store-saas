# Tech Stack & Architecture

> Multi-Store SaaS E-commerce Platform

---

## Core Technologies

| Layer         | Technology             | Purpose                  |
| ------------- | ---------------------- | ------------------------ |
| **Runtime**   | Cloudflare Workers     | Serverless edge compute  |
| **Framework** | Remix (React 18)       | Full-stack SSR framework |
| **Backend**   | Hono.js                | Fast API routing         |
| **Database**  | Cloudflare D1 (SQLite) | Edge SQL database        |
| **ORM**       | Drizzle ORM            | Type-safe DB queries     |
| **Storage**   | Cloudflare R2          | Image object storage     |
| **Styling**   | Tailwind CSS           | Utility-first CSS        |
| **Icons**     | Lucide React           | SVG icon library         |
| **Build**     | Vite                   | Fast bundler             |
| **Language**  | TypeScript             | Type safety              |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────┤
│  store1.ozzyl.com  │  store2.ozzyl.com       │
├─────────────────────────────────────────────────────────────┤
│                   Request Handler                           │
│     ┌─────────────────┐    ┌─────────────────┐             │
│     │  Hono.js API    │    │  Remix SSR      │             │
│     │  /api/*         │    │  Page Routes    │             │
│     └────────┬────────┘    └────────┬────────┘             │
│              │                      │                       │
│              └──────────┬───────────┘                       │
│                         ▼                                   │
│              ┌─────────────────┐                           │
│              │   Drizzle ORM   │                           │
│              └────────┬────────┘                           │
│                       ▼                                     │
├─────────────────────────────────────────────────────────────┤
│                  Cloudflare D1 (SQLite)                    │
│         (All queries filtered by store_id)                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Cloudflare R2  │  ←── Image Upload & Storage
└─────────────────┘
```

---

## Directory Structure

```
Ozzyl Saas/
├── app/                      # Remix Frontend
│   ├── routes/               # Page & API routes
│   │   ├── _index.tsx        # Storefront homepage
│   │   ├── auth.login.tsx    # Login page
│   │   ├── auth.register.tsx # Registration page
│   │   ├── app.tsx           # Dashboard layout
│   │   ├── app.products.tsx  # Product list
│   │   └── ...
│   ├── components/           # Reusable UI components
│   ├── services/             # Server-side services
│   │   └── auth.server.ts    # Auth utilities
│   ├── lib/                  # Utilities
│   └── styles/               # Tailwind CSS
│
├── server/                   # Hono Backend
│   ├── api/                  # API route handlers
│   ├── middleware/           # Request middleware
│   └── index.ts              # Entry point
│
├── db/                       # Database
│   ├── schema.ts             # Drizzle schema
│   ├── types.ts              # Type exports
│   └── migrations/           # SQL migrations
│
├── functions/                # Cloudflare Functions
├── public/                   # Static assets
├── wrangler.toml             # Cloudflare config
├── vite.config.ts            # Vite bundler config
└── package.json              # Dependencies
```

---

## Database Schema

### Tables

| Table         | Description       | Key Fields                          |
| ------------- | ----------------- | ----------------------------------- |
| `stores`      | Tenant stores     | id, name, subdomain, mode, currency |
| `users`       | Merchant accounts | id, email, passwordHash, storeId    |
| `products`    | Store products    | id, storeId, title, price, imageUrl |
| `customers`   | Customer info     | id, storeId, email, phone           |
| `orders`      | Order records     | id, storeId, status, total          |
| `order_items` | Order line items  | id, orderId, productId, quantity    |

### Multi-tenancy

All data is isolated by `storeId`. Every query filters by the merchant's store to ensure data separation.

---

## Key Integrations

### Cloudflare R2 (Image Upload)

```
POST /api/upload-image
├── Accepts: multipart/form-data (file, folder)
├── Images compressed on client via imageCompression.ts
├── Uploads to R2 bucket (ozzyl-saas-media)
├── Returns: { url, key, size, type }
```

### Authentication Flow

```
1. User submits login form
2. Server validates credentials (PBKDF2 hash check)
3. Creates session cookie (__session)
4. Stores userId + storeId in session
5. Protected routes call requireUserId()
```

---

## Environment Variables

| Variable         | Description                       |
| ---------------- | --------------------------------- |
| `R2`             | R2 bucket binding (wrangler.toml) |
| `R2_PUBLIC_URL`  | R2 bucket public URL              |
| `DB`             | D1 database binding (auto)        |
| `RESEND_API_KEY` | Email service API key             |

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Generate Drizzle migrations
npm run db:generate

# Apply migrations (local)
wrangler d1 execute ozzyl-saas-db --local --file=./db/migrations/xxxx.sql

# Deploy to production
npm run deploy
```

---

## Deployment

Hosted on **Cloudflare Pages** with:

- Auto-deployment on git push
- Edge SSR via Workers
- D1 database (production)
- Custom domain: `stores.ozzyl.com`
