import { getSteadfastSessionCookies } from './steadfast-scraper.server';
import { execSync } from 'child_process';

const adminEmail = 'rahmatullahzisan@gmail.com';
const adminPassword = 'ZxcAsd1212@';

async function run() {
  console.log('[STEADFAST SYNC] Testing Playwright to refresh admin cookies...');
  try {
    const { sessionCookie, xsrfToken } = await getSteadfastSessionCookies(adminEmail, adminPassword);
    console.log('[STEADFAST SYNC] Successfully extracted session cookies.');
    
    const payload = JSON.stringify({ sessionCookie, xsrfToken, updatedAt: new Date().toISOString() });
    
    console.log('[STEADFAST SYNC] Saving to Cloudflare KV STORE_CACHE (Production)...');
    execSync(`npx wrangler kv key put steadfast_admin_credentials '${payload}' --namespace-id 026696313f02475c846dc70197a3c98f --remote`, { stdio: 'inherit' });
    
    console.log('[STEADFAST SYNC] Successfully synced cookies! You can now use the Steadfast external fraud checker.');
  } catch (error) {
    console.error('[STEADFAST SYNC] Failed:', error);
    process.exit(1);
  }
}

run();
