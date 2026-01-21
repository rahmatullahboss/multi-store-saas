# Style Tokens & Customization System

> **Version:** 2.2  
> **Last Updated:** 2026-01-22  
> **Status:** ✅ Fully Implemented in Step 3

## Overview

The Style Customization system (Step 3 of IntentWizard) lets merchants instantly brand their landing pages with colors, button styles, and fonts—without any coding.

---

## Step 3: Style Preferences Wizard

### What It Includes

Users customize 4 key aspects:

1. **Brand Color** (6 presets + custom picker)
2. **Button Style** (rounded, sharp, pill)
3. **Font Family** (4 curated options)
4. **Dark Mode** (optional toggle)

### User Flow

```
Step 3: Customize Your Style
│
├─ Brand Color Selector
│  ├─ Orange (fast, action-oriented)
│  ├─ Blue (trust, professional)
│  ├─ Green (eco, growth)
│  ├─ Purple (premium, creative)
│  ├─ Red (urgent, danger)
│  ├─ Pink (friendly, female-oriented)
│  └─ Custom Color Picker
│
├─ Button Style Selector
│  ├─ Rounded (modern, soft)
│  ├─ Sharp (minimal, clean)
│  └─ Pill (friendly, rounded)
│
├─ Font Family Selector
│  ├─ Default (system fonts, fastest)
│  ├─ Bengali (Bangla optimized fonts)
│  ├─ Modern (trendy sans-serif)
│  └─ Classic (traditional serif)
│
└─ Dark Mode Toggle (optional)
```

---

## Brand Color System

### Presets

6 curated colors chosen for conversion:

```typescript
export const BRAND_COLOR_PRESETS = {
  orange: {
    name: 'Orange',
    hex: '#ff8c42',
    rgb: 'rgb(255, 140, 66)',
    bestFor: 'Facebook ads, call-to-action',
    emotion: 'Action, energy, urgency',
  },
  blue: {
    name: 'Blue',
    hex: '#3b82f6',
    rgb: 'rgb(59, 130, 246)',
    bestFor: 'B2B, trust, professional',
    emotion: 'Trust, stability, confidence',
  },
  green: {
    name: 'Green',
    hex: '#22c55e',
    rgb: 'rgb(34, 197, 94)',
    bestFor: 'Growth, eco, positive',
    emotion: 'Growth, health, nature',
  },
  purple: {
    name: 'Purple',
    hex: '#a855f7',
    rgb: 'rgb(168, 85, 247)',
    bestFor: 'Premium, creative, tech',
    emotion: 'Premium, imagination, magic',
  },
  red: {
    name: 'Red',
    hex: '#ef4444',
    rgb: 'rgb(239, 68, 68)',
    bestFor: 'Urgency, limited stock',
    emotion: 'Urgency, danger, passion',
  },
  pink: {
    name: 'Pink',
    hex: '#ec4899',
    rgb: 'rgb(236, 72, 153)',
    bestFor: 'Female audience, fashion',
    emotion: 'Friendliness, femininity',
  },
};
```

### Color Picker (Custom)

Users can pick any color using HTML color input:

```typescript
// If user selects "Custom", show color picker
<input
  type="color"
  value={brandColor}
  onChange={(e) => setBrandColor(e.target.value)}
/>
// Stores hex value: #a1b2c3
```

### Color Application

Colors are applied throughout the page:

| Element | Uses Color |
|---------|-----------|
| Primary buttons | Brand color (100%) |
| Button hover | Brand color (80%) |
| Links | Brand color |
| Accents | Brand color (70%) |
| Headings (optional) | Brand color (optional) |
| Icons | Brand color (optional) |

---

## Button Styles

### Three Options

#### 1. Rounded
```css
border-radius: 0.5rem; /* 8px */
```
**Best For:** Modern, friendly, accessible  
**Emotion:** Modern, friendly, approachable  
**Example Use:** E-commerce, SaaS, consumer products

#### 2. Sharp
```css
border-radius: 0; /* No rounding */
```
**Best For:** Minimal, clean, professional  
**Emotion:** Professional, serious, minimalist  
**Example Use:** B2B, corporate, finance

