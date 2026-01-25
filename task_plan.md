# Task Plan: Code Review

## Goal

Conduct a comprehensive code review of the recent changes to the Page Builder preview logic and Section Renderer, ensuring compliance with project standards, security best practices, and functional correctness.

## Success Criteria

- [ ] Automated checks (lint, typecheck, test) pass or have clear fix plans.
- [ ] Manual review completed for:
  - `apps/web/app/routes/builder-preview.$pageId.tsx`
  - `apps/web/app/components/page-builder/SectionRenderer.tsx`
  - `apps/web/tests/unit/section-registry-update.test.ts`
- [ ] Security checks performed (SQLi, Input Validation).
- [ ] React/Remix patterns verified.
- [ ] Review report generated.

## Phases

### Phase 1: Automated Checks & Setup

- [x] [AGENT] Run `npm run turbo:typecheck && npm run turbo:lint && npx turbo run test`
- [x] [AGENT] Load Skills (`backend-dev-guidelines`, `frontend-dev-guidelines`, etc.)

### Phase 2: Manual Review

- [ ] [AGENT] Review `apps/web/app/routes/builder-preview.$pageId.tsx` (Focus: Fallback logic, Data Flow)
- [ ] [AGENT] Review `apps/web/app/components/page-builder/SectionRenderer.tsx` (Focus: Prop drilling, Type handling)
- [ ] [AGENT] Review `apps/web/tests/unit/section-registry-update.test.ts` (Focus: Test coverage, correctness)

### Phase 3: Reporting

- [ ] [AGENT] Create Code Review Report Artifact.
- [ ] [AGENT] Notify User.
