## 2024-04-06 - Search Close Button Accessibility
**Learning:** Found an accessibility pattern where icon-only "X" buttons to close search forms in various templates lack `aria-label` attributes. This breaks the experience for screen-reader users, as they are not informed of the button's action.
**Action:** When implementing icon-only buttons (especially 'X' for close/clear functionality), always include `aria-label` attributes (e.g. `aria-label="Close search"`) so they remain accessible.
