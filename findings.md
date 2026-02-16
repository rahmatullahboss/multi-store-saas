# Findings

## Relevant Code

- `apps/web/app/components/store-templates/starter-store/index.tsx`: Main entry point for the "MVP" theme (starter-store).
- `apps/web/app/components/store-templates/sokol`: "Shopify 2.0" style component (Dynamic).
- `apps/web/app/components/page-builder`: Main "Shopify 2.0" builder logic.
- `apps/web/app/utils/store.server.ts`: Likely handles `resolveStore` logic (need to verify path as prev tool failed).

## Decisions

- **Decision 1**: Moving all dynamic/builder code to `dev/future_improvements_multistore_saas`.
- **Decision 2**: Focusing on `starter-store` as the sole "MVP" implementation for now.
