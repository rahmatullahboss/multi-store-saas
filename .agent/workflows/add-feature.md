---
description: Add a new feature with TDD workflow for Ozzyl SaaS
---

# Add Feature Workflow

## Prerequisites

- **Architecture**: Read `.agent/skills/c4-architecture/SKILL.md`
- **Design**: Read `.agent/skills/web-design-guidelines/SKILL.md`
- **SaaS**: Read `.agent/skills/micro-saas-launcher/SKILL.md`

## Phase 1: Planning

- [ ] Understand requirements completely
- [ ] Identify files to create/modify
- [ ] Check existing patterns in similar features
- [ ] Verify multi-tenancy requirements

## Phase 2: Database (if needed)

- [ ] Create migration in `packages/database/src/migrations/`
- [ ] Update schema in `packages/database/src/schema*.ts`
- [ ] Apply locally: `npm run db:migrate:local`
- [ ] Verify schema with Drizzle Studio: `npm run db:studio`

## Phase 3: TDD - Write Tests First

- [ ] Create test file in `apps/web/tests/`
- [ ] Write failing tests for happy path
- [ ] Write failing tests for error cases
- [ ] Run tests (should fail): `npm run test`

## Phase 4: Implementation

### Backend (if API needed)

- [ ] Create/update route in `apps/web/app/routes/api.*.ts`
- [ ] Add Zod validation schema
- [ ] Implement business logic in `apps/web/app/services/`
- [ ] Add proper error handling

### Frontend (if UI needed)

- [ ] Create route in `apps/web/app/routes/app.*.tsx`
- [ ] Create components in `apps/web/app/components/`
- [ ] Use `useLoaderData` and `useFetcher` patterns
- [ ] Add loading and error states

## Phase 5: Verification

- [ ] All tests pass: `npm run test`
- [ ] TypeScript clean: `npm run typecheck`
- [ ] Lint clean: `npm run lint`
- [ ] Manual testing in browser
- [ ] E2E test if critical path: `npm run e2e`

## Phase 6: Code Review Checklist

- [ ] Multi-tenancy: All queries scoped by `storeId`
- [ ] Security: Input validation, auth checks
- [ ] Error handling: Proper try/catch
- [ ] Types: No `any`, explicit types
- [ ] No `console.log` in production

## Quick Commands

```bash
cd apps/web
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run typecheck         # Type check
npm run lint              # Lint check
npm run e2e               # E2E tests
```
