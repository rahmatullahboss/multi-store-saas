/**
 * Database Migration Checker
 *
 * This script checks the migration status and provides information about
 * pending migrations that might be causing auth issues.
 */

export async function checkMigrationStatus(db: D1Database) {
  console.log('[MigrationCheck] Checking database migration status...');

  try {
    // Check if users table exists
    const usersTableCheck = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .first();

    if (!usersTableCheck) {
      console.error('[MigrationCheck] CRITICAL: users table does not exist!');
      return {
        status: 'error',
        message: 'Users table does not exist. Database migrations may not have been applied.',
        action: 'Run: npx wrangler d1 migrations apply multi-store-saas-db --remote',
      };
    }

    console.log('[MigrationCheck] users table exists ✓');

    // Check users table columns
    const usersColumns = await db.prepare('PRAGMA table_info(users)').all();

    const requiredColumns = [
      'id',
      'email',
      'password_hash',
      'name',
      'phone',
      'store_id',
      'role',
      'created_at',
    ];
    const existingColumns = usersColumns.results.map((col: any) => col.name);

    const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.error('[MigrationCheck] Missing columns in users table:', missingColumns);
      return {
        status: 'error',
        message: `Missing columns in users table: ${missingColumns.join(', ')}`,
        action: 'Database schema is outdated. Check migration files and apply pending migrations.',
      };
    }

    console.log('[MigrationCheck] All required columns exist ✓');

    // Check stores table
    const storesTableCheck = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='stores'")
      .first();

    if (!storesTableCheck) {
      console.error('[MigrationCheck] CRITICAL: stores table does not exist!');
      return {
        status: 'error',
        message: 'Stores table does not exist.',
        action: 'Apply database migrations immediately.',
      };
    }

    console.log('[MigrationCheck] stores table exists ✓');

    // Check for any recent users with password issues
    const recentUsers = await db
      .prepare(
        'SELECT id, email, length(password_hash) as hash_length, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      )
      .all();

    console.log('[MigrationCheck] Recent users:');
    for (const user of recentUsers.results) {
      const hashLength = (user as any).hash_length;
      console.log(
        `  - ID: ${(user as any).id}, Email: ${(user as any).email}, Hash Length: ${hashLength}, Created: ${(user as any).created_at}`
      );

      // Check if hash length is reasonable (should be around 64-88 chars for base64/base64url)
      if (hashLength < 40 || hashLength > 200) {
        console.warn(
          `[MigrationCheck] WARNING: User ${(user as any).id} has suspicious hash length: ${hashLength}`
        );
      }
    }

    return {
      status: 'ok',
      message: 'Database schema looks good',
      recentUsers: recentUsers.results,
    };
  } catch (error) {
    console.error('[MigrationCheck] Error checking migration status:', error);
    return {
      status: 'error',
      message:
        'Failed to check migration status: ' +
        (error instanceof Error ? error.message : String(error)),
      action: 'Check database connection and permissions',
    };
  }
}

/**
 * Validate a password hash format
 */
export function validatePasswordHashFormat(hash: string): {
  valid: boolean;
  format: string;
  error?: string;
} {
  if (!hash || hash.length === 0) {
    return { valid: false, format: 'unknown', error: 'Hash is empty' };
  }

  // Check if it's base64url format (no padding, uses - and _)
  if (/^[A-Za-z0-9_-]+$/.test(hash) && hash.length >= 40 && hash.length <= 100) {
    return { valid: true, format: 'base64url' };
  }

  // Check if it's standard base64 (may have padding, uses + and /)
  if (/^[A-Za-z0-9+/=]+$/.test(hash) && hash.length >= 40 && hash.length <= 100) {
    return { valid: true, format: 'base64' };
  }

  // Check if it's suspiciously short or long
  if (hash.length < 40) {
    return { valid: false, format: 'unknown', error: `Hash too short (${hash.length} chars)` };
  }

  if (hash.length > 200) {
    return { valid: false, format: 'unknown', error: `Hash too long (${hash.length} chars)` };
  }

  return { valid: true, format: 'unknown' };
}
