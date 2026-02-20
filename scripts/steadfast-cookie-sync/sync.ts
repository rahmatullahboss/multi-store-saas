/**
 * Steadfast Cookie Sync Script
 * 
 * Syncs Steadfast session cookies to Cloudflare KV for each store
 * that has saved their Steadfast portal email + password.
 * 
 * Modes:
 *  1. Single store sync:
 *     STEADFAST_EMAIL=x STEADFAST_PASSWORD=y STORE_ID=z npx ts-node sync.ts
 *  2. All stores from D1 database:
 *     D1_DATABASE_ID=x npx ts-node sync.ts --all-stores
 */
import { getSteadfastSessionCookies } from './steadfast-scraper.server';
import { execSync } from 'child_process';

const KV_NAMESPACE_ID = '026696313f02475c846dc70197a3c98f';
const isAllStores = process.argv.includes('--all-stores');

async function syncForStore(storeId: string, email: string, password: string) {
  console.log(`\n[STEADFAST SYNC] Syncing Store #${storeId} (${email})...`);
  const { sessionCookie, xsrfToken } = await getSteadfastSessionCookies(email, password);
  const payload = JSON.stringify({ sessionCookie, xsrfToken, updatedAt: new Date().toISOString() });
  execSync(
    `npx wrangler kv key put steadfast_credentials_${storeId} '${payload}' --namespace-id ${KV_NAMESPACE_ID} --remote`,
    { stdio: 'inherit' }
  );
  console.log(`[STEADFAST SYNC] ✅ Store #${storeId} synced.`);
}

async function run() {
  if (isAllStores) {
    // --all-stores mode: reads all stores from D1 with Steadfast credentials configured
    const dbId = process.env.D1_DATABASE_ID;
    if (!dbId) {
      console.error('[STEADFAST SYNC] Missing D1_DATABASE_ID env var for --all-stores mode.');
      process.exit(1);
    }

    console.log('[STEADFAST SYNC] Fetching all stores with Steadfast credentials from D1...');
    const rawJson = execSync(
      `npx wrangler d1 execute ${dbId} --remote --json --command "SELECT id, courierSettings FROM stores WHERE courierSettings IS NOT NULL"`,
      { encoding: 'utf8' }
    );

    // Wrangler returns a JSON array: [{ results: [...] }]
    const parsed = JSON.parse(rawJson) as Array<{ results: Array<{ id: number; courierSettings: string }> }>;
    const rows = parsed[0]?.results ?? [];

    let synced = 0;
    for (const row of rows) {
      try {
        const settings = JSON.parse(row.courierSettings);
        const sf = settings?.steadfast ?? settings?.courier?.steadfast;
        if (sf?.steadfastEmail && sf?.steadfastPassword) {
          await syncForStore(String(row.id), sf.steadfastEmail, sf.steadfastPassword);
          synced++;
        }
      } catch (e) {
        console.warn(`[STEADFAST SYNC] Skipping store #${row.id}:`, e);
      }
    }

    console.log(`\n[STEADFAST SYNC] Done. Synced ${synced}/${rows.length} stores.`);
  } else {
    // Single store mode via env vars
    const email = process.env.STEADFAST_EMAIL;
    const password = process.env.STEADFAST_PASSWORD;
    const storeId = process.env.STORE_ID;

    if (!email || !password || !storeId) {
      console.error('[STEADFAST SYNC] Provide STEADFAST_EMAIL, STEADFAST_PASSWORD and STORE_ID, or use --all-stores with D1_DATABASE_ID.');
      process.exit(1);
    }

    await syncForStore(storeId, email, password);
    console.log('[STEADFAST SYNC] Done!');
  }
}

run().catch((err) => {
  console.error('[STEADFAST SYNC] Fatal error:', err);
  process.exit(1);
});
