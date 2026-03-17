
## 2024-03-17 - Builder Accessibility
**Learning:** Generic builder settings components (like toggles and expand/collapse buttons) often lack ARIA attributes. When translating ARIA labels in builder UI, Bengali equivalents like "প্যানেল খুলুন" (Expand panel) or "বন্ধ করুন" (Close) should be used consistently to match the localized interface. Toggles need `role="switch"` and `aria-checked`.
**Action:** When working on builder/settings components, always check for icon-only toggles/buttons and ensure they have `role="switch"`, `aria-checked`, and translated `aria-label`s.
