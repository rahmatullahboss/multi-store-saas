# PHASE 4: UX IMPROVEMENTS - DETAILED SPECIFICATIONS

> **Duration**: 1.5 weeks  
> **Priority**: P1 - High  
> **Status**: Planning  
> **Depends on**: Phase 1 & 2 Complete  
> **Assigned to**: Senior Frontend Engineer  

---

## 🎯 PHASE OBJECTIVES

1. Implement **keyboard shortcuts** (Undo, Redo, Copy, Paste, Delete, etc.)
2. Add **copy/paste styles** functionality
3. Implement **drag snap guides and alignment indicators**
4. Add **right-click context menu** actions
5. Implement **component duplication**

---

## 📊 PHASE SCOPE

### Keyboard Shortcuts

| Shortcut | Action | Platform |
|----------|--------|----------|
| `Ctrl+Z` / `Cmd+Z` | Undo | All |
| `Ctrl+Y` / `Cmd+Y` | Redo | All |
| `Ctrl+C` / `Cmd+C` | Copy | All |
| `Ctrl+V` / `Cmd+V` | Paste | All |
| `Ctrl+X` / `Cmd+X` | Cut | All |
| `Delete` / `Backspace` | Delete selected | All |
| `Ctrl+D` / `Cmd+D` | Duplicate | All |
| `Ctrl+Shift+C` | Copy styles | All |
| `Ctrl+Shift+V` | Paste styles | All |
| `Escape` | Deselect | All |
| `Ctrl+A` | Select all | All |

---

## 🔧 IMPLEMENTATION DETAILS

### 1. KEYBOARD SHORTCUTS SYSTEM

#### 1.1 Shortcuts Manager
```typescript
// File: apps/page-builder/app/lib/grapesjs/services/shortcuts.ts

import type { Editor } from 'grapesjs';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export class ShortcutsManager {
  private shortcuts: Map<string, ShortcutConfig> = new Map();
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
    this.setupDefaultShortcuts();
  }

  private setupDefaultShortcuts() {
    // Undo
    this.register({
      key: 'z',
      ctrlKey: true,
      action: () => this.editor.UndoManager.undo(),
      description: 'Undo last action',
    });

    // Redo
    this.register({
      key: 'y',
      ctrlKey: true,
      action: () => this.editor.UndoManager.redo(),
      description: 'Redo last action',
    });

    // Copy
    this.register({
      key: 'c',
      ctrlKey: true,
      action: () => this.handleCopy(),
      description: 'Copy selected element',
    });

    // Paste
    this.register({
      key: 'v',
      ctrlKey: true,
      action: () => this.handlePaste(),
      description: 'Paste element',
    });

    // Cut
    this.register({
      key: 'x',
      ctrlKey: true,
      action: () => this.handleCut(),
      description: 'Cut selected element',
    });

    // Delete
    this.register({
      key: 'Delete',
      action: () => this.handleDelete(),
      description: 'Delete selected element',
    });

    // Duplicate
    this.register({
      key: 'd',
      ctrlKey: true,
      action: () => this.handleDuplicate(),
      description: 'Duplicate selected element',
    });

    // Copy Styles
    this.register({
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      action: () => this.handleCopyStyles(),
      description: 'Copy styles from selected element',
    });

    // Paste Styles
    this.register({
      key: 'v',
      ctrlKey: true,
      shiftKey: true,
      action: () => this.handlePasteStyles(),
      description: 'Paste styles to selected element',
    });

    // Select All
    this.register({
      key: 'a',
      ctrlKey: true,
      action: () => this.handleSelectAll(),
      description: 'Select all elements',
    });

    // Escape (Deselect)
    this.register({
      key: 'Escape',
      action: () => this.editor.select(),
      description: 'Deselect current selection',
    });
  }

  register(config: ShortcutConfig) {
    const key = this.getShortcutKey(config);
    this.shortcuts.set(key, config);
  }

  private getShortcutKey(config: ShortcutConfig): string {
    const parts = [];
    if (config.ctrlKey) parts.push('Ctrl');
    if (config.shiftKey) parts.push('Shift');
    if (config.altKey) parts.push('Alt');
    parts.push(config.key);
    return parts.join('+');
  }

  handleKeyDown(e: KeyboardEvent) {
    const key = this.getEventKey(e);
    const config = this.shortcuts.get(key);

    if (config) {
      e.preventDefault();
      config.action();
    }
  }

  private getEventKey(e: KeyboardEvent): string {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    
    if (e.key === 'Enter') parts.push('Enter');
    else if (e.key === 'Escape') parts.push('Escape');
    else if (e.key === 'Delete') parts.push('Delete');
    else if (e.key === 'Backspace') parts.push('Backspace');
    else parts.push(e.key.toLowerCase());
    
    return parts.join('+');
  }

  // Action handlers
  private handleCopy() {
    const selected = this.editor.getSelected();
    if (!selected) return;

    const html = selected.toHTML();
    localStorage.setItem('copiedElement', JSON.stringify({
      html,
      type: selected.get('type'),
    }));
  }

  private handlePaste() {
    const data = localStorage.getItem('copiedElement');
    if (!data) return;

    const { html } = JSON.parse(data);
    const parent = this.editor.getSelected()?.parent() || this.editor.getWrapper();
    
    if (parent) {
      parent.append(html);
    }
  }

  private handleCut() {
    this.handleCopy();
    this.handleDelete();
  }

  private handleDelete() {
    const selected = this.editor.getSelected();
    if (selected) {
      selected.remove();
    }
  }

  private handleDuplicate() {
    const selected = this.editor.getSelected();
    if (!selected) return;

    const clone = selected.clone();
    const parent = selected.parent();
    
    if (parent) {
      parent.append(clone);
    }
  }

  private handleCopyStyles() {
    const selected = this.editor.getSelected();
    if (!selected) return;

    const styles = selected.getStyle();
    localStorage.setItem('copiedStyles', JSON.stringify(styles));
  }

  private handlePasteStyles() {
    const selected = this.editor.getSelected();
    if (!selected) return;

    const styles = JSON.parse(localStorage.getItem('copiedStyles') || '{}');
    selected.addStyle(styles);
  }

  private handleSelectAll() {
    const wrapper = this.editor.getWrapper();
    if (wrapper) {
      this.editor.select(wrapper);
    }
  }

  getShortcuts() {
    return Array.from(this.shortcuts.values());
  }
}
```

