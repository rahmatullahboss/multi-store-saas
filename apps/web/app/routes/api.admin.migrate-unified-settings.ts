/**
 * Unified Settings Migration API
 *
 * POST /api/admin/migrate-unified-settings
 *
 * Body:
 *   { "dryRun": true|false }
 *
 * Response:
 *   { "success": true, "migrated": 10, "failed": 0, "skipped": 5 }
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { migrateAllStoresToUnifiedSettings } from '~/services/unified-storefront-settings.server';
import { requireSuperAdmin } from '~/services/auth.server';

export async function loader({ request: _request, context: _context }: LoaderFunctionArgs) {
  // Simple health check
  return json({
    status: 'ok',
    message: 'Use POST to run migration',
    dryRunExample: '{ "dryRun": true }',
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Always require super admin (no localhost bypass)
  await requireSuperAdmin(request, context.cloudflare.env, context.cloudflare.env.DB);

  let body: { dryRun?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const dryRun = body.dryRun !== false;

  console.warn(`[Migration] Starting unified settings migration (dryRun: ${dryRun})`);

  const db = drizzle(context.cloudflare.env.DB);

  const result = await migrateAllStoresToUnifiedSettings(db, 'v2.0-migration', dryRun);

  console.warn(`[Migration] Results:`, result);

  return json({
    success: true,
    ...result,
    dryRun,
    message: dryRun ? 'Dry run completed. No changes made.' : 'Migration completed successfully!',
  });
}
