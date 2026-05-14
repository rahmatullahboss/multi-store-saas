## 2026-05-14 - Added ARIA attributes to NotificationBell
**Learning:** React `useId()` is excellent for dynamically pairing `aria-controls` and `aria-labelledby` between toggle buttons and their respective dropdown `role="region"` containers to improve screen-reader context without ID collisions.
**Action:** Consistently use `useId` in reusable dropdown/popover components across the design system to ensure robust accessibility scaling.
