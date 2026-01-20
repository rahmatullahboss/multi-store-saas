# PHASE 1: CORE ARCHITECTURE - DETAILED SPECIFICATIONS

> **Duration**: 3 weeks  
> **Priority**: P0 - Critical  
> **Status**: Planning  
> **Assigned to**: Senior Frontend Engineer  

---

## 🎯 PHASE OBJECTIVES

1. Implement proper **Section → Row → Column → Widget** nesting hierarchy
2. Enable **Element Tree / Navigator Panel** for visual element management
3. Add **Undo/Redo UI controls** with history visibility
4. Implement **drag constraints** (widgets can't exist outside columns)
5. Setup **component type system** for easier future extensibility

---

## 📊 PHASE SCOPE

### In Scope ✅
- Section component type
- Row/Container component type
- Column component type with width grid system
- Navigator/Element tree panel
- Undo/Redo button + history panel
- Drag validation/constraints
- Component traits (width, offset, alignment)
- Migration guide for existing blocks

### Out of Scope ❌
- Device-specific styling (Phase 2)
- Advanced widgets (Phase 3)
- Keyboard shortcuts (Phase 4)
- Reusable blocks (Phase 5)

---

## 🏗️ ARCHITECTURE DESIGN

### Current Structure (Problem)
```
Page
├── Hero Block (flat HTML)
├── Trust Block (flat HTML)
├── Features Block (flat HTML)
└── Order Form Block (flat HTML)

Problem: No proper nesting, hard to edit individual elements
```

### Target Structure (Solution)
```
Page (Root - invisible)
├── Section 1
│   ├── Row (flex container)
│   │   ├── Column 1/2 width
│   │   │   ├── Heading
│   │   │   ├── Text
│   │   │   └── Button
│   │   └── Column 1/2 width
│   │       └── Image
│   └── [Floating buttons]
├── Section 2
│   └── Row
│       └── Column full width
│           └── Trust badges (inline widgets)
└── Section 3
    └── Row
        └── Column full width
            └── Order form (with nested inputs)
```

### Benefits
✓ Individual element editing
✓ Easy copy/paste/delete
✓ Proper z-index/layering
✓ Responsive column widths
✓ Semantic HTML structure
✓ Elementor-style hierarchy

---

## 🔧 IMPLEMENTATION DETAILS

### 1. NEW COMPONENT TYPES

#### 1.1 Section Component
```typescript
// File: apps/page-builder/app/lib/grapesjs/components/section.ts

export const SectionComponent = {
  model: {
    defaults: {
      name: 'Section',
      tagName: 'section',
      classes: ['bd-section'],
      attributes: {
        'data-section-id': '', // Will be filled with UUID
      },
      traits: [
        {
          type: 'text',
          name: 'data-section-id',
          label: 'Section ID',
          readonly: true,
          changeProp: true,
        },
        {
          type: 'select',
          name: 'data-bg-type',
          label: 'Background Type',
          options: [
            { value: 'none', label: 'None' },
            { value: 'color', label: 'Color' },
            { value: 'image', label: 'Image' },
            { value: 'gradient', label: 'Gradient' },
          ],
          changeProp: true,
        },
        {
          type: 'color',
          name: 'data-bg-color',
          label: 'Background Color',
          changeProp: true,
        },
        {
          type: 'text',
          name: 'data-padding',
          label: 'Padding (px)',
          placeholder: '40',
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const bgType = el.getAttribute('data-bg-type');
        const bgColor = el.getAttribute('data-bg-color');
        
        if (bgType === 'color' && bgColor) {
          el.style.backgroundColor = bgColor;
        }
        
        const padding = el.getAttribute('data-padding');
        if (padding) {
          el.style.padding = `${padding}px`;
        }
      },
      'script-props': ['data-bg-type', 'data-bg-color', 'data-padding'],
    },
  },
  view: {
    // Custom section template
    render() {
      this.el.innerHTML = `
        <section class="bd-section">
          <div class="bd-section-row"></div>
        </section>
      `;
      return this;
    },
  },
};
```

**Registration in Editor**:
```typescript
// In editor.ts or config.ts
const domComps = editor.DomComponents;
domComps.addType('bd-section', SectionComponent);
```

#### 1.2 Row Component
```typescript
// File: apps/page-builder/app/lib/grapesjs/components/row.ts

export const RowComponent = {
  model: {
    defaults: {
      name: 'Row',
      tagName: 'div',
      classes: ['bd-row'],
      attributes: {
        style: 'display: flex; flex-wrap: wrap; width: 100%; max-width: 1280px; margin: 0 auto;',
      },
      traits: [
        {
          type: 'select',
          name: 'data-gap',
          label: 'Gap Between Columns',
          options: [
            { value: '0', label: 'None' },
            { value: '16', label: 'Small' },
            { value: '24', label: 'Medium' },
            { value: '32', label: 'Large' },
          ],
          changeProp: true,
        },
        {
          type: 'select',
          name: 'data-align',
          label: 'Vertical Align',
          options: [
            { value: 'flex-start', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'flex-end', label: 'Bottom' },
          ],
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const gap = el.getAttribute('data-gap') || '24';
        const align = el.getAttribute('data-align') || 'flex-start';
        
        el.style.gap = `${gap}px`;
        el.style.alignItems = align;
      },
      'script-props': ['data-gap', 'data-align'],
    },
  },
};
```

#### 1.3 Column Component (Key)
```typescript
// File: apps/page-builder/app/lib/grapesjs/components/column.ts

export const ColumnComponent = {
  model: {
    defaults: {
      name: 'Column',
      tagName: 'div',
      classes: ['bd-column'],
      resizable: true, // Allow width resizing
      attributes: {
        'data-col-width': '6', // Out of 12 (half width)
      },
      traits: [
        {
          type: 'select',
          name: 'data-col-width',
          label: 'Width',
          options: [
            { value: '1', label: '1/12' },
            { value: '2', label: '1/6' },
            { value: '3', label: '1/4' },
            { value: '4', label: '1/3' },
            { value: '6', label: '1/2' },
            { value: '12', label: 'Full Width' },
          ],
          changeProp: true,
        },
        {
          type: 'select',
          name: 'data-col-offset',
          label: 'Offset',
          options: [
            { value: '0', label: 'None' },
            { value: '1', label: '1 col' },
            { value: '2', label: '2 cols' },
            { value: '3', label: '3 cols' },
            { value: '6', label: '6 cols' },
          ],
          changeProp: true,
        },
      ],
      script: function() {
        const el = this as HTMLElement;
        const width = el.getAttribute('data-col-width') || '6';
        const offset = el.getAttribute('data-col-offset') || '0';
        
        const widthPercent = (parseInt(width) / 12) * 100;
        const offsetPercent = (parseInt(offset) / 12) * 100;
        
        el.style.flexBasis = `${widthPercent}%`;
        el.style.maxWidth = `${widthPercent}%`;
        el.style.marginLeft = offsetPercent > 0 ? `${offsetPercent}%` : '0';
        el.style.minHeight = '100px'; // Minimum height for drop zones
      },
      'script-props': ['data-col-width', 'data-col-offset'],
    },
  },
};
```

---

### 2. DRAG CONSTRAINTS

```typescript
// File: apps/page-builder/app/lib/grapesjs/services/dragConstraints.ts

export const setupDragConstraints = (editor: Editor) => {
  const Canvas = editor.Canvas;
  
  // Prevent widgets from being placed outside columns
  editor.DragManager.setConstraint({
    'bd-text': 'bd-column',  // Text can only go in columns
    'bd-image': 'bd-column', // Image can only go in columns
    'bd-button': 'bd-column',
    'heading': 'bd-column',
    // ... all widgets restricted to columns
  });
  
  // Allow rows only in sections
  editor.DragManager.setConstraint({
    'bd-row': 'bd-section',
  });
  
  // Allow columns only in rows
  editor.DragManager.setConstraint({
    'bd-column': 'bd-row',
  });
  
  // Prevent section nesting
  editor.DragManager.setConstraint({
    'bd-section': null, // Only at root level
  });
};
```

---

### 3. ELEMENT TREE / NAVIGATOR PANEL

#### 3.1 Enable Navigator
```typescript
// File: apps/page-builder/app/lib/grapesjs/config.ts (modification)

export const getGrapesConfig = (...) => {
  return {
    // ... existing config
    panels: {
      defaults: [],
      // Don't hide all panels, keep navigator
    },
    // Enable layer manager (element tree)
    layerManager: {
      appendTo: '#layers-container', // We'll create this element
      autoAdd: 1,
      hidePrivate: 1,
      hideNonSelected: 0,
      expand: 1,
    },
  };
};
```

#### 3.2 Sidebar Tab for Navigator
```tsx
// File: apps/page-builder/app/components/page-builder/SidebarPanel.tsx (modification)

export default function SidebarPanel({ editor, activeSidebarTab, setActiveSidebarTab }: SidebarPanelProps) {
  
  // ... existing code ...

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-3 py-2 gap-2">
        <Tab
          label="Widgets"
          active={activeSidebarTab === 'widgets'}
          onClick={() => setActiveSidebarTab('widgets')}
          icon={<Box size={16} />}
        />
        <Tab
          label="Structure"
          active={activeSidebarTab === 'structure'}
          onClick={() => setActiveSidebarTab('structure')}
          icon={<Tree size={16} />}
        />
        <Tab
          label="Design"
          active={activeSidebarTab === 'design'}
          onClick={() => setActiveSidebarTab('design')}
          icon={<Palette size={16} />}
        />
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeSidebarTab === 'widgets' && (
          <div id="blocks-container" className="overflow-y-auto h-full" />
        )}
        
        {activeSidebarTab === 'structure' && (
          <div id="layers-container" className="overflow-y-auto h-full" />
        )}
        
        {activeSidebarTab === 'design' && (
          <StyleControls editor={editor} />
        )}
      </div>
    </div>
  );
}
```

---

### 4. UNDO/REDO UI

#### 4.1 Toolbar Buttons
```tsx
// File: apps/page-builder/app/components/page-builder/Toolbar.tsx (modification)

export default function EditorToolbar({ editor, ...props }: EditorToolbarProps) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateUndoRedoState = () => {
      setCanUndo(editor.UndoManager.hasUndo());
      setCanRedo(editor.UndoManager.hasRedo());
    };

    editor.UndoManager.addEventListener('update', updateUndoRedoState);
    updateUndoRedoState();

    return () => {
      editor.UndoManager.removeEventListener('update', updateUndoRedoState);
    };
  }, [editor]);

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 p-3">
      {/* Undo/Redo Buttons */}
      <div className="flex gap-1">
        <button
          onClick={() => editor?.UndoManager.undo()}
          disabled={!canUndo}
          className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={() => editor?.UndoManager.redo()}
          disabled={!canRedo}
          className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition`}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>
      </div>

      <Separator orientation="vertical" />

      {/* History Indicator */}
      <div className="text-xs text-gray-500">
        {editor?.UndoManager.getLength()} changes
      </div>

      {/* History Panel Button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="ml-auto p-2 rounded hover:bg-gray-100 transition"
        title="History Panel"
      >
        <Clock size={18} />
      </button>

      {/* ... existing code ... */}
    </div>
  );
}
```

#### 4.2 History Panel Modal
```tsx
// File: apps/page-builder/app/components/page-builder/HistoryPanel.tsx (new)

