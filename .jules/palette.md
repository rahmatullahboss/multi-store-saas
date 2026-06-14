
## 2024-06-15 - Make hidden hover actions keyboard accessible
**Learning:** Icon-only buttons that are hidden by default (`opacity-0`) and revealed on hover (`group-hover:opacity-100`) are invisible to keyboard users navigating via Tab.
**Action:** Explicitly pair `group-hover:opacity-100` with `focus-visible:opacity-100` and explicit focus rings (`focus-visible:ring-2`) on interactive elements to ensure they become visible during keyboard navigation. Also always include `aria-label` for icon-only buttons.
