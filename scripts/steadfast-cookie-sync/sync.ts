/**
 * Steadfast Cookie Sync Script
 * 
 * Syncs Steadfast session cookies to Cloudflare KV for each store
 * that has saved their Steadfast portal email + password.
 * 
 * Modes:
 *  1. Single store sync (env vars):
 *     STEADFAST_EMAIL=x STEADFAST_PASSWORD=y STORE_ID=z npx ts-node sync.ts
 *  2. All stores from D1 (passwords auto-decrypted if COURIER_ENCRYPT_KEY is set):
 *     D1_DATABASE_ID=x COURIER_ENCRYPT_KEY=base64key npx ts-node sync.ts --all-stores
 */
import { getSteadfastSessionCookies } from './steadfast-scraper.server';
import { execSync } from 'child_process';

const KV_NAMESPACE_ID = '026696313f02475c846dc70197a3c98f';
const isAllStores = process.argv.includes('--all-stores');

// ── AES-GCM helpers (Node.js 18+ Web Crypto API) ─────────────────────────────
function b64encode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}
function b64decode(str: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(str, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength) as Uint8Array<ArrayBuffer>;
}
async function importKey(keyBase64: string, usage: 'decrypt') {
  const keyBytes = b64decode(keyBase64);
  return (globalThis.crypto as Crypto).subtle.importKey(
    'raw', keyBytes.buffer as ArrayBuffer, { name: 'AES-GCM' }, false, [usage]
  );
}
async function decryptPassword(encrypted: string, keyBase64: string): Promise<string> {
  const [ivB64, ctB64] = encrypted.split(':');
  if (!ivB64 || !ctB64) throw new Error('Invalid encrypted format');
  const key = await importKey(keyBase64, 'decrypt');
  const iv = b64decode(ivB64);
  const ct = b64decode(ctB64);
  const plain = await (globalThis.crypto as Crypto).subtle.decrypt(
    { name: 'AES-GCM', iv }, key, ct.buffer as ArrayBuffer
  );
  return new TextDecoder().decode(plain);
}
// ─────────────────────────────────────────────────────────────────────────────

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
    const dbName = process.env.D1_DATABASE_NAME || 'multi-store-saas-db'; // default to production name
    const wranglerEnv = process.env.WRANGLER_ENV || '';
    const envFlag = wranglerEnv ? `--env ${wranglerEnv}` : '';
    const encryptKey = process.env.COURIER_ENCRYPT_KEY;

    console.log(`[STEADFAST SYNC] Fetching all stores with Steadfast credentials from D1 (${dbName})...`);
    const rawJson = execSync(
      `npx wrangler d1 execute ${dbName} ${envFlag} --remote --json --command "SELECT id, json_extract(storefront_settings, '$.courier.steadfast.steadfastEmail') as email, json_extract(storefront_settings, '$.courier.steadfast.steadfastPassword') as password FROM stores WHERE json_extract(storefront_settings, '$.courier.steadfast.steadfastEmail') IS NOT NULL"`,
      { encoding: 'utf8' }
    );

    const parsed = JSON.parse(rawJson) as Array<{ results: Array<{ id: number; email: string; password: string }> }>;
    const rows = parsed[0]?.results ?? [];

    let synced = 0;
    for (const row of rows) {
      try {
        let password = row.password;

        // Decrypt if COURIER_ENCRYPT_KEY is provided and password looks encrypted (iv:ct format)
        if (encryptKey && password.includes(':')) {
          try {
            password = await decryptPassword(password, encryptKey);
          } catch (e) {
            console.warn(`[STEADFAST SYNC] Could not decrypt password for store #${row.id}, trying as plaintext:`, e);
          }
        }

        await syncForStore(String(row.id), row.email, password);
        synced++;
      } catch (e) {
        console.warn(`[STEADFAST SYNC] Skipping store #${row.id}:`, e);
      }
    }


    console.log(`\n[STEADFAST SYNC] Done. Synced ${synced}/${rows.length} stores.`);
  } else {
    // Single store mode via env vars (no encryption needed here)
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
