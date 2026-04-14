## 2024-04-14 - Add aria-label to preview modal close buttons
**Learning:** Found multiple high-fidelity preview modals (`ThemePreview`, `TemplatePreview`, `StoreTemplatePreview`) across the app that missed `aria-label`s on their top-right close (`X`) buttons. This makes them inaccessible to screen readers.
**Action:** Always verify that icon-only buttons (especially standard "close/X" buttons in modals or headers) have descriptive `aria-label`s (like `aria-label="Close preview"`) to ensure keyboard/screen reader accessibility.
