import { env } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';
import { vi } from 'vitest';

export function getTestDb() {
  return drizzle(env.DB);
}

export function getTestContext() {
  return {
    cloudflare: {
      env,
      ctx: {
        waitUntil: vi.fn(),
      },
    },
  };
}

export async function execSql(sql: string) {
  // Split on semicolons for multiple statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

export async function resetTables(tableNames: string[]) {
  for (const table of tableNames) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}