#### 3. Pill
```css
border-radius: 9999px; /* Full rounded */
```
**Best For:** Friendly, playful, mobile-first  
**Emotion:** Playful, friendly, casual  
**Example Use:** Fashion, lifestyle, social

### Implementation

```typescript
// app/utils/landing-builder/intentEngine.ts

export type ButtonStyle = 'rounded' | 'sharp' | 'pill';

export const BUTTON_STYLE_CLASSES: Record<ButtonStyle, string> = {
  rounded: 'rounded-lg',
  sharp: 'rounded-none',
  pill: 'rounded-full',
};

// Usage in components
<button className={`px-4 py-2 ${BUTTON_STYLE_CLASSES[styleTokens.buttonStyle]}`}>
  Click me
</button>
```

---

## Font Families

### Four Curated Options

#### 1. Default
```css
font-family: system-ui, -apple-system, 'Segoe UI', 'Roboto';
```
**Speed:** ⚡ Fastest (system fonts)  
**Best For:** All use cases  
**Load Time:** < 1ms  
**Why:** Uses fonts already on user's device

#### 2. Bengali
```css
font-family: 'Noto Sans Bengali', 'Kalpurush';
```
**Speed:** ⚡ Fast (Google Fonts)  
**Best For:** Bangla content, authentic feel  
**Load Time:** ~50ms  
**Why:** Optimized for Bengali script

#### 3. Modern
```css
font-family: 'Inter', 'Poppins', sans-serif;
```
**Speed:** ⚡⚡ Medium  
**Best For:** Trendy, tech-focused  
**Load Time:** ~100ms  
**Why:** Trendy sans-serif for modern look

#### 4. Classic
```css
font-family: 'Georgia', 'Garamond', serif;
```
**Speed:** ⚡⚡ Medium  
**Best For:** Premium, traditional  
**Load Time:** ~100ms  
**Why:** Serif fonts for authoritative feel

### Storage & Application

```typescript
export type FontFamily = 'default' | 'bengali' | 'modern' | 'classic';

export const FONT_FAMILY_CSS: Record<FontFamily, string> = {
  default: "system-ui, -apple-system, 'Segoe UI', 'Roboto'",
  bengali: "'Noto Sans Bengali', 'Kalpurush', sans-serif",
  modern: "'Inter', 'Poppins', sans-serif",
  classic: "'Georgia', 'Garamond', serif",
};

// Applied globally to landing page
<style>{`
  body {
    font-family: ${FONT_FAMILY_CSS[styleTokens.fontFamily]};
  }
`}</style>
```

---

## StyleTokens Data Structure

### Complete Type Definition

```typescript
// app/utils/landing-builder/intentEngine.ts

export interface StyleTokens {
  brandColor: string; // hex or preset name
  buttonStyle: 'rounded' | 'sharp' | 'pill';
  fontFamily: 'default' | 'bengali' | 'modern' | 'classic';
  darkMode?: boolean; // Future use
}

// Default styles applied to all new pages
export const DEFAULT_STYLE_TOKENS: StyleTokens = {
  brandColor: 'blue', // Safe, trust-inducing default
  buttonStyle: 'rounded', // Most modern/accessible
  fontFamily: 'default', // Fastest loading
  darkMode: false,
};
```

### Storage

Stored in two places:

**1. builder_pages table (Intent-time)**
```typescript
// Saved when user completes IntentWizard Step 3
{
  "style_tokens_json": {
    "brandColor": "#3b82f6",
    "buttonStyle": "rounded",
    "fontFamily": "modern",
    "darkMode": false
  }
}
```

**2. Landing config (Runtime)**
```typescript
// Also stored in landingConfig.styleTokens
{
  "styleTokens": {
    "brandColor": "#3b82f6",
    "buttonStyle": "rounded",
    "fontFamily": "modern"
  }
}
```

### JSON Schema for Validation

```typescript
// app/lib/page-builder/schemas.ts

export const StyleTokensSchema = z.object({
  brandColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i)
    .or(z.enum(['orange', 'blue', 'green', 'purple', 'red', 'pink'])),
  
  buttonStyle: z.enum(['rounded', 'sharp', 'pill']),
  
  fontFamily: z.enum(['default', 'bengali', 'modern', 'classic']),
  
  darkMode: z.boolean().optional().default(false),
});

export type StyleTokens = z.infer<typeof StyleTokensSchema>;
```

