/**
 * Storefront Settings Monitoring
 * 
 * This module provides monitoring and alerting for stores with missing or invalid
 * unified storefront settings. It helps detect data integrity issues early.
 * 
 * Usage:
 *   import { checkStorefrontSettingsHealth } from '~/lib/storefront-settings-monitor';
 *   
 *   // In a cron job or health check
 *   const health = await checkStorefrontSettingsHealth(env);
 *   if (health.storesWithIssues.length > 0) {
 *     console.log(JSON.stringify({
 *       level: 'warn',
 *       event: 'storefront_settings_health_check',
 *       ...health
 *     }));
 *   }
 */

import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { sql } from 'drizzle-orm';

export interface StorefrontSettingsHealth {
  totalStores: number;
  storesWithUnifiedSettings: number;
  storesWithLegacyOnly: number;
  storesWithInvalidJson: number;
  storesWithIssues: Array<{
    id: number;
    name: string;
    subdomain: string;
    issue: string;
  }>;
  migrationCoverage: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

/**
 * Check the health of storefront settings across all stores
 */
export async function checkStorefrontSettingsHealth(env: Env): Promise<StorefrontSettingsHealth> {
  const db = drizzle(env.DB);

  try {
    // Get total stores
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(stores)
      .get();
    const totalStores = Number(totalResult?.count || 0);

    // Get stores with valid unified settings
    const unifiedResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(stores)
      .where(
        sql`storefront_settings IS NOT NULL 
            AND storefront_settings != '' 
            AND storefront_settings != '{}'`
      )
      .get();
    const storesWithUnifiedSettings = Number(unifiedResult?.count || 0);

    // Get stores with only legacy themeConfig (no unified settings)
    const legacyOnlyResult = await db
      .select({ 
        id: stores.id,
        name: stores.name,
        subdomain: stores.subdomain,
        themeConfigLength: sql<number>`LENGTH(theme_config)`
      })
      .from(stores)
      .where(
        sql`(storefront_settings IS NULL 
             OR storefront_settings = '' 
             OR storefront_settings = '{}')
           AND theme_config IS NOT NULL
           AND theme_config != ''
           AND theme_config != '{}'`
      )
      .all();

    // Get stores with potentially invalid JSON
    const invalidJsonResult = await db
      .select({ 
        id: stores.id,
        name: stores.name,
        subdomain: stores.subdomain,
        storefrontSettings: sql<string>`storefront_settings`
      })
      .from(stores)
      .where(
        sql`storefront_settings IS NOT NULL 
            AND storefront_settings != ''
            AND storefront_settings != '{}'
            AND json_valid(storefront_settings) = 0`
      )
      .all();

    // Build issues list
    const storesWithIssues: Array<{
      id: number;
      name: string;
      subdomain: string;
      issue: string;
    }> = [];

    // Add legacy-only stores to issues
    for (const store of legacyOnlyResult || []) {
      storesWithIssues.push({
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        issue: 'Missing unified storefront_settings (has legacy themeConfig only)',
      });
    }

    // Add invalid JSON stores to issues
    for (const store of invalidJsonResult || []) {
      storesWithIssues.push({
        id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        issue: 'Invalid JSON in storefront_settings',
      });
    }

    // Calculate metrics
    const storesWithLegacyOnly = legacyOnlyResult?.length || 0;
    const storesWithInvalidJson = invalidJsonResult?.length || 0;
    const migrationCoverage = totalStores > 0 
      ? Math.round((storesWithUnifiedSettings / totalStores) * 100) 
      : 0;

    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (storesWithIssues.length === 0) {
      healthStatus = 'healthy';
    } else if (storesWithIssues.length <= 3 || migrationCoverage >= 95) {
      healthStatus = 'warning';
    } else {
      healthStatus = 'critical';
    }

    return {
      totalStores,
      storesWithUnifiedSettings,
      storesWithLegacyOnly,
      storesWithInvalidJson,
      storesWithIssues,
      migrationCoverage,
      healthStatus,
    };
  } catch (error) {
    console.error('[checkStorefrontSettingsHealth] Error checking health:', error);
    return {
      totalStores: 0,
      storesWithUnifiedSettings: 0,
      storesWithLegacyOnly: 0,
      storesWithInvalidJson: 0,
      storesWithIssues: [],
      migrationCoverage: 0,
      healthStatus: 'critical',
    };
  }
}

/**
 * Log storefront settings health check results
 * Use this in cron jobs or periodic health checks
 */
export async function logStorefrontSettingsHealthCheck(env: Env): Promise<void> {
  const health = await checkStorefrontSettingsHealth(env);

  const logEntry = {
    level: health.healthStatus === 'healthy' ? 'info' : 'warn',
    event: 'storefront_settings_health_check',
    timestamp: new Date().toISOString(),
    ...health,
  };

  // Always log for monitoring
  console.log(JSON.stringify(logEntry));

  // If critical, log additional details
  if (health.healthStatus === 'critical' && health.storesWithIssues.length > 0) {
    console.error(
      JSON.stringify({
        level: 'error',
        event: 'storefront_settings_critical_alert',
        timestamp: new Date().toISOString(),
        issueCount: health.storesWithIssues.length,
        affectedStores: health.storesWithIssues.map((s) => ({
          id: s.id,
          subdomain: s.subdomain,
          issue: s.issue,
        })),
      })
    );
  }
}

/**
 * Check if a specific store has valid unified settings
 * Use this in route loaders to detect issues early
 */
export async function checkStoreSettingsValidity(
  env: Env,
  storeId: number
): Promise<{ valid: boolean; issue?: string }> {
  const db = drizzle(env.DB);

  try {
    const result = await db
      .select({
        storefrontSettings: sql<string>`storefront_settings`,
        themeConfig: sql<string>`theme_config`,
      })
      .from(stores)
      .where(sql`id = ${storeId}`)
      .get();

    if (!result) {
      return { valid: false, issue: 'Store not found' };
    }

    // Check if unified settings exist
    if (
      !result.storefrontSettings ||
      result.storefrontSettings === '' ||
      result.storefrontSettings === '{}'
    ) {
      // Check if legacy themeConfig exists
      if (result.themeConfig && result.themeConfig !== '' && result.themeConfig !== '{}') {
        return { 
          valid: false, 
          issue: 'Store has legacy themeConfig but no unified storefront_settings' 
        };
      }
      return { valid: false, issue: 'Store has no theme configuration' };
    }

    // Check if JSON is valid
    try {
      JSON.parse(result.storefrontSettings);
      return { valid: true };
    } catch {
      return { valid: false, issue: 'Invalid JSON in storefront_settings' };
    }
  } catch (error) {
    console.error('[checkStoreSettingsValidity] Error:', error);
    return { valid: false, issue: 'Database error checking settings' };
  }
}
