## 2026-03-29 - Interactive Elements Hidden with `opacity-0` Need Focus States
**Learning:** Elements hidden with `opacity-0` and revealed on hover (e.g., `group-hover:opacity-100`) become invisible traps for keyboard users unless explicitly paired with `focus-visible:opacity-100` and clear visual focus rings.
**Action:** Always add `focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2` when using `group-hover:opacity-100` on buttons or links.
