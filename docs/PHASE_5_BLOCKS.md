# PHASE 5: REUSABLE BLOCKS SYSTEM - DETAILED SPECIFICATIONS

> **Duration**: 2 weeks  
> **Priority**: P2 - Medium  
> **Status**: Planning  
> **Depends on**: Phase 1-3 Complete  
> **Assigned to**: Senior Frontend Engineer  

---

## 🎯 PHASE OBJECTIVES

1. Implement **"Save as Block" functionality** for custom sections
2. Create **Saved Blocks Library** UI in sidebar
3. Implement **block categorization and search**
4. Add **block preview thumbnails**
5. Enable **block deletion and management**

---

## 📊 PHASE SCOPE

### In Scope ✅
- Save custom sections as reusable blocks
- Library management (CRUD operations)
- Block categories (Hero, Features, CTA, etc.)
- Block search/filter
- Block preview thumbnails
- Block insertion from library
- Block deletion with confirmation

### Out of Scope ❌
- Sharing blocks between stores (future)
- Block versioning (Phase 6)
- Advanced templating (future)

---

## 🏗️ ARCHITECTURE DESIGN

### Block Storage

```
Database: saved_blocks table

saved_blocks
├── id (UUID)
├── storeId (FK)
├── name (string) - "Hero with Split Layout"
├── category (string) - "hero", "features", "cta"
├── description (string)
├── content (JSON) - Full GrapesJS component JSON
├── thumbnail (string) - URL to preview image
├── tags (JSON) - ["hero", "modern", "gradient"]
├── usageCount (int) - How many times used
├── createdAt (timestamp)
├── updatedAt (timestamp)
└── deletedAt (timestamp) - Soft delete
```

### UI Flow

```
Sidebar
├── [Widgets] [Structure] [Saved Blocks] [Design]
└── Saved Blocks Tab
    ├── Search bar: "Search blocks..."
    ├── Category filter
    │  ├── All (12)
    │  ├── Hero (3)
    │  ├── Features (4)
    │  ├── CTA (3)
    │  └── Other (2)
    └── Grid of saved blocks
       ├── Block Card
       │  ├── Thumbnail image
       │  ├── Block name
       │  ├── Category tag
       │  ├── Used X times
       │  ├── [Insert] button
       │  └── [Delete] button
       └── ... more cards
```

---

## 🔧 IMPLEMENTATION DETAILS

### 1. DATABASE SCHEMA

```typescript
// File: db/migrations/0064_saved_blocks.sql

CREATE TABLE saved_blocks (
  id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  
  -- Block metadata
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hero', 'features', 'cta', 'testimonials', 'footer'
  description TEXT,
  
  -- Content
  content TEXT NOT NULL, -- Full GrapesJS JSON
  thumbnail TEXT, -- Screenshot URL
  
  -- Organization
  tags TEXT, -- JSON array: ["hero", "modern", "gradient"]
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  
  -- Indexes
  UNIQUE (store_id, name),
  INDEX idx_store_category (store_id, category),
  INDEX idx_store_tags (store_id)
);
```

### 2. BACKEND API

#### 2.1 Save Block Endpoint
```typescript
// File: app/routes/api.page-builder.save-block.ts

import { json, type ActionFunction } from '@remix-run/cloudflare';
import { z } from 'zod';
import { db } from '~/lib/db.server';
import { requireStore } from '~/lib/auth.server';
import { generateId } from '~/lib/utils';

const SaveBlockSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['hero', 'features', 'cta', 'testimonials', 'footer', 'other']),
  description: z.string().max(500).optional(),
  content: z.string(), // JSON string of GrapesJS component
  tags: z.array(z.string()).optional(),
});

export const action: ActionFunction = async ({ request, context }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const store = await requireStore(request, context);
  const body = await request.json();
  
  const validated = SaveBlockSchema.parse(body);

  // Generate thumbnail (screenshot of the block)
  const thumbnail = await generateBlockThumbnail(validated.content);

  // Save to database
  const blockId = generateId();
  
  await db.insert(savedBlocks).values({
    id: blockId,
    storeId: store.id,
    name: validated.name,
    category: validated.category,
    description: validated.description || null,
    content: validated.content,
    thumbnail: thumbnail,
    tags: JSON.stringify(validated.tags || []),
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return json({ 
    success: true, 
    blockId,
    message: `ব্লক "${validated.name}" সেভ হয়েছে` 
  });
};

// Helper to generate thumbnail (server-side screenshot)
async function generateBlockThumbnail(content: string): Promise<string> {
  // TODO: Implement Playwright screenshot capture
  // For now, return placeholder
  return 'https://via.placeholder.com/300x200';
}
```

#### 2.2 Get Saved Blocks
```typescript
// File: app/routes/api.page-builder.blocks.ts

import { json, type LoaderFunction } from '@remix-run/cloudflare';
import { db } from '~/lib/db.server';
import { requireStore } from '~/lib/auth.server';

export const loader: LoaderFunction = async ({ request, context }) => {
  const store = await requireStore(request, context);
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  let query = db.select()
    .from(savedBlocks)
    .where(eq(savedBlocks.storeId, store.id))
    .where(isNull(savedBlocks.deletedAt));

  if (category && category !== 'all') {
    query = query.where(eq(savedBlocks.category, category));
  }

  const blocks = await query.orderBy(desc(savedBlocks.createdAt));

  // Client-side search filtering if needed
  let filtered = blocks;
  if (search) {
    filtered = blocks.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return json({ blocks: filtered });
};
```

