# Theme Development Standard Operating Procedure (SOP)

Use this guide when creating or fixing a theme (e.g., Organic, Modern Dark, Glassmorphism) to ensure consistency between the **Page Builder**, **Preview**, and **Intent Wizard** without multiple iterations.

## 1. Visual & Component Rules

### A. Section Padding & Spacing

- **Standard Padding**: `py-20` is the minimum.
- **With Curves/Waves**: Use **`pb-56` or `pb-64`** (Desktop) to prevent clipping. Floating elements (like Video Cards or Product Cards) usually hang over the bottom edge, so they need this extra space.
  - _Example_: `<section className="relative pt-20 pb-64 ...">`

### B. Wave & Divider Transitions

- **Top Wave**: Transitions from the **Previous Section Color** to **Current Section Color**.
- **Bottom Wave**: Transitions from **Current Section Color** to **Next Section Color**.
- **SVG Structure**: Use the "Premium Multi-Layer" SVG for high-quality themes.
  - `rect fill`: The Color of the **Adjacent** Section (The one you are blending INTO).
  - `path fill`: The Color of the **Current** Section.
  - _Height_: Always use `h-[120px] md:h-[160px]` for smooth curves.

### C. Color System

- **No Hardcoded Blacks**: Never use pure `bg-black` or `opacity-60` overlays unless the theme is explicitly "Dark Mode".
- **Theme Tokens**: Use specific hex codes that match the theme palette (e.g., `#fefce8` Cream, `#ecfccb` Light Green) rather than generic Tailwind colors, to ensure distinct identity.
- **World Class Standards**:
  - Use `framer-motion` for all entrances (no static fades).
  - Use `Playfair Display` for emotional/story-driven headings.
  - Use `Lato` or `Inter` for clean body text.
  - Interactive elements must have hover states (scale, magnetic effect, or glow).

## 2. Integration Workflow (The 4-Step Process)

Follow this exact order to ensuring a theme works everywhere.

### Step 1: Component Implementation (`/components/page-builder/sections/...`)

Create the variant component (e.g., `OrganicVideo.tsx`).

- **Props**: Accept `badgeText`, `title`, `subheadline` etc. from props. **Do not hardcode text**.
- **Defaults**: Provide fallbacks (e.g., `{badgeText || 'Default Badge'}`) in the component itself for safety.

### Step 2: Schema Registration (`lib/page-builder/schemas.ts`)

Update the Zod schema for that section type to include any new props your theme needs.

- _Example_: If your Video section has a badge, add `badgeText: z.string().optional()` to `VideoPropsSchema`.
- _Why_: If you miss this, the Sidebar in Page Builder **will not show the input field**.

### Step 3: Preview Routing (`.../sections/VideoSectionPreview.tsx`)

Update the Preview wrapper to route to your new component when the variant matches.

- _Code Pattern_:
  ```tsx
  // Inside VideoSectionPreview.tsx
  if ((props as any).variant === 'organic') {
    return (
      <OrganicVideo
        {...props}
        // Explicitly pass new props if strict typed
        badgeText={(props as any).badgeText}
      />
    );
  }
  ```

### Step 4: Intent Wizard Sync (`lib/page-builder/templates.ts`)

**CRITICAL STEP**: The "Intent Wizard" uses the presets in this file to generate the initial page.

- Find the preset (e.g., `'green-mart'`).
- For **EVERY** section in the `sections` array, enforce the variant:
  ```ts
  {
    type: 'video',
    props: {
      variant: 'organic', // <--- MUST MATCH Step 3
      badgeText: 'Watch Story', // <--- Set the default content here
      title: '...',
    }
  }
  ```
- _Why_: If you skip this, the user selects "Organic Theme" but gets the "Default" (Standard) sections because the variant prop wasn't pre-filled.

## 3. Editability Checklist

Before marking a theme as "Done", verify:

1.  [ ] **Sidebar**: Can I change the text/badge in the sidebar? (Means Step 2 is done).
2.  [ ] **Visuals**: Is the bottom of the section clipped? (Means Padding rule checked).
3.  [ ] **Reference**: Check `WorldClassStoryHero.tsx` for the "Gold Standard" of animation and typography.