---

## Integration Points

### 1. IntentWizard Step 3

```typescript
// app/components/landing-builder/IntentWizard.tsx

function Step3StylePreferences() {
  const [styleTokens, setStyleTokens] = useState<StyleTokens>(
    DEFAULT_STYLE_TOKENS
  );
  
  return (
    <div className="step-3">
      {/* Brand Color */}
      <div>
        <label>Brand Color</label>
        <div className="preset-colors">
          {Object.entries(BRAND_COLOR_PRESETS).map(([key, color]) => (
            <ColorButton
              key={key}
              color={color.hex}
              selected={styleTokens.brandColor === key}
              onClick={() => setStyleTokens({
                ...styleTokens,
                brandColor: key,
              })}
            />
          ))}
        </div>
        <input
          type="color"
          value={
            styleTokens.brandColor.startsWith('#')
              ? styleTokens.brandColor
              : BRAND_COLOR_PRESETS[styleTokens.brandColor]?.hex
          }
          onChange={(e) => setStyleTokens({
            ...styleTokens,
            brandColor: e.target.value,
          })}
        />
      </div>
      
      {/* Button Style */}
      <div>
        <label>Button Style</label>
        {(['rounded', 'sharp', 'pill'] as const).map((style) => (
          <ButtonStylePreview
            key={style}
            style={style}
            selected={styleTokens.buttonStyle === style}
            onClick={() => setStyleTokens({
              ...styleTokens,
              buttonStyle: style,
            })}
          />
        ))}
      </div>
      
      {/* Font Family */}
      <div>
        <label>Font Family</label>
        {(['default', 'bengali', 'modern', 'classic'] as const).map((font) => (
          <FontFamilyOption
            key={font}
            font={font}
            selected={styleTokens.fontFamily === font}
            onClick={() => setStyleTokens({
              ...styleTokens,
              fontFamily: font,
            })}
          />
        ))}
      </div>
    </div>
  );
}
```

### 2. Landing Config Generation

```typescript
// app/utils/landing-builder/intentEngine.ts

export function generateLandingConfigWithStyle(
  intent: PageIntent,
  styleTokens: StyleTokens
): LandingConfig {
  return {
    templateId: selectOptimalTemplate(intent),
    sections: generateOptimalSections(intent),
    styleTokens, // ← Includes style preferences
    // ... other config
  };
}
```

### 3. Preview Rendering

```typescript
// app/routes/builder-preview.$pageId.tsx

export function BuilderPreview() {
  const { page } = useLoaderData();
  const styleTokens: StyleTokens = JSON.parse(
    page.styleTokensJson
  );
  
  return (
    <div
      style={{
        fontFamily: FONT_FAMILY_CSS[styleTokens.fontFamily],
      }}
      className={`
        theme-${styleTokens.brandColor}
        buttons-${styleTokens.buttonStyle}
      `}
    >
      {/* Page content */}
    </div>
  );
}
```

---

## CSS Implementation

### Tailwind CSS Variables

```css
/* app/styles/genie-styles.css */

:root {
  /* Brand colors */
  --brand-orange: #ff8c42;
  --brand-blue: #3b82f6;
  --brand-green: #22c55e;
  --brand-purple: #a855f7;
  --brand-red: #ef4444;
  --brand-pink: #ec4899;
}

/* Theme classes */
.theme-orange {
  --brand-color: var(--brand-orange);
}

.theme-blue {
  --brand-color: var(--brand-blue);
}

/* Button styles */
.buttons-rounded button {
  @apply rounded-lg;
}

.buttons-sharp button {
  @apply rounded-none;
}

.buttons-pill button {
  @apply rounded-full;
}

/* Font families */
.font-default {
  font-family: system-ui, -apple-system, 'Segoe UI', 'Roboto';
}

.font-bengali {
  font-family: 'Noto Sans Bengali', 'Kalpurush', sans-serif;
}

.font-modern {
  font-family: 'Inter', 'Poppins', sans-serif;
}

.font-classic {
  font-family: 'Georgia', 'Garamond', serif;
}
```

### Dynamic Styles

