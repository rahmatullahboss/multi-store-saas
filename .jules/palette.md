## 2024-05-03 - [Notification Bell Accessibility]
**Learning:** Found that custom dropdown components like the Notification Bell often lack essential ARIA attributes connecting the toggle button to the expanded content region.
**Action:** Always ensure toggle buttons have `aria-expanded`, `aria-controls`, and `aria-haspopup`, and that the corresponding container has a `role="region"` and `id` when implementing custom dropdowns.
