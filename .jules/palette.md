
## 2024-05-13 - [Keyboard Accessibility for Hover Actions]
**Learning:** Elements hidden with `opacity-0` and revealed on hover (`group-hover:opacity-100`) become invisible traps for keyboard users navigating with tab.
**Action:** Explicitly pair them with `focus-visible:opacity-100` and clear visual focus rings (e.g., `focus-visible:ring-2`), or apply `focus-within:opacity-100` on their parent containers so nested interactive elements are visible when focused.
