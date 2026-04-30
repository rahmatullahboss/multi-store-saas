## 2024-05-01 - Add aria-labels to preview modal action buttons
**Learning:** Icon-only device toggle and close buttons in theme/template preview modals often lack `aria-label`s, which makes keyboard navigation and screen readers unable to announce their purpose correctly. Even though they have `title`, `aria-label` is needed for accessibility.
**Action:** Add `aria-label` attributes to icon-only buttons like Desktop/Mobile view toggles and Close buttons across the app.
