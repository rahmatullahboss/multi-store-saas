## 2026-05-10 - Added proper ARIA attributes to NotificationBell
**Learning:** Notification bell dropdown components need proper ARIA linking (`aria-expanded`, `aria-controls`, `aria-labelledby`) utilizing React's `useId()` for dynamically rendered regions.
**Action:** Always use `useId()` to map trigger buttons to their dynamically rendered dropdown containers.
