## 2024-05-25 - Focus Visibility for Hover-Revealed Actions
**Learning:** Interactive elements relying on hover states (e.g., `opacity-0` revealed via `group-hover:opacity-100`) become invisible traps for keyboard users.
**Action:** Explicitly pair them with `focus-visible:opacity-100` and focus ring utilities (e.g., `focus-visible:ring-2 focus-visible:ring-primary/50`) to ensure proper accessibility and distinct visual focus rings.
