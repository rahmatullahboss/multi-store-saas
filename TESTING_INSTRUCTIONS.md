# Testing Instructions: Multi-Page Landing & Collections

Here is the step-by-step guide to verify the new features (Multi-Page Landing & Collections).

## 1. Multi-Page Landing Feature (New!)

This feature allows you to create specific landing pages for campaigns (e.g., "Black Friday", "Summer Sale") separate from your main homepage.

### Step 1: Create a New Page
1.  Go to **Admin Panel > Pages** (`/app/pages`).
2.  Click **"Create New Page"**.
3.  Enter a **Title** (e.g., "Special Deal").
4.  The **Slug** will auto-generate (e.g., "special-deal"). You can edit it if you want.
5.  Click **Create**.

### Step 2: Design the Page
1.  After creating, you will be redirected to the **Landing Page Builder**.
2.  Select a **Template** (e.g., Flash Sale).
3.  Modify some text or settings to make it unique.
4.  Click **Save Changes** (top right).

### Step 3: View Live Page
1.  Click the **"View Live"** button in the builder header.
2.  OR manually go to: `https://[your-domain]/p/special-deal`.
3.  **Verify**: The page should show your specific design.
4.  **Verify Homepage**: Go to `https://[your-domain]/` and confirm it is **NOT** changed (it should still show your main store layout).

### Step 4: Check Analytics (View Count)
1.  Refresh your new custom page (`/p/special-deal`) a few times.
2.  Go back to **Admin Panel > Pages**.
3.  Check the **Views** column for your page. It should have increased.

---

## 2. Collections System (Categories Upgrade)

This feature upgraded the simple text categories to a robust Collection system.

### Step 1: Create a Collection
1.  Go to **Admin Panel > Collections**.
2.  Click **Create Collection**.
3.  Add a Title, Description, and Image.
4.  **Add Products**: Use the search bar to find and attach products.
5.  Click **Save**.

### Step 2: Assign Collection to Product
1.  Go to **Products** and edit any product.
2.  Look for the **"Collections"** sidebar on the right.
3.  Check the box for your new collection.
4.  Click **Save Product**.

### Step 3: Verify Storefront
1.  Go to the storefront URL: `https://[your-domain]/collections/[collection-slug]`.
2.  Verify you see the collection details and the products you assigned.

---

---

## 3. Analytics & Attribution (New!)

This feature tracks where your orders come from and provides visual stats for your campaign pages.

### Step 1: Verify Attribution Tracking
1.  Open one of your Campaign Pages (e.g., `/p/special-deal`) in an **Incognito Window**.
2.  Place a test order using the Order Form on that page.
3.  Go to **Admin Panel > Orders**.
4.  Open the new order.
5.  **Verify**: You should see an "Attribution" or "Source" field indicating it came from the "Special Deal" page (this might be in the database or detailed view depending on current UI).

### Step 2: Verify Analytics Dashboard
1.  Go to **Admin Panel > Pages** (`/app/pages`).
2.  Look at the row for "Special Deal".
3.  **Verify Columns**:
    *   **Orders**: Should have increased by 1.
    *   **Revenue**: Should show the total amount of the order you just placed.
    *   **Conv. Rate**: Should be updated based on (Orders / Views).

---

**Note**: If you encounter any issues, please let me know!
