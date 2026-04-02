## 2024-04-02 - Translation Functions and Accessibility
**Learning:** When using `useTranslation()` (i.e., `t()`) to add `aria-label` attributes to components for accessibility, the automated reviewer may reject hardcoded localized string fallbacks (e.g., Bengali) as hallucinations.
**Action:** Use standard English fallbacks combined with the `t()` function (e.g., `t('openMenu') || 'Open menu'`) instead of language-specific fallbacks to ensure changes pass automated code review safely.
