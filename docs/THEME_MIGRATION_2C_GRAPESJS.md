# Phase 2C: GrapesJS Integration

**Document Purpose:** Guide GrapesJS canvas integration with new template system.

---

## GrapesJS Overview

### What is GrapesJS?
- Open-source page builder framework
- Drag-drop visual editor on HTML canvas
- Customizable block/component system
- Extensible via plugins

### Why GrapesJS?
- ✅ Registry-friendly (blocks = sections)
- ✅ Real-time preview
- ✅ JSON export/import
- ✅ Active community support

---

## Integration Architecture

```
Editor UI
  ├─ GrapesJS Canvas (visual editor)
  ├─ Blocks Panel (section library)
  ├─ Style Panel (theme editor)
  └─ Properties Panel (section config)
       ↓
EditorStore (Zustand)
  ├─ Template data
  ├─ Sections array
  ├─ Theme config
  └─ State (draft/published)
       ↓
Template API (/api/templates/:id/*)
  ├─ POST /save (draft)
  ├─ POST /publish
  └─ GET / (load)
       ↓
Database (templates table)
  ├─ Config JSON
  ├─ Sections JSON
  └─ Status (draft/published)
```

---

## GrapesJS Canvas Setup

### Initialize Editor
```typescript
// app/components/editor/GrapesJSEditor.tsx
import grapesjs from 'grapesjs';
import GjsPresetWebpage from 'grapesjs-preset-webpage';

export function GrapesJSEditor({ template }) {
  useEffect(() => {
    const editor = grapesjs.init({
      container: '#editor',
      plugins: ['gjs-preset-webpage'],
      pluginsOpts: {
        'gjs-preset-webpage': {}
      },
      // Disable default blocks
      blockManager: {
        default: {
          blocks: [] // Custom blocks only
        }
      }
    });

    // Register custom section blocks
    registerSectionBlocks(editor, template);

    return () => editor.destroy();
  }, [template]);
}
```

### Register Section Blocks
```typescript
function registerSectionBlocks(editor, template) {
  const registry = getSectionRegistry();
  
  Object.entries(registry).forEach(([sectionId, def]) => {
    editor.BlockManager.add(sectionId, {
      label: def.name,
      category: def.category,
      content: `<div class="section section-${sectionId}">
        ${def.thumbnail ? `<img src="${def.thumbnail}" />` : ''}
        <p>${def.description || def.name}</p>
      </div>`,
      attributes: { class: 'custom-block' },
      activate: true
    });
  });
}
```

---

## Block to Section Mapping

### GrapesJS Block → Section Object
```typescript
function blockToSection(block, index): Section {
  const blockId = block.getId();
  const blockType = mapBlockTypeToSectionType(block.get('type'));
  
  return {
    id: `${blockType}_${Date.now()}`,
    type: blockType,
    order: index + 1,
    enabled: true,
    config: blockToConfig(block)
  };
}

function blockToConfig(block): object {
  // Extract GrapesJS component attributes
  // into section config object
  const el = block.getEl();
  const styles = block.getStyles();
  const html = block.getHtml();
  
  return {
    // Map GrapesJS properties to section config
    html,
    customStyle: styles
  };
}

function mapBlockTypeToSectionType(gjsType): string {
  const mapping = {
    'hero-block': 'hero',
    'grid-block': 'product-grid',
    'carousel-block': 'product-carousel'
  };
  return mapping[gjsType] || gjsType;
}
```

---

## Canvas Styles & CSS Injection

### Load Theme Styles on Canvas
```typescript
function injectThemeToCanvas(editor, theme) {
  const css = generateThemeCSS(theme);
  
  // Inject into canvas document
  const frame = editor.Canvas.getFrameEl();
  const doc = frame.contentDocument;
  
  const style = doc.createElement('style');
  style.textContent = css;
  doc.head.appendChild(style);
}

function generateThemeCSS(theme): string {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --font-family: ${theme.typography.fontFamily};
      --spacing-unit: ${theme.spacing.unit};
    }
    
    body {
      font-family: var(--font-family);
      color: var(--color-text-dark);
    }
    
    .section {
      padding: calc(var(--spacing-unit) * 3);
    }
    
    h1, h2, h3 {
      font-size: ${theme.typography.headingSize};
      color: var(--color-primary);
    }
  `;
}
```

---

## Properties Panel (Trait Panel)

### Dynamic Form for Section Config
```typescript
function setupTraitPanel(editor, sectionRegistry) {
  editor.TraitManager.removeType('default');
  
  editor.on('component:selected', (component) => {
    const sectionType = component.get('section-type');
    const def = sectionRegistry[sectionType];
    
    if (def && def.fields) {
      addTraitsForFields(editor, def.fields);
    }
  });
}