interface HistoryPanelProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryPanel({ editor, isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateHistory = () => {
      const undoManager = editor.UndoManager;
      // Get all undo/redo states
      setHistory(undoManager.getStack?.() || []);
    };

    editor.UndoManager.addEventListener('update', updateHistory);
    updateHistory();

    return () => {
      editor.UndoManager.removeEventListener('update', updateHistory);
    };
  }, [editor]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <p className="text-gray-500 text-sm">No history</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    // Jump to this state
                    editor.UndoManager.undoAll();
                    for (let i = 0; i < idx; i++) {
                      editor.UndoManager.redo();
                    }
                    onClose();
                  }}
                  className="p-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <span className="font-mono text-xs text-gray-500">{idx}</span>
                  {' '}
                  <span>{item.description || 'Change'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### 5. MIGRATION STRATEGY

#### 5.1 Existing Blocks Migration
Current flat HTML blocks need to be wrapped in the new structure:

```typescript
// Migration mapping
const blockMigration = {
  'bd-hero': {
    section: { classes: ['bd-hero-section'] },
    row: { 'data-gap': '24' },
    column: { 'data-col-width': '12' }, // Full width
    content: `<div class="hero-content">...</div>`,
  },
  'bd-features-grid': {
    section: { classes: ['bd-features-section'] },
    row: { 'data-gap': '32' },
    columns: [
      { 'data-col-width': '4', content: '...' }, // 1/3 width
      { 'data-col-width': '4', content: '...' },
      { 'data-col-width': '4', content: '...' },
    ],
  },
  // ... etc
};
```

#### 5.2 Data Migration Script
```typescript
// File: db/migrations/0063_migrate_to_nested_structure.sql

-- Add new column to track migration status
ALTER TABLE builder_pages ADD COLUMN migrated_to_nested INTEGER DEFAULT 0;

-- Add column for storing new nested structure
ALTER TABLE builder_pages ADD COLUMN nested_json TEXT;
```

---

## 📋 TASK BREAKDOWN

### Week 1: Design & Prototyping

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Create component type system design | Dev | 2 days | ⬜ |
| Prototype Section/Row/Column | Dev | 2 days | ⬜ |
| Design drag constraint logic | Dev | 1 day | ⬜ |
| Get design review | PM | 0.5 days | ⬜ |

**Week 1 Deliverable**: Approved design document + working prototype

### Week 2: Implementation

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Implement Section component | Dev | 1 day | ⬜ |
| Implement Row component | Dev | 1 day | ⬜ |
| Implement Column component (12-grid) | Dev | 1.5 days | ⬜ |
| Implement drag constraints | Dev | 1 day | ⬜ |
| Setup component registration in editor | Dev | 0.5 days | ⬜ |
| Enable Navigator panel | Dev | 1 day | ⬜ |
| Add Undo/Redo UI | Dev | 1 day | ⬜ |

**Week 2 Deliverable**: All components implemented and integrated

### Week 3: Testing & Refinement

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Unit tests for components | Dev + QA | 1.5 days | ⬜ |
| Integration tests | QA | 1.5 days | ⬜ |
| E2E tests (drag, nesting, undo) | QA | 1 day | ⬜ |
| Performance benchmarking | Dev | 0.5 days | ⬜ |
| Migration script testing | Dev + QA | 1 day | ⬜ |
| Bug fixes & refinements | Dev | 1.5 days | ⬜ |
| Documentation | Dev | 1 day | ⬜ |

**Week 3 Deliverable**: Fully tested Phase 1, ready for Phase 2

---

## ✅ DEFINITION OF DONE

Phase 1 is complete when:

- [ ] All component types (Section, Row, Column) implemented
- [ ] Element tree / Navigator panel working
- [ ] Undo/Redo buttons visible and functional
- [ ] History panel accessible
- [ ] Drag constraints preventing invalid nesting
- [ ] Column width selector (1/12 grid) working
- [ ] Existing blocks wrapped in new structure
- [ ] Migration script ready for production
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] E2E tests passing (drag, nesting, undo/redo)
- [ ] Performance benchmarks met (< 100ms for operations)
- [ ] No critical bugs
- [ ] Documentation complete (inline + API docs)
- [ ] Code review approved
- [ ] Ready for Phase 2 without blockers

---

## 🚨 RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| GrapesJS compatibility issues | Early integration testing, check GrapesJS version support |
| Performance degradation | Benchmark early, optimize rendering |
| Breaking existing pages | Comprehensive migration script + backwards compatibility layer |
| Complexity in drag system | Thorough testing, document edge cases |

---

## 📚 TECHNICAL RESOURCES

- [GrapesJS Component Model](https://grapesjs.com/docs/guides/component-types)
- [GrapesJS Traits System](https://grapesjs.com/docs/guides/components/traits)
- [GrapesJS Layer Manager](https://grapesjs.com/docs/guides/layers)
- [GrapesJS Undo Manager](https://grapesjs.com/docs/guides/undo-manager)

---

**Next**: After Phase 1 approval, proceed to PHASE_2_STYLES.md

