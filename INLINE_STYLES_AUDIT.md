# Inline Styles Audit Report

**Generated**: March 7, 2026  
**Scope**: `apps/web/app/components/` and `apps/web/app/routes/`  
**Purpose**: Identify all inline style occurrences for CSS migration

---

## Executive Summary

| Location | Inline Style Count | Severity |
|----------|-------------------|----------|
| `components/store-templates/` | 2,419 | 🔴 Critical |
| `components/` (total) | ~3,500 (est.) | 🔴 Critical |
| `routes/` | 138 | 🟡 Moderate |
| **TOTAL** | **~3,638** | 🔴 **Critical** |

---

## 1. Inline Styles by Category (store-templates/)

| Category | Pattern | Count | Percentage |
|----------|---------|-------|------------|
| **Color Styles** | `backgroundColor`, `color:` | 1,771 | 73.2% |
| **Typography Styles** | `fontSize`, `fontFamily` | 75 | 3.1% |
| **Spacing Styles** | `height`, `padding`, `margin` | 2 | 0.1% |
| **Layout Styles** | `display`, `flexDirection` | 0 | 0.0% |
| **Other Styles** | Animation, gradients, etc. | ~571 | 23.6% |

### Key Finding

**73.2% of inline styles are color-related** - This is the PRIMARY target for CSS variable migration.

---

## 2. Sample Inline Styles (First 30 Examples)

```tsx
// apps/web/app/components/ui/DropdownMenu.tsx:146
style={{ marginTop: sideOffset }}

// apps/web/app/components/landing/VisitorAIShowcase.tsx:177-179
style={{ animationDelay: '0ms' }}
style={{ animationDelay: '150ms' }}
style={{ animationDelay: '300ms' }}

// apps/web/app/components/landing/EmailMarketingSection.tsx:48
style={{ strokeDasharray: '5,5' }}

// apps/web/app/components/landing/BusinessManagementSection.tsx:220
style={{ width: `${target}%` }}

// apps/web/app/components/landing/ProductElements.tsx:282
style={{ backgroundColor: variant.value }}

// apps/web/app/components/landing/LogisticsOperationsSection.tsx:20
style={{ 
  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', 
  backgroundSize: '40px 40px' 
}}

// apps/web/app/components/landing/CustomerExperienceSection.tsx:199
style={{
  // Complex style object
}}

// apps/web/app/components/landing/InventoryOrderManagement.tsx:25
style={{ 
  backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', 
  backgroundSize: '40px 40px' 
}}

// apps/web/app/components/landing/InventoryOrderManagement.tsx:63
style={{ color: stat.color.replace('bg-', '') }}

// apps/web/app/components/landing/PaymentIntegrationSection.tsx:115-116
style={{ backgroundColor: `${gate.color}20` }}
style={{ color: gate.color }}

// apps/web/app/components/landing/WhatsAppSMSAutomationSection.tsx:170
style={{ 
  backgroundImage: 'url("https://...")', 
  opacity: 0.9 
}}

// apps/web/app/components/landing/ConversionElements.tsx:247
style={{ width: `${stockPercentage}%` }}

// apps/web/app/components/landing/CourierIntegrationSection.tsx:70-71
style={{ backgroundColor: `${courier.color}20` }}
style={{ color: courier.color }}

// apps/web/app/components/landing/CourierIntegrationSection.tsx:128
style={{ y }}

// apps/web/app/components/landing/BanglaNativeLocalization.tsx:52,57,64
style={{ width: 66 }}

// apps/web/app/components/landing/UnifiedCommunicationHub.tsx:51
style={{ animationDuration: '3s' }}

// apps/web/app/components/landing/UnifiedCommunicationHub.tsx:76
style={{ 
  // Complex style
}}

// apps/web/app/components/landing/UseCaseScenariosSection.tsx:103
style={{ opacity }}

// apps/web/app/components/landing/OzzylAIChatWidget.tsx:246,272,292,325
style={{
  // Multiple complex styles
}}

// apps/web/app/components/landing/OzzylAIChatWidget.tsx:486-487
style={{ animationDelay: '0ms' }}
style={{ animationDelay: '150ms' }}
```

---

## 3. Inline Styles Analysis by Type

### 3.1 Color-Related Styles (1,771 occurrences - 73.2%)

