
## 2024-05-01 - Hidden Action Buttons Needs Focus Within and Focus Visible
**Learning:** Elements hidden with `opacity-0` and revealed on hover (`group-hover:opacity-100`) become invisible traps for keyboard users.
**Action:** Explicitly pair them with `focus-visible:opacity-100` and clear visual focus rings (e.g., `focus-visible:ring-2`), and apply `focus-within:bg-gray-50` (or `focus-within:opacity-100`) on their parent containers so nested interactive elements are visible when focused via keyboard.
