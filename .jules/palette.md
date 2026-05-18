## 2024-05-19 - Invisible Interactive Elements on Focus
**Learning:** Interactive elements relying on hover states to become visible (e.g., `opacity-0` revealed via `group-hover:opacity-100`) are invisible traps for keyboard users because focusing them does not trigger the hover state.
**Action:** Explicitly pair them with `focus-visible:opacity-100` and clear focus rings (e.g., `focus-visible:ring-2 focus-visible:ring-cyan-500`) to ensure proper accessibility and distinct visual focus rings.
