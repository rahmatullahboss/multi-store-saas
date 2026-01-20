# PHASE 2: STYLE SYSTEM ENHANCEMENT - DETAILED SPECIFICATIONS

> **Duration**: 2 weeks  
> **Priority**: P0 - Critical  
> **Status**: Planning  
> **Depends on**: Phase 1 Complete  
> **Assigned to**: Senior Frontend Engineer  

---

## 🎯 PHASE OBJECTIVES

1. Implement **device-specific style editing** (Desktop/Tablet/Mobile)
2. Add **visibility controls** (Hide/Show per device)
3. Create **Global Styles Panel** for site-wide typography and colors
4. Implement **CSS variable system** for consistent theming
5. Add **responsive style indicators** in inspector

---

## 📊 PHASE SCOPE

### In Scope ✅
- Device-aware style panel (Desktop/Tablet/Mobile tabs)
- Per-device CSS media queries
- Visibility toggle trait (show/hide per device)
- Global styles management (fonts, colors, spacing)
- CSS custom properties (variables) system
- Style inheritance visualization
- Responsive breakpoints configuration
- Style reset/clear functionality

### Out of Scope ❌
- Advanced animations (Phase 3)
- Custom CSS editing (future)
- Style presets (Phase 5)
- Version history for styles (Phase 6)

---

## 🏗️ ARCHITECTURE DESIGN

### Current Problem
```
Current: Style controls are global
- Change color for all devices at once
- Can't hide element on mobile while showing on desktop
- Hard to implement responsive design
- Theme changes require manual CSS

Consequence:
- Pages don't look good on all devices
- Merchants resort to manual CSS
- User frustration = lower adoption
```

### Target Solution
```
Device-Aware Styles:

Style Inspector
├── [Desktop Tab] [Tablet Tab] [Mobile Tab]
├── Active: Desktop
│   ├── Layout
│   │   ├── Display: Block ↔ Flex
│   │   ├── Width: 100%
│   │   └── Height: auto
│   ├── Spacing
│   │   ├── Margin: 20px
│   │   └── Padding: 15px
│   ├── Typography
│   │   ├── Font: Hind Siliguri
│   │   ├── Size: 18px
│   │   ├── Weight: 600
│   │   └── Color: #333
│   ├── Background
│   │   ├── Color: #fff
│   │   └── Image: none
│   └── Visibility: ◉ Show  ○ Hide
│
├── [Switch to Tablet]
│   ├── [Same controls but for tablet]
│   ├── Width: 80% (inherited from desktop, can override)
│   └── Font Size: 16px
│
└── [Switch to Mobile]
    ├── Display: Block (changed from Flex)
    ├── Width: 100%
    ├── Font Size: 14px
    └── Visibility: ○ Show  ◉ Hide (element hidden on mobile)
```

### Global Styles Panel
```
Global Typography
├── Heading Font: Hind Siliguri
├── Body Font: Open Sans
├── Accent Font: none
└── [Preview text]

Global Colors
├── Primary: #059669
├── Secondary: #2563eb
├── Accent: #f59e0b
├── Text (Light): #333333
├── Text (Dark): #ffffff
├── Background (Light): #f9fafb
├── Background (Dark): #1f2937
└── [Color grid preview]

Responsive Breakpoints
├── Desktop: 1024px (default)
├── Tablet: 768px
├── Mobile: 480px
└── [Edit breakpoints]
```

---

## 🔧 IMPLEMENTATION DETAILS

### 1. RESPONSIVE BREAKPOINTS SYSTEM

