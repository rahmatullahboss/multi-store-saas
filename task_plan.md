# Task Plan: Fix Turborepo Migration TypeScript Errors

## Goal
Fix all 126 TypeScript errors that appeared after migrating to Turborepo monorepo structure. Ensure `npm run turbo:typecheck` passes cleanly.

## Success Criteria
- [ ] All Session type access errors fixed (35 occurrences)
- [ ] All Drizzle ORM query chaining errors fixed
- [ ] All component prop type mismatches fixed
- [ ] All unknown type assertions fixed
- [ ] `npm run turbo:typecheck` passes with 0 errors
- [ ] Build succeeds without type errors

## Phases

### Phase 1: Context & Research
- [x] [CONTEXT] Analyze git history for Turborepo migration commit
- [x] [CONTEXT] Run typecheck and categorize all errors
- [x] [RESEARCH] Check Manus workflow documentation
- [x] [RESEARCH] Use Context7 for Turborepo and Drizzle ORM best practices
- [ ] [RESEARCH] Load relevant skills (typescript-expert, remix-development)

### Phase 2: Fix Session Type Access Pattern (35 errors)
- [ ] [CODE] Fix `api.metafields.ts` - change `session.storeId` to `session.get('storeId')`
- [ ] [CODE] Fix `api.template-versions.ts` - 12+ occurrences
- [ ] [CODE] Fix `api.metafield-definitions.ts`
- [ ] [CODE] Fix `lib/metafields.server.ts`
- [ ] [CODE] Fix `lib/page-builder/actions.server.ts`
- [ ] [CODE] Fix `lib/template-builder/actions.server.ts`
- [ ] [VERIFY] Run typecheck - Session errors should be 0

### Phase 3: Fix Drizzle ORM Query Issues
- [ ] [CODE] Fix `app.customers._index.tsx` - query chaining with dynamic where
- [ ] [CODE] Fix any other Drizzle query issues
- [ ] [VERIFY] Run typecheck - Drizzle errors should be 0

### Phase 4: Fix Component Type Mismatches
- [ ] [CODE] Fix `DefaultOrderForm.tsx` - null check for realData
- [ ] [CODE] Fix `SidebarPanel.tsx` - editor prop type
- [ ] [CODE] Fix `UnifiedStoreLayout.tsx` - undefined string parameter
- [ ] [CODE] Fix `bdshop/index.tsx` - ThemeConfig | null to Record
- [ ] [CODE] Fix `ghorer-bazar/index.tsx` - remove invalid CSS ringColor
- [ ] [CODE] Fix `ghorer-bazar/sections/Header.tsx` - remove focusRing
- [ ] [CODE] Fix `turbo-sale/sections/Footer.tsx` - add footerText
- [ ] [CODE] Fix `store/rovo/index.tsx` - filter null categories

### Phase 5: Fix Unknown Type Assertions
- [ ] [CODE] Fix `CheckoutFormSection.tsx` - type data properly
- [ ] [CODE] Fix `app.agent.tsx` - unknown[] to Record[]
- [ ] [CODE] Fix `app.customers.$id.tsx` - success property
- [ ] [CODE] Fix remaining route type issues

### Phase 6: Final Verification
- [ ] [TEST] Run `npm run turbo:typecheck` - should pass
- [ ] [TEST] Run `npm run turbo:build` - should succeed
- [ ] [VERIFY] No regressions in functionality
