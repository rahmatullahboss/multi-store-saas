import { execFileSync } from 'node:child_process';
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
  const out = execFileSync(
    wranglerBin(),
    ['d1', 'execute', 'multi-store-saas-db', '--local', '--json', '--command', command],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  return JSON.parse(out) as WranglerD1ExecuteJson;
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

function tableExists(table: string): boolean {
  const res = d1ExecuteJson(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${table.replace(/'/g, "''")}';`
  );
  return (res?.[0]?.results ?? []).length > 0;
}

function ensureStoresColumns(cols: Set<string>) {
  // Keep this focused on columns that exist in current Drizzle schema but were missing
  // from older local D1 snapshots. Missing columns can cause INSERT/SELECT to error.
  const required: Array<{ name: string; type: string }> = [
    { name: 'tagline', type: 'TEXT' },
    { name: 'description', type: 'TEXT' },
    { name: 'banner_url', type: 'TEXT' },
    { name: 'custom_shipping_policy', type: 'TEXT' },
    { name: 'custom_subscription_policy', type: 'TEXT' },
    { name: 'custom_legal_notice', type: 'TEXT' },
  ];

  for (const col of required) {
    if (cols.has(col.name)) continue;
    // SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we pre-check via PRAGMA.
    d1ExecuteJson(`ALTER TABLE stores ADD COLUMN ${col.name} ${col.type};`);
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
  const storeCols = getTableColumns('stores');
  ensureStoresColumns(storeCols);
  ensureMetafieldsTables();
}
