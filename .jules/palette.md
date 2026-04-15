## 2024-04-15 - Add ARIA Labels to Icon-Only Buttons in Preview Components
**Learning:** Found several preview components (`ThemePreview.tsx`, `TemplatePreview.tsx`, `StoreTemplatePreview.tsx`) containing icon-only buttons (Desktop View, Mobile View, Close) that lack `aria-label`s, which causes accessibility issues for screen readers. Using `title` attribute is insufficient.
**Action:** Always add `aria-label` to icon-only buttons.