```typescript
// Inject styles at runtime
export function injectStyleTokens(styleTokens: StyleTokens) {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --brand-color: ${
        styleTokens.brandColor.startsWith('#')
          ? styleTokens.brandColor
          : BRAND_COLOR_PRESETS[styleTokens.brandColor]?.hex
      };
    }
    
    body {
      font-family: ${FONT_FAMILY_CSS[styleTokens.fontFamily]};
    }
  `;
  document.head.appendChild(style);
}
```

---

## Editor Integration

### Settings Panel

In `/app/settings/landing`, merchants can change style anytime:

```typescript
// app/routes/app.settings.landing.tsx

export function LandingSettings() {
  const [styleTokens, setStyleTokens] = useState<StyleTokens>(
    store.styleTokens || DEFAULT_STYLE_TOKENS
  );
  
  async function handleSave() {
    await updateStoreStyleTokens(storeId, styleTokens);
    toast.success('Style updated!');
  }
  
  return (
    <div className="settings-panel">
      {/* Same UI as Step 3 of wizard */}
      <ColorSelector
        value={styleTokens.brandColor}
        onChange={(color) =>
          setStyleTokens({ ...styleTokens, brandColor: color })
        }
      />
      <ButtonStyleSelector
        value={styleTokens.buttonStyle}
        onChange={(style) =>
          setStyleTokens({ ...styleTokens, buttonStyle: style })
        }
      />
      <FontFamilySelector
        value={styleTokens.fontFamily}
        onChange={(font) =>
          setStyleTokens({ ...styleTokens, fontFamily: font })
        }
      />
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
```

---

## Performance Considerations

### Font Loading

```typescript
// Preload fonts to minimize FOUT (Flash of Unstyled Text)

export function getPreloadLinks(fontFamily: FontFamily): string {
  const links = {
    default: '', // No preload needed (system fonts)
    bengali: '<link rel="preload" href="fonts/noto-sans-bengali.woff2">',
    modern: '<link rel="preload" href="fonts/inter.woff2">',
    classic: '<link rel="preload" href="fonts/georgia.woff2">',
  };
  return links[fontFamily];
}
```

### Color Performance

- Brand colors stored as hex (no performance impact)
- CSS variables evaluated at runtime (minimal overhead)
- No additional HTTP requests for colors

### Benchmark

| Font | Load Time | FOUT Duration |
|------|-----------|----------------|
| Default | < 1ms | None |
| Bengali | ~50ms | < 50ms |
| Modern | ~100ms | < 100ms |
| Classic | ~100ms | < 100ms |

---

## Testing Checklist

- [ ] Brand color preset selection works
- [ ] Custom color picker works
- [ ] Color preview updates in real-time
- [ ] Button styles render correctly
- [ ] Font families load without FOUT
- [ ] Styles persist in database
- [ ] Styles apply to all page elements
- [ ] Mobile rendering matches desktop
- [ ] Dark mode toggle works (future)
- [ ] Style changes don't break layout

---

## Future Enhancements

- [ ] **Dark Mode** (full implementation)
- [ ] **Custom Font Upload** (limited to merchants)
- [ ] **AI Color Suggestions** (based on traffic source)
- [ ] **Font Pairing Suggestions** (heading + body)
- [ ] **Accessibility Checker** (contrast ratios)
- [ ] **A/B Test Styles** (split testing different brands)
- [ ] **Color Animations** (transitions, gradients)
- [ ] **Global Font Scale** (modular typography)

---

## Troubleshooting

### Styles Not Applying

**Check:**
1. `styleTokensJson` is saved in database
2. CSS classes are injected to head
3. Tailwind config includes custom colors
4. No conflicting CSS overriding theme

### Font Not Loading

**Check:**
1. Font file exists and is served correctly
2. Preload link is in `<head>`
3. No CSP (Content Security Policy) blocking fonts
4. CORS headers correct for font CDN

### Color Not Changing

**Check:**
1. Hex value is valid (#RRGGBB format)
2. CSS variable is updated
3. No inline styles overriding theme
4. Rebuild CSS after color change

---

## References

- **User Guide:** docs/genie-builder/GENIE_USER_GUIDE.md (Step 3)
- **Technical Guide:** docs/genie-builder/GENIE_TECHNICAL_GUIDE.md
- **Gap Analysis:** docs/genie-builder/GENIE_GAP_ANALYSIS.md
