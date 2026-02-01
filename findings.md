# Findings

## Relevant Code

- `apps/web/app/services/customer-auth.server.ts`: Handles customer session & Google Auth. **Missing Email/Password logic.**
- `apps/web/app/routes/store.auth.google.ts`: Existing Google Auth route.
- `apps/web/app/routes/account.tsx`: Customer account page. Redirects to `/` if not logged in.
- `packages/database/src/schema.ts`: `customers` table exists and supports `passwordHash` and `storeId`.

## Documentation

- **Schema**: `customers` table has `email`, `passwordHash`, `storeId`.
- **Auth Pattern**: Use `customer-auth.server.ts` similar to `auth.server.ts`.

## Decisions

- [x] Decision 1: Implement Email/Password auth in `customer-auth.server.ts`.
- [x] Decision 2: Create `store.auth.login.tsx` and `store.auth.register.tsx` for storefront usage.
- [x] Decision 3: Update `account.tsx` to redirect to `/store/auth/login` instead of `/` when unauthenticated.
