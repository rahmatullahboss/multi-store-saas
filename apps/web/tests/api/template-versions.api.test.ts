/**
 * Template Versions API Tests
 */
import { describe, it, beforeAll, beforeEach, expect, vi } from 'vitest';
import { loader as versionsLoader, action as versionsAction } from '~/routes/api.template-versions';

const mockDb = vi.hoisted(() => ({
  tables: {
    template_versions: [] as any[],
    template_sections_draft: [] as any[],
    template_sections_published: [] as any[],
    theme_settings_draft: [] as any[],
    theme_settings_published: [] as any[],
  },
  select() {
    const state = { table: null as string | null };
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
        return makeQuery(rows ?? []);
      },
    };
  },
  insert(table: any) {
    const tableName = table?.[Symbol.for('drizzle:Name')] ?? table?.name ?? String(table);
    return {
      values: async (row: any) => {
        (mockDb.tables[tableName as keyof typeof mockDb.tables] as any[]).push(row);
        return { success: true };
      },
    };
  },
  update() {
    return { set: () => ({ where: async () => ({ success: true }) }) };
  },
  delete(table: any) {
    const tableName = table?.[Symbol.for('drizzle:Name')] ?? table?.name ?? String(table);
    return {
      where: async () => {
        (mockDb.tables[tableName as keyof typeof mockDb.tables] as any[]) = [];
        return { success: true };
      },
    };
  },
}));

vi.mock('~/services/auth.server', () => ({
  getSession: async () => ({
    get: (key: string) => (key === 'storeId' ? 1 : undefined),
  }),
}));
vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
}));

describe('Template Versions API', () => {
  const context = { cloudflare: { env: { DB: {} } } } as any;

  beforeEach(() => {
    mockDb.tables.template_versions = [];
    mockDb.tables.template_sections_draft = [];
    mockDb.tables.template_sections_published = [];
    mockDb.tables.theme_settings_draft = [];
    mockDb.tables.theme_settings_published = [];
  });

  it('lists versions for a template', async () => {
    (mockDb.tables.template_versions as any[]).push({
      id: 'ver_1',
      storeId: 1,
      templateId: 'tmpl_1',
      themeId: 'theme_1',
      version: 1,
      sectionsJson: '[]',
    });

    const req = new Request('http://localhost/api/template-versions?templateId=tmpl_1');
    const res = (await versionsLoader({ request: req, context } as any)) as unknown as Response;
    const json = (await res.json()) as { success: boolean; versions: any[] };
    expect(json.success).toBe(true);
    expect(json.versions.length).toBe(1);
  });

  it('rolls back to a version (draft)', async () => {
    (mockDb.tables.template_versions as any[]).push({
      id: 'ver_1',
      storeId: 1,
      templateId: 'tmpl_1',
      themeId: 'theme_1',
      version: 1,
      sectionsJson: '[{"id":"s1","type":"hero","settings":{},"blocks":[]}]',
    });

    const req = new Request('http://localhost/api/template-versions/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId: 'ver_1', target: 'draft' }),
    });

    const res = (await versionsAction({ request: req, context } as any)) as unknown as Response;
    const json = (await res.json()) as { success: boolean };
    expect(json.success).toBe(true);
  });
});
