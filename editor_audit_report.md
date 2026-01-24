# Store Live Editor Audit Report

## 🏆 Verdict: Production Ready (90%)
Your **Store Live Editor** is a powerful visual builder that rivals standard SaaS offerings. It correctly implements the "Draft/Publish" workflow and uses modern React patterns (`dnd-kit`) for a smooth experience.

### ✅ What Works Well
1.  **Architecture**: The split between `Draft` and `Published` tables is solid.
2.  **Visual Editing**: `dnd-kit` implementation for sorting sections is superior to legacy jQuery-based editors.
3.  **Undo/Redo**: `useEditorHistory` hook provides a safety net for users.
4.  **Registry**: ~25 Components coverage is excellent for an MVP (Hero, Features, Product Grid, Urgency Bar).
5.  **Multi-Page Support**: You support editing `Home`, `Product`, `Cart`, `Checkout`. This is advanced.

### ⚠️ Critical Gaps (Must Fix for MVP)
| Feature | Gap Description | Priority |
| :--- | :--- | :--- |
| **Mobile Preview** | Code has `previewDevice` state, but does iframe actually resize? **Likely visual-only.** | High |
| **Theme Settings** | Basic Colors/Fonts exist. Missing: Global Rounding, Button Styles, Cart Drawer toggles. | Medium |
| **Templates** | Only 1-2 templates hardcoded? Need a way to swap "Presets". | Medium |

### 🔍 detailed Findings

#### 1. Section Registry (`registry.ts`)
You have a rich set of components tailored for **High Conversion**:
- `turbo-hero`: Video-first hero (Crucial for BD/Social traffic).
- `urgency-bar`: Stock scarcity (Conversion booster).
- `product-grid`: Standard e-com requirement.

**Missing Standard Sections**:
- **Blog/News**: No section to display latest posts.
- **Collection List**: No visual grid of collections (only product grid).
- **Map/Contact**: Visual map section is missing.

#### 2. Editor Mechanics (`store-live-editor.tsx`)
- **State**: Uses `useFetcher` for saving. Good for avoiding full page reloads.
- **Optimism**: `useEditorHistory` provides optimistic UI updates.
- **Complexity**: The file is **3,268 lines long**. This is technical debt waiting to happen.
    - **Action**: Refactor `Action` and `Loader` logic into separate files.

### 🚀 Recommendations
1.  **Refactor**: Split `store-live-editor.tsx` into `editor.server.ts` (Loader/Action) and `Editor.client.tsx` (UI).
2.  **Mobile View**: Ensure the `previewDevice` state toggles a CSS class on the iframe container to force width (e.g. `w-[375px]`).
3.  **Add "Collection List"**: This is a standard homepage requirement for stores with >1 category.
