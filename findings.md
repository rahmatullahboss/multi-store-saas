# Findings

## Relevant Code

- `apps/web/app/components/store-templates/starter-store/index.tsx`: Main homepage component for Starter Store.
- `apps/web/app/components/store-templates/starter-store/sections/Header.tsx`: Header component for Starter Store.

## Documentation

- User pointed out the issue was on `Starter Store`, not `Sokol`.
- Issue: Sticky solid header was pushing content down, creating unwanted space on the homepage.

## Decisions

- [x] Fix: Implemented immersive header (overlay) for Starter Store homepage. This removes the solid space and overlays the header on the hero banner.
- [x] Fix (Previous): Removed duplicate rendering in Sokol (kept as a righteous fix, though not the user's immediate problem).
