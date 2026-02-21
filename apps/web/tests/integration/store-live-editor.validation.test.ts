/**
 * Store Live Editor Publish Validation Integration Test
 *
 * NOTE: This test is SKIPPED - Shopify OS 2.0 system has been archived to dev/shopify-os2/
 * The store-live-editor route was moved to .archived
 */
import { describe, it, expect, vi } from 'vitest';

describe.skip('Store Live Editor Validation', () => {
  it('should be skipped - archived feature', () => {
    expect(true).toBe(true);
  });
});
const mockDb = vi.hoisted(() => ({
  tables: {
    stores: [{ id: 1, name: 'Test Store', subdomain: 'test', themeConfig: null }],
    themes: [],
    theme_templates: [],
    template_sections_draft: [],
    template_sections_published: [],
    theme_settings_draft: [],
    theme_settings_published: [],
    template_versions: [],
  },
  select() {
    const state = { table: null } as any;
    const makeQuery = (rows: any[]) => {
      const query: any = {
        where: () => makeQuery(rows),
        orderBy: () => makeQuery(rows),
        limit: async (n: number) => rows.slice(0, n),
        then: (resolve: (value: any) => void) => resolve(rows),
      };
      return query;
    };
    return {
      from: (table: any) => {
        state.table = table?.[Symbol.for('drizzle:Name')] ?? table?.name ?? String(table);
        const rows = mockDb.tables[state.table as keyof typeof mockDb.tables];
        return makeQuery(rows);
      },
    };
  },
  insert(table: any) {
    const tableName = (table?.[Symbol.for('drizzle:Name')] ??
      table?.name ??
      String(table)) as keyof typeof mockDb.tables;
    return {
      values: async (row: any) => {
        (mockDb.tables[tableName] as any[]).push(row);
        return { success: true };
      },
    };
  },
  update() {
    return { set: () => ({ where: async () => ({ success: true }) }) };
  },
  delete(table: any) {
    const tableName = (table?.[Symbol.for('drizzle:Name')] ??
      table?.name ??
      String(table)) as keyof typeof mockDb.tables;
    return {
      where: async () => {
        mockDb.tables[tableName] = [];
        return { success: true };
      },
    };
  },
}));

vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
}));

vi.mock('~/services/auth.server', async () => {
  const actual = await vi.importActual<any>('~/services/auth.server');
  return {
    ...actual,
    getStoreId: async () => 1,
  };
});

describe('Store Live Editor Publish Validation', () => {
  const context = { cloudflare: { env: { DB: {} } } } as any;

  beforeEach(() => {
    mockDb.tables.themes = [];
    mockDb.tables.theme_templates = [];
    mockDb.tables.template_sections_draft = [];
    mockDb.tables.template_sections_published = [];
    mockDb.tables.theme_settings_draft = [];
    mockDb.tables.theme_settings_published = [];
    mockDb.tables.template_versions = [];
  });

  it('rejects publish with invalid section settings', async () => {
    const sections = [
      {
        id: 'hero-1',
        type: 'hero',
        settings: { heading: 'Welcome' },
        blocks: [{ id: 'b1', type: 'slide', settings: {} }],
      },
    ];
    const result = validateForPublish(sections as any, { primaryColor: '#FF5500' });
    expect(result.valid).toBe(false);
  });

  it('publishes successfully with valid settings', async () => {
    const form = new FormData();
    form.set('_action', 'publish');
    form.set('storeTemplateId', 'rovo');
    form.set('primaryColor', '#FF5500');
    form.set('accentColor', '#000000');
    form.set(
      'sections',
      JSON.stringify([
        {
          id: 'text-1',
          type: 'rich-text',
          settings: { content: '<p>Hello</p>' },
        },
      ])
    );

    const request = new Request('http://localhost/store-live-editor', {
      method: 'POST',
      body: form,
    });

    const response = await editorAction({ request, context } as any);
    const json = (await response.json()) as any;
    expect(json.success).toBe(true);
  });
});
