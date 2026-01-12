# Multi-tenant E-commerce SaaS

A Shopify-like multi-tenant e-commerce platform built with Cloudflare Workers, Hono.js, Remix, and D1.

## Tech Stack

- **Runtime**: Cloudflare Workers (Serverless Edge)
- **Backend**: Hono.js
- **Frontend**: Remix (SSR)
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Storage**: Cloudflare R2
- **Styling**: Tailwind CSS v4

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────┤
│  store1.mysaas.com  │  store2.mysaas.com  │  custom-shop.com │
├─────────────────────────────────────────────────────────────┤
│                   Tenant Middleware                          │
│         (Resolve store_id from hostname)                     │
├─────────────────────────────────────────────────────────────┤
│    Hono API Routes          │       Remix SSR               │
│    /api/products            │       /products/:id           │
│    /api/orders              │       /cart                   │
├─────────────────────────────────────────────────────────────┤
│                    Cloudflare D1 (SQLite)                   │
│              (All queries filtered by store_id)              │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create D1 database**

   ```bash
   wrangler d1 create ozzyl-saas-db
   ```

   Copy the `database_id` to `wrangler.toml`

3. **Create R2 bucket**

   ```bash
   wrangler r2 bucket create ozzyl-saas-media
   ```

4. **Run migrations**

   ```bash
   # Local
   wrangler d1 execute ozzyl-saas-db --local --file=./db/migrations/0001_initial_schema.sql
   wrangler d1 execute ozzyl-saas-db --local --file=./db/migrations/0002_seed_data.sql

   # Production
   wrangler d1 execute ozzyl-saas-db --file=./db/migrations/0001_initial_schema.sql
   wrangler d1 execute ozzyl-saas-db --file=./db/migrations/0002_seed_data.sql
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Test with different stores**
   ```
   http://localhost:8787?store=demo     # Demo Store
   http://localhost:8787?store=fashion  # Fashion Hub
   http://localhost:8787?store=tech     # Tech Shop
   ```

### Deploy to Cloudflare

```bash
npm run deploy
```

## Project Structure

```
├── app/                    # Remix frontend
│   ├── routes/             # Page routes
│   ├── components/         # React components
│   ├── lib/                # Utilities
│   └── styles/             # Tailwind CSS
├── server/                 # Hono backend
│   ├── middleware/         # Tenant resolution
│   ├── api/                # API routes
│   └── index.ts            # Entry point
├── db/
│   ├── schema.ts           # Drizzle ORM schema
│   └── migrations/         # SQL migrations
├── wrangler.toml           # Cloudflare config
└── package.json
```

## Multi-tenancy

Every request is processed through `tenantMiddleware` which:

1. Parses the hostname from the request
2. Determines if it's a subdomain or custom domain
3. Looks up the store in D1
4. Injects `storeId` and `store` into the request context
5. All subsequent database queries filter by `store_id`

## API Endpoints

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/products`          | List products        |
| GET    | `/api/products/:id`      | Get product          |
| POST   | `/api/products`          | Create product       |
| PUT    | `/api/products/:id`      | Update product       |
| DELETE | `/api/products/:id`      | Delete product       |
| GET    | `/api/orders`            | List orders          |
| POST   | `/api/orders`            | Create order         |
| PATCH  | `/api/orders/:id/status` | Update order status  |
| GET    | `/api/stores/current`    | Get current store    |
| POST   | `/api/stores`            | Create store (admin) |

## License

MIT