#### 1.2 Integration in Editor
```tsx
// In Editor.tsx
useEffect(() => {
  if (!editor || !isEditorReady) return;

  const shortcutsManager = new ShortcutsManager(editor);

  const handleKeyDown = (e: KeyboardEvent) => {
    shortcutsManager.handleKeyDown(e);
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [editor, isEditorReady]);
```

---

### 2. CONTEXT MENU

#### 2.1 Context Menu Component
```tsx
// File: apps/page-builder/app/components/page-builder/ContextMenu.tsx (enhancement)

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  editor: Editor;
}

export function ContextMenu({ x, y, onClose, editor }: ContextMenuProps) {
  const selected = editor.getSelected();

  if (!selected) {
    return null;
  }

  const menuItems = [
    {
      label: 'কপি',
      icon: <Copy size={16} />,
      onClick: () => {
        editor.runCommand('core:component-copy');
        onClose();
      },
    },
    {
      label: 'পেস্ট',
      icon: <Clipboard size={16} />,
      onClick: () => {
        editor.runCommand('core:component-paste');
        onClose();
      },
      disabled: !localStorage.getItem('copiedElement'),
    },
    {
      label: 'কাট',
      icon: <Scissors size={16} />,
      onClick: () => {
        editor.runCommand('core:component-cut');
        onClose();
      },
    },
    { divider: true },
    {
      label: 'ডুপ্লিকেট',
      icon: <Copy size={16} />,
      onClick: () => {
        editor.runCommand('core:component-duplicate');
        onClose();
      },
    },
    {
      label: 'ডিলিট',
      icon: <Trash2 size={16} />,
      onClick: () => {
        selected.remove();
        onClose();
      },
      danger: true,
    },
    { divider: true },
    {
      label: 'স্টাইল কপি করুন',
      icon: <Palette size={16} />,
      onClick: () => {
        const styles = selected.getStyle();
        localStorage.setItem('copiedStyles', JSON.stringify(styles));
        toast.success('স্টাইল কপি হয়েছে');
        onClose();
      },
    },
    {
      label: 'স্টাইল পেস্ট করুন',
      icon: <Palette size={16} />,
      onClick: () => {
        const styles = JSON.parse(localStorage.getItem('copiedStyles') || '{}');
        selected.addStyle(styles);
        toast.success('স্টাইল পেস্ট হয়েছে');
        onClose();
      },
      disabled: !localStorage.getItem('copiedStyles'),
    },
  ];

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-44"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      {menuItems.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="my-1 border-t border-gray-200" />;
        }

        return (
          <button
            key={idx}
            onClick={item.onClick}
            disabled={item.disabled}
            className={`
              w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50 transition
              ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
            `}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

### 3. DRAG SNAP GUIDES

#### 3.1 Snap Guides Implementation
```typescript
// File: apps/page-builder/app/lib/grapesjs/services/snapGuides.ts

