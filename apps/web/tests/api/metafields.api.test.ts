/**
 * Metafields API Tests
 */
import { describe, it, beforeAll, beforeEach, expect, vi } from 'vitest';
import { loader as defsLoader, action as defsAction } from '~/routes/api.metafield-definitions';
import { loader as valuesLoader, action as valuesAction } from '~/routes/api.metafields';

const mockDb = vi.hoisted(() => ({
  tables: {
    metafield_definitions: [] as any[],
    metafields: [] as any[],
  },
  select(fields?: Record<string, any>) {
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
        const isCount =
          fields && Object.keys(fields).some((k) => k.toLowerCase().includes('count'));
        return makeQuery(isCount ? [{ count: rows?.length ?? 0 }] : (rows ?? []));
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

describe('Metafields API', () => {
  const context = { cloudflare: { env: { DB: {} } } } as any;

  beforeEach(() => {
    mockDb.tables.metafield_definitions = [];
    mockDb.tables.metafields = [];
  });

  it('creates and lists metafield definitions', async () => {
    const request = new Request('http://localhost/api/metafield-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: 'custom',
        key: 'warranty_years',
        name: 'Warranty Period',
        type: 'number_integer',
        ownerType: 'product',
      }),
    });

    const response = (await defsAction({ request, context } as any)) as Response;
    const result = (await response.json()) as { success: boolean };
    expect(result.success).toBe(true);

    const listReq = new Request('http://localhost/api/metafield-definitions?ownerType=product');
    const listRes = (await defsLoader({ request: listReq, context } as any)) as Response;
    const listJson = (await listRes.json()) as { success: boolean; definitions: any[] };
    expect(listJson.success).toBe(true);
    expect(listJson.definitions.length).toBe(1);
  });

  it('creates and fetches metafield values', async () => {
    const defReq = new Request('http://localhost/api/metafield-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: 'custom',
        key: 'warranty_years',
        name: 'Warranty Period',
        type: 'number_integer',
        ownerType: 'product',
      }),
    });
    const defRes = (await defsAction({ request: defReq, context } as any)) as Response;
    const defJson = (await defRes.json()) as { id: string };

    const valueReq = new Request('http://localhost/api/metafields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: 'custom',
        key: 'warranty_years',
        value: 2,
        type: 'number_integer',
        ownerId: '101',
        ownerType: 'product',
        definitionId: defJson.id,
      }),
    });

    const valueRes = (await valuesAction({ request: valueReq, context } as any)) as Response;
    const valueJson = (await valueRes.json()) as { success: boolean };
    expect(valueJson.success).toBe(true);

    const getReq = new Request(
      'http://localhost/api/metafields?ownerId=101&ownerType=product&namespace=custom&key=warranty_years'
    );
    const getRes = (await valuesLoader({ request: getReq, context } as any)) as Response;
    const getJson = (await getRes.json()) as { success: boolean; metafield: { value: number } };
    expect(getJson.success).toBe(true);
    expect(getJson.metafield.value).toBe(2);
  });

  it('prevents deleting definition with existing values', async () => {
    const defReq = new Request('http://localhost/api/metafield-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: 'custom',
        key: 'material',
        name: 'Material',
        type: 'single_line_text_field',
        ownerType: 'product',
      }),
    });
    const defRes = (await defsAction({ request: defReq, context } as any)) as Response;
    const defJson = (await defRes.json()) as { id: string };

    const valueReq = new Request('http://localhost/api/metafields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        namespace: 'custom',
        key: 'material',
        value: 'Cotton',
        type: 'single_line_text_field',
        ownerId: '101',
        ownerType: 'product',
        definitionId: defJson.id,
      }),
    });
    await valuesAction({ request: valueReq, context } as any);

    const deleteReq = new Request(`http://localhost/api/metafield-definitions?id=${defJson.id}`, {
      method: 'DELETE',
    });
    const delRes = (await defsAction({ request: deleteReq, context } as any)) as Response;
    expect(delRes.status).toBe(409);
  });
});
