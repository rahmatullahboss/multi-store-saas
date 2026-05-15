## 2024-05-15 - Missing ARIA label on Search Button in UnifiedStoreLayout
**Learning:** Found a missing `aria-label` attribute on the search button inside the `UnifiedStoreLayout` component. This prevents screen reader users from understanding the purpose of the button.
**Action:** Always add `aria-label` to icon-only buttons to ensure they are accessible to screen reader users. I will add `aria-label="Search"` to the button.