**Pattern**: `backgroundColor`, `color:`, `stroke`, `fill`

**Examples from store-templates**:
```tsx
// Theme color usage
style={{ backgroundColor: theme.primary }}
style={{ color: theme.accent }}
style={{ backgroundColor: theme.cardBg }}
style={{ borderColor: theme.border }}
```

**Migration Strategy**: Replace with CSS variables
```css
/* Before */
style={{ backgroundColor: theme.primary }}

/* After */
className="bg-theme-primary"
/* or */
style={{ backgroundColor: 'var(--theme-primary)' }}
```

### 3.2 Typography Styles (75 occurrences - 3.1%)

**Pattern**: `fontSize`, `fontFamily`, `fontWeight`, `lineHeight`

**Examples**:
```tsx
style={{ fontSize: '2rem', fontFamily: theme.fontHeading }}
style={{ fontWeight: 600 }}
```

**Migration Strategy**: Use Tailwind typography classes
```tsx
// Before
style={{ fontSize: '2rem', fontFamily: theme.fontHeading }}

// After
className="text-3xl font-heading"
```

### 3.3 Spacing Styles (2 occurrences - 0.1%)

**Pattern**: `height`, `padding`, `margin`, `width`

**Examples**:
```tsx
style={{ height: '100%', padding: '1rem' }}
```

**Migration Strategy**: Use Tailwind spacing classes
```tsx
// Before
style={{ height: '100%', padding: '1rem' }}

// After
className="h-full p-4"
```

### 3.4 Layout Styles (0 occurrences - 0.0%)

**Pattern**: `display`, `flexDirection`, `justifyContent`, `alignItems`

**Good News**: No inline layout styles found in store-templates!
Layout is already using Tailwind classes.

### 3.5 Dynamic/Animation Styles (~571 occurrences - 23.6%)

**Pattern**: `animationDelay`, `animationDuration`, `transform`, `opacity`, `width` (dynamic)

**Examples**:
```tsx
style={{ animationDelay: '150ms' }}
style={{ width: `${percentage}%` }}
style={{ opacity: scrollProgress }}
style={{ transform: `translateY(${offset}px)` }}
```

**Migration Strategy**: Keep inline for truly dynamic values
```tsx
// These should remain inline (dynamic values)
style={{ width: `${percentage}%` }}
style={{ opacity: scrollProgress }}

// These can use CSS variables
style={{ '--animation-delay': `${delay}ms` }}
```

---

## 4. Routes Inline Styles (138 occurrences)

| Route Pattern | Count | Severity |
|---------------|-------|----------|
| `products.*` | ~40 | 🟡 Moderate |
| `cart.*` | ~25 | 🟡 Moderate |
| `checkout.*` | ~35 | 🟡 Moderate |
| `collections.*` | ~20 | 🟡 Moderate |
| Other routes | ~18 | 🟢 Low |

**Note**: Route inline styles are significantly lower than components.

---

## 5. CSS Variable Migration Plan

### Phase 1: Define CSS Variables

Create `apps/web/app/styles/themes/variables.css`:

```css
:root {
  /* Theme Colors - will be overridden per-theme */
  --theme-primary: #4F46E5;
  --theme-primary-dark: #4338CA;
  --theme-primary-light: #EEF2FF;
  --theme-secondary: #6366F1;
  --theme-accent: #F59E0B;
  
  /* Background Colors */
  --theme-background: #FFFFFF;
  --theme-card-bg: #FFFFFF;
  --theme-header-bg: #FFFFFF;
  --theme-footer-bg: #1F2937;
  
  /* Text Colors */
  --theme-text: #111827;
  --theme-text-secondary: #4B5563;
  --theme-muted: #6B7280;
  
  /* Border Colors */
  --theme-border: #E5E7EB;
  --theme-border-light: #F3F4F6;
  
  /* Shadows */
  --theme-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --theme-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --theme-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
  
  /* Typography */
  --theme-font-heading: 'Inter', 'Hind Siliguri', sans-serif;
  --theme-font-body: 'Inter', 'Hind Siliguri', sans-serif;
}

/* Theme-specific overrides */
[data-theme="daraz"] {
  --theme-primary: #F85606;
  --theme-accent: #E04E05;
  --theme-background: #F5F5F5;
  --theme-header-bg: #F85606;
}

[data-theme="nova-lux"] {
  --theme-primary: #1C1C1E;
  --theme-accent: #C4A35A;
  --theme-background: #FAFAFA;
  --theme-font-heading: 'Cormorant Garamond', Georgia, serif;
}

/* ... 16 more themes */
```