#### 1.1 Breakpoint Configuration
```typescript
// File: apps/page-builder/app/lib/grapesjs/responsive.ts

export const RESPONSIVE_BREAKPOINTS = {
  desktop: {
    id: 'desktop',
    label: 'Desktop',
    width: 1024,
    icon: 'Monitor',
    default: true,
  },
  tablet: {
    id: 'tablet',
    label: 'Tablet',
    width: 768,
    icon: 'Tablet',
    mediaQuery: '(max-width: 768px)',
  },
  mobile: {
    id: 'mobile',
    label: 'Mobile',
    width: 480,
    icon: 'Smartphone',
    mediaQuery: '(max-width: 480px)',
  },
} as const;

export type BreakpointId = keyof typeof RESPONSIVE_BREAKPOINTS;

// Get configured breakpoints
export const getBreakpoints = () => Object.values(RESPONSIVE_BREAKPOINTS);

// Check if style should apply to device
export const appliesTo = (breakpoint: BreakpointId, style: StyleRule) => {
  if (!style.media) return breakpoint === 'desktop';
  if (style.media === '@media (max-width: 768px)') return breakpoint !== 'desktop';
  if (style.media === '@media (max-width: 480px)') return breakpoint === 'mobile';
  return true;
};
```

#### 1.2 GrapesJS Responsive Manager Setup
```typescript
// File: apps/page-builder/app/lib/grapesjs/config.ts (modification)

export const getGrapesConfig = (container, pageId, planType, canvasStyleLinks) => {
  return {
    // ... existing config
    
    // Enable responsive breakpoints
    deviceManager: {
      devices: [
        {
          name: 'Desktop',
          width: '1024px',
          widthMedia: '1025px',
          default: true,
        },
        {
          name: 'Tablet',
          width: '768px',
          widthMedia: '769px',
        },
        {
          name: 'Mobile',
          width: '480px',
          widthMedia: '481px',
        },
      ],
    },
  };
};
```

---

### 2. DEVICE-AWARE STYLE CONTROLS

