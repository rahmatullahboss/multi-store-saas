## 2024-05-14 - Bengali localization in aria-labels
**Learning:** Found that this codebase heavily relies on Bengali (Bangla) translations. For accessibility improvements like `aria-label`s, ensure the label text matches the localized Bengali text (often already provided in `title` attributes) or uses common translations like 'বন্ধ করুন' (Close).
**Action:** When adding `aria-label`s to icon-only buttons in builder components or storefront, ensure they are translated to Bengali or match existing translations.
