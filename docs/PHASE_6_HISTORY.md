# PHASE 6: HISTORY & REVISIONS - DETAILED SPECIFICATIONS

> **Duration**: 1 week (unchanged)  
> **Priority**: P3 - Low  
> **Status**: ⬜ PENDING  
> **Depends on**: Phase 1 ✅, Phase 2-5  
> **Assigned to**: Frontend Engineer  

---

## ⚠️ REALITY CHECK UPDATE

This feature is **actually missing** from the current system. No changes to scope.

### ❌ Does Not Exist
- ❌ Revision tracking in database
- ❌ Auto-save revisions
- ❌ History panel UI
- ❌ Restore to previous version

**Effort**: 1 week (no change)  

---

## 🎯 PHASE OBJECTIVES

1. Implement **revision history tracking** for all page edits
2. Create **revision comparison view** (before/after)
3. Add **revision restore functionality**
4. Implement **auto-save with versioning**
5. Create **revision history UI panel**

---

## 📊 PHASE SCOPE

### In Scope ✅
- Store page revisions on every significant change
- Show revision timeline
- Compare two revisions (diff view)
- Restore to any previous revision
- Show who made changes and when
- Auto-prune old revisions (keep last 50)

### Out of Scope ❌
- Collaboration/multi-user revisions (future)
- Revision branching (future)
- Detailed diff visualization (future)

---

## 🏗️ ARCHITECTURE DESIGN

### Revision Storage

```
Database: page_revisions table

page_revisions
├── id (UUID)
├── pageId (FK)
├── storeId (FK)
├── content (JSON) - Full page content snapshot
├── changeType (enum) - 'auto_save' | 'manual_save' | 'publish'
├── description (string) - User's description
├── createdBy (userId) - Who made the change
├── createdAt (timestamp)
└── notes (string) - Auto-generated: "Updated 3 elements"
```

### UI Flow

```
Page Editor
├── [Toolbar: Save] [History button]
└── History Panel (Modal/Sidebar)
    ├── Timeline View
    │  ├── [Now]
    │  │  ├── Just now
    │  │  └── Current state
    │  ├── [5 mins ago]
    │  │  ├── Auto-save
    │  │  ├── Changed hero section
    │  │  └── [Restore] [Compare]
    │  ├── [2 hours ago]
    │  │  ├── Manual save
    │  │  ├── "Updated product details"
    │  │  └── [Restore] [Compare]
    │  └── [Yesterday]
    │      ├── Published
    │      ├── "Launch version"
    │      └── [Restore]
    │
    └── Compare View (when comparing 2 revisions)
       ├── Left: Revision A
       ├── Slider (to compare)
       └── Right: Revision B
```

---

## 🔧 IMPLEMENTATION DETAILS

### 1. DATABASE SCHEMA

```typescript
// File: db/migrations/0065_page_revisions.sql

CREATE TABLE page_revisions (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL, -- Full JSON snapshot
  change_type TEXT NOT NULL DEFAULT 'auto_save', -- 'auto_save', 'manual_save', 'publish'
  description TEXT, -- User-provided description
  
  -- Metadata
  created_by INTEGER, -- User who made the change
  change_summary TEXT, -- Auto-generated: "Modified 3 sections"
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_page_created (page_id, created_at DESC),
  INDEX idx_store_created (store_id, created_at DESC)
);

-- Add column to builder_pages to track current revision
ALTER TABLE builder_pages ADD COLUMN current_revision_id TEXT REFERENCES page_revisions(id);
```

### 2. BACKEND API

