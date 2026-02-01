# Findings

## Relevant Code

- `apps/web/app/components/store-templates/starter-store/index.tsx`: Main homepage component for Starter Store.
- `apps/web/app/components/store-templates/starter-store/sections/Header.tsx`: Header component for Starter Store.

## Documentation

- User requested: "Header position seems correct, but use white background instead of transparent."

## Decisions

- [x] Fix: Updated `StarterStoreHeader` to usage fixed positioning (overlay) but with a **solid white background**.
- [x] Fix: Resolved `Cannot read properties of undefined (reading 'typography')` by adding `nova-lux-ultra` to `TEMPLATE_ENHANCEMENTS` in `theme-config-converter.ts`.
