import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

type WranglerD1ExecuteJson = Array<{
  results?: Array<Record<string, unknown>>;
  success?: boolean;
  error?: string;
}>;

function wranglerBin(): string {
  // Playwright runs from `apps/web`. Wrangler is hoisted to repo root.
  return path.resolve(process.cwd(), '../../node_modules/.bin/wrangler');
}

function d1ExecuteJson(command: string): WranglerD1ExecuteJson {
  const args = ['d1', 'execute', 'multi-store-saas-db', '--local', '--json', '--command', command];

  // Local D1 can be briefly locked while the dev server is starting/stopping.
  // Retry a few times to avoid flaky E2E setup failures.
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const out = execFileSync(wranglerBin(), args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return JSON.parse(out) as WranglerD1ExecuteJson;
    } catch (e) {
      lastErr = e;
      // Best-effort detection of SQLite busy/locked.
      const msg = String((e as any)?.stderr ?? (e as any)?.message ?? e);
      if (!msg.includes('SQLITE_BUSY') && !msg.toLowerCase().includes('database is locked')) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
    }
  }

  throw lastErr;
}

function getTableColumns(table: string): Set<string> {
  const res = d1ExecuteJson(`PRAGMA table_info(${table});`);
  const rows = res?.[0]?.results ?? [];
  const cols = new Set<string>();
  for (const row of rows) {
    const name = row?.name;
    if (typeof name === 'string') cols.add(name);
  }
  return cols;
}

function loadSqliteTableColumnsFromSchemaSource(
  schemaPath: string,
  tableName: string
): Array<{ name: string; type: string }> {
  // Parse the canonical schema source so E2E local D1 doesn't drift.
  // NOTE: We only use primitive SQLite types; no constraints/defaults here.
  const src = fs.readFileSync(schemaPath, 'utf8');

  // Matches both:
  // - sqliteTable('stores', { ... })
  // - sqliteTable(\n  'products',\n  { ... })
  const reTable = new RegExp(
    String.raw`sqliteTable\(\s*\n?\s*['"]${tableName}['"][\s\S]*?\n?\s*\)\s*;`,
    'm'
  );
  const mTable = src.match(reTable);
  if (!mTable) throw new Error(`table schema not found: ${tableName} in ${schemaPath}`);

  const block = mTable[0];
  const cols: Array<{ name: string; type: string }> = [];
  const reCol = /\b(text|integer|real)\(\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = reCol.exec(block))) {
    const kind = m[1];
    const name = m[2];
    const type = kind === 'text' ? 'TEXT' : kind === 'real' ? 'REAL' : 'INTEGER';
    cols.push({ name, type });
  }
  return cols;
}

function tableExists(table: string): boolean {
  const res = d1ExecuteJson(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${table.replace(/'/g, "''")}';`
  );
  return (res?.[0]?.results ?? []).length > 0;
}

function ensureTableColumnsFromSchema(tableName: string) {
  if (!tableExists(tableName)) return;

  const schemaPath = path.resolve(process.cwd(), '../../packages/database/src/schema.ts');
  const desired = loadSqliteTableColumnsFromSchemaSource(schemaPath, tableName);
  const existing = getTableColumns(tableName);

  for (const col of desired) {
    if (existing.has(col.name)) continue;
    d1ExecuteJson(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type};`);
  }
}

function ensureMetafieldsTables() {
  if (!tableExists('metafields')) {
    d1ExecuteJson(`
      CREATE TABLE metafields (
        id TEXT PRIMARY KEY NOT NULL,
        store_id INTEGER NOT NULL,
        definition_id TEXT,
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        owner_type TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `.trim());

    // Helpful indexes for common lookups.
    d1ExecuteJson(`CREATE INDEX IF NOT EXISTS metafields_store_owner_idx ON metafields (store_id, owner_type, owner_id);`);
    d1ExecuteJson(`CREATE INDEX IF NOT EXISTS metafields_namespace_key_idx ON metafields (store_id, namespace, key);`);
  }

  if (!tableExists('metafield_definitions')) {
    d1ExecuteJson(`
      CREATE TABLE metafield_definitions (
        id TEXT PRIMARY KEY NOT NULL,
        store_id INTEGER NOT NULL,
        namespace TEXT NOT NULL,
        key TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        owner_type TEXT NOT NULL,
        validations TEXT,
        pinned INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `.trim());

    d1ExecuteJson(
      `CREATE INDEX IF NOT EXISTS metafield_definitions_store_owner_idx ON metafield_definitions (store_id, owner_type);`
    );
  }
}

export default async function globalSetup() {
  // Ensure local D1 schema is compatible with the current Drizzle schema.
  // This avoids E2E failures when the local DB is from an older snapshot.
  ensureTableColumnsFromSchema('stores');
  ensureTableColumnsFromSchema('products');
  ensureTableColumnsFromSchema('product_variants');
  ensureTableColumnsFromSchema('customers');
  ensureTableColumnsFromSchema('orders');
  ensureTableColumnsFromSchema('order_items');
  ensureTableColumnsFromSchema('checkout_sessions');

  ensureMetafieldsTables();
}
