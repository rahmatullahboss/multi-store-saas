## 2025-02-23 - Fix Keyboard Navigation for Mobile KPIs
**Learning:** Interactive elements implemented as `<div>` lack keyboard navigation support.
**Action:** Always use semantic `<button type="button">` with `w-full text-left` to maintain block layout, and add explicit `focus-visible` ring utilities for accessible focus states.
