
## $(date +%Y-%m-%d) - Add ARIA Labels to Mobile Menu Button
**Learning:** Found an icon-only SVG button without an accessible name or state indication in `StoreLayout.tsx`. Screen readers would likely announce it vaguely or not at all.
**Action:** Always add dynamic `aria-label` (e.g., "Open menu" vs "Close menu") and `aria-expanded` attributes to togglable, icon-only menu buttons to ensure full accessibility for screen reader users.
