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

export default async function globalSetup() {
  const storeCols = getTableColumns('stores');
  ensureStoresColumns(storeCols);
}

