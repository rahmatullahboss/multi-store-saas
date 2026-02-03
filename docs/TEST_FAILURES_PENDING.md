# Test Failures Pending Fix

Date: 2026-02-03

## Context
These failures occurred during `npm run turbo:test`. The AI-related changes were verified separately (see AI tests below). The following failures are **pre-existing** or unrelated to the AI work and are saved here for later fixes.

## Failing Suites (from @ozzyl/web)

1) app/tests/unit/intentEngine.test.ts
- should select premium-bd for Organic + direct sales
- should select mobile-first for WhatsApp leads
- should return 3 template suggestions

2) tests/api/metafields.api.test.ts
- creates and lists metafield definitions
- creates and fetches metafield values
- prevents deleting definition with existing values

3) tests/api/template-versions.api.test.ts
- lists versions for a template
- rolls back to a version (draft)

4) tests/unit/components/FooterBranding.test.tsx
- hides branding when disabled for pro plan

5) tests/integration/store-live-editor.validation.test.ts
- publishes successfully with valid settings

6) test/rate-limiter.test.ts
- should return HTML response when limit is reached

7) app/tests/unit/CheckoutModal.test.tsx
- displays shipping options

8) app/tests/unit/IntentWizard.test.tsx
- calls onComplete with intent and product when finishing
- allows selecting existing product

9) tests/theme-switch.test.tsx
- renders flash sale discount in TechModern theme
- renders flash sale discount in AuroraMinimal theme

10) Aurora Minimal Template Runtime Errors (during tests)
- ReferenceError: config is not defined
- ReferenceError: heroSrc is not defined

## page-builder
Initially failed due to missing deps. Fixed by installing:
- loupe
- tinypool
- tinyspy

page-builder tests now pass.

## Next Steps
- Triage the above failures by suite priority.
- Fix Aurora minimal template runtime issues first (breaking multiple tests).
- Re-run `npm run turbo:test` after fixes.