#### 2.1 Create Revision
```typescript
// File: app/routes/api.page-builder.revisions.ts

import { json, type ActionFunction } from '@remix-run/cloudflare';
import { z } from 'zod';
import { db } from '~/lib/db.server';
import { requireStore } from '~/lib/auth.server';
import { generateId } from '~/lib/utils';

const CreateRevisionSchema = z.object({
  pageId: z.string(),
  content: z.string(), // JSON string
  changeType: z.enum(['auto_save', 'manual_save', 'publish']),
  description: z.string().optional(),
});

export const action: ActionFunction = async ({ request, context }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const store = await requireStore(request, context);
  const body = await request.json();
  
  const validated = CreateRevisionSchema.parse(body);

  // Verify page belongs to store
  const page = await db.query.builderPages.findFirst({
    where: (t) => and(eq(t.id, validated.pageId), eq(t.storeId, store.id)),
  });

  if (!page) {
    return json({ error: 'Page not found' }, { status: 404 });
  }

  // Generate change summary
  const changeSummary = generateChangeSummary(page.content, validated.content);

  // Create revision
  const revisionId = generateId();
  
  await db.insert(pageRevisions).values({
    id: revisionId,
    pageId: validated.pageId,
    storeId: store.id,
    content: validated.content,
    changeType: validated.changeType,
    description: validated.description || null,
    createdBy: store.userId,
    changeSummary,
    createdAt: new Date(),
  });

  // Update page's current revision
  await db.update(builderPages)
    .set({ currentRevisionId: revisionId, updatedAt: new Date() })
    .where(eq(builderPages.id, validated.pageId));

  // Prune old revisions (keep only last 50)
  await pruneRevisions(validated.pageId);

  return json({ 
    success: true, 
    revisionId,
  });
};

function generateChangeSummary(oldContent: string, newContent: string): string {
  try {
    const oldObj = JSON.parse(oldContent);
    const newObj = JSON.parse(newContent);
    
    // Count differences (simplified)
    let changes = 0;
    // TODO: Implement proper diff counting
    
    return `Modified ${changes} element(s)`;
  } catch {
    return 'Content updated';
  }
}

async function pruneRevisions(pageId: string) {
  // Keep only last 50 revisions per page
  const revisions = await db
    .select()
    .from(pageRevisions)
    .where(eq(pageRevisions.pageId, pageId))
    .orderBy(desc(pageRevisions.createdAt))
    .limit(51);

  if (revisions.length > 50) {
    const toDelete = revisions.slice(50);
    await db.delete(pageRevisions)
      .where(inArray(pageRevisions.id, toDelete.map(r => r.id)));
  }
}
```

#### 2.2 Get Revisions
```typescript
// File: app/routes/api.page-builder.revisions.ts (GET)

export const loader: LoaderFunction = async ({ request, context, params }) => {
  const store = await requireStore(request, context);
  const { pageId } = params;

  // Verify page belongs to store
  const page = await db.query.builderPages.findFirst({
    where: (t) => and(eq(t.id, pageId), eq(t.storeId, store.id)),
  });

  if (!page) {
    return json({ error: 'Page not found' }, { status: 404 });
  }

  // Get revisions (last 50)
  const revisions = await db
    .select()
    .from(pageRevisions)
    .where(eq(pageRevisions.pageId, pageId))
    .orderBy(desc(pageRevisions.createdAt))
    .limit(50);

  return json({ revisions });
};
```

#### 2.3 Restore Revision
```typescript
// File: api.page-builder.revisions.$id.restore.ts

export const action: ActionFunction = async ({ request, context, params }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const store = await requireStore(request, context);
  const { id: revisionId } = params;

  // Get revision
  const revision = await db.query.pageRevisions.findFirst({
    where: (t) => and(
      eq(t.id, revisionId),
      eq(t.storeId, store.id)
    ),
  });

  if (!revision) {
    return json({ error: 'Revision not found' }, { status: 404 });
  }

  // Create new revision (from restored content)
  const newRevisionId = generateId();
  
  await db.insert(pageRevisions).values({
    id: newRevisionId,
    pageId: revision.pageId,
    storeId: store.id,
    content: revision.content,
    changeType: 'manual_save',
    description: `Restored to "${formatDate(revision.createdAt)}"`,
    createdBy: store.userId,
    changeSummary: 'Restored from previous version',
    createdAt: new Date(),
  });

  // Update page
  await db.update(builderPages)
    .set({ currentRevisionId: newRevisionId, updatedAt: new Date() })
    .where(eq(builderPages.id, revision.pageId));

  return json({ 
    success: true,
    revisionId: newRevisionId,
  });
};
```

---

### 3. FRONTEND - HISTORY PANEL