function addTraitsForFields(editor, fields) {
  fields.forEach(field => {
    editor.TraitManager.addType(field.type, {
      events: {
        'change': (e) => {
          updateSectionConfig(field.name, e.target.value);
        }
      },
      // Field template
      getInputEl: () => createFieldInput(field)
    });
    
    editor.TraitManager.add(field.name, {
      type: field.type,
      label: field.label,
      placeholder: field.placeholder
    });
  });
}
```

---

## Two-Way Sync: GrapesJS ↔ EditorStore

### Export Canvas to Template Data
```typescript
function canvasToTemplate(editor): TemplateData {
  const components = editor.getComponents();
  const styles = editor.Css.getAll();
  
  const sections = components.map((comp, idx) => ({
    id: comp.getId(),
    type: comp.get('section-type'),
    order: idx + 1,
    enabled: !comp.isHidden(),
    config: extractComponentConfig(comp)
  }));
  
  return {
    sections,
    theme: getCurrentTheme()
  };
}

function extractComponentConfig(component) {
  return {
    // Convert GrapesJS component to section config
    ...component.getAttributes(),
    html: component.getHtml(),
    style: component.getStyle()
  };
}
```

### Import Template to Canvas
```typescript
function templateToCanvas(editor, template) {
  editor.Components.clear();
  
  template.sections.forEach(section => {
    const block = createBlockFromSection(section);
    editor.addComponent(block);
  });
  
  injectThemeToCanvas(editor, template.theme);
  editor.trigger('load:complete');
}

function createBlockFromSection(section): object {
  return {
    type: section.type,
    tagName: 'div',
    attributes: {
      class: `section section-${section.type}`,
      'data-section-id': section.id,
      'data-section-type': section.type
    },
    components: [
      {
        type: 'text',
        content: JSON.stringify(section.config)
      }
    ]
  };
}
```

---

## Save & Publish Workflow

### Auto-Save to Draft
```typescript
function setupAutoSave(editor, templateId) {
  let saveTimeout;
  
  editor.on('change', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const template = canvasToTemplate(editor);
      
      await fetch(`/api/templates/${templateId}/save`, {
        method: 'POST',
        body: JSON.stringify(template)
      });
      
      showNotification('Draft saved');
    }, 1000);
  });
}
```

### Publish with Validation
```typescript
async function publishTemplate(editor, templateId) {
  try {
    const template = canvasToTemplate(editor);
    
    // Validate
    const validated = TemplateSchema.parse(template);
    
    // Publish
    const res = await fetch(`/api/templates/${templateId}/publish`, {
      method: 'POST',
      body: JSON.stringify(validated)
    });
    
    if (res.ok) {
      showNotification('Published successfully', 'success');
      editor.setDirty(0); // Clear dirty flag
    } else {
      showNotification('Publish failed', 'error');
    }
  } catch (error) {
    showNotification(`Validation error: ${error.message}`, 'error');
  }
}
```

---

## Preview Mode

### Render Published Template
```typescript
export function TemplatePreview({ templateId }) {
  const [template, setTemplate] = useState(null);
  
  useEffect(() => {
    fetch(`/api/templates/${templateId}?status=published`)
      .then(r => r.json())
      .then(setTemplate);
  }, [templateId]);
  
  if (!template) return <Loading />;
  
  return (
    <div className="preview">
      {template.sections.map(section => {
        const def = SECTION_REGISTRY[section.type];
        return (
          <div key={section.id} className={`section-${section.type}`}>
            {createElement(def.component, {
              ...section.config,
              theme: template.theme
            })}
          </div>
        );
      })}
    </div>
  );
}
```

---

## GrapesJS Plugins

### Custom Section Block Plugin
```typescript
function createSectionPlugin(registry) {
  return (editor) => {
    registry.forEach((def) => {
      editor.BlockManager.add(def.id, {
        label: def.name,
        category: def.category,
        content: def.component, // React component
        activate: true
      });
    });
  };
}

export default createSectionPlugin;
```

### Usage
```typescript
grapesjs.init({
  plugins: [createSectionPlugin(SECTION_REGISTRY)]
});
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Styles not applied on canvas | CSS not injected | Call `injectThemeToCanvas()` after load |
| Blocks not draggable | Block manager misconfigured | Set `draggable: true` in block config |
| Components not syncing | Two-way binding broken | Use debounced listeners on both sides |
| Theme changes don't persist | Store not updated | Call store action on editor change |

---

## Next Steps

1. Set up GrapesJS with custom blocks (1-2 days)
2. Create trait panel for section config (1 day)
3. Implement two-way sync (1-2 days)
4. Test with sample template (1 day)

See [Phase 3A: Draft System Design](../THEME_MIGRATION_3A_DRAFT_SYSTEM.md).