export const enableSnapGuides = (editor: Editor) => {
  const Canvas = editor.Canvas;
  
  // Get canvas document
  const doc = Canvas.getDocument();
  if (!doc) return;

  // Create guides container
  let guidesContainer = doc.getElementById('snap-guides');
  if (!guidesContainer) {
    guidesContainer = doc.createElement('div');
    guidesContainer.id = 'snap-guides';
    doc.body.appendChild(guidesContainer);
  }

  // Add styles for guides
  let style = doc.getElementById('snap-guides-style') as HTMLStyleElement;
  if (!style) {
    style = doc.createElement('style');
    style.id = 'snap-guides-style';
    style.textContent = `
      #snap-guides {
        position: absolute;
        pointer-events: none;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
      }
      
      .snap-guide-vertical,
      .snap-guide-horizontal {
        position: absolute;
        background: #3b82f6;
        pointer-events: none;
      }
      
      .snap-guide-vertical {
        width: 1px;
        height: 100%;
        top: 0;
        opacity: 0.7;
      }
      
      .snap-guide-horizontal {
        height: 1px;
        width: 100%;
        left: 0;
        opacity: 0.7;
      }
    `;
    doc.head.appendChild(style);
  }

  // Snap distance in pixels
  const SNAP_DISTANCE = 10;

  editor.on('component:selected', (component: any) => {
    const el = component.view?.el as HTMLElement;
    if (!el) return;

    // Show alignment guides
    showAlignmentGuides(el, guidesContainer, SNAP_DISTANCE);
  });
};

function showAlignmentGuides(element: HTMLElement, container: HTMLElement, distance: number) {
  // Get element position
  const rect = element.getBoundingClientRect();
  
  // Clear existing guides
  container.innerHTML = '';

  // Get all other elements
  const allElements = Array.from(document.querySelectorAll('[data-gjs]')) as HTMLElement[];
  
  allElements.forEach((otherEl) => {
    if (otherEl === element) return;

    const otherRect = otherEl.getBoundingClientRect();

    // Check vertical alignment
    if (Math.abs(rect.left - otherRect.left) < distance) {
      createGuide(container, 'vertical', otherRect.left);
    }
    if (Math.abs(rect.right - otherRect.right) < distance) {
      createGuide(container, 'vertical', otherRect.right);
    }
    if (Math.abs(rect.top - otherRect.top) < distance) {
      createGuide(container, 'horizontal', otherRect.top);
    }
    if (Math.abs(rect.bottom - otherRect.bottom) < distance) {
      createGuide(container, 'horizontal', otherRect.bottom);
    }
  });
}

function createGuide(container: HTMLElement, type: 'vertical' | 'horizontal', position: number) {
  const guide = document.createElement('div');
  guide.className = type === 'vertical' ? 'snap-guide-vertical' : 'snap-guide-horizontal';
  
  if (type === 'vertical') {
    guide.style.left = `${position}px`;
  } else {
    guide.style.top = `${position}px`;
  }

  container.appendChild(guide);

  // Auto-hide after 1 second
  setTimeout(() => guide.remove(), 1000);
}
```

---

### 4. SHORTCUTS HELP PANEL

#### 4.1 Keyboard Shortcuts Help
```tsx
// File: apps/page-builder/app/components/page-builder/ShortcutsHelp.tsx (new)

export function ShortcutsHelpPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shortcuts = [
    { keys: ['Ctrl', 'Z'], action: 'পূর্ববর্তী পদক্ষেপ' },
    { keys: ['Ctrl', 'Y'], action: 'পরবর্তী পদক্ষেপ' },
    { keys: ['Ctrl', 'C'], action: 'কপি করুন' },
    { keys: ['Ctrl', 'V'], action: 'পেস্ট করুন' },
    { keys: ['Ctrl', 'X'], action: 'কাট করুন' },
    { keys: ['Delete'], action: 'ডিলিট করুন' },
    { keys: ['Ctrl', 'D'], action: 'ডুপ্লিকেট করুন' },
    { keys: ['Ctrl', 'Shift', 'C'], action: 'স্টাইল কপি করুন' },
    { keys: ['Ctrl', 'Shift', 'V'], action: 'স্টাইল পেস্ট করুন' },
    { keys: ['Escape'], action: 'নির্বাচন সরান' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">কীবোর্ড শর্টকাট</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex gap-1">
                  {shortcut.keys.map((key, keyIdx) => (
                    <span key={keyIdx}>
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                        {key}
                      </kbd>
                      {keyIdx < shortcut.keys.length - 1 && <span className="mx-1">+</span>}
                    </span>
                  ))}
                </div>
                <span className="text-gray-600 text-sm">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📋 TASK BREAKDOWN

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Shortcuts manager implementation | Dev | 1 day | ⬜ |
| Context menu enhancement | Dev | 1 day | ⬜ |
| Snap guides system | Dev | 1 day | ⬜ |
| Shortcuts help panel | Dev | 0.5 days | ⬜ |
| Testing all features | QA | 1 day | ⬜ |
| Documentation | Dev | 0.5 days | ⬜ |

---

## ✅ DEFINITION OF DONE

- [ ] All keyboard shortcuts working
- [ ] Context menu with all actions
- [ ] Drag snap guides visible
- [ ] Copy/paste styles functional
- [ ] Component duplication working
- [ ] Shortcuts help accessible
- [ ] Unit tests > 80% coverage
- [ ] Cross-browser tested
- [ ] No performance impact
- [ ] Documentation complete

---

**Next**: After Phase 4 approval, proceed to PHASE_5_BLOCKS.md

