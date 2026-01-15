# 🛠️ GrapeJS + AI Integration Complete Rebuild Guide

## Lovable-Style AI Page Builder System

---

## 🎯 Current Problem Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    সমস্যাগুলো চিহ্নিত করা                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ❌ CURRENT ISSUES:                                             │
│                                                                 │
│  1. Button Select → AI Deletes → Creates New Section           │
│     (AI doesn't understand "edit in place")                    │
│                                                                 │
│  2. AI modifies unselected elements                            │
│     (No context isolation)                                     │
│                                                                 │
│  3. AI creates new structures instead of editing               │
│     (Wrong action type)                                        │
│                                                                 │
│  4. No proper element targeting                                │
│     (Missing component ID tracking)                            │
│                                                                 │
│  ✅ WHAT WE NEED:                                               │
│                                                                 │
│  • AI should ONLY modify selected element                      │
│  • Preserve parent/sibling structure                           │
│  • In-place editing, not replacement                           │
│  • Strict action boundaries                                    │
│  • Lovable-style sidebar interface                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    SYSTEM ARCHITECTURE                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      FRONTEND                           │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                                 │    │   │
│  │  │  ┌─────────────────────┐ ┌──────────────────┐  │    │   │
│  │  │  │                     │ │                  │  │    │   │
│  │  │  │    GRAPEJS CANVAS   │ │   AI SIDEBAR     │  │    │   │
│  │  │  │                     │ │                  │  │    │   │
│  │  │  │  • Component Tree   │ │  • Chat UI       │  │    │   │
│  │  │  │  • Selection State  │ │  • Context View  │  │    │   │
│  │  │  │  • Edit Events      │ │  • Action Queue  │  │    │   │
│  │  │  │                     │ │                  │  │    │   │
│  │  │  └──────────┬──────────┘ └────────┬─────────┘  │    │   │
│  │  │             │                     │            │    │   │
│  │  │             └──────────┬──────────┘            │    │   │
│  │  │                        │                       │    │   │
│  │  │             ┌──────────▼──────────┐            │    │   │
│  │  │             │  CONTEXT MANAGER    │            │    │   │
│  │  │             │  • Selected Element │            │    │   │
│  │  │             │  • Element Metadata │            │    │   │
│  │  │             │  • Parent Structure │            │    │   │
│  │  │             └──────────┬──────────┘            │    │   │
│  │  │                        │                       │    │   │
│  │  └────────────────────────┼───────────────────────┘    │   │
│  │                           │                            │   │
│  └───────────────────────────┼────────────────────────────┘   │
│                              │                                 │
│  ┌───────────────────────────▼────────────────────────────┐   │
│  │                      BACKEND                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              AI PROCESSING LAYER                │   │   │
│  │  │                                                 │   │   │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │   │   │
│  │  │  │   Context   │ │   Action    │ │  Output   │ │   │   │
│  │  │  │   Parser    │→│  Validator  │→│ Generator │ │   │   │
│  │  │  └─────────────┘ └─────────────┘ └───────────┘ │   │   │
│  │  │                                                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
app/
├── lib/
│   └── grapesjs/
│       ├── types/
│       │   ├── editor.types.ts       # SelectedComponent, ComponentType
│       │   ├── actions.types.ts      # AllowedAction, AIAction, AIResponse
│       │   └── ai.types.ts           # ChatMessage, AIRequest
│       │
│       └── services/
│           ├── contextBuilder.ts     # Serialize GrapeJS components
│           ├── actionValidator.ts    # Validate AI responses
│           └── actionExecutor.ts     # Safely apply changes
│
├── components/
│   └── page-builder/
│       ├── ai-sidebar/
│       │   ├── AISidebar.tsx         # Main sidebar container
│       │   ├── ContextDisplay.tsx    # Shows selected element
│       │   ├── SuggestionChips.tsx   # Quick actions
│       │   ├── ActionPreview.tsx     # Preview before apply
│       │   └── MessageBubble.tsx     # Chat message component
│       │
│       └── hooks/
│           ├── useSelection.ts       # Track GrapeJS selection
│           └── useAIChat.ts          # Manage conversation
│
└── routes/
    └── api/
        └── ai/
            └── action.ts             # Updated AI endpoint
```

---

## 📝 MASTER SYSTEM PROMPT (Backend AI)

```markdown
# GrapeJS AI Editor System Prompt

You are an AI assistant integrated into a GrapeJS-based page builder.
Your ONLY job is to modify the SELECTED element based on user commands.

## CRITICAL RULES (NEVER VIOLATE):

### Rule 1: ONLY MODIFY SELECTED ELEMENT

- You will receive a `selectedComponent` object with the element's current state
- You can ONLY modify THIS element, nothing else
- NEVER create new sections, rows, or parent containers
- NEVER delete sibling elements
- NEVER modify parent elements

### Rule 2: PRESERVE STRUCTURE

- Keep the element in its current position in the DOM
- Keep the element's ID/data-gjs-id intact
- Keep parent-child relationships unchanged
- Only modify: content, styles, attributes of the SELECTED element

### Rule 3: RETURN SPECIFIC MODIFICATIONS

- Return a JSON object with ONLY the changes needed
- Use specific action types (see below)
- Never return full HTML replacements
- Use incremental updates

### Rule 4: ALLOWED VS FORBIDDEN ACTIONS

ALLOWED ACTIONS:
✅ updateContent - Change text/innerHTML
✅ updateStyles - Modify CSS styles
✅ updateAttributes - Change HTML attributes
✅ addClass - Add CSS class
✅ removeClass - Remove CSS class
✅ updateSrc - Change image/video source
✅ updateHref - Change link destination

FORBIDDEN ACTIONS:
❌ deleteElement - Cannot delete selected element
❌ createSection - Cannot create new sections
❌ moveElement - Cannot move element to different parent
❌ replaceElement - Cannot replace with new element
❌ modifyParent - Cannot touch parent element
❌ modifySibling - Cannot touch sibling elements

## INPUT FORMAT:

You will receive:
\`\`\`json
{
"selectedComponent": {
"id": "component-abc123",
"type": "button",
"tagName": "button",
"content": "Click Me",
"styles": {
"background-color": "#3b82f6",
"color": "#ffffff",
"padding": "12px 24px"
},
"attributes": {
"class": "btn btn-primary",
"data-gjs-id": "abc123"
},
"parentId": "section-xyz",
"position": 2
},
"userCommand": "Make this button green and bigger",
"context": {
"pageTheme": "dark",
"brandColors": ["#006A4E", "#8B5CF6"]
}
}
\`\`\`

## OUTPUT FORMAT:

Return ONLY this JSON structure:
\`\`\`json
{
"action": "updateStyles",
"targetId": "component-abc123",
"changes": {
"styles": {
"background-color": "#006A4E",
"padding": "16px 32px",
"font-size": "18px"
}
},
"explanation": "Changed button color to green and increased size"
}
\`\`\`

## MULTI-ACTION FORMAT (if needed):

\`\`\`json
{
"actions": [
{
"action": "updateContent",
"targetId": "component-abc123",
"changes": {
"content": "Get Started Now"
}
},
{
"action": "updateStyles",
"targetId": "component-abc123",
"changes": {
"styles": {
"background-color": "#006A4E"
}
}
}
],
"explanation": "Updated button text and color"
}
\`\`\`

## EXAMPLES:

### Example 1: User selects a button, says "make it red"

INPUT:

- Selected: Button with blue background
- Command: "make it red"

OUTPUT:
\`\`\`json
{
"action": "updateStyles",
"targetId": "button-123",
"changes": {
"styles": {
"background-color": "#ef4444"
}
},
"explanation": "Changed button background to red"
}
\`\`\`

❌ WRONG OUTPUT (what you must NOT do):
\`\`\`json
{
"action": "replaceSection",
"newHtml": "<section><button style='background:red'>...</button></section>"
}
\`\`\`

### Example 2: User selects text, says "make it bigger and bold"

OUTPUT:
\`\`\`json
{
"action": "updateStyles",
"targetId": "text-456",
"changes": {
"styles": {
"font-size": "24px",
"font-weight": "700"
}
}
}
\`\`\`

## ELEMENT TYPE SPECIFIC RULES:

### BUTTON:

- Can modify: text, colors, size, border, shadow, hover states
- Cannot: move position, delete, create duplicate

### TEXT/HEADING:

- Can modify: content, font, size, color, alignment
- Cannot: change tag type (h1→h2), create new paragraphs

### IMAGE:

- Can modify: src, alt, size, border, shadow
- Cannot: change to video, delete, move

### SECTION:

- Can modify: background, padding, margin
- Cannot: delete children, add new children, move

## VALIDATION BEFORE RESPONSE:

Before generating response, verify:

1. ✓ Am I only modifying the selected element?
2. ✓ Am I preserving the targetId?
3. ✓ Am I using only allowed actions?
4. ✓ Am I not creating new parent structures?
5. ✓ Am I not deleting anything?

If any answer is NO, regenerate the response.
```

---

## 📝 Core TypeScript Types

### types/editor.types.ts

```typescript
export interface SelectedComponent {
  id: string;
  type: ComponentType;
  tagName: string;
  content: string;
  styles: Record<string, string>;
  attributes: Record<string, string>;
  classes: string[];
  parentId: string | null;
  parentType: string | null;
  siblingCount: number;
  position: number;
  children?: SelectedComponent[];
  isContainer: boolean;
}

export type ComponentType =
  | "text"
  | "heading"
  | "button"
  | "image"
  | "video"
  | "link"
  | "section"
  | "container"
  | "row"
  | "column"
  | "form"
  | "input"
  | "wrapper"
  | "custom";

export interface SelectionContext {
  selectedComponent: SelectedComponent;
  pageTheme: "light" | "dark";
  brandColors: string[];
  availableFonts: string[];
  pageId: string;
  userId: string;
}
```

### types/actions.types.ts

```typescript
export type AllowedAction =
  | "updateContent"
  | "updateStyles"
  | "updateAttributes"
  | "addClass"
  | "removeClass"
  | "updateSrc"
  | "updateHref"
  | "updateAlt";

export type ForbiddenAction =
  | "deleteElement"
  | "createSection"
  | "moveElement"
  | "replaceElement"
  | "modifyParent"
  | "modifySibling"
  | "createNewElement";

export interface AIAction {
  action: AllowedAction;
  targetId: string;
  changes: {
    content?: string;
    styles?: Record<string, string>;
    attributes?: Record<string, string>;
    addClass?: string[];
    removeClass?: string[];
  };
}

export interface AIResponse {
  success: boolean;
  actions: AIAction[];
  explanation: string;
  needsUserInput?: boolean;
  prompt?: string;
  error?: string;
}
```

### types/ai.types.ts

```typescript
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  context?: {
    selectedElementId: string;
    selectedElementType: ComponentType;
  };
  actions?: AIAction[];
  status: "pending" | "success" | "error";
}

export interface AIRequest {
  selectedComponent: SelectedComponent;
  userCommand: string;
  context: SelectionContext;
  conversationHistory: ChatMessage[];
}
```

---

## 📝 Context Builder Service

```typescript
// services/contextBuilder.ts

export class ContextBuilder {
  private editor: any;

  constructor(editor: any) {
    this.editor = editor;
  }

  buildContext(selectedComponent: any): SelectionContext {
    const serialized = this.serializeComponent(selectedComponent);

    return {
      selectedComponent: serialized,
      pageTheme: this.detectTheme(),
      brandColors: this.extractBrandColors(),
      availableFonts: this.getAvailableFonts(),
      pageId: this.editor.getConfig().pageId,
      userId: this.editor.getConfig().userId,
    };
  }

  private serializeComponent(component: any): SelectedComponent {
    const styles = component.getStyle();
    const attributes = component.getAttributes();
    const classes = component.getClasses().map((c: any) => c.id || c);
    const parent = component.parent();

    return {
      id: component.getId(),
      type: this.detectComponentType(component),
      tagName: component.get("tagName") || "div",
      content: component.get("content") || this.getInnerContent(component),
      styles: this.cleanStyles(styles),
      attributes: this.cleanAttributes(attributes),
      classes,
      parentId: parent ? parent.getId() : null,
      parentType: parent ? this.detectComponentType(parent) : null,
      siblingCount: parent ? parent.components().length : 0,
      position: this.getPositionInParent(component),
      isContainer: this.isContainerType(component),
    };
  }

  private detectComponentType(component: any): ComponentType {
    const type = component.get("type");
    const tagName = component.get("tagName")?.toLowerCase();

    if (type === "text") return "text";
    if (type === "image") return "image";
    if (tagName === "button") return "button";
    if (tagName === "a") return "link";
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tagName))
      return "heading";
    if (tagName === "p" || tagName === "span") return "text";
    if (tagName === "section") return "section";
    if (component.components().length > 0) return "container";

    return "wrapper";
  }
  // ... more methods
}
```

---

## 📝 Action Validator Service

```typescript
// services/actionValidator.ts

const ALLOWED_ACTIONS: AllowedAction[] = [
  "updateContent",
  "updateStyles",
  "updateAttributes",
  "addClass",
  "removeClass",
  "updateSrc",
  "updateHref",
];

export class ActionValidator {
  private selectedComponentId: string;

  constructor(selectedComponentId: string) {
    this.selectedComponentId = selectedComponentId;
  }

  validate(response: AIResponse): ValidationResult {
    const errors: string[] = [];
    const sanitizedActions: AIAction[] = [];

    for (const action of response.actions) {
      // Check 1: Action type is allowed
      if (!ALLOWED_ACTIONS.includes(action.action)) {
        errors.push(`Forbidden action type: ${action.action}`);
        continue;
      }

      // Check 2: Target ID matches selected component
      if (action.targetId !== this.selectedComponentId) {
        errors.push(`Wrong target: Expected ${this.selectedComponentId}`);
        continue;
      }

      sanitizedActions.push(action);
    }

    return {
      valid: errors.length === 0 && sanitizedActions.length > 0,
      errors,
      sanitizedResponse: { ...response, actions: sanitizedActions },
    };
  }
}
```

---

## 📝 Action Executor Service

```typescript
// services/actionExecutor.ts

export class ActionExecutor {
  private editor: any;
  private undoStack: UndoItem[] = [];

  constructor(editor: any) {
    this.editor = editor;
  }

  async execute(response: AIResponse): Promise<ExecutionResult> {
    const results: ActionResult[] = [];

    for (const action of response.actions) {
      const component = this.getComponent(action.targetId);
      if (!component) continue;

      // Store previous state for undo
      const previousState = this.captureState(component);
      this.undoStack.push({
        componentId: action.targetId,
        state: previousState,
      });

      try {
        await this.executeAction(component, action);
        results.push({ action, success: true });
      } catch (error) {
        results.push({ action, success: false, error: String(error) });
      }
    }

    return { success: results.every((r) => r.success), results };
  }

  private async executeAction(component: any, action: AIAction): Promise<void> {
    switch (action.action) {
      case "updateContent":
        component.set("content", action.changes.content);
        break;
      case "updateStyles":
        component.setStyle({
          ...component.getStyle(),
          ...action.changes.styles,
        });
        break;
      case "addClass":
        action.changes.addClass?.forEach((c) => component.addClass(c));
        break;
      // ... other actions
    }
  }

  undo(): boolean {
    const lastUndo = this.undoStack.pop();
    if (!lastUndo) return false;
    // Restore state...
    return true;
  }
}
```

---

## 🎨 Lovable-Style Sidebar Design

```
┌────────────────────────────────────┐
│  🤖 OZZYL AI          [◁ ✕]       │  ← Header
├────────────────────────────────────┤
│ Selected: 🔘 Button                │  ← Context Display
│ ├── Content: "Click Me"            │
│ ├── BG: ████ #3b82f6              │
│ └── Size: 14px                     │
├────────────────────────────────────┤
│                                    │
│ [Chat messages here...]            │  ← Messages
│                                    │
├────────────────────────────────────┤
│ 💡 Quick: [বড় করো] [রং বদলাও]     │  ← Suggestions
├────────────────────────────────────┤
│  [Type command...              ➤]  │  ← Input
└────────────────────────────────────┘
```

---

## ✅ Implementation Phases

### Phase 1: Types & Interfaces

Create TypeScript type definitions for the entire system.

### Phase 2: Services

Implement ContextBuilder, ActionValidator, and ActionExecutor.

### Phase 3: AI Sidebar Components

Build the Lovable-style sidebar UI components.

### Phase 4: Hooks

Create useSelection and useAIChat hooks.

### Phase 5: Backend API

Update the AI endpoint with the new strict system prompt.

### Phase 6: Integration

Integrate everything into Editor.tsx and test.

---

## ✅ Verification Checklist

- [ ] Button select → AI only modifies that button
- [ ] Text select → AI changes font/color only
- [ ] "Delete this" → AI refuses (shows error)
- [ ] "Add section" → AI refuses (shows error)
- [ ] Undo works after each action
- [ ] Preview before apply works
- [ ] History timeline shows all actions
