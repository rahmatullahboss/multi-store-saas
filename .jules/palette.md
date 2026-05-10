
## 2024-05-10 - Keyboard accessibility for hover-revealed elements
**Learning:** Elements hidden with `opacity-0` and revealed on hover (e.g., `group-hover:opacity-100`) become invisible traps for keyboard users because they can still receive focus but remain visually hidden unless explicitly styled for focus states.
**Action:** Always pair `opacity-0 group-hover:opacity-100` on interactive elements with `focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2` (or similar clear focus rings). For containers wrapping nested interactive elements, use `focus-within:opacity-100` so the container becomes visible when a child element receives focus.
