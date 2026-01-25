/**
 * Editor State Worker - Durable Objects for Live Page Builder State
 * 
 * Solves the lost changes problem:
 * Refresh ──► All unsaved changes lost 💀
 * 
 * Solution:
 * Every edit ──► Saved to DO ──► Survives refresh! ✅
 * 
 * ============================================================================
 * ARCHITECTURE
 * ============================================================================
 * 
 * DO ID Pattern: editor-{pageId}
 * - One DO per page being edited
 * - Undo/redo history in memory
 * - Auto-save drafts to SQLite
 * - Publish to D1 on save
 * 
 * FREE TIER COMPATIBLE:
 * - SQLite backend for persistence
 * - Efficient history management
 */

import { DurableObject } from "cloudflare:workers";

// ============================================================================
// CONSTANTS
// ============================================================================

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const CONFIG = {
  // Max history entries
  MAX_HISTORY_SIZE: 50,
  
  // Auto-save interval
  AUTO_SAVE_INTERVAL_MS: 30 * SECONDS,
  
  // Draft expiry (24 hours)
  DRAFT_EXPIRY_MS: 24 * 60 * MINUTES,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface Section {
  id: string;
  type: string;
  props: Record<string, unknown>;
  order: number;
}

interface EditorStateData {
  pageId: number;
  storeId: number;
  sections: Section[];
  title: string;
  slug: string;
  metadata: Record<string, unknown>;
  updatedAt: number;
  isDirty: boolean;
}

interface HistoryEntry {
  sections: Section[];
  timestamp: number;
  action: string;
}

interface UpdateSectionRequest {
  sectionId: string;
  props: Record<string, unknown>;
}

interface AddSectionRequest {
  type: string;
  props?: Record<string, unknown>;
  afterId?: string;
}

interface Env {
  EDITOR_STATE: DurableObjectNamespace<EditorStateDO>;
  DB: D1Database;
}

// ============================================================================
// EDITOR STATE DURABLE OBJECT
// ============================================================================

export class EditorStateDO extends DurableObject<Env> {
  private sql!: SqlStorage;
  private initialized = false;
  
  // Current state
  private pageId: number = 0;
  private storeId: number = 0;
  private sections: Section[] = [];
  private title: string = '';
  private slug: string = '';
  private metadata: Record<string, unknown> = {};
  private isDirty: boolean = false;
  
  // Undo/Redo history
  private history: HistoryEntry[] = [];
  private historyIndex: number = -1;
  
  // Auto-save
  private lastSave: number = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
  }

  private ensureInitialized() {
    if (this.initialized) return;
    
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS editor_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS sections (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        props TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      )
    `);
    
    // Load existing state
    this.loadFromStorage();
    
    this.initialized = true;
  }

  private loadFromStorage() {
    // Load metadata
    const meta = this.sql.exec(`SELECT key, value FROM editor_state`).toArray() as Array<{key: string; value: string}>;
    for (const row of meta) {
      switch (row.key) {
        case 'pageId': this.pageId = parseInt(row.value, 10); break;
        case 'storeId': this.storeId = parseInt(row.value, 10); break;
        case 'title': this.title = row.value; break;
        case 'slug': this.slug = row.value; break;
        case 'metadata': this.metadata = JSON.parse(row.value); break;
      }
    }
    
    // Load sections
    const rows = this.sql.exec(`
      SELECT id, type, props, sort_order FROM sections ORDER BY sort_order
    `).toArray() as Array<{id: string; type: string; props: string; sort_order: number}>;
    
    this.sections = rows.map(row => ({
      id: row.id,
      type: row.type,
      props: JSON.parse(row.props),
      order: row.sort_order,
    }));
  }

  private saveToStorage() {
    const now = Date.now();
    
    // Save metadata
    this.sql.exec(`INSERT OR REPLACE INTO editor_state (key, value, updated_at) VALUES ('pageId', ?, ?)`, String(this.pageId), now);
    this.sql.exec(`INSERT OR REPLACE INTO editor_state (key, value, updated_at) VALUES ('storeId', ?, ?)`, String(this.storeId), now);
    this.sql.exec(`INSERT OR REPLACE INTO editor_state (key, value, updated_at) VALUES ('title', ?, ?)`, this.title, now);
    this.sql.exec(`INSERT OR REPLACE INTO editor_state (key, value, updated_at) VALUES ('slug', ?, ?)`, this.slug, now);
    this.sql.exec(`INSERT OR REPLACE INTO editor_state (key, value, updated_at) VALUES ('metadata', ?, ?)`, JSON.stringify(this.metadata), now);
    
    // Save sections
    this.sql.exec(`DELETE FROM sections`);
    for (const section of this.sections) {
      this.sql.exec(
        `INSERT INTO sections (id, type, props, sort_order) VALUES (?, ?, ?, ?)`,
        section.id, section.type, JSON.stringify(section.props), section.order
      );
    }
    
    this.lastSave = now;
  }

  private pushHistory(action: string) {
    // Truncate future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    // Add new entry
    this.history.push({
      sections: JSON.parse(JSON.stringify(this.sections)),
      timestamp: Date.now(),
      action,
    });
    
    // Limit history size
    if (this.history.length > CONFIG.MAX_HISTORY_SIZE) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
    
    this.isDirty = true;
  }

  private getState(): EditorStateData {
    return {
      pageId: this.pageId,
      storeId: this.storeId,
      sections: this.sections,
      title: this.title,
      slug: this.slug,
      metadata: this.metadata,
      updatedAt: this.lastSave,
      isDirty: this.isDirty,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/init':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.initEditor(await request.json());
          
        case '/get':
          return this.getEditorState();
          
        case '/update-section':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.updateSection(await request.json() as UpdateSectionRequest);
          
        case '/add-section':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.addSection(await request.json() as AddSectionRequest);
          
        case '/remove-section':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.removeSection(await request.json());
          
        case '/reorder':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.reorderSections(await request.json());
          
        case '/undo':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.undo();
          
        case '/redo':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.redo();
          
        case '/save':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.saveDraft();
          
        case '/publish':
          if (request.method !== 'POST') {
            return Response.json({ error: 'Method not allowed' }, { status: 405 });
          }
          return this.publishToD1();
          
        case '/health':
          return Response.json({ 
            status: 'ok', 
            pageId: this.pageId,
            sectionCount: this.sections.length,
            historySize: this.history.length,
          });
          
        default:
          return Response.json({ error: 'Not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('EditorState error:', error);
      return Response.json({ 
        error: 'Internal error', 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
  }

  private async initEditor(data: { pageId: number; storeId: number; sections?: Section[]; title?: string; slug?: string }): Promise<Response> {
    this.ensureInitialized();
    
    this.pageId = data.pageId;
    this.storeId = data.storeId;
    this.title = data.title || '';
    this.slug = data.slug || '';
    
    if (data.sections) {
      this.sections = data.sections;
    }
    
    // Initialize history with current state
    this.history = [{
      sections: JSON.parse(JSON.stringify(this.sections)),
      timestamp: Date.now(),
      action: 'init',
    }];
    this.historyIndex = 0;
    
    this.saveToStorage();
    
    return Response.json({ 
      success: true, 
      state: this.getState(),
    });
  }

  private getEditorState(): Response {
    this.ensureInitialized();
    
    return Response.json({ 
      success: true, 
      state: this.getState(),
      canUndo: this.historyIndex > 0,
      canRedo: this.historyIndex < this.history.length - 1,
    });
  }

  private async updateSection(data: UpdateSectionRequest): Promise<Response> {
    this.ensureInitialized();
    
    const section = this.sections.find(s => s.id === data.sectionId);
    if (!section) {
      return Response.json({ success: false, error: 'Section not found' }, { status: 404 });
    }
    
    this.pushHistory(`update:${section.type}`);
    section.props = { ...section.props, ...data.props };
    this.saveToStorage();
    
    return Response.json({ success: true, state: this.getState() });
  }

  private async addSection(data: AddSectionRequest): Promise<Response> {
    this.ensureInitialized();
    
    const newSection: Section = {
      id: `section_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: data.type,
      props: data.props || {},
      order: this.sections.length,
    };
    
    this.pushHistory(`add:${data.type}`);
    
    if (data.afterId) {
      const index = this.sections.findIndex(s => s.id === data.afterId);
      if (index !== -1) {
        this.sections.splice(index + 1, 0, newSection);
        // Reorder
        this.sections.forEach((s, i) => s.order = i);
      } else {
        this.sections.push(newSection);
      }
    } else {
      this.sections.push(newSection);
    }
    
    this.saveToStorage();
    
    return Response.json({ success: true, state: this.getState(), newSectionId: newSection.id });
  }

  private async removeSection(data: { sectionId: string }): Promise<Response> {
    this.ensureInitialized();
    
    const index = this.sections.findIndex(s => s.id === data.sectionId);
    if (index === -1) {
      return Response.json({ success: false, error: 'Section not found' }, { status: 404 });
    }
    
    this.pushHistory(`remove:${this.sections[index].type}`);
    this.sections.splice(index, 1);
    this.sections.forEach((s, i) => s.order = i);
    this.saveToStorage();
    
    return Response.json({ success: true, state: this.getState() });
  }

  private async reorderSections(data: { sectionIds: string[] }): Promise<Response> {
    this.ensureInitialized();
    
    this.pushHistory('reorder');
    
    const newSections: Section[] = [];
    for (const id of data.sectionIds) {
      const section = this.sections.find(s => s.id === id);
      if (section) {
        section.order = newSections.length;
        newSections.push(section);
      }
    }
    
    this.sections = newSections;
    this.saveToStorage();
    
    return Response.json({ success: true, state: this.getState() });
  }

  private undo(): Response {
    if (this.historyIndex <= 0) {
      return Response.json({ success: false, error: 'Nothing to undo' }, { status: 400 });
    }
    
    this.historyIndex--;
    this.sections = JSON.parse(JSON.stringify(this.history[this.historyIndex].sections));
    this.isDirty = true;
    this.saveToStorage();
    
    return Response.json({ 
      success: true, 
      state: this.getState(),
      canUndo: this.historyIndex > 0,
      canRedo: true,
    });
  }

  private redo(): Response {
    if (this.historyIndex >= this.history.length - 1) {
      return Response.json({ success: false, error: 'Nothing to redo' }, { status: 400 });
    }
    
    this.historyIndex++;
    this.sections = JSON.parse(JSON.stringify(this.history[this.historyIndex].sections));
    this.isDirty = true;
    this.saveToStorage();
    
    return Response.json({ 
      success: true, 
      state: this.getState(),
      canUndo: true,
      canRedo: this.historyIndex < this.history.length - 1,
    });
  }

  private saveDraft(): Response {
    this.ensureInitialized();
    this.saveToStorage();
    this.isDirty = false;
    
    return Response.json({ success: true, message: 'Draft saved', state: this.getState() });
  }

  private async publishToD1(): Promise<Response> {
    this.ensureInitialized();
    
    try {
      // Save to D1 database
      const sectionsJson = JSON.stringify(this.sections);
      
      await this.env.DB.prepare(`
        UPDATE pages SET 
          sections = ?,
          title = ?,
          slug = ?,
          updated_at = datetime('now')
        WHERE id = ? AND store_id = ?
      `).bind(sectionsJson, this.title, this.slug, this.pageId, this.storeId).run();
      
      this.isDirty = false;
      this.saveToStorage();
      
      return Response.json({ success: true, message: 'Published to database' });
    } catch (error) {
      console.error('Publish error:', error);
      return Response.json({ 
        success: false, 
        error: 'Failed to publish',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }
  }
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route: /do/:pageId/* - Forward to Durable Object
    const match = url.pathname.match(/^\/do\/(\d+)(\/.*)$/);
    if (match) {
      const pageId = match[1];
      const doPath = match[2] || '/';
      
      const id = env.EDITOR_STATE.idFromName(`editor-${pageId}`);
      const stub = env.EDITOR_STATE.get(id);
      
      const doUrl = new URL(request.url);
      doUrl.pathname = doPath;
      
      return stub.fetch(new Request(doUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }

    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'editor-state' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
