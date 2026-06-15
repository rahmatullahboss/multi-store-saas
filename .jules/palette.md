## 2024-06-15 - Added focus-visible classes to interactive variant selector elements
**Learning:** In interactive lists or selection menus, using semantic `<button type="button">` alongside explicit `focus-visible` ring utilities ensures accessible focus states and maintains clean interaction patterns without relying on pseudo-button wrapper divs.
**Action:** Pair direct interactive elements with `focus-visible` classes (e.g., `focus-visible:outline-none focus-visible:ring-2`) consistently for accessible keyboard navigation and focus management across components like checkout modals.
