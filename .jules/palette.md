## 2024-04-04 - Elements Hidden with `opacity-0` Create Keyboard Traps
**Learning:** Elements hidden with `opacity-0` and revealed on hover (e.g., `group-hover:opacity-100`) become invisible traps for keyboard users unless explicitly paired with `focus-visible:opacity-100` and clear visual focus rings (e.g., `focus-visible:ring-2`).
**Action:** Always verify keyboard accessibility for elements revealed on hover. Apply `focus-visible:opacity-100` and focus styling (`focus-visible:ring-2`) to ensure they are visible when receiving keyboard focus.
