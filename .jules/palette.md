## 2024-06-22 - Add ARIA Labels and Focus States to Mobile Menus
**Learning:** Icon-only buttons lacking ARIA labels are a critical accessibility issue, especially for screen readers on mobile devices. Hover effects should be supplemented with `focus-visible` to support keyboard navigation.
**Action:** Always ensure any interactive elements like `<button>` without visible text content have descriptive `aria-label`s and visible focus rings.
