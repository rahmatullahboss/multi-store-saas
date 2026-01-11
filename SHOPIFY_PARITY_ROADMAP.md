# Shopify 2.0 Parity Roadmap

This document serves as the master plan for upgrading the platform to reach feature parity with **Shopify Online Store 2.0**.
It outlines the architectural gaps and the step-by-step implementation plan.

## 🔴 Identified Gaps

| Feature                 | Description                                                                                             | Priority    |
| :---------------------- | :------------------------------------------------------------------------------------------------------ | :---------- |
| **Product Page Layout** | **Current**: Dynamic sections (drag & drop).                                                            | ✅ **Done** |
| **Collection Page**     | **Current**: Dynamic sections.                                                                          | ✅ **Done** |
| **Cart Page Layout**    | **Current**: Dynamic sections.                                                                          | ✅ **Done** |
| **App Blocks**          | **Current**: No plugin system.<br>**Target**: Allow 3rd party widgets to inject UI blocks.              | 🟡 Medium   |
| **Metafields**          | **Current**: Static text inputs.<br>**Target**: Dynamic data binding (e.g. "Connect to Product Title"). | 🟢 Low      |
| **Theme Uploads**       | **Current**: System themes only.<br>**Target**: ZIP upload for custom themes.                           | 🟢 Future   |

---

## 🚀 Execution Roadmap

### Phase 1: "Templates for Everything" (Current Focus)

**Goal**: Extend the `SectionRenderer` system to work on **Product Details**, **Collections**, and **Custom Pages**.

#### Step 1: Universal Template Schema

- [x] Update `ThemeConfig` interface in `db/types.ts`.
  - Added `productSections?: any[]`.
  - Added `collectionSections?: any[]`.

#### Step 2: "Section-ize" Product Details

Break down the monolithic `ProductDetail.tsx` into small, reusable components.

- [x] `ProductHeaderSection` (Breadcrumbs)
- [x] `ProductGallerySection` (Images)
- [x] `ProductInfoSection` (Title, Price, Variants, Buy Button)
- [x] `ProductReviewsSection` (Reviews List & Form)
- [x] `ProductDescriptionSection` (Long text description)
- [x] `RelatedProductsSection` (Recommendations)

#### Step 3: "Section-ize" Collection & Cart (Completed)

- [x] `CollectionHeaderSection`
- [x] `ProductGridSection` (Dynamic)
- [x] `CartItemsSection`
- [x] `CartSummarySection`
- [x] `routes/collections.$slug.tsx` (Dynamic Route)
- [x] `routes/cart.tsx` (Dynamic Section Support)

#### Step 3: Dynamic Template Rendering

- [x] Update `products.$id.tsx` to read `themeConfig.productSections`.
- [x] If sections exist, use `SectionRenderer`.
- [x] If not, fallback to the default hardcoded layout.

#### Step 4: Visual Editor Update

- [x] Update `store-live-editor.tsx` UI.
- [x] Add a **Page Selector** dropdown in the header (Home vs Product).
- [x] When "Product" is selected, load `themeConfig.productSections` into the sidebar.
- [x] Support Collection and Cart page editing.

---

### Phase 2: Dynamic Data Binding (Metafields)

**Goal**: Allow generic sections to display dynamic data.
_Example: Use the standard "Rich Text" section to display the Product Description._

1.  **Create Metafield Registry**: Define what data is available on which page.
    ```typescript
    const DYNAMIC_SOURCES = {
      product: ["title", "price", "description", "vendor"],
      store: ["name", "email", "currency"],
    };
    ```
2.  **Update Section Settings**: Add a "Connect Dynamic Source" button next to text inputs in the Editor.

---

### Phase 3: The "Widget" System (App Blocks)

**Goal**: Allow 3rd party apps to extend the storefront.

1.  **Create `WidgetSection`**: A generic shell that takes an `appId`.
2.  **Render Method**: Safely render the widget (likely via Iframe or isolated React component with restricted props).

---

## 🟢 Implementation Status

- Phase 1 (Sectionizing Product, Collection, Cart) is **Completed**.
- The layout engine now supports full drag-and-drop customization for core pages.
- Next Priority: **Phase 2 (Metafields)** to allow deeper customization.
