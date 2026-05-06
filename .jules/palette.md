
## 2024-05-17 - Keyboard Trap in opacity-0 Elements
**Learning:** Elements hidden with `opacity-0` and revealed on hover (`group-hover:opacity-100`) create an invisible trap for keyboard users because they receive focus but remain visually hidden.
**Action:** Always add `focus-visible:opacity-100` alongside `opacity-0` to ensure the element becomes visible when focused via keyboard navigation, along with standard focus rings (`focus-visible:ring-2`).
