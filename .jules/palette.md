## 2026-04-16 - Added missing accessibility attributes to OrderTimeline expand button
**Learning:** Icon-only expand/collapse buttons in custom interactive components often miss the `aria-expanded` state, which is crucial for screen reader users to understand the current state of the UI element they are interacting with. It's not enough to just add `aria-label`.
**Action:** Always include `aria-expanded={state}` alongside an appropriate `aria-label` on buttons that toggle visibility of details.
