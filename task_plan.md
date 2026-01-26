# Task Plan: Upgrade Storied Driven Template

## Goal

Upgrade the "Storied Driven Template" (likely 'story-brand' or similar found in analysis) to a world-class, high-fidelity UI/UX with premium typography, advanced animations, and immersive layouts.

## Success Criteria

- [ ] Identify the correct "Storied Driven Template" in `templates.ts`.
- [ ] Create a detailed design plan in `implementation_plan.md` (or within this task plan).
- [ ] Implement premium typography (Google Fonts).
- [ ] Implement advanced color palette.
- [ ] Overhaul Hero, Features, and CTA sections with high-fidelity designs (Bento grids, glassmorphism, etc.).
- [ ] Add micro-interactions and scroll animations.
- [ ] Verify changes in `landing-template-preview`.

## Phases

### Phase 1: Context & Research

- [ ] [AGENT: Research Agent] [CONTEXT] Identify the specific template in `apps/web/app/lib/page-builder/templates.ts`.
- [ ] [AGENT: Research Agent] [CONTEXT] Analyze `docs/theme_development_guide.md` for constraint compliance.
- [ ] [AGENT: Research Agent] [CONTEXT] Check `apps/web/app/routes/landing-template-preview.$templateId.tsx` for rendering logic.

### Phase 2: Design & Planning

- [ ] [AGENT: Design Agent] [PLAN] Define the new design tokens (Colors, Fonts).
- [ ] [AGENT: Design Agent] [PLAN] Define section specific upgrades (Hero -> Immersive, Features -> Bento).

### Phase 3: Implementation

- [ ] [AGENT: Coding Agent] [CODE] Update `apps/web/app/lib/page-builder/templates.ts` with new JSON structure.
- [ ] [AGENT: Coding Agent] [CODE] Create/Update React components if necessary (or just generic section upgrades). _Note: The system seems to rely on generic sections with variants. I may need to create new variants._
- [ ] [AGENT: Coding Agent] [CODE] Update `docs/theme_development_guide.md` with new standards.

### Phase 4: Verification

- [ ] [AGENT: Testing Agent] [VERIFY] Visual verification via preview code inspection.