#### 3.1 Revisions History Component
```tsx
// File: apps/page-builder/app/components/page-builder/RevisionHistory.tsx

import { useState, useEffect } from 'react';
import { X, Loader2, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { bn } from 'date-fns/locale'; // Bangla locale

interface Revision {
  id: string;
  changeType: 'auto_save' | 'manual_save' | 'publish';
  description?: string;
  changeSummary: string;
  createdAt: string;
}

interface RevisionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  onRestore: (revisionId: string) => void;
}

export function RevisionHistory({
  isOpen,
  onClose,
  pageId,
  onRestore,
}: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRevisions();
    }
  }, [isOpen, pageId]);

  const loadRevisions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/page-builder/revisions/${pageId}`);
      const data = await response.json();
      setRevisions(data.revisions || []);
    } catch (error) {
      console.error('Failed to load revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (revisionId: string) => {
    if (!confirm('এই সংস্করণে ফিরে যেতে চান?')) return;

    setRestoring(revisionId);
    try {
      const response = await fetch(
        `/api/page-builder/revisions/${revisionId}/restore`,
        { method: 'POST' }
      );

      if (response.ok) {
        onRestore(revisionId);
        onClose();
      }
    } finally {
      setRestoring(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">সংস্করণ ইতিহাস</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              লোড হচ্ছে...
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>কোনো সংস্করণ নেই</p>
            </div>
          ) : (
            <div className="divide-y">
              {revisions.map((revision, idx) => (
                <div
                  key={revision.id}
                  className="p-4 hover:bg-gray-50 transition"
                >
                  {/* Timeline marker */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                      {idx < revisions.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-300 my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {revision.description || 'নতুন সংস্করণ'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDistanceToNow(new Date(revision.createdAt), {
                              addSuffix: true,
                              locale: bn, // Bangla locale
                            })}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {revision.changeSummary}
                          </p>
                        </div>

                        {/* Badge */}
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                            revision.changeType === 'publish'
                              ? 'bg-green-100 text-green-700'
                              : revision.changeType === 'manual_save'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {revision.changeType === 'publish'
                            ? '📤 প্রকাশিত'
                            : revision.changeType === 'manual_save'
                            ? '💾 সংরক্ষিত'
                            : '⚡ স্বয়ংসংরক্ষণ'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setComparing(revision.id)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center gap-1"
                        >
                          <Eye size={12} />
                          দেখুন
                        </button>
                        <button
                          onClick={() => handleRestore(revision.id)}
                          disabled={restoring === revision.id}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center gap-1 disabled:opacity-50"
                        >
                          {restoring === revision.id ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              পুনরুদ্ধার হচ্ছে...
                            </>
                          ) : (
                            <>
                              <RotateCcw size={12} />
                              পুনরুদ্ধার করুন
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
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

#### 3.2 Add History Button to Toolbar
```tsx
// In Toolbar.tsx

<button
  onClick={() => setShowRevisionHistory(true)}
  className="p-2 rounded hover:bg-gray-100 transition"
  title="সংস্করণ ইতিহাস (Ctrl+H)"
>
  <Clock size={18} />
</button>

<RevisionHistory
  isOpen={showRevisionHistory}
  onClose={() => setShowRevisionHistory(false)}
  pageId={pageId}
  onRestore={() => {
    // Reload page content
    window.location.reload();
  }}
/>
```

---

### 4. AUTO-SAVE WITH VERSIONING

#### 4.1 Auto-Save Manager
```typescript
// File: apps/page-builder/app/lib/grapesjs/services/autoSaveManager.ts

export class AutoSaveManager {
  private editor: Editor;
  private saveInterval = 60000; // 1 minute
  private lastSavedContent: string | null = null;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(editor: Editor, private pageId: string) {
    this.editor = editor;
    this.startAutoSave();
  }

  private startAutoSave() {
    this.saveTimer = setInterval(() => {
      this.performAutoSave();
    }, this.saveInterval);
  }

  private async performAutoSave() {
    const currentContent = this.editor.getProjectData();
    const contentString = JSON.stringify(currentContent);

    // Only save if content changed
    if (contentString === this.lastSavedContent) {
      return;
    }

    try {
      await fetch('/api/page-builder/revisions', {
        method: 'POST',
        body: JSON.stringify({
          pageId: this.pageId,
          content: contentString,
          changeType: 'auto_save',
        }),
      });

      this.lastSavedContent = contentString;
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  async manualSave(description?: string) {
    const currentContent = this.editor.getProjectData();
    const contentString = JSON.stringify(currentContent);

    return fetch('/api/page-builder/revisions', {
      method: 'POST',
      body: JSON.stringify({
        pageId: this.pageId,
        content: contentString,
        changeType: 'manual_save',
        description,
      }),
    });
  }

  destroy() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }
  }
}
```

---

## 📋 TASK BREAKDOWN

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Database schema | Dev | 0.5 days | ⬜ |
| Backend API endpoints | Dev | 1.5 days | ⬜ |
| Auto-save manager | Dev | 1 day | ⬜ |
| Revision history UI | Dev | 1 day | ⬜ |
| Integration with editor | Dev | 0.5 days | ⬜ |
| Testing | QA | 1 day | ⬜ |
| Documentation | Dev | 0.5 days | ⬜ |

---

## ✅ DEFINITION OF DONE

- [ ] Revisions saved on changes
- [ ] Revision history accessible
- [ ] Restore functionality working
- [ ] Auto-save running every minute
- [ ] Old revisions pruned (keep 50)
- [ ] Unit tests > 80% coverage
- [ ] Database migrations tested
- [ ] Documentation complete

---

**Phase 6 Complete** - All phases finished!

