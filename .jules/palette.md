## 2026-04-12 - Added aria-expanded to FAQ components
**Learning:** Found that FAQ accordion toggles across 11 templates were missing the `aria-expanded` attribute and `aria-controls` mapping to their answer bodies.
**Action:** Always verify accordion/toggle UI components include `aria-expanded` indicating the content state and `aria-controls` pointing to the expanded content id for screen reader users.
