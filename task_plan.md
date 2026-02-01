# Task Plan: Customer Authentication for Storefronts

## Goal

Implement a secure, store-specific customer authentication system for merchant storefronts, supporting Google OAuth and Email/Password, allowing customers to create accounts and login to specific stores.

## Success Criteria

- [ ] Database schema updated to support `StoreCustomer` (or similar) linked to `Store`.
- [ ] Authentication flow (Sign up/Login) implemented for Storefronts.
- [ ] Google OAuth integrated for Storefront customers (distinct from main app users if necessary).
- [ ] Session management implemented for Storefront customers.
- [ ] UI for Login/Signup added to Storefront templates.

## Phases

### Phase 1: Context & Research

- [x] [AGENT: Research Agent] [CONTEXT] Analyze `apps/web/app/services/auth.server.ts` and `apps/web/app/routes/auth.google.ts`.
- [x] [AGENT: Research Agent] [CONTEXT] Inspect Database Schema (`packages/database/src/schema.ts`).
- [x] [AGENT: Research Agent] [CONTEXT] Check Storefront Header components.
- [x] [AGENT: Research Agent] [CONTEXT] Check `customer-auth.server.ts` and `account.tsx`.

### Phase 2: Implementation

- [ ] [AGENT: Coding Agent] [CODE] Update `apps/web/app/services/customer-auth.server.ts`:
  - [ ] Add `hashPassword` / `verifyPassword` (reuse or import from `auth.server.ts` if exported, else duplicate/move to common).
  - [ ] Add `registerCustomer` function (email, password, name, storeId).
  - [ ] Add `loginCustomer` function (email, password, storeId).
- [ ] [AGENT: Coding Agent] [CODE] Create `apps/web/app/routes/store.auth.login.tsx`:
  - [ ] UI with Email/Password form.
  - [ ] Google Auth button (linking to `/store/auth/google`).
  - [ ] Action handler calling `loginCustomer`.
- [ ] [AGENT: Coding Agent] [CODE] Create `apps/web/app/routes/store.auth.register.tsx`:
  - [ ] UI with Name, Email, Password form.
  - [ ] Action handler calling `registerCustomer`.
- [ ] [AGENT: Coding Agent] [CODE] Update `apps/web/app/routes/account.tsx`:
  - [ ] Redirect unauthenticated users to `/store/auth/login`.
- [ ] [AGENT: Coding Agent] [CODE] Update `StarterStoreHeader.tsx` (and other themes):
  - [ ] Link "Account" icon to `/store/auth/login` if not logged in (or let `account` redirect handle it).

### Phase 3: Verification

- [ ] [AGENT: Testing Agent] [TEST] Verify Local Login/Signup.
- [ ] [AGENT: Testing Agent] [TEST] Verify Google OAuth flow.
