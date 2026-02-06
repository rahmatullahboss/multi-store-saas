# Task Plan: Integration of OpenLovable (landing.ozzyl.com)

## Goal

Deploy a modified version of **OpenLovable** as a separate Cloudflare Worker/Pages application at `landing.ozzyl.com`.

## Success Criteria

- [ ] `open-lovable` repo is cloned into `apps/landing-builder`.
- [ ] Application runs on Cloudflare (Hono + React/Vite/Remix).
- [ ] Deployed to `landing.ozzyl.com`.
- [ ] Accessible via "Landing Page Builder" tab in Admin (`app.ozzyl.com`).
- [ ] Authentication is secured.

## Phases

### Phase 1: Setup & Context

- [x] [AGENT] Fetch Context7 docs for Firecrawl.
- [x] [AGENT] Clone `firecrawl/open-lovable` repo.
- [x] [AGENT] Audit `package.json` and API structure.

### Phase 2: Adaptation (Execution)

- [x] [AGENT] Create `implementation_plan.md`.
- [x] [AGENT] Config `wrangler.toml` for `landing.ozzyl.com`.
- [x] [AGENT] Install `@cloudflare/next-on-pages` and update build scripts.
- [ ] [AGENT] Verify E2B provider in `lib/sandbox`.
- [ ] [AGENT] Refactor `create-ai-sandbox` to be stateless (E2B).
- [ ] [AGENT] Refactor `generate-ai-code-stream` to use `Sandbox.connect`.

### Phase 3: Integration

- [ ] [AGENT] Add navigation link in Main Admin.
- [ ] [AGENT] Verify Auth flow.