#### 2.1 Enhanced StyleControls Component
```tsx
// File: apps/page-builder/app/components/page-builder/StyleControls.tsx (major revision)

import { useState, useEffect } from 'react';
import type { Editor } from 'grapesjs';
import { 
  Monitor, Tablet, Smartphone, 
  Layout, Maximize2, Type, Palette, Sparkles, MousePointer2 
} from 'lucide-react';

const DEVICES = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

interface StyleControlsProps {
  editor: Editor;
}

export default function StyleControls({ editor }: StyleControlsProps) {
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [deviceStyles, setDeviceStyles] = useState<Record<string, any>>({
    desktop: {},
    tablet: {},
    mobile: {},
  });

  // Listen to component selection
  useEffect(() => {
    if (!editor) return;

    const updateStyles = () => {
      const selected = editor.getSelected();
      setSelectedComp(selected);
      
      if (selected) {
        // Get styles for current device
        const currentDeviceStyles = getStylesForDevice(selected, activeDevice);
        setStyles(currentDeviceStyles);
        
        // Get all device styles
        const allDeviceStyles = {
          desktop: getStylesForDevice(selected, 'desktop'),
          tablet: getStylesForDevice(selected, 'tablet'),
          mobile: getStylesForDevice(selected, 'mobile'),
        };
        setDeviceStyles(allDeviceStyles);
      }
    };

    editor.on('component:selected', updateStyles);
    editor.on('component:styleUpdate', updateStyles);
    editor.on('component:update', updateStyles);
    updateStyles();

    return () => {
      editor.off('component:selected', updateStyles);
      editor.off('component:styleUpdate', updateStyles);
      editor.off('component:update', updateStyles);
    };
  }, [editor, activeDevice]);

  const getStylesForDevice = (component: any, device: string) => {
    if (device === 'desktop') {
      return component.getStyle() || {};
    }
    
    // For tablet/mobile, check for media-query styles
    const mediaStyles = component.view?.el?.style || {};
    return mediaStyles;
  };

  /**
   * Update style for currently selected component
   * Uses updateMediaStyle helper which correctly handles
   * desktop vs tablet/mobile via CssComposer
   */
  const updateStyle = (prop: string, value: string) => {
    if (!selectedComp || !editor) return;

    // Use the helper function that correctly handles media queries
    updateMediaStyle(selectedComp, prop, value, activeDevice, editor);

    // Update local state for UI
    setStyles(prev => ({ ...prev, [prop]: value }));
  };

  if (!selectedComp) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center px-6">
        <MousePointer2 size={32} className="mb-4 opacity-50" />
        <p className="text-xs font-medium">Element sanlect করুন styling শুরু করতে</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 pb-20">
      {/* Device Selector */}
      <div className="flex gap-2 p-3 border-b bg-gray-50">
        {DEVICES.map(device => {
          const Icon = device.icon;
          const isActive = activeDevice === device.id;
          const hasChanges = Object.keys(deviceStyles[device.id] || {}).length > 0;
          
          return (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id as any)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition relative
                ${isActive 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
              title={device.label}
            >
              <Icon size={16} />
              <span className="text-xs font-semibold">{device.label}</span>
              {hasChanges && !isActive && (
                <span className="w-2 h-2 rounded-full bg-blue-500 ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Style Sections (Layout, Spacing, etc.) */}
      <div className="space-y-1">
        {/* Layout Sector */}
        <Sector title="Layout" icon={<Layout size={14} />} isOpen={true}>
          <ControlRow label="Display">
            <SelectControl 
              value={styles['display'] || 'block'} 
              options={[
                { label: 'Block', value: 'block' },
                { label: 'Flex', value: 'flex' },
                { label: 'Grid', value: 'grid' },
                { label: 'Inline', value: 'inline-block' },
                { label: 'None', value: 'none' },
              ]}
              onChange={(val) => updateStyle('display', val)}
            />
          </ControlRow>

          {/* Visibility Toggle */}
          <ControlRow label="Visibility">
            <div className="flex gap-2">
              <button
                onClick={() => updateVisibility(selectedComp, activeDevice, true)}
                className={`flex-1 px-3 py-2 rounded transition ${
                  isDeviceVisible(selectedComp, activeDevice)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                ✓ Show
              </button>
              <button
                onClick={() => updateVisibility(selectedComp, activeDevice, false)}
                className={`flex-1 px-3 py-2 rounded transition ${
                  !isDeviceVisible(selectedComp, activeDevice)
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                ✕ Hide
              </button>
            </div>
          </ControlRow>

          {/* Responsive Indicator */}
          {activeDevice !== 'desktop' && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 এই styles শুধুমাত্র {activeDevice} এ প্রয়োগ হবে
            </div>
          )}

          {/* Width / Height */}
          <ControlRow label="Width / Height">
            <div className="flex gap-2">
              <UnitInput 
                placeholder="W" 
                value={styles['width']} 
                onChange={(val) => updateStyle('width', val)} 
              />
              <UnitInput 
                placeholder="H" 
                value={styles['height']} 
                onChange={(val) => updateStyle('height', val)} 
              />
            </div>
          </ControlRow>
        </Sector>

        {/* Spacing Sector */}
        <Sector title="Spacing" icon={<Maximize2 size={14} />}>
          {/* Margin/Padding box (same as before) */}
        </Sector>

        {/* Typography Sector */}
        <Sector title="Typography" icon={<Type size={14} />}>
          {/* Typography controls (same as before) */}
        </Sector>

        {/* Background Sector */}
        <Sector title="Background" icon={<Palette size={14} />}>
          {/* Background controls (same as before) */}
        </Sector>

        {/* Effects Sector */}
        <Sector title="Effects" icon={<Sparkles size={14} />}>
          {/* Opacity, Shadow, Border controls */}
        </Sector>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS - Using correct GrapesJS CssComposer API
// =============================================================================

/**
 * Update component visibility for specific device using GrapesJS CssComposer
 * 
 * @param component - GrapesJS component
 * @param device - 'desktop' | 'tablet' | 'mobile'
 * @param visible - true/false
 * @param editor - GrapesJS editor instance
 */
function updateVisibility(component: any, device: string, visible: boolean, editor: Editor) {
  // Store visibility state as component attribute
  component.addAttributes({ [`data-visible-${device}`]: visible ? '1' : '0' });
  
  // Get the component's selector string
  const selector = component.getSelectorsString() || `#${component.getId()}`;
  
  if (device === 'desktop') {
    // Desktop: directly update component style
    if (!visible) {
      component.addStyle({ display: 'none' });
    } else {
      component.removeStyle('display');
    }
  } else {
    // Tablet/Mobile: use media query via CssComposer
    const mediaParams = device === 'tablet' 
      ? '(max-width: 768px)'
      : '(max-width: 480px)';
    
    const css = editor.CssComposer;
    
    if (!visible) {
      // Add rule to hide on this device
      css.setRule(selector, { display: 'none' }, {
        atRuleType: 'media',
        atRuleParams: mediaParams,
      });
    } else {
      // Remove the hiding rule (set display to initial/block)
      css.setRule(selector, { display: 'block' }, {
        atRuleType: 'media',
        atRuleParams: mediaParams,
      });
    }
  }
}

/**
 * Check if component is visible on specific device
 */
function isDeviceVisible(component: any, device: string): boolean {
  const attr = component.getAttributes()[`data-visible-${device}`];
  return attr !== '0';
}

/**
 * Update style for specific device using GrapesJS CssComposer
 * 
 * This is the correct way to handle device-specific styles in GrapesJS.
 * Uses CssComposer.setRule() with atRuleType: 'media'
 * 
 * @param component - GrapesJS component
 * @param prop - CSS property name (e.g., 'font-size', 'width')
 * @param value - CSS value (e.g., '16px', '100%')
 * @param device - 'desktop' | 'tablet' | 'mobile'
 * @param editor - GrapesJS editor instance
 */
function updateMediaStyle(
  component: any, 
  prop: string, 
  value: string, 
  device: string,
  editor: Editor
) {
  // Get component selector
  const selector = component.getSelectorsString() || `#${component.getId()}`;
  
  if (device === 'desktop') {
    // Desktop: update component style directly (no media query)
    component.addStyle({ [prop]: value });
  } else {
    // Tablet/Mobile: use CssComposer with media query
    const mediaParams = device === 'tablet' 
      ? '(max-width: 768px)'
      : '(max-width: 480px)';
    
    const css = editor.CssComposer;
    
    // Get existing rule or create new one
    let rule = css.getRule(selector, { 
      atRuleType: 'media', 
      atRuleParams: mediaParams 
    });
    
    if (rule) {
      // Merge with existing styles
      css.setRule(selector, { ...rule.getStyle(), [prop]: value }, {
        atRuleType: 'media',
        atRuleParams: mediaParams,
        addStyles: true, // Merge styles instead of replacing
      });
    } else {
      // Create new rule
      css.setRule(selector, { [prop]: value }, {
        atRuleType: 'media',
        atRuleParams: mediaParams,
      });
    }
  }
}

/**
 * Get styles for specific device from CssComposer
 */
function getStylesForDevice(component: any, device: string, editor: Editor): Record<string, string> {
  if (device === 'desktop') {
    // Desktop styles are stored directly on component
    return component.getStyle() || {};
  }
  
  // For tablet/mobile, look up in CssComposer
  const selector = component.getSelectorsString() || `#${component.getId()}`;
  const mediaParams = device === 'tablet' 
    ? '(max-width: 768px)'
    : '(max-width: 480px)';
  
  const css = editor.CssComposer;
  const rule = css.getRule(selector, { 
    atRuleType: 'media', 
    atRuleParams: mediaParams 
  });
  
  return rule ? rule.getStyle() : {};
}

/**
 * Remove a style property for specific device
 */
function removeMediaStyle(
  component: any, 
  prop: string, 
  device: string,
  editor: Editor
) {
  if (device === 'desktop') {
    component.removeStyle(prop);
  } else {
    const selector = component.getSelectorsString() || `#${component.getId()}`;
    const mediaParams = device === 'tablet' 
      ? '(max-width: 768px)'
      : '(max-width: 480px)';
    
    const css = editor.CssComposer;
    const rule = css.getRule(selector, { 
      atRuleType: 'media', 
      atRuleParams: mediaParams 
    });
    
    if (rule) {
      const currentStyles = { ...rule.getStyle() };
      delete currentStyles[prop];
      css.setRule(selector, currentStyles, {
        atRuleType: 'media',
        atRuleParams: mediaParams,
      });
    }
  }
}
```

---

### 3. GLOBAL STYLES PANEL

#### 3.1 Global Styles Component
```tsx
// File: apps/page-builder/app/components/page-builder/GlobalStylesPanel.tsx (new)

interface GlobalStylesConfig {
  typography: {
    headingFont: string;
    bodyFont: string;
    accentFont: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    textLight: string;
    textDark: string;
    bgLight: string;
    bgDark: string;
  };
  spacing: {
    baseUnit: number; // in px
  };
}

export function GlobalStylesPanel({ editor }: { editor: Editor }) {
  const [config, setConfig] = useState<GlobalStylesConfig>({
    typography: {
      headingFont: 'Hind Siliguri',
      bodyFont: 'Open Sans',
      accentFont: 'none',
    },
    colors: {
      primary: '#059669',
      secondary: '#2563eb',
      accent: '#f59e0b',
      textLight: '#333333',
      textDark: '#ffffff',
      bgLight: '#f9fafb',
      bgDark: '#1f2937',
    },
    spacing: {
      baseUnit: 8,
    },
  });

  const [activeTab, setActiveTab] = useState<'typography' | 'colors' | 'spacing'>('typography');

  const updateGlobalStyle = useCallback((key: string, value: string) => {
    setConfig(prev => {
      const keys = key.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Apply to canvas
    applyGlobalStyleToCanvas(editor, key, value);
  }, [editor]);

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(['typography', 'colors', 'spacing'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 border-b-2 transition ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600'
            }`}
          >
            {tab === 'typography' && '🔤 Typography'}
            {tab === 'colors' && '🎨 Colors'}
            {tab === 'spacing' && '📏 Spacing'}
          </button>
        ))}
      </div>

      {/* Typography Tab */}
      {activeTab === 'typography' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">হেডিং ফন্ট</label>
            <FontSelector
              value={config.typography.headingFont}
              onChange={(val) => updateGlobalStyle('typography.headingFont', val)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">বডি ফন্ট</label>
            <FontSelector
              value={config.typography.bodyFont}
              onChange={(val) => updateGlobalStyle('typography.bodyFont', val)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">অ্যাকসেন্ট ফন্ট</label>
            <FontSelector
              value={config.typography.accentFont}
              onChange={(val) => updateGlobalStyle('typography.accentFont', val)}
            />
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h3 style={{ fontFamily: config.typography.headingFont }}>এটা একটা হেডিং</h3>
            <p style={{ fontFamily: config.typography.bodyFont }}>এটা নর্মাল টেক্স্ট</p>
          </div>
        </div>
      )}

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">প্রাইমারি কালার</label>
            <ColorPicker
              value={config.colors.primary}
              onChange={(val) => updateGlobalStyle('colors.primary', val)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">সেকেন্ডারি কালার</label>
            <ColorPicker
              value={config.colors.secondary}
              onChange={(val) => updateGlobalStyle('colors.secondary', val)}
            />
          </div>

          {/* Show all color swatches */}
          <div className="mt-6 grid grid-cols-4 gap-2">
            {Object.entries(config.colors).map(([name, color]) => (
              <div key={name} className="text-center">
                <div
                  style={{ backgroundColor: color }}
                  className="w-full h-12 rounded border border-gray-300 cursor-pointer hover:border-gray-600"
                  onClick={() => {
                    // Open color picker for this color
                  }}
                />
                <span className="text-xs mt-1 block text-gray-600">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing Tab */}
      {activeTab === 'spacing' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">বেস স্পেসিং ইউনিট</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={config.spacing.baseUnit}
                onChange={(e) => updateGlobalStyle('spacing.baseUnit', e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              />
              <span className="py-2">px</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              এই ভ্যালু থেকে সব spacing ডিরাইভ করা হবে (8px, 16px, 24px, etc.)
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button className="w-full bg-primary text-white py-2 rounded font-semibold hover:opacity-90 transition">
        সেভ করুন
      </button>
    </div>
  );
}

// Helper: Apply global style to canvas
function applyGlobalStyleToCanvas(editor: Editor, key: string, value: string) {
  const canvas = editor.Canvas;
  const doc = canvas.getDocument();
  if (!doc) return;

  let styleEl = doc.getElementById('global-styles') as HTMLStyleElement;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = 'global-styles';
    doc.head.appendChild(styleEl);
  }

  // Build CSS based on key
  let css = '';
  if (key.startsWith('typography.')) {
    if (key === 'typography.headingFont') {
      css = `h1, h2, h3, h4, h5, h6 { font-family: ${value}; }`;
    } else if (key === 'typography.bodyFont') {
      css = `body, p, div { font-family: ${value}; }`;
    }
  } else if (key.startsWith('colors.')) {
    const colorName = key.replace('typography.', '');
    const cssVar = `--${colorName}`;
    css = `:root { ${cssVar}: ${value}; }`;
  }

  if (css) {
    styleEl.textContent += css;
  }
}
```

---

### 4. VISIBILITY TRAIT SYSTEM

#### 4.1 Add Visibility Trait to Components
```typescript
// File: apps/page-builder/app/lib/grapesjs/services/componentTraits.ts

export const addVisibilityTraits = (editor: Editor) => {
  const domComps = editor.DomComponents;
  
  // Add visibility trait to all components
  editor.on('component:create', (component: any) => {
    // Only add to container components
    if (!['bd-section', 'bd-row', 'bd-column', 'div'].includes(component.get('tagName'))) {
      return;
    }

    const traits = component.get('traits') || [];
    
    // Check if visibility trait already exists
    if (traits.some((t: any) => t.name === 'data-visible-desktop')) {
      return;
    }

    traits.push(
      {
        type: 'checkbox',
        name: 'data-visible-desktop',
        label: 'Visible on Desktop',
        changeProp: true,
        default: true,
      },
      {
        type: 'checkbox',
        name: 'data-visible-tablet',
        label: 'Visible on Tablet',
        changeProp: true,
        default: true,
      },
      {
        type: 'checkbox',
        name: 'data-visible-mobile',
        label: 'Visible on Mobile',
        changeProp: true,
        default: true,
      }
    );

    component.set('traits', traits);
  });
};
```

---

## 📋 TASK BREAKDOWN

### Week 1: Design & Implementation

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Design responsive breakpoint system | Dev | 1 day | ⬜ |
| Implement breakpoint configuration | Dev | 1 day | ⬜ |
| Enhance StyleControls for devices | Dev | 2 days | ⬜ |
| Implement visibility trait system | Dev | 1 day | ⬜ |
| Setup device-specific style storage | Dev | 1 day | ⬜ |

**Week 1 Deliverable**: Device-aware style controls working

### Week 2: Global Styles & Testing

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Create GlobalStylesPanel component | Dev | 1.5 days | ⬜ |
| Implement CSS variable system | Dev | 1.5 days | ⬜ |
| Test responsive styles across devices | QA | 1 day | ⬜ |
| Test visibility toggles | QA | 1 day | ⬜ |
| Performance testing | Dev | 0.5 days | ⬜ |
| Bug fixes & refinements | Dev | 1 day | ⬜ |
| Documentation | Dev | 0.5 days | ⬜ |

**Week 2 Deliverable**: Phase 2 complete and tested

---

## ✅ DEFINITION OF DONE

Phase 2 is complete when:

- [ ] Device tabs (Desktop/Tablet/Mobile) visible in Style Controls
- [ ] Styles can be edited per device
- [ ] Visibility toggles working for each device
- [ ] Device-specific CSS media queries generated correctly
- [ ] Global Styles Panel accessible
- [ ] Global fonts and colors editable
- [ ] CSS variables applied to canvas
- [ ] Responsive breakpoints configurable
- [ ] Style inheritance working correctly
- [ ] No style conflicts between devices
- [ ] Unit test coverage > 80%
- [ ] Responsive design tests passing
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Code review approved

---

## 🚨 RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| CSS specificity issues | Use BEM naming + CSS variables |
| Media query conflicts | Comprehensive testing, clear breakpoint definitions |
| Performance with many styles | Lazy load styles, optimize CSS generation |

---

**Next**: After Phase 2 approval, proceed to PHASE_3_WIDGETS.md

