## 2025-04-25 - Notification Bell Accessibility
**Learning:** Notification bells frequently use dynamic dropdowns but lack the required ARIA attributes (`aria-expanded` and `aria-controls`) to communicate state to screen readers. This makes it impossible for visually impaired users to know if clicking the bell opened a menu.
**Action:** Always ensure that toggle buttons for popovers/dropdowns have an `aria-expanded` reflecting their open state, and an `aria-controls` pointing to the ID of the dynamically rendered container.
