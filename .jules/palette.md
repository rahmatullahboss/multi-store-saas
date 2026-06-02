
## 2025-06-03 - Improve keyboard accessibility for NotificationBell
**Learning:** Interactive elements nested inside popovers or dropdowns that rely heavily on hover states (e.g., `opacity-0` revealed via `group-hover:opacity-100`) become invisible traps for keyboard users.
**Action:** Explicitly pair these hover-dependent interactive elements with `focus-visible` classes (e.g., `focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/50 focus:outline-none`) and ensure they have semantic accessible labels to guarantee proper accessibility and distinct visual focus rings for keyboard navigation.