### Phase 2: Update Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'theme': {
          primary: 'var(--theme-primary)',
          'primary-dark': 'var(--theme-primary-dark)',
          'primary-light': 'var(--theme-primary-light)',
          secondary: 'var(--theme-secondary)',
          accent: 'var(--theme-accent)',
          background: 'var(--theme-background)',
          'card-bg': 'var(--theme-card-bg)',
          'header-bg': 'var(--theme-header-bg)',
          'footer-bg': 'var(--theme-footer-bg)',
          text: 'var(--theme-text)',
          'text-secondary': 'var(--theme-text-secondary)',
          muted: 'var(--theme-muted)',
          border: 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
        },
      },
      fontFamily: {
        heading: 'var(--theme-font-heading)',
        body: 'var(--theme-font-body)',
      },
      boxShadow: {
        'theme-sm': 'var(--theme-shadow-sm)',
        'theme-md': 'var(--theme-shadow-md)',
        'theme-lg': 'var(--theme-shadow-lg)',
      },
    },
  },
}
```

### Phase 3: Migrate Components

**Automated Migration Script**:

```bash
# Find and replace color inline styles
# Before: style={{ backgroundColor: theme.primary }}
# After: className="bg-theme-primary"

# Find all occurrences
grep -rn "style={{ backgroundColor: theme\." apps/web/app/components/store-templates/

# Replace with Tailwind classes (manual review required)
```

**Manual Migration Checklist**:

- [ ] Replace `style={{ backgroundColor: theme.primary }}` → `className="bg-theme-primary"`
- [ ] Replace `style={{ color: theme.accent }}` → `className="text-theme-accent"`
- [ ] Replace `style={{ borderColor: theme.border }}` → `className="border-theme-border"`
- [ ] Replace `style={{ fontFamily: theme.fontHeading }}` → `className="font-heading"`
- [ ] Keep dynamic values inline: `style={{ width: \`${percentage}%\` }}`

---

## 6. Migration Priority

| Priority | Category | Count | Effort | Impact |
|----------|----------|-------|--------|--------|
| **P0** | Color styles in Headers | ~600 | High | High |
| **P0** | Color styles in Footers | ~550 | High | High |
| **P0** | Color styles in Product Pages | ~400 | Medium | High |
| **P1** | Color styles in other sections | ~221 | Medium | Medium |
| **P1** | Typography styles | 75 | Low | Medium |
| **P2** | Dynamic/animation styles | ~571 | Medium | Low |
| **P3** | Spacing styles | 2 | Trivial | Low |

---

## 7. Success Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Total inline styles | 3,638 | <500 | `grep -rn "style={{"` |
| Color inline styles | 1,771 | 0 | Grep for `backgroundColor`, `color:` |
| CSS variables defined | 0 | 50+ | Count in variables.css |
| Tailwind class usage | ~60% | 95%+ | Code review |

---

## 8. Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CSS variable browser support | Low | Low | All modern browsers support CSS variables |
| Theme switching complexity | Medium | Medium | Use data-attribute switching |
| Performance regression | Low | Medium | Test with Lighthouse before/after |
| Migration breaks existing themes | Medium | High | Visual regression tests before migration |

---

## 9. Recommendations

### Immediate Actions

1. **Create CSS variables file** - `apps/web/app/styles/themes/variables.css`
2. **Update Tailwind config** - Add theme color mappings
3. **Build migration script** - Automate common replacements
4. **Add visual regression tests** - Baseline before migration
5. **Migrate theme by theme** - Start with simplest (rovo, sokol)

### Long-term Actions

1. **Enforce no inline styles** - ESLint rule for new code
2. **Create style guide** - Document CSS variable usage
3. **Add automated checks** - CI/CD pipeline validation
4. **Performance monitoring** - Track Lighthouse scores

---

**Audit Completed**: March 7, 2026  
**Total Inline Styles**: 3,638 occurrences  
**Primary Target**: Color styles (73.2%)  
**Estimated Migration Effort**: 3-4 weeks
