import { selectRows } from './mock-db.helpers';

export type MockTable = Record<string, any>[];

export interface MockDbTables {
  metafield_definitions?: MockTable;
  metafields?: MockTable;
  template_versions?: MockTable;
  template_sections_draft?: MockTable;
  template_sections_published?: MockTable;
  theme_settings_draft?: MockTable;
  theme_settings_published?: MockTable;
  themes?: MockTable;
  theme_templates?: MockTable;
  stores?: MockTable;
}

export function createMockDb(tables: MockDbTables = {}) {
  const db = {
    tables: {
      metafield_definitions: tables.metafield_definitions ?? [],
      metafields: tables.metafields ?? [],
      template_versions: tables.template_versions ?? [],
      template_sections_draft: tables.template_sections_draft ?? [],
      template_sections_published: tables.template_sections_published ?? [],
      theme_settings_draft: tables.theme_settings_draft ?? [],
      theme_settings_published: tables.theme_settings_published ?? [],
      themes: tables.themes ?? [],
      theme_templates: tables.theme_templates ?? [],
      stores: tables.stores ?? [],
    },
    select(fields?: Record<string, any>) {
      const state = { table: null as string | null, fields };
      return {
        from: (table: any) => {
          state.table = resolveTableName(table);
          const rows = db.tables[state.table as string];
          return {
            where: () => ({
              limit: async (n: number) => selectRows(rows, state.fields).slice(0, n),
              orderBy: () => ({ limit: async (n: number) => selectRows(rows, state.fields).slice(0, n) }),
            }),
            orderBy: () => ({
              limit: async (n: number) => selectRows(rows, state.fields).slice(0, n),
            }),
          };
        },
      };
    },
    insert(table: any) {
      const tableName = resolveTableName(table);
      return {
        values: async (row: any) => {
          db.tables[tableName].push(row);
          return { success: true };
        },
      };
    },
    update(table: any) {
      const tableName = resolveTableName(table);
      return {
        set: () => ({
          where: async () => ({ success: true }),
        }),
      };
    },
    delete(table: any) {
      const tableName = resolveTableName(table);
      return {
        where: async () => {
          db.tables[tableName] = [];
          return { success: true };
        },
      };
    },
  };
  return db;
}

function resolveTableName(table: any) {
  if (typeof table === 'string') return table;
  if (table?.[Symbol.for('drizzle:Name')]) return table[Symbol.for('drizzle:Name')];
  if (table?.name) return table.name;
  return String(table);
}