#### 2.3 Delete Block
```typescript
// File: app/routes/api.page-builder.blocks.$id.delete.ts

import { json, type ActionFunction } from '@remix-run/cloudflare';
import { db } from '~/lib/db.server';
import { requireStore } from '~/lib/auth.server';
import { eq } from 'drizzle-orm';

export const action: ActionFunction = async ({ request, context, params }) => {
  if (request.method !== 'DELETE') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const store = await requireStore(request, context);
  const { id } = params;

  // Soft delete
  await db.update(savedBlocks)
    .set({ deletedAt: new Date() })
    .where(eq(savedBlocks.id, id))
    .where(eq(savedBlocks.storeId, store.id));

  return json({ success: true });
};
```

---

### 3. FRONTEND - SAVED BLOCKS PANEL

#### 3.1 Saved Blocks Component
```tsx
// File: apps/page-builder/app/components/page-builder/SavedBlocksPanel.tsx

import { useState, useEffect } from 'react';
import { Trash2, Plus, Search, Loader2 } from 'lucide-react';

interface SavedBlock {
  id: string;
  name: string;
  category: string;
  description?: string;
  thumbnail: string;
  usageCount: number;
  tags: string[];
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hero', label: 'Hero' },
  { id: 'features', label: 'Features' },
  { id: 'cta', label: 'CTA' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'footer', label: 'Footer' },
  { id: 'other', label: 'Other' },
];

export function SavedBlocksPanel({ editor }: { editor: any }) {
  const [blocks, setBlocks] = useState<SavedBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load saved blocks on mount
  useEffect(() => {
    loadBlocks();
  }, [selectedCategory, searchQuery]);

  const loadBlocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/page-builder/blocks?${params}`);
      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertBlock = (block: SavedBlock) => {
    try {
      const content = JSON.parse(block.content);
      editor.addComponents(content);
      
      // Increment usage count
      fetch(`/api/page-builder/blocks/${block.id}/use`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to insert block:', error);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('এই ব্লকটি ডিলিট করতে চান?')) return;

    setDeleting(blockId);
    try {
      const response = await fetch(`/api/page-builder/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlocks(blocks.filter(b => b.id !== blockId));
      }
    } finally {
      setDeleting(null);
    }
  };

  const filteredBlocks = blocks.filter(block => {
    if (searchQuery) {
      return (
        block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search & Filter */}
      <div className="p-3 border-b space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ব্লক খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition
                ${selectedCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            লোড হচ্ছে...
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Plus size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">কোনো সেভ করা ব্লক নেই</p>
            <p className="text-xs mt-1">কাস্টম সেকশন তৈরি করে সেভ করুন</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredBlocks.map(block => (
              <div
                key={block.id}
                className="group border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer bg-gray-50"
              >
                {/* Thumbnail */}
                <div className="w-full h-24 bg-gray-200 overflow-hidden relative">
                  <img
                    src={block.thumbnail}
                    alt={block.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* Info */}
                <div className="p-2">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {block.name}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">
                    ব্যবহৃত: {block.usageCount} বার
                  </p>

                  {/* Tags */}
                  {block.tags.length > 0 && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {block.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {block.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{block.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInsertBlock(block)}
                      className="flex-1 px-2 py-1 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition"
                    >
                      যোগ করুন
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      disabled={deleting === block.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition disabled:opacity-50"
                    >
                      {deleting === block.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 4. SAVE BLOCK DIALOG

#### 4.1 Save Block Modal
```tsx
// File: apps/page-builder/app/components/page-builder/SaveBlockModal.tsx

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SaveBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  selectedComponent: any;
}

const CATEGORIES = [
  { value: 'hero', label: 'Hero' },
  { value: 'features', label: 'Features' },
  { value: 'cta', label: 'CTA / Call to Action' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'footer', label: 'Footer' },
  { value: 'other', label: 'Other' },
];

export function SaveBlockModal({
  isOpen,
  onClose,
  onSave,
  selectedComponent,
}: SaveBlockModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('hero');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('ব্লকের নাম দিন');
      return;
    }

    setSaving(true);
    try {
      const blockContent = selectedComponent.toJSON();

      await onSave({
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        content: JSON.stringify(blockContent),
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      });

      toast.success(`"${name}" সফলভাবে সেভ হয়েছে`);
      onClose();
      setName('');
      setDescription('');
      setTags('');
    } catch (error) {
      toast.error('ব্লক সেভ করতে ব্যর্থ হয়েছে');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">ব্লক সেভ করুন</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              ব্লকের নাম *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="যেমন: আধুনিক হিরো সেকশন"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1">ক্যাটাগরি</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              বর্ণনা
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="এই ব্লক কিসের জন্য ব্যবহার করা যায়..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              ট্যাগ (কমা দিয়ে আলাদা করুন)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="আধুনিক, গ্রেডিয়েন্ট, অ্যানিমেশন"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              বাতিল করুন
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  সেভ হচ্ছে...
                </>
              ) : (
                'সেভ করুন'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 📋 TASK BREAKDOWN

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Database schema & migration | Dev | 0.5 days | ⬜ |
| Backend API endpoints | Dev | 1.5 days | ⬜ |
| SaveBlockModal component | Dev | 1 day | ⬜ |
| SavedBlocksPanel component | Dev | 1 day | ⬜ |
| Integration with editor | Dev | 1 day | ⬜ |
| Testing & refinement | QA | 1 day | ⬜ |
| Documentation | Dev | 0.5 days | ⬜ |

---

## ✅ DEFINITION OF DONE

- [ ] Save Block dialog working
- [ ] Blocks saved to database
- [ ] Saved Blocks panel accessible
- [ ] Search and filter working
- [ ] Block insertion functional
- [ ] Block deletion with confirmation
- [ ] Thumbnail generation working
- [ ] Usage counting functional
- [ ] Unit tests > 80% coverage
- [ ] Database migrations tested
- [ ] Documentation complete

---

**Next**: After Phase 5 approval, proceed to PHASE_6_HISTORY.md

