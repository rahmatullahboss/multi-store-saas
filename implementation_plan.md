# Refactor Store Editor & Fix Gaps

## Goal
Split the 3000+ line `store-live-editor.tsx` into a robust Service-Oriented Architecture (Server Logic + Client UI) to improve maintainability, then apply the Mobile Preview fixes.

## User Review Required
> [!IMPORTANT]
> The `store-live-editor.tsx` currently mixes Data Fetching, Database Writes, State Management, and UI Rendering. I will separate these cleanly. This is a large structural change but zero-functional change.

## Proposed Changes

### [Apps/Web] (Refactoring)

#### [NEW] [apps/web/app/routes/store-live-editor.server.ts](file:///apps/web/app/routes/store-live-editor.server.ts)
- Extract `loader()` logic (Fetching store, theme config).
- Extract `action()` logic (Saving Drafts, Publishing, Validation).
- Clean up Drizzle queries and validation logic.

#### [NEW] [apps/web/app/components/store-builder/LiveEditor.client.tsx](file:///apps/web/app/components/store-builder/LiveEditor.client.tsx)
- Extract the massive React Component.
- Move `useEditorHistory` and State Management here.
- Implement the "Split Pane" layout (Sidebar + Iframe).
- **FIX**: Implement correct Mobile/Tablet width constraints here.

#### [MODIFY] [apps/web/app/routes/store-live-editor.tsx](file:///apps/web/app/routes/store-live-editor.tsx)
- Reduce to a "Route Shell".
- Import `loader`/`action` from `.server.ts`.
- Render `LiveEditor` client component.

### [Apps/Web] (Feature Fixes)

#### [MODIFY] [registry.ts](file:///apps/web/app/components/store-sections/registry.ts)
- Rename `Category List` -> `Collection List`.

## Verification Plan

### Manual Verification
1.  **Refactor Check**:
    - Load `/store-live-editor`.
    - Verify all sections load.
    - Verify "Save Changes" persists to DB.
2.  **Mobile Fix**:
    - Click Mobile Icon -> Verify 375px width.
